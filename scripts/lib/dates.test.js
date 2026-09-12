import { describe, it, expect } from "vitest";
import { ymdParis, todayParisYMD, addDaysYMD } from "./dates.js";

describe("ymdParis", () => {
  it("accepte un objet Date", () => {
    expect(ymdParis(new Date("2026-03-15T10:00:00Z"))).toBe("20260315");
  });

  it("accepte une string ISO", () => {
    expect(ymdParis("2026-03-15T10:00:00Z")).toBe("20260315");
  });

  it("convertit UTC vers le jour civil Europe/Paris (décalage +1h/+2h)", () => {
    // 23h30 UTC le 14 mars = 00h30 (CET, UTC+1) le 15 mars à Paris
    expect(ymdParis("2026-03-14T23:30:00Z")).toBe("20260315");
  });

  it("traverse le changement d'heure été/hiver sans décalage", () => {
    // Bascule heure d'été 2026 : dernier dimanche de mars (29/03, 1h UTC)
    expect(ymdParis("2026-03-29T00:30:00Z")).toBe("20260329"); // avant bascule (CET, UTC+1)
    expect(ymdParis("2026-03-29T01:30:00Z")).toBe("20260329"); // après bascule (CEST, UTC+2)
  });
});

describe("todayParisYMD", () => {
  it("retourne un format YYYYMMDD (8 chiffres)", () => {
    expect(todayParisYMD()).toMatch(/^\d{8}$/);
  });
});

describe("addDaysYMD", () => {
  it("additionne des jours dans le même mois", () => {
    expect(addDaysYMD("20260310", 3)).toBe("20260313");
  });

  it("traverse une fin de mois", () => {
    expect(addDaysYMD("20260228", 1)).toBe("20260301");
  });

  it("traverse une fin d'année", () => {
    expect(addDaysYMD("20261230", 3)).toBe("20270102");
  });

  it("accepte un décalage négatif", () => {
    expect(addDaysYMD("20260301", -1)).toBe("20260228");
  });
});
