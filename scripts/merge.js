#!/usr/bin/env node

/* eslint-env node */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ymd = process.argv[2];
const KEEP = process.argv.includes("--keep");

if (!/^\d{8}$/.test(ymd || "")) {
  console.error("Usage: node scripts/merge.js YYYYMMDD [--keep]");
  process.exit(1);
}

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

// Vérifie si match un samedi à 17h00 heure de Paris pour Ligues spéciales
const isSat17Paris = (iso) => {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));

  const m = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return m.weekday === "Sat" && m.hour === "17";
};

// Fonction utilitaire pour lire les fichiers JSON, retourne [] si absent ou erreur
const tryRead = async (paths) => {
  for (const p of paths) {
    try {
      return JSON.parse(await fs.readFile(p, "utf-8"));
    } catch {}
  }
  return [];
};

// Fonction principale exportée pour pipeline en mémoire
export async function mergeData(ics, epg, teams, ymd) {
  const pData = "public/data";
  const pConf = "config";

  // Charger les sources ICS pour les defaultBroadcasters
  const icsSources = await tryRead([path.join(pConf, "icsSources.json")]);

  // Construction d'un index alias -> nom officiel par compétition
  const idx = {};
  for (const [comp, map] of Object.entries(teams || {})) {
    const m = (idx[comp] = {});
    for (const [team, aliases] of Object.entries(map || {})) {
      m[norm(team)] = team;
      for (const a of aliases || []) m[norm(a)] = team;
    }
  }

  // Mapper un programme EPG à sa chaine, équipes officielles, date
  const mapEpg = (comp, p) => {
    const m = idx[comp] || {};
    const h = m[norm(p.epgHome)],
      a = m[norm(p.epgAway)];
    return h && a ? { ch: p.channel, h, a, st: p.start } : null;
  };

  const out = [];
  for (const ev of ics || []) {
    let comp = ev.competition;
    const H = norm(ev.home),
      A = norm(ev.away);

    // Mapper les compétitions par sport pour les sources d'équipe
    if (ev.sport === "rugby" && !idx[comp]) {
      comp = "Rugby"; // Forcer la compétition Rugby pour les équipes de rugby
    } else if (ev.sport === "football" && norm(ev.home) === "toulouse fc") {
      comp = "Ligue 1";
    }

    // Trouve les candidats EPG matching équipes + fenêtre de temps stricte ±1h
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

    // Fallback diffuseur par défaut
    if (!chan) {
      if (comp === "Serie A") chan = "DAZN";
      else if (comp === "Ligue 1")
        chan = isSat17Paris(ev.start) ? "beIN SPORTS 1" : "Ligue 1+";
    }

    // Si toujours pas de diffuseur, utiliser les defaultBroadcasters de la source ICS
    if (!chan) {
      const matchingSource = icsSources.find((source) => {
        if (source.type === "team") {
          // Pour les équipes, chercher avec normalisation
          const m = idx[comp] || {};
          const homeOfficial = m[norm(ev.home)] || ev.home;
          const awayOfficial = m[norm(ev.away)] || ev.away;
          return homeOfficial === source.name || awayOfficial === source.name;
        }
        // Chercher par competition
        else if (source.type === "competition") {
          return comp === source.name;
        }
        return false;
      });

      if (
        matchingSource &&
        matchingSource.defaultBroadcasters &&
        matchingSource.defaultBroadcasters.length > 0
      ) {
        chan = matchingSource.defaultBroadcasters[0]; // Prendre le premier diffuseur par défaut
      }
    }

    // Utiliser les noms officiels normalisés si disponibles
    const m = idx[comp] || {};
    let homeOfficial = m[norm(ev.home)] || ev.home;
    let awayOfficial = m[norm(ev.away)] || ev.away;

    // Appliquer les traductions globales si disponibles
    const translations = await tryRead([path.join(pConf, "translations.json")]);
    if (translations) {
      const allTranslations = {
        ...translations.countries,
        ...translations.cities,
        ...translations.teams,
      };
      homeOfficial = allTranslations[homeOfficial] || homeOfficial;
      awayOfficial = allTranslations[awayOfficial] || awayOfficial;
    }

    // Conserver le titre original pour les sports sans équipes (F1, etc.)
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
      away: awayOfficial,
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
      console.error("Usage: node scripts/merge.js YYYYMMDD [--keep]");
      process.exit(1);
    }

    // Lit les fichiers JSON depuis disque
    const pData = "public/data";
    const pConf = "config";

    const ics = await tryRead([
      path.join(pData, `ics_${ymd}.json`),
      path.join(pData, `ics-${ymd}.json`),
    ]);
    const epg = await tryRead([
      path.join(pData, `epg_${ymd}.json`),
      path.join(pData, `epg-${ymd}.json`),
    ]);
    const teams = await tryRead([path.join(pConf, "teams.json")]);

    const merged = await mergeData(ics, epg, teams, ymd);

    // Dossier sortie
    await fs.mkdir(pData, { recursive: true });

    const outFile = path.join(pData, `progs_${ymd}.json`);
    await fs.writeFile(outFile, JSON.stringify(merged, null, 2), "utf-8");

    console.log(`✔ wrote ${outFile} (${merged.length} events)`);

    // Gestion --keep éventuelle pour nettoyage dans pipeline externe
  })().catch((e) => {
    console.error(e.message || String(e));
    process.exit(1);
  });
}
