// Configuration automatique selon l'environnement
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "" // En développement, les fichiers public/ sont à la racine
    : "/tv_sports"; // En production sur GitHub Pages

export async function fetchUserSettings() {
  try {
    const response = await fetch(`${BASE_URL}/config/userSettings.json`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user settings:", error);
    // Fallback configuration si le fichier n'est pas accessible
    return {
      sources: { enabled: [] },
      display: { defaultTab: "all" },
      favorites: { teams: [], competitions: [] },
    };
  }
}

export async function fetchIcsSources() {
  try {
    const response = await fetch(`${BASE_URL}/config/icsSources.json`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching ICS sources:", error);
    return [];
  }
}

// Détermine les sports disponibles basés sur les sources activées
export async function getAvailableSports(providedUserSettings = null) {
  const userSettings = providedUserSettings || (await fetchUserSettings());
  const allSources = await fetchIcsSources();

  const enabledSources = allSources.filter((source) =>
    userSettings.sources.enabled.includes(source.id)
  );

  const sports = [...new Set(enabledSources.map((source) => source.sport))];
  return ["all", ...sports];
}
