#!/usr/bin/env node

/* eslint-env node */

/**
 * ICS Fetcher - Fixtures only (YYYYMMDD)
 * - Lit config/icsSources.json (https)
 * - Parse VEVENT
 * - Filtre au jour Europe/Paris (YYYYMMDD), déduplique, trie
 * - Compatible pipeline en mémoire + CLI debug
 */

import fs from "node:fs/promises";
import https from "node:https";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url.replace(/^webcal:\/\//, "http://"),
        { headers: { "User-Agent": "tv-sports/ics" } },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => resolve(data));
        }
      )
      .on("error", reject);
  });
}

function parseICS(content) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let ev = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      ev = {};
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (ev) out.push(ev);
      ev = null;
      continue;
    }
    if (!ev) continue;

    const i = line.indexOf(":");
    if (i === -1) continue;

    const key = line.slice(0, i);
    const val = line.slice(i + 1).trim();

    if (key === "SUMMARY") ev.title = val;
    else if (key === "DESCRIPTION") ev.description = val;
    else if (key === "URL") ev.url = val;
    else if (key.startsWith("DTSTART")) ev.start = val;
    else if (key.startsWith("DTEND")) ev.end = val;
    else if (key === "UID") ev.uid = val;
    else if (key === "LOCATION") ev.location = val;
  }

  return out;
}

function toISO(dt) {
  if (!dt) return null;

  let m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(dt);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)).toISOString();
  }

  m = /^(\d{4})(\d{2})(\d{2})$/.exec(dt);
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, 0, 0, 0)).toISOString();
  }

  return dt;
}

function extractTeams(title = "") {
  const clean = title
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^⚽\s*/u, "")
    .replace(/^🏉\s*/u, "")
    .trim();

  const parts = clean.split(/\s+(?:\/|v|vs|versus|–|—|-)\s+/i);

  if (parts.length >= 2) {
    // Nettoyer les noms d'équipes en retirant les [WC Qualifiers], etc.
    const cleanHome = parts[0]
      .trim()
      .replace(/\s*\[.*\]$/, "")
      .trim();
    const cleanAway = parts[1]
      .trim()
      .replace(/\s*\[.*\]$/, "")
      .trim();

    return { home: cleanHome, away: cleanAway };
  }

  return { home: "", away: "" };
}

function parisYMD(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [dd, mm, yy] = f.format(d).split("/");
  return `${yy}${mm}${dd}`;
}

function stripAccents(s = "") {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function nk(s = "") {
  return stripAccents(String(s).toLowerCase().trim());
}

function eventKey(ev) {
  return [nk(ev.competition), nk(ev.home), nk(ev.away), ev.start].join("|");
}

function dedupeAndSort(items) {
  const map = new Map();

  for (const ev of items) {
    const k = eventKey(ev);
    if (!map.has(k)) {
      map.set(k, { ...ev, broadcasters: [] });
      continue;
    }

    const base = map.get(k);
    if (!base.url && ev.url) base.url = ev.url;
    if (!base.location && ev.location) base.location = ev.location;
    if (!base.description && ev.description) base.description = ev.description;
  }

  return Array.from(map.values()).sort((a, b) => {
    const ta = +new Date(a.start);
    const tb = +new Date(b.start);
    return ta === tb
      ? nk(a.competition).localeCompare(nk(b.competition))
      : ta - tb;
  });
}

function norm(ev, source) {
  const originalTitle = ev.title || "";

  // Extraire la compétition depuis le titre original (partie entre crochets)
  const competitionMatch = originalTitle.match(/\[([^\]]+)\]$/);
  const extractedCompetition = competitionMatch ? competitionMatch[1] : "";

  // Nettoyer le titre en retirant les informations entre crochets
  const cleanTitle = originalTitle.replace(/\s*\[.*\]$/, "").trim();

  const { home, away } = extractTeams(originalTitle);
  let title = cleanTitle;
  let broadcaster = "";

  // Nettoyer les titres tv-sports.fr
  if (source.url.includes("tv-sports.fr")) {
    // 1. Supprimer uniquement l'emoji rugby
    title = title.replace(/🏉\s*/, "");

    // 2. Extraire diffuseur si présent, sinon garder defaultBroadcasters
    const broadcasterMatch = title.match(/\s*\(([^)]+)\)$/);
    if (broadcasterMatch) {
      broadcaster = broadcasterMatch[1];
      title = title.replace(/\s*\([^)]+\)$/, "");
    }

    // 3. Nettoyer seulement les espaces en fin
    title = title.trim();
  }

  return {
    uid: ev.uid || "",
    title,
    start: toISO(ev.start),
    end: toISO(ev.end),
    sport: source?.sport || "football",
    competition: extractedCompetition || source?.name || "",
    broadcasters: [],
    home,
    away,
  };
}

// ✅ FONCTION EXPORTÉE - Compatible Pipeline en Mémoire
export async function fetchIcs(ymd) {
  if (!/^\d{8}$/.test(ymd || ""))
    throw new Error("fetchIcs(ymd): expected YYYYMMDD");

  const cfgPath = path.join(__dirname, "../config/icsSources.json");
  const sources = JSON.parse(await fs.readFile(cfgPath, "utf-8")).filter(
    (s) => s.enabled && s.url
  );

  const results = await Promise.allSettled(
    sources.map(async (s) =>
      parseICS(await httpGet(s.url)).map((ev) => norm(ev, s))
    )
  );

  const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const filtered = all.filter((ev) => parisYMD(ev.start) === ymd);

  return dedupeAndSort(filtered);
}

// ✅ PARTIE CLI - Interface Debug Simplifiée
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const ymd = process.argv[2];
    if (!/^\d{8}$/.test(ymd || "")) {
      console.error("Usage: node scripts/ics.js YYYYMMDD");
      process.exit(1);
    }

    console.log(`📊 Fetching ICS data for ${ymd}...`);
    const data = await fetchIcs(ymd);
    console.log(`✅ ICS completed (${data.length} events)`);

    // Affichage détaillé pour debug
    if (data.length > 0) {
      console.log("\n📋 Events found:");
      data.slice(0, 5).forEach((ev, i) => {
        console.log(` ${i + 1}. ${ev.title} (${ev.competition})`);
      });
      if (data.length > 5) {
        console.log(` ... and ${data.length - 5} more events`);
      }
    }
  })().catch((e) => {
    console.error("❌ Error:", e.message || String(e));
    process.exit(1);
  });
}
