import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/sports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Check authentication from cookies
    const cookie = req.headers.get("cookie") || "";
    const userEmailMatch = cookie.match(/user_email=([^;]+)/);
    
    if (!userEmailMatch) {
      return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamA = (searchParams.get("teamA") || "").trim();
    const teamB = (searchParams.get("teamB") || "").trim();
    
    if (!teamA || !teamB) {
      return NextResponse.json({ error: "Kérlek, add meg mindkét csapat nevét." }, { status: 400 });
    }
    
    const provider = await getProvider();
    const idA = await provider.getTeamIdByName(teamA);
    const idB = await provider.getTeamIdByName(teamB);
    
    if (!idA || !idB) {
      return NextResponse.json({ error: "Nem található valamelyik csapat azonosítója." }, { status: 404 });
    }
    
    const matches = await provider.getHeadToHeadWithStats(idA, idB, 5);
    return NextResponse.json({ matches });
  } catch (e: any) {
    console.error('H2H API error:', e);
    return NextResponse.json({ error: `Hiba történt a H2H adatok lekérésekor: ${e?.message || "ismeretlen"}` }, { status: 500 });
  }
}