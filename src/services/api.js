// Configuration automatique selon l'environnement
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5174" // URL absolue pour debug
    : "/tv_sports"; // En production sur GitHub Pages

export async function fetchEvents({ day, sport }) {
  const dataPath = `${BASE_URL}/data/progs_${day}.json`;

  console.log("🔍 Fetching events:", { day, sport, dataPath });

  try {
    const response = await fetch(dataPath);
    console.log("📡 Response:", response.status, response.statusText);

    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.status}`);

    const text = await response.text();
    console.log("📄 Raw response (first 100 chars):", text.substring(0, 100));

    const events = JSON.parse(text);
    console.log("✅ Parsed events:", events.length, "events");

    // Cas "all" : retourner tous les événements sans filtrage
    if (sport === "all") {
      return events;
    }

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
