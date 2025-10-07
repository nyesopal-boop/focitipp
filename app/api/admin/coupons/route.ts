import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication from cookies
    const cookie = request.headers.get("cookie") || "";
    const userEmailMatch = cookie.match(/user_email=([^;]+)/);
    
    if (!userEmailMatch) {
      return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 });
    }

    const email = decodeURIComponent(userEmailMatch[1]);
    const user = db.users.findByEmail(email);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin jogosultság szükséges' }, { status: 403 });
    }

    const coupons = db.coupons.findAll();

    return NextResponse.json({ 
      coupons: coupons.map(c => ({
        id: c.id,
        code: c.code,
        startsAt: c.startsAt,
        expiresAt: c.expiresAt,
        maxRedemptions: c.maxRedemptions,
        redeemedCount: c.redeemedCount,
        redeemedByUserId: c.redeemedByUserId,
        redeemedAt: c.redeemedAt,
        createdAt: c.createdAt,
      }))
    });
  } catch (error) {
    console.error('Admin coupons GET error:', error);
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication from cookies
    const cookie = req.headers.get("cookie") || "";
    const userEmailMatch = cookie.match(/user_email=([^;]+)/);
    
    if (!userEmailMatch) {
      return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 });
    }

    const email = decodeURIComponent(userEmailMatch[1]);
    const user = db.users.findByEmail(email);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin jogosultság szükséges' }, { status: 403 });
    }

    const { code, startsAt, expiresAt, maxRedemptions } = await req.json();
    
    const sAt = new Date(startsAt);
    const eAt = new Date(expiresAt);
    
    if (isNaN(sAt.getTime()) || isNaN(eAt.getTime())) {
      return NextResponse.json({ error: "Érvénytelen dátum." }, { status: 400 });
    }
    
    const finalCode = code?.trim() || `PRO-${Math.random().toString(36).slice(2,8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    
    const coupon = db.coupons.create({
      code: finalCode,
      startsAt: sAt.toISOString(),
      expiresAt: eAt.toISOString(),
      maxRedemptions: maxRedemptions || 1,
      redeemedCount: 0,
    });
    
    return NextResponse.json({ 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        startsAt: coupon.startsAt,
        expiresAt: coupon.expiresAt,
        maxRedemptions: coupon.maxRedemptions,
        redeemedCount: coupon.redeemedCount
      }
    });
  } catch (e: any) {
    console.error('Admin coupon create error:', e);
    return NextResponse.json({ error: e.message || "Hiba kupon létrehozásakor." }, { status: 400 });
  }
}