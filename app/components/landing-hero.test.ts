import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingActions, LandingTitle } from "@/components/landing-hero";

describe("LandingTitle", () => {
  it("keeps the full title on a single line", () => {
    const markup = renderToStaticMarkup(React.createElement(LandingTitle));

    expect(markup).toContain("Qui est l\u2019");
    expect(markup).toContain("imposteur");
    expect(markup).toContain("font-display");
    expect(markup).toContain("whitespace-nowrap");
  });
});

describe("LandingActions", () => {
  it("renders create and join CTAs without stats copy", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LandingActions, {
        onCreate: vi.fn(),
        onJoin: vi.fn(),
      })
    );

    expect(markup).toContain("Créer une partie");
    expect(markup).toContain("Rejoindre par code");
    expect(markup).not.toContain("3 joueurs minimum");
    expect(markup).toContain("bg-[#50C878]");
    expect(markup).toContain("border-[#50C878]/30");
  });
});
