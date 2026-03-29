import { afterEach, describe, expect, it } from "vitest";
import {
  LOBBY_TTL_HOURS,
  DEFAULT_KICK_COOLDOWN_SECONDS,
  countPlayersUnseenRole,
  getKickCooldownMs,
  getLobbyTtlMs,
  isLobbyStale,
  lobbyAgeCutoff,
  minPlayersForLobby,
  shouldFinishLobbyAfterReveal,
} from "@/lib/lobby-lifecycle";

describe("countPlayersUnseenRole", () => {
  it("counts players who have not seen their role", () => {
    expect(
      countPlayersUnseenRole([
        { hasSeenRole: false },
        { hasSeenRole: true },
        { hasSeenRole: false },
      ])
    ).toBe(2);
  });
});

describe("shouldFinishLobbyAfterReveal", () => {
  it("returns false when lobby is not roles_assigned", () => {
    expect(
      shouldFinishLobbyAfterReveal("waiting", [
        { hasSeenRole: true },
        { hasSeenRole: true },
      ])
    ).toBe(false);
  });

  it("returns false when no players", () => {
    expect(shouldFinishLobbyAfterReveal("roles_assigned", [])).toBe(false);
  });

  it("returns false when at least one player has not seen", () => {
    expect(
      shouldFinishLobbyAfterReveal("roles_assigned", [
        { hasSeenRole: true },
        { hasSeenRole: false },
      ])
    ).toBe(false);
  });

  it("returns true when roles_assigned and everyone has seen", () => {
    expect(
      shouldFinishLobbyAfterReveal("roles_assigned", [
        { hasSeenRole: true },
        { hasSeenRole: true },
        { hasSeenRole: true },
      ])
    ).toBe(true);
  });
});

describe("minPlayersForLobby", () => {
  it("uses at least 4 players and scales with impostor count", () => {
    expect(minPlayersForLobby(1)).toBe(4);
    expect(minPlayersForLobby(2)).toBe(4);
    expect(minPlayersForLobby(3)).toBe(5);
  });
});

describe("getKickCooldownMs", () => {
  const prev = process.env.KICK_COOLDOWN_SECONDS;

  afterEach(() => {
    if (prev === undefined) delete process.env.KICK_COOLDOWN_SECONDS;
    else process.env.KICK_COOLDOWN_SECONDS = prev;
  });

  it("defaults when env is unset", () => {
    delete process.env.KICK_COOLDOWN_SECONDS;
    expect(getKickCooldownMs()).toBe(DEFAULT_KICK_COOLDOWN_SECONDS * 1000);
  });

  it("parses KICK_COOLDOWN_SECONDS", () => {
    process.env.KICK_COOLDOWN_SECONDS = "30";
    expect(getKickCooldownMs()).toBe(30_000);
  });
});

describe("TTL / purge helpers", () => {
  it("getLobbyTtlMs matches LOBBY_TTL_HOURS", () => {
    expect(getLobbyTtlMs()).toBe(LOBBY_TTL_HOURS * 60 * 60 * 1000);
  });

  it("lobbyAgeCutoff is now minus ttl", () => {
    const now = new Date("2025-01-01T12:00:00.000Z");
    const ttlMs = 60 * 60 * 1000;
    const cutoff = lobbyAgeCutoff(now, ttlMs);
    expect(cutoff.toISOString()).toBe("2025-01-01T11:00:00.000Z");
  });

  it("isLobbyStale when created before cutoff", () => {
    const cutoff = new Date("2025-01-01T12:00:00.000Z");
    expect(isLobbyStale(new Date("2025-01-01T11:59:00.000Z"), cutoff)).toBe(true);
    expect(isLobbyStale(new Date("2025-01-01T12:00:00.000Z"), cutoff)).toBe(false);
    expect(isLobbyStale(new Date("2025-01-01T12:01:00.000Z"), cutoff)).toBe(false);
  });
});
