#!/usr/bin/env node
/* eslint-env node */
/* global process */
/**
 * ICS Fetcher — Fixtur.es only (YYYYMMDD)
 * - Lit config/icsSources.json (https)
 * - Parse VEVENT
 * - Filtre au jour Europe/Paris (YYYYMMDD), déduplique, trie
 * - --keep => écrit public/data/ics-YYYYMMDD.json
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
  const lines = content.split(/\r?\n/),
    out = [];
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
    const key = line.slice(0, i),
      val = line.slice(i + 1).trim();
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
    .trim();
  const parts = clean.split(/\s+(?:\/|v|vs|versus|–|—|-)\s+/i);
  return parts.length >= 2
    ? { home: parts[0].trim(), away: parts[1].trim() }
    : { home: "", away: "" };
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
  return `${yy}${mm}${dd}`; // YYYYMMDD
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
    const ta = +new Date(a.start),
      tb = +new Date(b.start);
    return ta === tb
      ? nk(a.competition).localeCompare(nk(b.competition))
      : ta - tb;
  });
}

function norm(ev, source) {
  const { home, away } = extractTeams(ev.title);
  return {
    uid: ev.uid || "",
    title: ev.title || "",
    start: toISO(ev.start),
    end: toISO(ev.end),
    sport: source?.sport || "football",
    competition: source?.name || "",
    broadcasters: [],
    home,
    away,
  };
}

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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const ymd = process.argv[2];
    if (!/^\d{8}$/.test(ymd || "")) {
      console.error("Usage: node scripts/ics.js YYYYMMDD [--keep]");
      process.exit(1);
    }
    const data = await fetchIcs(ymd);
    const keep =
      process.env.KEEP_INTERMEDIATE === "1" || process.argv.includes("--keep");
    if (keep) {
      const outDir = path.join(__dirname, "../public/data");
      await fs.mkdir(outDir, { recursive: true });
      const outFile = path.join(outDir, `ics-${ymd}.json`);
      await fs.writeFile(outFile, JSON.stringify(data, null, 2), "utf-8");
      console.log(
        `✔ wrote ${path.relative(path.join(__dirname, "../../"), outFile)} (${
          data.length
        } events)`
      );
    } else {
      console.log(
        `ℹ ics.js: ${data.length} events for ${ymd} (not written; add --keep)`
      );
    }
  })().catch((e) => {
    console.error(e.message || String(e));
    process.exit(1);
  });
}
