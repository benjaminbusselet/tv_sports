#!/usr/bin/env node

/* eslint-env node */

import fs from "node:fs/promises";
import path from "node:path";
import { fetchIcs } from "./ics.js";
import { fetchEpg } from "./epg.js";
import { mergeData } from "./merge.js";

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

const start = ARG || todayParisYMD();
const days = Array.from({ length: 8 }, (_, i) => addDaysYMD(start, i));

let totalPROGS = 0;
let successfulDays = 0;
let failedDays = [];

console.log(
  `🚀 Starting pipeline build for ${days.length} days: ${start} → ${days.at(
    -1
  )}`
);
console.log(`📁 Output directory: ${outDir}`);
console.log(
  `⚠️ EPG available only for first 3 days (Open-EPG limitation J-2→J+2)`
);
console.log("");

for (let i = 0; i < days.length; i++) {
  const ymd = days[i];
  console.log(`📅 Processing day ${i + 1}/${days.length}: ${ymd}`);
  let daySuccess = true;

  try {
    // 1. ICS Fetch - toujours
    console.log(" 📊 Fetching ICS data...");
    const icsData = await fetchIcs(ymd);
    console.log(` ✅ ICS fetched (${icsData.length} events)`);

    // 2. EPG Fetch - uniquement pour J..J+2
    let epgData = [];
    if (i <= 2) {
      console.log(" 📺 Fetching EPG data...");
      epgData = await fetchEpg(ymd);
      console.log(` ✅ EPG fetched (${epgData.length} programs)`);
    } else {
      console.log(" ⏭️ EPG skipped (outside J-2→J+2 window)");
    }

    // 3. Chargement teams.json
    const teamsPath = path.join("config", "teams.json");
    const teamsData = JSON.parse(await fs.readFile(teamsPath, "utf-8"));

    // 4. Merge
    console.log(" 🔀 Merging data...");
    const merged = await mergeData(icsData, epgData, teamsData, ymd);
    console.log(` ✅ Merge completed (${merged.length} events)`);

    // 5. Sauvegarde résultat
    const outFile = path.join(outDir, `progs_${ymd}.json`);
    await fs.writeFile(outFile, JSON.stringify(merged, null, 2), "utf-8");
    console.log(` 📁 Wrote ${outFile} (${merged.length} events)`);

    totalPROGS += merged.length;
    successfulDays++;
  } catch (e) {
    console.error(`❌ Failed to process day ${ymd}:`, e.message || e);
    daySuccess = false;
    failedDays.push(ymd);
  }

  console.log("");
}

console.log(`🎉 Pipeline build completed!`);
console.log(`📅 Period: ${start} → ${days.at(-1)}`);
console.log(`✅ Successful days: ${successfulDays}/${days.length}`);
console.log(`📊 Total events: ${totalPROGS}`);

if (failedDays.length > 0) {
  console.log(`❌ Failed days: ${failedDays.join(", ")}`);
  process.exit(1);
} else {
  console.log("🎯 All days processed successfully!");
}
