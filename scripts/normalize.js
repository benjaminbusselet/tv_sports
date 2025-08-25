import fs from "fs";
import path from "path";

/**
 * normalize.js
 *
 * Single source of truth for channel normalization.
 * - Reads config/channels.json (object: { CanonicalName: [aliases...] })
 * - Builds a fast in-memory alias -> canonical map (case/diacritics/spacing insensitive)
 * - Exposes helpers to normalize a single channel or an array of broadcasters
 * - Also exports two small utilities kept here for convenience: toISO, makeUid
 *
 * No hard-coded channels here: everything comes from config/channels.json.
 */

// ------------------------
// Internal helpers
// ------------------------

/**
 * Produce a robust, comparable key from a channel string.
 * - lowercases
 * - removes diacritics
 * - trims
 * - collapses inner whitespace
 */
function keyOf(input) {
  if (input == null) return "";
  // Remove diacritics then lowercase
  let s = String(input)
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();
  // Collapse any weird whitespace and trim
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/**
 * Build alias -> canonical map from channels.json content shaped like:
 * {
 *   "Canal+": ["Canal+", "Canal+ Foot", ...],
 *   "beIN Sports": ["beIN Sports", "beIN SPORTS 1", ...]
 * }
 */
function buildAliasMap(rawObject) {
  const map = new Map();
  for (const [canonical, aliases] of Object.entries(rawObject || {})) {
    const kCanon = keyOf(canonical);
    // Map canonical to itself
    if (kCanon) map.set(kCanon, canonical);
    // Map all aliases to canonical
    if (Array.isArray(aliases)) {
      for (const a of aliases) {
        const k = keyOf(a);
        if (!k) continue;
        // Last-write-wins is fine; duplicates collapse
        map.set(k, canonical);
      }
    }
  }
  return map;
}

// ------------------------
// Load channels.json ONCE at module import (synchronous, tiny file)
// ------------------------
const channelsPath = path.resolve("config/channels.json");
const channelsJson = JSON.parse(fs.readFileSync(channelsPath, "utf-8"));
const aliasToCanonical = buildAliasMap(channelsJson);

// ------------------------
// Public API
// ------------------------

/**
 * Convert a (date, time) expressed in local calendar data to a UTC ISO string.
 * dateStr = YYYY-MM-DD, timeStr = HH:MM:SS (optional)
 */
export function toISO(dateStr, timeStr) {
  const [Y, M, D] = String(dateStr).split("-").map(Number);
  const [h, m, s] = String(timeStr || "00:00:00")
    .split(":")
    .map(Number);
  const d = new Date(Date.UTC(Y, (M || 1) - 1, D || 1, h || 0, m || 0, s || 0));
  return d.toISOString(); // Always UTC output
}

/**
 * Construct a stable uid from date + title-like string.
 */
export function makeUid({ dateEvent, strEvent }) {
  return `${dateEvent}-${strEvent}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Normalize a single channel/broadcaster name to its canonical label.
 * If unknown, returns the original input unchanged.
 */
export function normalizeChannel(name) {
  if (!name) return name;
  const hit = aliasToCanonical.get(keyOf(name));
  return hit || name;
}

/**
 * Normalize an array of broadcasters.
 * - maps each to canonical
 * - de-duplicates while preserving order of first appearance
 * - drops falsy entries
 */
export function normalizeBroadcasters(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const norm = normalizeChannel(item);
    if (!norm) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

/**
 * Expose the alias map for advanced use (e.g., building EPG filters).
 * Read-only snapshot (Map is fine to share, but please don't mutate it).
 */
export function getAliasMap() {
  return aliasToCanonical;
}
