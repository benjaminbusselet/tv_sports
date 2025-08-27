import sources from "../../config/icsSources.json";

export function getTeamNames() {
  return sources
    .filter((source) => source.type === "team" && source.enabled)
    .map((source) => source.name);
}

export function getSportSources(sport) {
  return sources.filter(
    (source) =>
      source.enabled &&
      (sport === "teams" ? source.type === "team" : source.sport === sport)
  );
}
