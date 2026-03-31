/**
 * Pure helpers for lobby lifecycle and cleanup (unit-tested without DB).
 */

export const LOBBY_TTL_HOURS = 2;

/** Default kick rejoin cooldown when KICK_COOLDOWN_SECONDS is unset or invalid. */
export const DEFAULT_KICK_COOLDOWN_SECONDS = 30;

/** Max impostors configurable in lobby settings (host UI). */
export const MAX_IMPOSTOR_COUNT = 3;

/** Maximum number of players allowed in a lobby. */
export const MAX_PLAYER_COUNT = 8;

export function getLobbyTtlMs(): number {
  return LOBBY_TTL_HOURS * 60 * 60 * 1000;
}

/**
 * Server-only: reads KICK_COOLDOWN_SECONDS from the environment (seconds).
 * Invalid or missing values fall back to DEFAULT_KICK_COOLDOWN_SECONDS.
 */
export function getKickCooldownMs(): number {
  const raw = process.env.KICK_COOLDOWN_SECONDS;
  const parsed =
    raw != null && raw !== "" ? Number.parseInt(raw, 10) : Number.NaN;
  const seconds =
    Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : DEFAULT_KICK_COOLDOWN_SECONDS;
  return seconds * 1000;
}

/** Minimum active players required before the host can assign roles. */
export function minPlayersForLobby(impostorCount: number): number {
  return Math.max(4, impostorCount + 2);
}

export function countPlayersUnseenRole(
  players: { hasSeenRole: boolean }[]
): number {
  return players.filter((p) => !p.hasSeenRole).length;
}

/** True when lobby is in roles_assigned and every player has opened their role card. */
export function shouldFinishLobbyAfterReveal(
  lobbyStatus: string,
  players: { hasSeenRole: boolean }[]
): boolean {
  if (lobbyStatus !== "roles_assigned") return false;
  if (players.length === 0) return false;
  return countPlayersUnseenRole(players) === 0;
}

/** True if lobby row should be purged: created strictly before cutoff instant. */
export function isLobbyStale(createdAt: Date, cutoff: Date): boolean {
  return createdAt.getTime() < cutoff.getTime();
}

export function lobbyAgeCutoff(now: Date, ttlMs: number): Date {
  return new Date(now.getTime() - ttlMs);
}
