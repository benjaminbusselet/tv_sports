import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware pour servir les fichiers statiques du build
app.use(express.static("dist"));

// Point d'entrée API pour les événements
app.get("/api/events", async (req, res) => {
  const { sport, team, day } = req.query;
  try {
    // TODO: Implémenter la logique de filtrage
    const dataPath = join(__dirname, "public/data", "progs_20250824.json");
    const data = JSON.parse(await readFile(dataPath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error("Error reading events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Pour gérer le routage côté client avec React Router
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
