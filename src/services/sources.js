import sources from "../../public/config/icsSources.json";

export function getTeamNames() {
  const teams = sources
    .filter((source) => source.type === "team" && source.enabled)
    .map((source) => source.name);
  return teams;
}

export function getSportSources(sport) {
  return sources.filter((source) => source.enabled && source.sport === sport);
}
