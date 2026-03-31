import { DEFAULT_KICK_COOLDOWN_SECONDS } from "@/lib/lobby-lifecycle";

const STORAGE_KEY = "who-impostor-kick-cooldown";

interface KickRecord {
  lobbyCode: string;
  kickedAtMs: number;
}

function readRecord(): KickRecord | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as KickRecord;
  } catch {
    return null;
  }
}

export function setKickCooldown(lobbyCode: string): void {
  try {
    const record: KickRecord = { lobbyCode, kickedAtMs: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* SSR or quota — ignore */
  }
}

export function getKickCooldownRemaining(lobbyCode: string): number {
  const record = readRecord();
  if (!record || record.lobbyCode !== lobbyCode) return 0;
  const cooldownMs = DEFAULT_KICK_COOLDOWN_SECONDS * 1000;
  const elapsed = Date.now() - record.kickedAtMs;
  return Math.max(0, cooldownMs - elapsed);
}

export function clearKickCooldown(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
