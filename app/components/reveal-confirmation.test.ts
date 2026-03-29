import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RevealConfirmation } from "@/components/reveal-confirmation";

describe("RevealConfirmation", () => {
  it("renders the post-confirmation copy", () => {
    const markup = renderToStaticMarkup(React.createElement(RevealConfirmation));

    expect(markup).toContain("Bonne chance, aventurier.");
    expect(markup).toContain("Rendez-vous en jeu !");
    expect(markup).toContain("Tu peux fermer cette page.");
    expect(markup).toContain("text-2xl");
    expect(markup).toContain("text-sm");
  });
});
