import sources from "../../config/icsSources.json";

export function getTeamNames() {
  const teams = sources
    .filter((source) => source.type === "team" && source.enabled)
    .map((source) => source.name);
  return teams;
}

export function getSportSources(sport) {
  console.log("getSportSources called with sport:", sport);
  console.log("All sources:", sources.length);

  const filtered = sources.filter(
    (source) => source.enabled && source.sport === sport
  );
  console.log(`Sources for sport '${sport}':`, filtered.length);
  console.log("Filtered sources:", filtered);

  return filtered;
}
