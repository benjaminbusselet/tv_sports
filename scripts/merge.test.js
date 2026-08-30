import { describe, it, expect } from "vitest";
import { mergeData } from "./merge.js";

describe("mergeData", () => {
  it("résout le diffuseur via le cross-check EPG quand les équipes et l'horaire correspondent", async () => {
    const ics = [
      {
        uid: "1",
        title: "Paris Saint-Germain - Olympique de Marseille",
        start: "2026-08-30T20:00:00.000Z",
        end: "2026-08-30T22:00:00.000Z",
        sport: "football",
        competition: "Ligue 1",
        home: "Paris Saint-Germain",
        away: "Olympique de Marseille",
      },
    ];
    const epg = [
      {
        channel: "Canal+ Foot",
        start: "2026-08-30T20:00:00.000Z",
        end: "2026-08-30T22:00:00.000Z",
        title: "Paris Saint-Germain / Olympique de Marseille",
        epgHome: "Paris Saint-Germain",
        epgAway: "Olympique de Marseille",
      },
    ];
    const teams = {
      "Ligue 1": {
        "Paris Saint-Germain": [],
        "Olympique de Marseille": ["OM"],
      },
    };

    const result = await mergeData(ics, epg, teams);

    expect(result[0].broadcasters).toEqual(["Canal+ Foot"]);
    expect(result[0].homeId).toBe("Paris Saint-Germain");
    expect(result[0].awayId).toBe("Olympique de Marseille");
  });

  it("résout un alias vers son nom canonique (régression bug Espagne)", async () => {
    // Avant fix : la clé teams.json était "Spain" avec alias "Espagne", ce
    // qui cassait le matching des favoris côté frontend. Ici on vérifie que
    // la résolution alias -> nom canonique fonctionne dans les deux sens.
    const ics = [
      {
        uid: "2",
        title: "Spain - France",
        start: "2026-08-30T20:00:00.000Z",
        end: "2026-08-30T22:00:00.000Z",
        sport: "football",
        competition: "National",
        home: "Spain",
        away: "France",
      },
    ];
    const teams = {
      National: {
        Espagne: ["Spain", "España"],
        France: ["France"],
      },
    };

    const result = await mergeData(ics, [], teams);

    expect(result[0].homeId).toBe("Espagne");
    expect(result[0].awayId).toBe("France");
  });

  it("résout le même nom d'équipe différemment selon la compétition (Toulouse foot vs rugby)", async () => {
    const ics = [
      {
        uid: "3a",
        title: "Toulouse - Lens",
        start: "2026-08-30T20:00:00.000Z",
        end: "2026-08-30T22:00:00.000Z",
        sport: "football",
        competition: "Ligue 1",
        home: "Toulouse",
        away: "Lens",
      },
      {
        uid: "3b",
        title: "Toulouse - La Rochelle",
        start: "2026-08-30T20:00:00.000Z",
        end: "2026-08-30T22:00:00.000Z",
        sport: "rugby",
        competition: "Rugby",
        home: "Toulouse",
        away: "La Rochelle",
      },
    ];
    const teams = {
      "Ligue 1": { Toulouse: [] },
      Rugby: { "Stade Toulousain": ["Stade Toulousain", "Toulouse"] },
    };

    const result = await mergeData(ics, [], teams);

    expect(result[0].homeId).toBe("Toulouse");
    expect(result[1].homeId).toBe("Stade Toulousain");
  });
});
