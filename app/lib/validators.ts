import { z } from "zod";
import { MAX_IMPOSTOR_COUNT } from "@/lib/lobby-lifecycle";

const pseudoSchema = z
  .string()
  .min(2, "Le pseudo doit faire au moins 2 caractères")
  .max(30, "Le pseudo ne peut pas dépasser 30 caractères");

export const createLobbySchema = z.object({
  hostName: pseudoSchema,
});

export const joinLobbySchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit faire exactement 6 caractères")
    .toUpperCase(),
  playerName: pseudoSchema,
});

export const assignRolesSchema = z.object({
  lobbyId: z.guid(),
  requesterId: z.guid(),
});

export const kickPlayerSchema = z.object({
  lobbyId: z.guid(),
  requesterId: z.guid(),
  targetPlayerId: z.guid(),
});

export const updateLobbySettingsSchema = z.object({
  lobbyId: z.guid(),
  requesterId: z.guid(),
  impostorCount: z
    .int()
    .min(1, "Au moins 1 imposteur")
    .max(
      MAX_IMPOSTOR_COUNT,
      `Maximum ${MAX_IMPOSTOR_COUNT} imposteurs`
    ),
});

/** GET server fn: lobby code from URL / polling */
export const lobbyAccessCodeSchema = z
  .string()
  .length(6, "Le code doit faire exactement 6 caractères")
  .transform((s) => s.toUpperCase());

/** GET server fn: player id for role fetch */
export const playerUuidSchema = z.guid();

export const transferHostSchema = z.object({
  lobbyId: z.guid(),
  requesterId: z.guid(),
  targetPlayerId: z.guid(),
});

export const leaveLobbySchema = z.object({
  lobbyId: z.guid(),
  playerId: z.guid(),
});

export const lobbyResultsSchema = z.object({
  lobbyId: z.guid(),
  playerId: z.guid(),
});

export type LobbyResultsInput = z.infer<typeof lobbyResultsSchema>;
export type CreateLobbyInput = z.infer<typeof createLobbySchema>;
export type JoinLobbyInput = z.infer<typeof joinLobbySchema>;
export type AssignRolesInput = z.infer<typeof assignRolesSchema>;
export type KickPlayerInput = z.infer<typeof kickPlayerSchema>;
export type UpdateLobbySettingsInput = z.infer<typeof updateLobbySettingsSchema>;
export type TransferHostInput = z.infer<typeof transferHostSchema>;
export type LeaveLobbyInput = z.infer<typeof leaveLobbySchema>;
