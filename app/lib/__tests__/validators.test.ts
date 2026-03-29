import { describe, it, expect } from "vitest";
import {
  createLobbySchema,
  joinLobbySchema,
  assignRolesSchema,
} from "../validators";

describe("createLobbySchema", () => {
  it("accepts a valid host name", () => {
    const result = createLobbySchema.safeParse({ hostName: "Toto" });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = createLobbySchema.safeParse({ hostName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 30 characters", () => {
    const result = createLobbySchema.safeParse({
      hostName: "A".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = createLobbySchema.safeParse({ hostName: "" });
    expect(result.success).toBe(false);
  });
});

describe("joinLobbySchema", () => {
  it("accepts valid input", () => {
    const result = joinLobbySchema.safeParse({
      code: "ABC123",
      playerName: "Joueur",
    });
    expect(result.success).toBe(true);
  });

  it("transforms code to uppercase", () => {
    const result = joinLobbySchema.safeParse({
      code: "abc123",
      playerName: "Joueur",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("ABC123");
    }
  });

  it("rejects a code that is not 6 characters", () => {
    const result = joinLobbySchema.safeParse({
      code: "ABC",
      playerName: "Joueur",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a player name shorter than 2 characters", () => {
    const result = joinLobbySchema.safeParse({
      code: "ABC123",
      playerName: "A",
    });
    expect(result.success).toBe(false);
  });
});

describe("assignRolesSchema", () => {
  it("accepts valid UUIDs", () => {
    const result = assignRolesSchema.safeParse({
      lobbyId: "550e8400-e29b-41d4-a716-446655440000",
      requesterId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid lobbyId", () => {
    const result = assignRolesSchema.safeParse({
      lobbyId: "not-a-uuid",
      requesterId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid requesterId", () => {
    const result = assignRolesSchema.safeParse({
      lobbyId: "550e8400-e29b-41d4-a716-446655440000",
      requesterId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
