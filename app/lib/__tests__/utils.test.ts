import { describe, it, expect } from "vitest";
import { generateLobbyCode, cn } from "../utils";

describe("generateLobbyCode", () => {
  it("generates a 6-character code", () => {
    const code = generateLobbyCode();
    expect(code).toHaveLength(6);
  });

  it("generates only uppercase alphanumeric characters (no ambiguous chars)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateLobbyCode();
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });

  it("generates different codes on multiple calls", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateLobbyCode());
    }
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("resolves tailwind conflicts", () => {
    const result = cn("px-4", "px-2");
    expect(result).toBe("px-2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toBe("base extra");
  });
});
