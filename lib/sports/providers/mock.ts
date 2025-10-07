import type { SportsProvider, HeadToHeadMatch } from "..";

export class MockAdapter implements SportsProvider {
  async getTeamIdByName(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
  
  async getHeadToHeadWithStats(a: string, b: string, limit: number): Promise<HeadToHeadMatch[]> {
    const now = new Date();
    const sample: HeadToHeadMatch[] = Array.from({ length: limit }).map((_, i) => {
      const d = new Date(now); 
      d.setDate(d.getDate() - (i + 1) * 30);
      
      return {
        date: d.toISOString(),
        league: "Barátságos",
        homeTeam: "Csapat A",
        awayTeam: "Csapat B",
        score: `${Math.floor(Math.random()*3)}–${Math.floor(Math.random()*3)}`,
        cornersHome: 3 + (i % 3),
        cornersAway: 4 + (i % 2),
        yellowHome: 1 + (i % 2),
        yellowAway: 2 + (i % 3),
      };
    });
    return sample;
  }
}