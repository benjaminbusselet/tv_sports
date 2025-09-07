#!/usr/bin/env node

/**
 * Script de vérification pré-développement
 * Vérifie que les fichiers JSON nécessaires existent et les génère si besoin
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const dataDir = path.join("public", "data");

// Fonction pour obtenir la date d'aujourd'hui au format YYYYMMDD
function getTodayYMD() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// Fonction pour ajouter des jours à une date YYYYMMDD
function addDaysToYMD(ymd, days) {
  const year = parseInt(ymd.slice(0, 4));
  const month = parseInt(ymd.slice(4, 6)) - 1; // JS months are 0-indexed
  const day = parseInt(ymd.slice(6, 8));

  const date = new Date(year, month, day);
  date.setDate(date.getDate() + days);

  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0")
  );
}

// Vérifier les fichiers JSON nécessaires
async function checkDataFiles() {
  console.log("🔍 Vérification des fichiers de données...");

  try {
    // Créer le dossier data s'il n'existe pas
    await fs.mkdir(dataDir, { recursive: true });

    // Lister les fichiers JSON existants
    const files = await fs.readdir(dataDir);
    const jsonFiles = files
      .filter((f) => f.startsWith("progs_") && f.endsWith(".json"))
      .map((f) => f.replace("progs_", "").replace(".json", ""))
      .sort();

    console.log(`📁 Fichiers JSON trouvés: ${jsonFiles.length}`);

    // Vérifier si on a au moins les 7 prochains jours
    const today = getTodayYMD();
    const neededDays = [];

    for (let i = 0; i < 7; i++) {
      const day = addDaysToYMD(today, i);
      if (!jsonFiles.includes(day)) {
        neededDays.push(day);
      }
    }

    if (neededDays.length > 0) {
      console.log(`⚠️  Fichiers manquants: ${neededDays.join(", ")}`);
      console.log("🚀 Génération des données manquantes...");

      // Exécuter le pipeline de build
      await new Promise((resolve, reject) => {
        const buildProcess = spawn("node", ["scripts/build.js"], {
          stdio: "inherit",
          cwd: process.cwd(),
        });

        buildProcess.on("close", (code) => {
          if (code === 0) {
            console.log("✅ Données générées avec succès!");
            resolve();
          } else {
            console.error("❌ Erreur lors de la génération des données");
            reject(new Error(`Build failed with code ${code}`));
          }
        });
      });
    } else {
      console.log("✅ Tous les fichiers de données sont présents");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error.message);
    process.exit(1);
  }
}

// Vérifier les fichiers de configuration
async function checkConfigFiles() {
  console.log("🔧 Vérification des fichiers de configuration...");

  const configFiles = [
    "public/config/userSettings.json",
    "public/config/icsSources.json",
  ];

  for (const file of configFiles) {
    try {
      await fs.access(file);
      console.log(`✅ ${file} présent`);
    } catch {
      console.log(`⚠️  ${file} manquant`);
      // Les fichiers de config devraient être copiés par le build
    }
  }
}

// Exécution principale
async function main() {
  console.log("🧪 === Vérification pré-développement ===\n");

  await checkConfigFiles();
  console.log();
  await checkDataFiles();

  console.log("\n🎉 Vérifications terminées - Prêt pour le développement!");
}

main().catch(console.error);
