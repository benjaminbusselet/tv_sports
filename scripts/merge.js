#!/usr/bin/env node

/* eslint-env node */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PCONF = "public/config";
const PDATA = "public/data";

// Normalisation des chaînes de caractères
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tms = (s) => new Date(s).getTime();

// Fenêtre temporelle strictement ±1 heure
const near = (a, b, ms = 60 * 60 * 1000) =>
  a && b && Math.abs(tms(a) - tms(b)) <= ms;

// Lecture JSON tolérante : retourne null si absent ou erreur
const tryRead = async (paths) => {
  for (const p of paths) {
    try {
      return JSON.parse(await fs.readFile(p, "utf-8"));
    } catch {}
  }
  return null;
};

// Fonction principale exportée pour pipeline en mémoire
export async function mergeData(ics, epg, teams) {
  // Lectures effectuées une seule fois, avant la boucle
  const icsSources = (await tryRead([path.join(PCONF, "icsSources.json")])) ?? [];

  // Construction de l'index alias -> nom officiel, par compétition
  const idx = {};
  for (const [comp, map] of Object.entries(teams || {})) {
    const m = (idx[comp] = {});
    for (const [team, aliases] of Object.entries(map || {})) {
      m[norm(team)] = team;
      for (const a of aliases || []) m[norm(a)] = team;
    }
  }

  // Mapper un programme EPG vers ses équipes normalisées + chaîne
  const mapEpg = (comp, p) => {
    const m = idx[comp] || {};
    const h = m[norm(p.epgHome)],
      a = m[norm(p.epgAway)];
    return h && a ? { ch: p.channel, h, a, st: p.start } : null;
  };

  const out = [];
  for (const ev of ics || []) {
    const comp = ev.competition;
    const H = norm(ev.home),
      A = norm(ev.away);

    // 1. Chercher un match EPG (chaîne confirmée par le guide TV)
    const cand = (epg || [])
      .map((p) => mapEpg(comp, p))
      .filter(Boolean)
      .filter((x) => {
        const same =
          (norm(x.h) === H && norm(x.a) === A) ||
          (norm(x.h) === A && norm(x.a) === H);
        return same && near(ev.start, x.st);
      })
      .sort(
        (x, y) =>
          Math.abs(tms(x.st) - tms(ev.start)) -
          Math.abs(tms(y.st) - tms(ev.start))
      );

    let chan = cand[0]?.ch || "";

    // 2. Fallback : defaultBroadcasters définis dans icsSources.json
    if (!chan) {
      const src = icsSources.find((source) => {
        if (source.type === "team") {
          const m = idx[comp] || {};
          const homeOfficial = m[norm(ev.home)] || ev.home;
          const awayOfficial = m[norm(ev.away)] || ev.away;
          return homeOfficial === source.name || awayOfficial === source.name;
        }
        return source.type === "competition" && comp === source.name;
      });

      if (src?.defaultBroadcasters?.length > 0) {
        chan = src.defaultBroadcasters[0];
      }
    }

    // Résolution des noms officiels (teams.json)
    const m = idx[comp] || {};
    const homeRaw = m[norm(ev.home)] || ev.home;
    const awayRaw = m[norm(ev.away)] || ev.away;
    const homeOfficial = homeRaw;
    const awayOfficial = awayRaw;

    const finalTitle =
      homeOfficial && awayOfficial
        ? `${homeOfficial} - ${awayOfficial}`
        : ev.title;

    out.push({
      uid: ev.uid,
      title: finalTitle,
      start: ev.start,
      end: ev.end,
      sport: ev.sport,
      competition: comp,
      home: homeOfficial,
      homeId: homeRaw,
      away: awayOfficial,
      awayId: awayRaw,
      broadcasters: chan ? [chan] : [],
    });
  }

  return out;
}

// Mode CLI pour debug ou utilisation individuelle
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const ymd = process.argv[2];
    if (!/^\d{8}$/.test(ymd || "")) {
      console.error("Usage: node scripts/merge.js YYYYMMDD");
      process.exit(1);
    }

    const ics = await tryRead([
      path.join(PDATA, `ics_${ymd}.json`),
      path.join(PDATA, `ics-${ymd}.json`),
    ]);
    const epg = await tryRead([
      path.join(PDATA, `epg_${ymd}.json`),
      path.join(PDATA, `epg-${ymd}.json`),
    ]);
    const teams = await tryRead([path.join(PCONF, "teams.json")]);

    const merged = await mergeData(ics ?? [], epg ?? [], teams ?? {});

    await fs.mkdir(PDATA, { recursive: true });
    const outFile = path.join(PDATA, `progs_${ymd}.json`);
    await fs.writeFile(outFile, JSON.stringify(merged, null, 2), "utf-8");

    console.log(`✔ wrote ${outFile} (${merged.length} events)`);
  })().catch((e) => {
    console.error(e.message || String(e));
    process.exit(1);
  });
}
