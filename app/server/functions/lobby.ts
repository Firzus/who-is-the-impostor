import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { lobbies, players } from "../db/schema";
import { and, count, eq } from "drizzle-orm";
import { generateLobbyCode } from "@/lib/utils";
import {
  createLobbySchema,
  joinLobbySchema,
  assignRolesSchema,
  lobbyAccessCodeSchema,
  playerUuidSchema,
} from "@/lib/validators";

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
      .where(eq(players.lobbyId, lobby.id));

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
              eq(players.hasSeenRole, false)
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

    const lobbyPlayers = await db
      .select()
      .from(players)
      .where(eq(players.lobbyId, data.lobbyId));

    if (lobbyPlayers.length < 4) {
      throw new Error("Il faut au moins 4 joueurs pour lancer la partie");
    }

    const impostorIndex = Math.floor(Math.random() * lobbyPlayers.length);

    for (let i = 0; i < lobbyPlayers.length; i++) {
      const role = i === impostorIndex ? "imposteur" : "aventurier";
      await db
        .update(players)
        .set({ role, hasSeenRole: false })
        .where(eq(players.id, lobbyPlayers[i].id));
    }

    await db
      .update(lobbies)
      .set({ status: "roles_assigned" })
      .where(eq(lobbies.id, data.lobbyId));

    return { success: true };
  });
