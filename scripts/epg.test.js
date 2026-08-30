import { describe, it, expect } from "vitest";
import { looksLikeLimitPage } from "./epg.js";

describe("looksLikeLimitPage", () => {
  it("ne bloque pas un vrai flux XML EPG valide", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<tv><channel id="beIN.fr"><display-name>beIN Sports</display-name></channel></tv>`;
    expect(looksLikeLimitPage(xml)).toBe(false);
  });

  it("détecte la vraie page de blocage Open-EPG", () => {
    expect(looksLikeLimitPage("You reached the download limit")).toBe(true);
  });

  it("détecte une réponse qui ne ressemble pas à du XML", () => {
    expect(looksLikeLimitPage("<html><body>erreur</body></html>")).toBe(true);
  });
});
