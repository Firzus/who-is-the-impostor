import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RevealConfirmation } from "@/components/reveal-confirmation";

describe("RevealConfirmation", () => {
  it("renders the upgraded post-confirmation copy and text sizes", () => {
    const markup = renderToStaticMarkup(React.createElement(RevealConfirmation));

    expect(markup).toContain("Bonne chance, aventurier.");
    expect(markup).toContain("Rendez-vous sur Dofus pour le donjon !");
    expect(markup).toContain("Tu peux fermer cette page.");
    expect(markup).toContain("text-xl");
    expect(markup).toContain("text-base");
    expect(markup).toContain("text-sm");
  });
});
