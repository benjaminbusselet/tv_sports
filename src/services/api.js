// Configuration automatique selon l'environnement
const BASE_URL =
  import.meta.env.MODE === "development" ? "/data" : "/tv_sports/data";

export async function fetchEvents({ day, sport }) {
  const dataPath = `${BASE_URL}/progs_${day}.json`;

  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error("Network response was not ok");
    const events = await response.json();

    // Si sport est "teams", on fait le croisement avec les équipes activées
    if (sport === "teams") {
      const { getTeamNames } = await import("./sources");
      const teamNames = getTeamNames();

      const teamEvents = events.filter((event) => {
        const homeMatch = teamNames.includes(event.home);
        const awayMatch = teamNames.includes(event.away);
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
