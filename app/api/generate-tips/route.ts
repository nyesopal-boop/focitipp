import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/sports";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  teamA: z.string().min(1).trim(),
  teamB: z.string().min(1).trim(),
});

const SYSTEM_PROMPT = `
Te egy magyar nyelvű sportstatisztikai elemző vagy, aki futballmérkőzéseket elemez.
Mindig figyelembe veszed a csapatok formáját, statisztikáit és 200 000 szimuláció eredményét modellezd.
Tömören, magyarul válaszolj.
`;

export async function POST(req: NextRequest) {
  try {
    const { teamA, teamB } = BodySchema.parse(await req.json());
    
    // Check authentication from cookies
    const cookie = req.headers.get("cookie") || "";
    const userEmailMatch = cookie.match(/user_email=([^;]+)/);
    
    if (!userEmailMatch) {
      return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 });
    }
    
    // Check PRO status
    const isPro = /user_status=pro/.test(cookie);
    const proExpiresMatch = cookie.match(/pro_expires_at=([^;]+)/);
    let isProValid = false;
    
    if (isPro && proExpiresMatch) {
      const expiryDate = new Date(decodeURIComponent(proExpiresMatch[1]));
      isProValid = expiryDate > new Date();
    }

    // H2H adatok lekérése
    const provider = await getProvider();
    const idA = await provider.getTeamIdByName(teamA);
    const idB = await provider.getTeamIdByName(teamB);

    let h2hMatches: any[] = [];
    
    try {
      if (idA && idB) {
        h2hMatches = await provider.getHeadToHeadWithStats(idA, idB, 5);
      }
    } catch (e) {
      console.warn("Nem sikerült lekérni a H2H adatokat:", e);
    }

    // Statisztikák számítása
    const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
    
    const h2hGoals = h2hMatches.map(m => {
      const s = m.score?.split("–") || ["0","0"];
      return Number(s[0]) + Number(s[1]);
    });
    
    const avgGoalsH2H = avg(h2hGoals);
    const avgYellows = avg(h2hMatches.map(m => (m.yellowHome||0)+(m.yellowAway||0)));
    const avgCorners = avg(h2hMatches.map(m => (m.cornersHome||0)+(m.cornersAway||0)));

    const statsText = h2hMatches.length > 0 ? `
${teamA} vs ${teamB} utolsó ${h2hMatches.length} meccsének átlagos gólszáma: ${avgGoalsH2H.toFixed(1)} gól/mérkőzés.
Sárgalap-átlag: ${avgYellows.toFixed(1)}, szöglet-átlag: ${avgCorners.toFixed(1)} meccsenként.
Ezeket az adatokat vedd figyelembe a szimulációban.
` : `
${teamA} vs ${teamB} - nincs elérhető korábbi H2H adat.
Általános statisztikák alapján elemezz.
`;

    const proPrompt = `
${statsText}

Elemezd a ${teamA} és ${teamB} közötti közelgő mérkőzést. 
Futtass 200 000 valószínűségi szimulációt (modellezd a csapatok formáját és statisztikáit),
és add vissza a tippeket természetes magyar nyelven:

1. Várható győztes és esély
2. Gólok száma (2,5 felett/alatt)
3. Mindkét csapat szerez gólt (BTTS)
4. Szögletek tartománya
5. Sárgalapok tartománya

Minden tipphez add meg az esélyt 80-90% között és rövid indoklást.
`;

    const freePrompt = `
Elemezd röviden a ${teamA} vs ${teamB} mérkőzést.
Adj csak két dolgot:
1. Egyetlen sort: "Várható győztes: <CSAPAT> (~<SZÁZALÉK>%)"
2. Alatta egy rövid 2-3 mondatos magyar nyelvű összefoglalót, ami sportújságírói stílusban van.
`;

    const userPrompt = isProValid ? proPrompt : freePrompt;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "Nincs válasz.";
    
    return NextResponse.json({ text, isPro: isProValid });

  } catch (e: any) {
    console.error('Generate tips error:', e);
    return NextResponse.json({ error: `Hiba történt: ${e?.message || "ismeretlen"}` }, { status: 400 });
  }
}