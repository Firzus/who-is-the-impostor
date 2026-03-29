import { describe, it, expect } from "vitest";

interface MockPlayer {
  id: string;
  name: string;
  role: "aventurier" | "imposteur" | null;
}

function assignRolesToPlayers(players: MockPlayer[]): MockPlayer[] {
  if (players.length < 3) {
    throw new Error("Il faut au moins 3 joueurs pour lancer la partie");
  }

  const impostorIndex = Math.floor(Math.random() * players.length);

  return players.map((player, i) => ({
    ...player,
    role: i === impostorIndex ? "imposteur" : "aventurier",
  }));
}

describe("assignRolesToPlayers", () => {
  it("throws if fewer than 3 players", () => {
    const players: MockPlayer[] = [
      { id: "1", name: "Alice", role: null },
      { id: "2", name: "Bob", role: null },
    ];
    expect(() => assignRolesToPlayers(players)).toThrow(
      "Il faut au moins 3 joueurs"
    );
  });

  it("assigns exactly 1 imposteur with 3 players", () => {
    const players: MockPlayer[] = [
      { id: "1", name: "Alice", role: null },
      { id: "2", name: "Bob", role: null },
      { id: "3", name: "Charlie", role: null },
    ];

    const assigned = assignRolesToPlayers(players);

    const impostors = assigned.filter((p) => p.role === "imposteur");
    const aventuriers = assigned.filter((p) => p.role === "aventurier");

    expect(impostors).toHaveLength(1);
    expect(aventuriers).toHaveLength(2);
  });

  it("assigns exactly 1 imposteur with many players", () => {
    const players: MockPlayer[] = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      name: `Player${i}`,
      role: null,
    }));

    const assigned = assignRolesToPlayers(players);

    const impostors = assigned.filter((p) => p.role === "imposteur");
    const aventuriers = assigned.filter((p) => p.role === "aventurier");

    expect(impostors).toHaveLength(1);
    expect(aventuriers).toHaveLength(7);
  });

  it("all players receive a role", () => {
    const players: MockPlayer[] = [
      { id: "1", name: "Alice", role: null },
      { id: "2", name: "Bob", role: null },
      { id: "3", name: "Charlie", role: null },
      { id: "4", name: "Diana", role: null },
    ];

    const assigned = assignRolesToPlayers(players);
    expect(assigned.every((p) => p.role !== null)).toBe(true);
  });

  it("produces varying impostor selection over many runs", () => {
    const players: MockPlayer[] = [
      { id: "1", name: "Alice", role: null },
      { id: "2", name: "Bob", role: null },
      { id: "3", name: "Charlie", role: null },
      { id: "4", name: "Diana", role: null },
      { id: "5", name: "Eve", role: null },
    ];

    const impostorIds = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const assigned = assignRolesToPlayers(players);
      const impostor = assigned.find((p) => p.role === "imposteur")!;
      impostorIds.add(impostor.id);
    }

    expect(impostorIds.size).toBeGreaterThan(1);
  });
});
