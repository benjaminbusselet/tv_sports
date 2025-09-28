#!/usr/bin/env node

/**
 * Script de vérification pré-développement
 * Vérifie que les fichiers JSON nécessaires existent et les génère si besoin
 * Utilise la même logique de dates que build.js (Europe/Paris)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const dataDir = path.join("public", "data");

// Utiliser la même logique de dates que build.js
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

// Vérifier les fichiers JSON nécessaires
async function checkDataFiles() {
  console.log(" Vérification des fichiers de données...");

  try {
    // Créer le dossier data s'il n'existe pas
    await fs.mkdir(dataDir, { recursive: true });

    // Lister les fichiers JSON existants
    const files = await fs.readdir(dataDir);
    const jsonFiles = files
      .filter((f) => f.startsWith("progs_") && f.endsWith(".json"))
      .map((f) => f.replace("progs_", "").replace(".json", ""))
      .sort();

    console.log(` Fichiers JSON trouvés: ${jsonFiles.length}`);

    // Utiliser la même logique que build.js : aujourd'hui + 7 jours
    const start = todayParisYMD();
    console.log(` Date de départ (Europe/Paris): ${start}`);
    
    const neededDays = [];
    let currentYmd = start;
    
    // Générer 8 jours (aujourd'hui + 7 jours suivants)
    for (let i = 0; i < 8; i++) {
      if (!jsonFiles.includes(currentYmd)) {
        neededDays.push(currentYmd);
      }
      currentYmd = addDaysYMD(currentYmd, 1);
    }

    if (neededDays.length > 0) {
      console.log(` Fichiers manquants: ${neededDays.join(", ")}`);
      console.log(" Génération des données manquantes...");

      // Exécuter le pipeline de build pour les jours manquants
      await new Promise((resolve, reject) => {
        const buildProcess = spawn(
          "node",
          ["scripts/build.js", ...neededDays],
          {
            stdio: "inherit",
            cwd: process.cwd(),
          }
        );

        buildProcess.on("close", (code) => {
          if (code === 0) {
            console.log(" Données générées avec succès!");
            resolve();
          } else {
            console.error(" Erreur lors de la génération des données");
            reject(new Error(`Build failed with code ${code}`));
          }
        });
      });
    } else {
      console.log(" Tous les fichiers de données sont présents");
    }
  } catch (error) {
    console.error(" Erreur lors de la vérification:", error.message);
    process.exit(1);
  }
}

// Vérifier les fichiers de configuration
async function checkConfigFiles() {
  console.log(" Vérification des fichiers de configuration...");

  const configFiles = [
    "public/config/userSettings.json",
    "public/config/icsSources.json",
  ];

  for (const file of configFiles) {
    try {
      await fs.access(file);
      console.log(` ${file} présent`);
    } catch {
      console.log(` ${file} manquant`);
      // Les fichiers de config devraient être copiés par le build
    }
  }
}

// Exécution principale
async function main() {
  console.log(" === Vérification pré-développement ===\n");

  await checkConfigFiles();
  console.log();
  await checkDataFiles();

  console.log("\n Vérifications terminées - Prêt pour le développement!");
}

main().catch(console.error);
