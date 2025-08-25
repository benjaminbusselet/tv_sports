#!/usr/bin/env node
/* eslint-env node */
import fs from "node:fs/promises";
const ymd = process.argv[2];
if (!/^\d{8}$/.test(ymd || "")) {
  console.error("Usage: node scripts/checkTeams.js YYYYMMDD");
  process.exit(1);
}
const read = async (a) => {
  for (const p of a) {
    try {
      return JSON.parse(await fs.readFile(p, "utf-8"));
    } catch {}
  }
  return [];
};
const teams = (await read(["config/teams.json"])) || {},
  ics = await read([
    `public/data/ics_${ymd}.json`,
    `public/data/ics-${ymd}.json`,
  ]),
  epg = await read([
    `public/data/epg_${ymd}.json`,
    `public/data/epg-${ymd}.json`,
  ]);
const stop = new Set([
  "cf",
  "sc",
  "ac",
  "as",
  "ud",
  "cd",
  "sv",
  "the",
  "de",
  "of",
  "club",
]);
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const toks = (s) =>
    norm(s)
      .split(" ")
      .filter((w) => w && !stop.has(w)),
  core = (a) => a.filter((w) => w !== "fc");
const lev = (a, b) => {
  const m = a.length,
    n = b.length,
    d = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    }
  return d[m][n];
};
const comps = Object.keys(teams).length
  ? Object.fromEntries(
      Object.entries(teams).map(([c, m]) => [c, Object.keys(m)])
    )
  : ics.reduce(
      (m, x) => (
        (m[x.competition] ??= new Set()),
        m[x.competition].add(x.home),
        m[x.competition].add(x.away),
        m
      ),
      {}
    );
const namesByComp = Object.fromEntries(
    Object.entries(comps).map(([c, v]) => [c, Array.isArray(v) ? v : [...v]])
  ),
  tk = Object.fromEntries(
    Object.values(namesByComp)
      .flat()
      .map((n) => [n, toks(n)])
  );
const aliases = [
  ...new Set(epg.flatMap((p) => [p.epgHome, p.epgAway].filter(Boolean))),
];
for (const alias of aliases) {
  const a = toks(alias);
  if (!a.length) continue;
  const A = core(a);
  const hits = [];
  for (const [comp, names] of Object.entries(namesByComp))
    for (const n of names) {
      const b = tk[n],
        B = core(b),
        inter = a.filter((x) => b.includes(x));
      if (
        norm(alias) === norm(n) ||
        (a.length >= 2 &&
          b.length >= 2 &&
          inter.length === Math.min(a.length, b.length)) ||
        (A.length === 1 && B.length === 1 && lev(A[0], B[0]) <= 2)
      )
        hits.push([comp, n]);
    }
  if (hits.length !== 1) continue;
  const [comp, name] = hits[0];
  teams[comp] ??= {};
  const arr = teams[comp][name] ?? [];
  if (!arr.includes(alias)) teams[comp][name] = [...arr, alias];
}
await fs.writeFile(
  "config/teams.json",
  JSON.stringify(teams, null, 2),
  "utf-8"
);
console.log("✔ teams.json updated");
