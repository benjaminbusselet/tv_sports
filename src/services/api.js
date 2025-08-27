import { getTeamNames, getSportSources } from "./sources";

const BASE_URL = "/data";

export async function fetchEvents({ day, sport }) {
  // day est déjà au format YYYYMMDD
  const dataPath = `${BASE_URL}/progs_${day}.json`;

  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error("Network response was not ok");
    const events = await response.json();

    // Appliquer les filtres côté client
    if (sport === "teams") {
      return events.filter(
        (event) => event.sport === "football" || event.sport === "rugby"
      );
    }

    // Sinon on filtre par sport
    return events.filter((event) => event.sport === sport);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
