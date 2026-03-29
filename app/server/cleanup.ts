import { lt } from "drizzle-orm";
import { db } from "./db";
import { lobbies } from "./db/schema";
import { getLobbyTtlMs } from "@/lib/lobby-lifecycle";

export async function cleanupOldLobbies(): Promise<{ deletedIds: string[] }> {
  const cutoff = new Date(Date.now() - getLobbyTtlMs());
  const deleted = await db
    .delete(lobbies)
    .where(lt(lobbies.createdAt, cutoff))
    .returning({ id: lobbies.id });

  if (deleted.length > 0) {
    console.log(`[cleanup] ${deleted.length} old lobbies purged`);
  }

  return { deletedIds: deleted.map((r) => r.id) };
}

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

function startCleanupScheduler(): void {
  void cleanupOldLobbies();
  setInterval(() => {
    void cleanupOldLobbies();
  }, CLEANUP_INTERVAL_MS);
}

const isBrowser =
  typeof globalThis !== "undefined" && "window" in globalThis && globalThis.window != null;

if (typeof setInterval !== "undefined" && !isBrowser) {
  const skip =
    process.env.VITEST === "true" || process.env.DISABLE_LOBBY_CLEANUP === "1";
  if (!skip) {
    startCleanupScheduler();
  }
}
