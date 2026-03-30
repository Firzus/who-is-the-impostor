import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { lobbies, players } from "../db/schema";
import { and, asc, count, desc, eq, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { signToken } from "../auth";
import { generateLobbyCode } from "@/lib/utils";
import {
  getKickCooldownMs,
  minPlayersForLobby,
  MAX_IMPOSTOR_COUNT,
} from "@/lib/lobby-lifecycle";
import {
  createLobbySchema,
  joinLobbySchema,
  assignRolesSchema,
  lobbyAccessCodeSchema,
  playerUuidSchema,
  kickPlayerSchema,
  updateLobbySettingsSchema,
  transferHostSchema,
  leaveLobbySchema,
  lobbyResultsSchema,
} from "@/lib/validators";

function pickImpostorIndices(
  impostorCount: number,
  playerCount: number
): number[] {
  const indices = Array.from({ length: playerCount }, (_, i) => i);
  for (let i = playerCount - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }
  return indices.slice(0, impostorCount);
}

export const createLobby = createServerFn({ method: "POST" })
  .inputValidator(createLobbySchema)
  .handler(async ({ data }) => {
    const code = generateLobbyCode();

    const { lobby, host } = await db.transaction(async (tx) => {
      const [lobby] = await tx
        .insert(lobbies)
        .values({ code })
        .returning();

      const [host] = await tx
        .insert(players)
        .values({
          lobbyId: lobby.id,
          name: data.hostName,
          isHost: true,
        })
        .returning();

      await tx
        .update(lobbies)
        .set({ hostId: host.id })
        .where(eq(lobbies.id, lobby.id));

      return { lobby, host };
    });

    const token = signToken(host.id, lobby.id);
    return { lobby: { ...lobby, hostId: host.id }, player: host, token };
  });

export const joinLobby = createServerFn({ method: "POST" })
  .inputValidator(joinLobbySchema)
  .handler(async ({ data }) => {
    const [lobby] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.code, data.code));

    if (!lobby) {
      throw new Error("Lobby introuvable");
    }

    if (lobby.status === "finished") {
      throw new Error("Cette partie est terminée");
    }

    if (lobby.status !== "waiting") {
      throw new Error("Les rôles ont déjà été attribués");
    }

    const [existingActive] = await db
      .select({ id: players.id })
      .from(players)
      .where(
        and(
          eq(players.lobbyId, lobby.id),
          eq(players.name, data.playerName),
          isNull(players.kickedAt)
        )
      )
      .limit(1);

    if (existingActive) {
      throw new Error("Ce pseudo est déjà utilisé dans ce lobby");
    }

    const [lastKick] = await db
      .select({ kickedAt: players.kickedAt })
      .from(players)
      .where(
        and(
          eq(players.lobbyId, lobby.id),
          eq(players.name, data.playerName),
          isNotNull(players.kickedAt)
        )
      )
      .orderBy(desc(players.kickedAt))
      .limit(1);

    if (lastKick?.kickedAt) {
      const cooldownMs = getKickCooldownMs();
      const elapsed = Date.now() - lastKick.kickedAt.getTime();
      if (elapsed < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
        throw new Error(
          `Vous avez été expulsé. Réessayez dans ${waitSec} s.`
        );
      }
    }

    const [player] = await db
      .insert(players)
      .values({
        lobbyId: lobby.id,
        name: data.playerName,
        isHost: false,
      })
      .returning();

    const token = signToken(player.id, lobby.id);
    return { lobby, player, token };
  });

// POST avoids intermediary/browser caching of repeated lobby reads during polling.
export const getLobby = createServerFn({ method: "POST" })
  .inputValidator(lobbyAccessCodeSchema)
  .handler(async ({ data: code }) => {
    const [lobby] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.code, code));

    if (!lobby) {
      throw new Error("Lobby introuvable");
    }

    const lobbyPlayers = await db
      .select({
        id: players.id,
        name: players.name,
        isHost: players.isHost,
      })
      .from(players)
      .where(and(eq(players.lobbyId, lobby.id), isNull(players.kickedAt)));

    return { lobby, players: lobbyPlayers };
  });

