/**
 * Pure helpers for lobby lifecycle and cleanup (unit-tested without DB).
 */

export const LOBBY_TTL_HOURS = 2;

export function getLobbyTtlMs(): number {
  return LOBBY_TTL_HOURS * 60 * 60 * 1000;
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
