#!/usr/bin/env node
/* eslint-env node */
import { execFileSync as sh } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const KEEP = process.argv.includes("--keep");
const ARG = process.argv.find((x) => /^\d{8}$/.test(x)) || null;

const outDir = path.join("public", "data");
await fs.mkdir(outDir, { recursive: true });

const fmtParis = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const ymdParis = (d) => fmtParis.format(d).replaceAll("-", "");
const todayParisYMD = () => ymdParis(new Date());
const addDaysYMD = (ymd, n) => {
  const y = +ymd.slice(0, 4),
    m = +ymd.slice(4, 6),
    d = +ymd.slice(6, 8);
  const t = Date.UTC(y, m - 1, d) + n * 86400000;
  return ymdParis(new Date(t));
};
const run = (...args) => sh("node", args.filter(Boolean), { stdio: "inherit" });

const start = ARG || todayParisYMD();
const days = Array.from({ length: 8 }, (_, i) => addDaysYMD(start, i));
const keepArg = KEEP ? "--keep" : null;

const aliasCount = (obj) =>
  Object.values(obj || {})
    .flatMap((m) => Object.values(m))
    .reduce((a, v) => a + (v?.length || 0), 0);
let totalPROGS = 0,
  totalAliasAdded = 0;

// Génération T..T+7 ; EPG seulement pour J..J+2 (cache interne)
for (let i = 0; i < days.length; i++) {
  const ymd = days[i];

  run("scripts/ics.js", ymd, keepArg);
  if (i <= 2) run("scripts/epg.js", ymd, keepArg);

  // alias before/after
  const teamsPath = path.join("config", "teams.json");
  const before = await fs
    .readFile(teamsPath, "utf-8")
    .then(JSON.parse)
    .catch(() => ({}));
  const beforeCnt = aliasCount(before);

  run("scripts/checkTeams.js", ymd);
  run("scripts/merge.js", ymd, keepArg);

  const after = await fs
    .readFile(teamsPath, "utf-8")
    .then(JSON.parse)
    .catch(() => ({}));
  totalAliasAdded += Math.max(0, aliasCount(after) - beforeCnt);

  // compter uniquement les PROGS (toujours écrits)
  const progsFile = path.join(outDir, `progs_${ymd}.json`);
  try {
    totalPROGS += JSON.parse(await fs.readFile(progsFile, "utf-8")).length;
  } catch {}
}

// Purge
const wantProgs = new Set(days.map((d) => `progs_${d}.json`));
const files = await fs.readdir(outDir);
if (KEEP) {
  for (const f of files)
    if (f.startsWith("progs_") && f.endsWith(".json") && !wantProgs.has(f))
      await fs.unlink(path.join(outDir, f));
} else {
  for (const f of files) {
    const keep =
      f.startsWith("progs_") && f.endsWith(".json") && wantProgs.has(f);
    if (!keep) await fs.unlink(path.join(outDir, f));
  }
}

console.log(
  `✔ build done ${start}→${days.at(-1)} (${
    KEEP ? "kept intermediates" : "finals only"
  })`
);
console.log(`ℹ summary: PROGS=${totalPROGS} | aliases+${totalAliasAdded}`);
