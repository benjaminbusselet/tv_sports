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
      const { fetchUserSettings } = await import("./userConfig");
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
    const filteredEvents = events.filter((event) => event.sport === sport);

    return filteredEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