// POST avoids caching of role reads (GET could return stale null before/after assignment).
export const getPlayerRole = createServerFn({ method: "POST" })
  .inputValidator(playerUuidSchema)
  .handler(async ({ data: playerId }) => {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId));

    if (!player) {
      throw new Error("Joueur introuvable");
    }

    if (player.role != null && !player.hasSeenRole) {
      await db
        .update(players)
        .set({ hasSeenRole: true })
        .where(eq(players.id, playerId));

      const [result] = await db
        .select({
          status: lobbies.status,
          unseen: count(),
        })
        .from(lobbies)
        .leftJoin(
          players,
          and(
            eq(players.lobbyId, lobbies.id),
            eq(players.hasSeenRole, false),
            isNotNull(players.role)
          )
        )
        .where(eq(lobbies.id, player.lobbyId))
        .groupBy(lobbies.id);

      if (result?.status === "roles_assigned" && Number(result.unseen) === 0) {
        await db
          .update(lobbies)
          .set({ status: "finished" })
          .where(eq(lobbies.id, player.lobbyId));
      }
    }

    return { role: player.role, name: player.name };
  });

export const kickPlayer = createServerFn({ method: "POST" })
  .inputValidator(kickPlayerSchema)
  .handler(async ({ data }) => {
    const [requester] = await db
      .select()
      .from(players)
      .where(
        and(eq(players.id, data.requesterId), eq(players.lobbyId, data.lobbyId))
      );

    if (!requester || !requester.isHost) {
      throw new Error("Seul l'hôte peut expulser un joueur");
    }

    const [lobbyRow] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.id, data.lobbyId));

    if (!lobbyRow || lobbyRow.status !== "waiting") {
      throw new Error("Impossible d'expulser en dehors de la phase d'attente");
    }

    if (data.targetPlayerId === data.requesterId) {
      throw new Error("Vous ne pouvez pas vous expulser vous-même");
    }

    const [target] = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.id, data.targetPlayerId),
          eq(players.lobbyId, data.lobbyId)
        )
      );

    if (!target) {
      throw new Error("Joueur introuvable dans ce lobby");
    }

    if (target.isHost) {
      throw new Error("Impossible d'expulser l'hôte");
    }

    await db
      .update(players)
      .set({ kickedAt: new Date() })
      .where(eq(players.id, data.targetPlayerId));

    return { success: true };
  });

export const updateLobbySettings = createServerFn({ method: "POST" })
  .inputValidator(updateLobbySettingsSchema)
  .handler(async ({ data }) => {
    const [requester] = await db
      .select()
      .from(players)
      .where(
        and(eq(players.id, data.requesterId), eq(players.lobbyId, data.lobbyId))
      );

    if (!requester || !requester.isHost) {
      throw new Error("Seul l'hôte peut modifier les paramètres");
    }

    const [lobbyRow] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.id, data.lobbyId));

    if (!lobbyRow || lobbyRow.status !== "waiting") {
      throw new Error(
        "Les paramètres ne peuvent être modifiés qu'avant le lancement"
      );
    }

    const [{ activeCount }] = await db
      .select({ activeCount: count() })
      .from(players)
      .where(and(eq(players.lobbyId, data.lobbyId), isNull(players.kickedAt)));

    if (data.impostorCount >= activeCount) {
      throw new Error(
        "Il doit rester au moins un joueur qui n'est pas imposteur"
      );
    }

    if (data.impostorCount > MAX_IMPOSTOR_COUNT) {
      throw new Error(`Maximum ${MAX_IMPOSTOR_COUNT} imposteurs`);
    }

    await db
      .update(lobbies)
      .set({ impostorCount: data.impostorCount })
      .where(eq(lobbies.id, data.lobbyId));

    return { success: true };
  });

export const assignRoles = createServerFn({ method: "POST" })
  .inputValidator(assignRolesSchema)
  .handler(async ({ data }) => {
    const [requester] = await db
      .select()
      .from(players)
      .where(
        and(eq(players.id, data.requesterId), eq(players.lobbyId, data.lobbyId))
      );

    if (!requester || !requester.isHost) {
      throw new Error("Seul l'hôte peut lancer l'attribution des rôles");
    }

    const [lobbyRow] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.id, data.lobbyId));

    if (!lobbyRow) {
      throw new Error("Lobby introuvable");
    }

    const impostorCount = lobbyRow.impostorCount;

    const lobbyPlayers = await db
      .select()
      .from(players)
      .where(and(eq(players.lobbyId, data.lobbyId), isNull(players.kickedAt)));

    const minPlayers = minPlayersForLobby(impostorCount);
    if (lobbyPlayers.length < minPlayers) {
      throw new Error(
        `Il faut au moins ${minPlayers} joueurs pour cette configuration`
      );
    }

    if (impostorCount >= lobbyPlayers.length) {
      throw new Error("Trop d'imposteurs pour le nombre de joueurs");
    }

    const impostorIndices = new Set(
      pickImpostorIndices(impostorCount, lobbyPlayers.length)
    );

    const impostorIds = lobbyPlayers
      .filter((_, i) => impostorIndices.has(i))
      .map((p) => p.id);
    const adventurerIds = lobbyPlayers
      .filter((_, i) => !impostorIndices.has(i))
      .map((p) => p.id);

    await db.transaction(async (tx) => {
      await tx
        .update(players)
        .set({ role: "imposteur", hasSeenRole: false })
        .where(inArray(players.id, impostorIds));

      await tx
        .update(players)
        .set({ role: "aventurier", hasSeenRole: false })
        .where(inArray(players.id, adventurerIds));

      await tx
        .update(lobbies)
        .set({ status: "roles_assigned" })
        .where(eq(lobbies.id, data.lobbyId));
    });

    return { success: true };
  });

