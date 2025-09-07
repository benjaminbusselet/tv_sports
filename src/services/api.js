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
        // Ignorer les événements sans équipes (F1, etc.)
        if (!event.home && !event.away) return false;

        // Matching simple avec les équipes favorites
        const homeMatch =
          event.home &&
          favoriteTeams.some(
            (team) =>
              event.home.toLowerCase().includes(team.toLowerCase()) ||
              team.toLowerCase().includes(event.home.toLowerCase())
          );
        const awayMatch =
          event.away &&
          favoriteTeams.some(
            (team) =>
              event.away.toLowerCase().includes(team.toLowerCase()) ||
              team.toLowerCase().includes(event.away.toLowerCase())
          );

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
