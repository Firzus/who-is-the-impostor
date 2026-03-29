import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { lobbies, players } from "../db/schema";
import { and, count, desc, eq, isNotNull, isNull } from "drizzle-orm";
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

    const [lobby] = await db
      .insert(lobbies)
      .values({ code })
      .returning();

    const [host] = await db
      .insert(players)
      .values({
        lobbyId: lobby.id,
        name: data.hostName,
        isHost: true,
      })
      .returning();

    await db
      .update(lobbies)
      .set({ hostId: host.id })
      .where(eq(lobbies.id, lobby.id));

    return { lobby: { ...lobby, hostId: host.id }, player: host };
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

    return { lobby, player };
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

    if (player.role != null) {
      await db
        .update(players)
        .set({ hasSeenRole: true })
        .where(eq(players.id, playerId));

      const [lobbyRow] = await db
        .select()
        .from(lobbies)
        .where(eq(lobbies.id, player.lobbyId));

      if (lobbyRow?.status === "roles_assigned") {
        const [unseenRow] = await db
          .select({ unseen: count() })
          .from(players)
          .where(
            and(
              eq(players.lobbyId, player.lobbyId),
              eq(players.hasSeenRole, false),
              isNotNull(players.role)
            )
          );

        if (Number(unseenRow.unseen) === 0) {
          await db
            .update(lobbies)
            .set({ status: "finished" })
            .where(eq(lobbies.id, player.lobbyId));
        }
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

    for (let i = 0; i < lobbyPlayers.length; i++) {
      const role = impostorIndices.has(i) ? "imposteur" : "aventurier";
      await db
        .update(players)
        .set({ role, hasSeenRole: false })
        .where(eq(players.id, lobbyPlayers[i]!.id));
    }

    await db
      .update(lobbies)
      .set({ status: "roles_assigned" })
      .where(eq(lobbies.id, data.lobbyId));

    return { success: true };
  });
