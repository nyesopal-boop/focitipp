import type { SportsProvider, HeadToHeadMatch } from "..";

const BASE = process.env.SPORTS_API_BASE_URL || "https://v3.football.api-sports.io";
const KEY = process.env.SPORTS_API_KEY!; // API-Football (APISports) kulcs

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": KEY },
    ...init,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API-Football error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json;
}

function extractStatValue(
  stats: any[],
  teamId: number,
  typeNames: string[],
): number | null {
  // /fixtures/statistics -> response: [{ team:{id,name}, statistics:[{type,value}, ...]}, ...]
  const byTeam = stats.find((s: any) => s?.team?.id === teamId);
  if (!byTeam) return null;
  for (const t of typeNames) {
    const row = byTeam.statistics?.find((r: any) => r?.type?.toLowerCase() === t.toLowerCase());
    if (row && typeof row.value === "number") return row.value;
  }
  return null;
}

export class ApiFootballAdapter implements SportsProvider {
  async getTeamIdByName(name: string): Promise<string | null> {
    const q = encodeURIComponent(name.trim());
    const data = await api(`/teams?search=${q}`);
    const id = data?.response?.[0]?.team?.id;
    return id ? String(id) : null;
  }

  async getHeadToHeadWithStats(a: string, b: string, limit: number): Promise<HeadToHeadMatch[]> {
    const h2h = await api(`/fixtures/headtohead?h2h=${a}-${b}&last=${limit}`);
    const fixtures = (h2h?.response || []) as any[];

    const results: HeadToHeadMatch[] = [];
    for (const f of fixtures) {
      const fixtureId = f?.fixture?.id;
      const date = f?.fixture?.date;
      const league = f?.league?.name || "";
      const homeTeam = f?.teams?.home?.name || "";
      const awayTeam = f?.teams?.away?.name || "";
      const score = `${f?.goals?.home ?? 0}–${f?.goals?.away ?? 0}`;

      let cornersHome: number | null = null;
      let cornersAway: number | null = null;
      let yellowHome: number | null = null;
      let yellowAway: number | null = null;

      if (fixtureId) {
        try {
          const stats = await api(`/fixtures/statistics?fixture=${fixtureId}`);
          const arr = stats?.response || [];

          const homeId = f?.teams?.home?.id;
          const awayId = f?.teams?.away?.id;

          // Corner Kicks / Corners
          cornersHome = extractStatValue(arr, homeId, ["Corner Kicks", "Corners"]);
          cornersAway = extractStatValue(arr, awayId, ["Corner Kicks", "Corners"]);
          // Yellow Cards
          yellowHome = extractStatValue(arr, homeId, ["Yellow Cards"]);
          yellowAway = extractStatValue(arr, awayId, ["Yellow Cards"]);
        } catch (error) {
          console.error('Error fetching statistics for fixture:', fixtureId, error);
        }
      }

      results.push({
        date: date || new Date().toISOString(),
        league,
        homeTeam,
        awayTeam,
        score,
        cornersHome,
        cornersAway,
        yellowHome,
        yellowAway,
      });
    }
    return results;
  }
}