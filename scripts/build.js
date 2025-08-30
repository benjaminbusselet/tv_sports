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

const run = (...args) => {
  const filteredArgs = args.filter(Boolean);
  console.log(`🔧 Running: node ${filteredArgs.join(" ")}`);
  try {
    sh("node", filteredArgs, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`❌ Error running: node ${filteredArgs.join(" ")}`);
    console.error(error.message);
    return false;
  }
};

const aliasCount = (obj) =>
  Object.values(obj || {})
    .flatMap((m) => Object.values(m))
    .reduce((a, v) => a + (v?.length || 0), 0);

const checkFileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};

const start = ARG || todayParisYMD();
const days = Array.from({ length: 8 }, (_, i) => addDaysYMD(start, i));
const keepArg = KEEP ? "--keep" : undefined;

let totalPROGS = 0,
  totalAliasAdded = 0,
  successfulDays = 0,
  failedDays = [];

console.log(
  `🚀 Starting build for ${days.length} days: ${start} → ${days.at(-1)}`
);
console.log(`📁 Output directory: ${outDir}`);
console.log(`🔧 Keep intermediates: ${KEEP ? "YES" : "NO"}`);
console.log(`📅 Days to process: ${days.join(", ")}`);
console.log(
  `⚠️  EPG available only for first 3 days (Open-EPG limitation J-2→J+2)`
);
console.log("");

// Génération T..T+7 ; EPG seulement pour J..J+2 (cache interne)
for (let i = 0; i < days.length; i++) {
  const ymd = days[i];
  console.log(`📅 Processing day ${i + 1}/${days.length}: ${ymd}`);

  let daySuccess = true;

  // 1. ICS (toujours)
  console.log(`  📊 Fetching ICS data...`);
  if (!run("scripts/ics.js", ymd, keepArg)) {
    console.error(`  ❌ ICS failed for ${ymd}`);
    daySuccess = false;
  } else {
    console.log(`  ✅ ICS completed`);
  }

  // 2. EPG (seulement J, J+1, J+2)
  if (i <= 2) {
    console.log(`  📺 Fetching EPG data...`);
    if (!run("scripts/epg.js", ymd, keepArg)) {
      console.error(`  ❌ EPG failed for ${ymd}`);
      daySuccess = false;
    } else {
      console.log(`  ✅ EPG completed`);
    }
  } else {
    console.log(`  ⏭️  EPG skipped (outside J-2→J+2 window)`);
  }

  // 3. Alias before/after
  const teamsPath = path.join("config", "teams.json");
  const before = await fs
    .readFile(teamsPath, "utf-8")
    .then(JSON.parse)
    .catch(() => ({}));
  const beforeCnt = aliasCount(before);

  // 4. Merge
  console.log(`  🔀 Merging data...`);
  if (!run("scripts/merge.js", ymd, keepArg)) {
    console.error(`  ❌ Merge failed for ${ymd}`);
    daySuccess = false;
  } else {
    console.log(`  ✅ Merge completed`);
  }

  // 5. Vérification du fichier généré
  const progsFile = path.join(outDir, `progs_${ymd}.json`);
  const exists = await checkFileExists(progsFile);
  const size = await getFileSize(progsFile);

  if (exists) {
    console.log(`  📁 progs_${ymd}.json created (${size} bytes)`);
    try {
      const content = JSON.parse(await fs.readFile(progsFile, "utf-8"));
      const eventCount = content.length;
      totalPROGS += eventCount;
      console.log(`  📊 Events: ${eventCount}`);
    } catch (error) {
      console.error(`  ⚠️  Warning: Invalid JSON in progs_${ymd}.json`);
    }
  } else {
    console.error(`  ❌ progs_${ymd}.json NOT CREATED`);
    daySuccess = false;
  }

  // 6. Count alias changes
  const after = await fs
    .readFile(teamsPath, "utf-8")
    .then(JSON.parse)
    .catch(() => ({}));
  const aliasAdded = Math.max(0, aliasCount(after) - beforeCnt);
  totalAliasAdded += aliasAdded;

  if (aliasAdded > 0) {
    console.log(`  🏷️  New aliases: +${aliasAdded}`);
  }

  if (daySuccess) {
    successfulDays++;
    console.log(`  ✅ Day ${ymd} completed successfully`);
  } else {
    failedDays.push(ymd);
    console.log(`  ❌ Day ${ymd} had errors`);
  }

  console.log("");
}

// 7. Purge (une seule fois à la fin)
console.log(`🧹 Cleaning up files...`);
const wantProgs = new Set(days.map((d) => `progs_${d}.json`));
const files = await fs.readdir(outDir);

let removedCount = 0;

if (KEEP) {
  console.log(`  🔄 Removing old progs_ files (keeping intermediates)...`);
  for (const f of files) {
    if (f.startsWith("progs_") && f.endsWith(".json") && !wantProgs.has(f)) {
      await fs.unlink(path.join(outDir, f));
      removedCount++;
      console.log(`  🗑️  Removed: ${f}`);
    }
  }
} else {
  console.log(`  🔄 Removing all intermediate files (keeping only progs_)...`);
  for (const f of files) {
    const keep =
      f.startsWith("progs_") && f.endsWith(".json") && wantProgs.has(f);
    if (!keep) {
      await fs.unlink(path.join(outDir, f));
      removedCount++;
      console.log(`  🗑️  Removed: ${f}`);
    }
  }
}

console.log(`🧹 Cleanup completed (${removedCount} files removed)`);
console.log("");

// 8. Résumé final
console.log(`🎉 Build completed!`);
console.log(
  `📅 Period: ${start} → ${days.at(-1)} (${
    KEEP ? "kept intermediates" : "finals only"
  })`
);
console.log(`✅ Successful days: ${successfulDays}/${days.length}`);
console.log(`📊 Total events: ${totalPROGS}`);
console.log(`🏷️  New aliases: +${totalAliasAdded}`);

if (failedDays.length > 0) {
  console.log(`❌ Failed days: ${failedDays.join(", ")}`);
  process.exit(1);
} else {
  console.log(`🎯 All days processed successfully!`);
}