export const transferHost = createServerFn({ method: "POST" })
  .inputValidator(transferHostSchema)
  .handler(async ({ data }) => {
    const [requester] = await db
      .select()
      .from(players)
      .where(
        and(eq(players.id, data.requesterId), eq(players.lobbyId, data.lobbyId))
      );

    if (!requester || !requester.isHost) {
      throw new Error("Seul l'hôte peut transférer ce rôle");
    }

    const [target] = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.id, data.targetPlayerId),
          eq(players.lobbyId, data.lobbyId),
          isNull(players.kickedAt)
        )
      );

    if (!target) {
      throw new Error("Joueur introuvable dans ce lobby");
    }

    if (data.targetPlayerId === data.requesterId) {
      throw new Error("Vous êtes déjà l'hôte");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(players)
        .set({ isHost: false })
        .where(eq(players.id, data.requesterId));

      await tx
        .update(players)
        .set({ isHost: true })
        .where(eq(players.id, data.targetPlayerId));

      await tx
        .update(lobbies)
        .set({ hostId: data.targetPlayerId })
        .where(eq(lobbies.id, data.lobbyId));
    });

    return { success: true };
  });

export const leaveLobby = createServerFn({ method: "POST" })
  .inputValidator(leaveLobbySchema)
  .handler(async ({ data }) => {
    const [player] = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.id, data.playerId),
          eq(players.lobbyId, data.lobbyId),
          isNull(players.kickedAt)
        )
      );

    if (!player) {
      throw new Error("Joueur introuvable dans ce lobby");
    }

    const [lobbyRow] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.id, data.lobbyId));

    if (!lobbyRow || lobbyRow.status !== "waiting") {
      throw new Error("Impossible de quitter en dehors de la phase d'attente");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(players)
        .set({ kickedAt: new Date() })
        .where(eq(players.id, data.playerId));

      if (player.isHost) {
        const [nextHost] = await tx
          .select()
          .from(players)
          .where(
            and(
              eq(players.lobbyId, data.lobbyId),
              isNull(players.kickedAt),
              ne(players.id, data.playerId)
            )
          )
          .orderBy(asc(players.joinedAt))
          .limit(1);

        if (nextHost) {
          await tx
            .update(players)
            .set({ isHost: true })
            .where(eq(players.id, nextHost.id));

          await tx
            .update(lobbies)
            .set({ hostId: nextHost.id })
            .where(eq(lobbies.id, data.lobbyId));
        }
      }
    });

    return { success: true };
  });

export const getLobbyResults = createServerFn({ method: "POST" })
  .inputValidator(lobbyResultsSchema)
  .handler(async ({ data }) => {
    const [lobby] = await db
      .select()
      .from(lobbies)
      .where(eq(lobbies.id, data.lobbyId));

    if (!lobby) {
      throw new Error("Lobby introuvable");
    }

    if (lobby.status !== "finished" && lobby.status !== "roles_assigned") {
      throw new Error("La partie n'est pas encore terminée");
    }

    const [requester] = await db
      .select()
      .from(players)
      .where(
        and(eq(players.id, data.playerId), eq(players.lobbyId, data.lobbyId))
      );

    if (!requester) {
      throw new Error("Vous ne faites pas partie de ce lobby");
    }

    const allPlayers = await db
      .select({
        id: players.id,
        name: players.name,
        role: players.role,
        isHost: players.isHost,
      })
      .from(players)
      .where(and(eq(players.lobbyId, data.lobbyId), isNull(players.kickedAt)))
      .orderBy(asc(players.joinedAt));

    return { players: allPlayers, impostorCount: lobby.impostorCount };
  });
