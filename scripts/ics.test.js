import { describe, it, expect } from "vitest";
import { extractTeams } from "./ics.js";

describe("extractTeams", () => {
  it("extrait domicile/extérieur séparés par un tiret", () => {
    expect(extractTeams("Paris FC - OGC Nice")).toEqual({
      home: "Paris FC",
      away: "OGC Nice",
    });
  });

  it("extrait domicile/extérieur séparés par 'vs'", () => {
    expect(extractTeams("Chelsea vs Arsenal")).toEqual({
      home: "Chelsea",
      away: "Arsenal",
    });
  });

  it("retire les crochets de compétition en fin de nom d'équipe", () => {
    expect(extractTeams("France - Espagne [WC Qualifiers]")).toEqual({
      home: "France",
      away: "Espagne",
    });
  });

  it("traite un Grand Prix de F1 sans équipe extérieure", () => {
    const result = extractTeams("🏎️ Grand Prix de Monaco");
    expect(result.away).toBe("Formule 1");
    expect(result.home).toContain("Monaco");
  });

  it("renvoie le titre brut si aucun séparateur n'est trouvé", () => {
    expect(extractTeams("Titre sans séparateur")).toEqual({
      home: "Titre sans séparateur",
      away: "",
    });
  });
});
