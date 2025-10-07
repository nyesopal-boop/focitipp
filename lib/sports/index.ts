export type HeadToHeadMatch = {
  date: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  cornersHome: number | null;
  cornersAway: number | null;
  yellowHome: number | null;
  yellowAway: number | null;
};

export interface SportsProvider {
  getTeamIdByName(name: string): Promise<string | null>;
  getHeadToHeadWithStats(teamIdA: string, teamIdB: string, limit: number): Promise<HeadToHeadMatch[]>;
}

// --- Válassz adaptert env alapján:
export async function getProvider(): Promise<SportsProvider> {
  const p = (process.env.SPORTS_API_PROVIDER || "mock").toLowerCase();
  if (p === "api-football") {
    const { ApiFootballAdapter } = await import("./providers/apiFootball");
    return new ApiFootballAdapter();
  } else if (p === "sportmonks") {
    const { SportmonksAdapter } = await import("./providers/sportmonks");
    return new SportmonksAdapter();
  }
  const { MockAdapter } = await import("./providers/mock");
  return new MockAdapter();
}