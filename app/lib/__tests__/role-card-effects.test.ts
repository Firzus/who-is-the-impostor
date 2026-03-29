import { describe, expect, it } from "vitest";
import {
  createHolographicBackground,
  getCardHoverState,
  isRoleCardHoverEnabled,
} from "@/lib/role-card-effects";

describe("getCardHoverState", () => {
  it("keeps the card flat in the center while applying hover scale", () => {
    const state = getCardHoverState({
      pointerX: 140,
      pointerY: 200,
      rect: { left: 0, top: 0, width: 280, height: 400 },
    });

    expect(state.rotateX).toBe(0);
    expect(state.rotateY).toBe(0);
    expect(state.scale).toBe(1.06);
  });

  it("tilts the card within the configured limits near the edges", () => {
    const state = getCardHoverState({
      pointerX: 280,
      pointerY: 0,
      rect: { left: 0, top: 0, width: 280, height: 400 },
    });

    expect(state.rotateX).toBeGreaterThan(0);
    expect(state.rotateY).toBeGreaterThan(0);
    expect(state.rotateX).toBeLessThanOrEqual(14);
    expect(state.rotateY).toBeLessThanOrEqual(14);
  });
});

describe("createHolographicBackground", () => {
  it("builds a gradient centered on the pointer position", () => {
    const background = createHolographicBackground({
      pointerX: 70,
      pointerY: 100,
      rect: { left: 0, top: 0, width: 280, height: 400 },
    });

    expect(background).toContain("25%");
    expect(background).toContain("radial-gradient(circle at 25% 25%");
    expect(background).toContain("linear-gradient(135deg");
  });
});

describe("isRoleCardHoverEnabled", () => {
  it("stays disabled until the reveal animation has completed", () => {
    expect(
      isRoleCardHoverEnabled({ revealed: true, animationComplete: false })
    ).toBe(false);
    expect(
      isRoleCardHoverEnabled({ revealed: true, animationComplete: true })
    ).toBe(true);
  });
});
