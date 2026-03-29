import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingActions, LandingTitle } from "@/components/landing-hero";

describe("LandingTitle", () => {
  it("keeps the full title on a single line", () => {
    const markup = renderToStaticMarkup(React.createElement(LandingTitle));

    expect(markup).toContain("Who Is The");
    expect(markup).toContain("Impostor");
    expect(markup).not.toContain("<br");
    expect(markup).toContain("whitespace-nowrap");
    expect(markup).toContain("clamp(");
  });
});

describe("LandingActions", () => {
  it("renders the join button with stronger contrast and without stats copy", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LandingActions, {
        showActions: true,
        onCreate: vi.fn(),
        onJoin: vi.fn(),
        onRevealActions: vi.fn(),
      })
    );

    expect(markup).toContain("Créer une partie");
    expect(markup).toContain("Rejoindre par code");
    expect(markup).not.toContain("3 joueurs minimum");
    expect(markup).toContain("bg-secondary");
    expect(markup).toContain("border-muted-foreground/30");
  });
});
