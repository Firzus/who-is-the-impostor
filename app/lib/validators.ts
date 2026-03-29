import { z } from "zod";
import { MAX_IMPOSTOR_COUNT } from "@/lib/lobby-lifecycle";

export const createLobbySchema = z.object({
  hostName: z
    .string()
    .min(2, "Le pseudo doit faire au moins 2 caractères")
    .max(30, "Le pseudo ne peut pas dépasser 30 caractères"),
});

export const joinLobbySchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit faire exactement 6 caractères")
    .toUpperCase(),
  playerName: z
    .string()
    .min(2, "Le pseudo doit faire au moins 2 caractères")
    .max(30, "Le pseudo ne peut pas dépasser 30 caractères"),
});

export const assignRolesSchema = z.object({
  lobbyId: z.string().uuid(),
  requesterId: z.string().uuid(),
});

export const kickPlayerSchema = z.object({
  lobbyId: z.string().uuid(),
  requesterId: z.string().uuid(),
  targetPlayerId: z.string().uuid(),
});

export const updateLobbySettingsSchema = z.object({
  lobbyId: z.string().uuid(),
  requesterId: z.string().uuid(),
  impostorCount: z
    .number()
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
export const playerUuidSchema = z.string().uuid();

export type CreateLobbyInput = z.infer<typeof createLobbySchema>;
export type JoinLobbyInput = z.infer<typeof joinLobbySchema>;
export type AssignRolesInput = z.infer<typeof assignRolesSchema>;
export type KickPlayerInput = z.infer<typeof kickPlayerSchema>;
export type UpdateLobbySettingsInput = z.infer<typeof updateLobbySettingsSchema>;
