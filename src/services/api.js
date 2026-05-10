import { fetchUserSettings } from "./userConfig.js";

// Configuration automatique selon l'environnement
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "" // En développement, les fichiers public/ sont à la racine
    : "/tv_sports"; // En production sur GitHub Pages

export async function fetchEvents({ day, sport }) {
  const dataPath = `${BASE_URL}/data/progs_${day}.json`;

  try {
    const response = await fetch(dataPath);

    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.status}`);

    const events = await response.json();

    // Cas "all" : retourner tous les événements sans filtrage
    if (sport === "all") {
      return events;
    }

    // Si sport est "teams", on fait le croisement avec les équipes favorites
    if (sport === "teams") {
      const userSettings = await fetchUserSettings();
      const favoriteTeams = userSettings.favorites?.teams || [];

      const teamEvents = events.filter((event) => {
        // Ignorer les événements sans identifiant d'équipe (F1, etc.)
        if (!event.homeId && !event.awayId) return false;

        // Matching fiable avec les identifiants uniques
        const homeMatch = event.homeId && favoriteTeams.includes(event.homeId);
        const awayMatch = event.awayId && favoriteTeams.includes(event.awayId);

        return homeMatch || awayMatch;
      });
      return teamEvents;
    }

    // Sinon filtrer par sport normalement
    return events.filter((event) => event.sport === sport);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Récupère le nombre d'événements pour chaque jour en parallèle (pour le DayStrip)
export async function fetchDayCounts(days) {
  const counts = {};
  await Promise.allSettled(
    days.map(async (d) => {
      try {
        const res = await fetch(`${BASE_URL}/data/progs_${d}.json`);
        counts[d] = res.ok ? (await res.json()).length : 0;
      } catch {
        counts[d] = 0;
      }
    })
  );
  return counts;
}
