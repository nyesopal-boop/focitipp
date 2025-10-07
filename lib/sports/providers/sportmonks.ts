import type { SportsProvider, HeadToHeadMatch } from "..";

const BASE = process.env.SPORTS_API_BASE_URL || "https://api.sportmonks.com/v3/football";
const TOKEN = process.env.SPORTS_API_KEY!; // Sportmonks api_token

async function api(path: string) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}api_token=${TOKEN}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sportmonks error ${res.status}: ${await res.text()}`);
  return res.json();
}

function pickStat(stats: any[], label: string): number | null {
  // statistics array: [{type:{name:"corners"}, value: 5, team_id: 123}, ...] – a pontos szerkezet csomagtól függhet
  const row = stats.find((s: any) => (s?.type?.name || s?.type) && String(s?.type?.name || s?.type).toLowerCase().includes(label));
  if (!row) return null;
  const v = Number(row.value);
  return Number.isFinite(v) ? v : null;
}

export class SportmonksAdapter implements SportsProvider {
  async getTeamIdByName(name: string): Promise<string | null> {
    try {
      const q = encodeURIComponent(name.trim());
      const data = await api(`/teams/search/${q}`);
      const id = data?.data?.[0]?.id;
      return id ? String(id) : null;
    } catch (error) {
      console.error('Error searching team:', error);
      return null;
    }
  }

  async getHeadToHeadWithStats(a: string, b: string, limit: number): Promise<HeadToHeadMatch[]> {
    try {
      // include: league;participants;statistics
      const data = await api(`/fixtures/head-to-head/${a}/${b}?per_page=${limit}&include=league;participants;statistics`);
      const fixtures = (data?.data || []) as any[];
      const out: HeadToHeadMatch[] = [];

      for (const f of fixtures) {
        const date = f?.starting_at || f?.date || new Date().toISOString();
        const league = f?.league?.name || "";
        const homeTeam = f?.participants?.find((p: any) => p?.meta?.location === "home")?.name || "";
        const awayTeam = f?.participants?.find((p: any) => p?.meta?.location === "away")?.name || "";
        const score = `${f?.scores?.localteam_score ?? f?.home_score ?? 0}–${f?.scores?.visitorteam_score ?? f?.away_score ?? 0}`;
        const stats = f?.statistics || [];

        const homeId = f?.participants?.find((p: any) => p?.meta?.location === "home")?.id;
        const awayId = f?.participants?.find((p: any) => p?.meta?.location === "away")?.id;

        const statsHome = stats.filter((s: any) => s?.team_id === homeId);
        const statsAway = stats.filter((s: any) => s?.team_id === awayId);

        const cornersHome = pickStat(statsHome, "corner");
        const cornersAway = pickStat(statsAway, "corner");
        const yellowHome  = pickStat(statsHome, "yellow");
        const yellowAway  = pickStat(statsAway, "yellow");

        out.push({
          date,
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
      return out;
    } catch (error) {
      console.error('Error getting head to head:', error);
      return [];
    }
  }
}