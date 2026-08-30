#!/usr/bin/env node

/* eslint-env node */

/**
 * EPG Fetcher - Open-EPG (YYYYMMDD)
 * - Télécharge et parse le XML EPG depuis Open-EPG
 * - Filtre au jour demandé, trie, déduplique
 * - Compatible pipeline en mémoire + CLI debug
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { XMLParser } from "fast-xml-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPEN_EPG_URL = "https://www.open-epg.com/files/france1.xml";
const CACHE_PATH = path.join("public", "data", "epg-raw_france1.xml");
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2h
const SEP = /\s+(?:\/|v|vs|versus|–|—|-)\s+/i;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const toISO = (s) => {
  const m =
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-]\d{4}))?$/.exec(
      s || ""
    );
  if (!m) return null;
  let [, Y, M, D, h, mi, se, off] = m;
  let t = Date.UTC(+Y, +M - 1, +D, +h, +mi, +se);
  if (off) {
    const sg = off.startsWith("-") ? -1 : 1,
      hh = +off.slice(1, 3),
      mm = +off.slice(3, 5);
    t -= sg * (hh * 60 + mm) * 60000;
  }
  return new Date(t).toISOString();
};

const ymdParis = (iso) => {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [dd, mm, yy] = f.format(d).split("/");
  return `${yy}${mm}${dd}`; // YYYYMMDD
};

const canonChannel = (s) => String(s || "").replace(/\.[a-z]{2}$/i, "");

const getTitle = (n) => {
  const t = n?.title;
  if (!t) return "";
  if (typeof t === "string") return t;
  if (Array.isArray(t)) return String(t[0]?.["#text"] ?? t[0] ?? "");
  if (typeof t === "object") return String(t["#text"] ?? "");
  return "";
};

const buildWhitelist = (json) => {
  const entries = Array.isArray(json)
    ? json.flatMap((c) => [
        c.canon || c.name || c.id,
        ...(c.aliases || c.variants || []),
      ])
    : Object.entries(json).flatMap(([canon, vars]) => [canon, ...(vars || [])]);
  return new Set(
    entries.map((x) => x.toLowerCase().replace(/\.[a-z]{2}$/i, ""))
  );
};

const looksLikeLimitPage = (txt) =>
  /You reached the download limit/i.test(txt) || !/]/i.test(txt);

// Utilitaire : télécharge le XML, utilise le cache pour limiter les appels
async function fetchRawXmlOnce() {
  const res = await fetch(OPEN_EPG_URL, {
    headers: { "User-Agent": "tv-sports/epg" },
  });
  const buf = new Uint8Array(await res.arrayBuffer());
  const isGz =
    OPEN_EPG_URL.endsWith(".gz") || (buf[0] === 0x1f && buf[1] === 0x8b);
  const text = isGz
    ? zlib.gunzipSync(buf).toString("utf-8")
    : Buffer.from(buf).toString("utf-8");
  return text;
}

// Utilitaire : lit le cache si récent
async function readFreshCache() {
  try {
    const st = await fs.stat(CACHE_PATH);
    if (Date.now() - st.mtimeMs <= MAX_AGE_MS)
      return await fs.readFile(CACHE_PATH, "utf-8");
  } catch {}
  return null;
}

// Récupère et parse le flux EPG complet, toutes dates confondues (pas de
// filtre par jour ici). Permet à l'appelant de ne télécharger le XML qu'une
// seule fois par run même si plusieurs jours consécutifs ont besoin de l'EPG,
// au lieu de retélécharger le même fichier une fois par jour.
export async function fetchEpgAll() {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });

  // Récupération du XML EPG (cache ou téléchargement)
  let xml = await readFreshCache();
  if (!xml) {
    const fetched = await fetchRawXmlOnce();
    if (looksLikeLimitPage(fetched)) {
      try {
        xml = await fs.readFile(CACHE_PATH, "utf-8");
        console.warn("EPG quota hit; using existing cache");
      } catch {
        console.warn("EPG quota hit; no cache available");
        return [];
      }
    } else {
      xml = fetched;
      await fs.writeFile(CACHE_PATH, xml, "utf-8");
    }
  }

  const [channelsJson] = await Promise.all([
    fs
      .readFile(path.join(__dirname, "../public/config/channels.json"), "utf-8")
      .then(JSON.parse),
  ]);

  const wl = buildWhitelist(channelsJson);

  // Parsing XML
  const j = parser.parse(xml);

  const arr = Array.isArray(j?.tv?.programme)
    ? j.tv.programme
    : [j?.tv?.programme].filter(Boolean);

  const chArr = Array.isArray(j?.tv?.channel)
    ? j.tv.channel
    : [j?.tv?.channel].filter(Boolean);

  // channel id -> display-name
  const firstName = (dn) =>
    dn
      ? typeof dn === "string"
        ? dn
        : Array.isArray(dn)
        ? String(dn[0]?.["#text"] ?? dn[0] ?? "")
        : String(dn["#text"] ?? "")
      : "";
  const id2name = new Map();
  for (const c of chArr) {
    const id = c?.["@_id"] || "";
    const name = firstName(c?.["display-name"]) || id;
    if (id) id2name.set(id, name);
  }

  // Filtre : équipes, chaînes whitelist, déduplication (pas de filtre jour)
  const out = [],
    seen = new Set();
  for (const p of arr) {
    const start = toISO(p?.["@_start"]);
    if (!start) continue;
    const end = toISO(p?.["@_stop"]);
    const title = getTitle(p).trim();
    const channel = canonChannel(id2name.get(p?.["@_channel"]) || p?.["@_channel"]);

    if (!wl.has(channel.toLowerCase())) continue;

    // Avant de filtrer par séparateur d'équipes
    const isF1 = (title.toLowerCase().includes("formule 1") ||
                   title.toLowerCase().includes("f1")) &&
                  !title.toLowerCase().includes("moto");

    // Si c'est un événement F1, on le traite différemment
    if (isF1) {
      out.push({
        channel,
        start,
        end,
        title,
        epgHome: "",  // Pas d'équipe "domicile" pour la F1
        epgAway: "",  // Pas d'équipe "extérieur" pour la F1
      });
      continue;  // Passer à l'événement suivant
    }

    // Sinon, traitement normal pour les sports d'équipe
    const parts = title.split(SEP).map((s) => s?.trim());
    if (parts.length < 2 || !parts[0] || !parts[1]) continue;

    const key = `${channel.toLowerCase()}|${start}|${title}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      channel,
      start,
      end,
      title,
      epgHome: parts[0],
      epgAway: parts[1],
    });
  }

  return out.sort((a, b) => a.start.localeCompare(b.start));
}

// Filtre un jeu de programmes déjà récupéré (fetchEpgAll) pour un jour donné.
export function filterEpgByDay(programmes, ymd) {
  return programmes.filter((p) => ymdParis(p.start) === ymd);
}

// Conserve l'API historique (un jour = un fetch + un filtre) pour le mode CLI.
// Le pipeline (build.js) doit préférer fetchEpgAll() + filterEpgByDay() pour
// éviter de retélécharger le même XML une fois par jour.
export async function fetchEpg(ymd) {
  if (!/^\d{8}$/.test(ymd || ""))
    throw new Error("fetchEpg(ymd): expected YYYYMMDD");

  const all = await fetchEpgAll();
  return filterEpgByDay(all, ymd);
}

// CLI debug : pour tester et afficher les données EPG
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const ymd = process.argv[2];
    if (!/^\d{8}$/.test(ymd || "")) {
      console.error("Usage: node scripts/epg.js YYYYMMDD");
      process.exit(1);
    }

    console.log(`📺 Fetching EPG data for ${ymd}...`);
    const data = await fetchEpg(ymd);
    console.log(`✅ EPG completed (${data.length} programs)`);

    // Affichage pour debug rapide
    if (data.length > 0) {
      console.log("\n📋 Sample programs:");
      data.slice(0, 50).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.channel})`);
      });
      if (data.length > 5) {
        console.log(`  ... and ${data.length - 5} more programs`);
      }
    }
  })().catch((e) => {
    console.error("❌ Error:", e.message || String(e));
    process.exit(1);
  });
}
