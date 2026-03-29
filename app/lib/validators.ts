import { z } from "zod";

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
