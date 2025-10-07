import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const userEmailMatch = cookie.match(/user_email=([^;]+)/);
    const userStatusMatch = cookie.match(/user_status=([^;]+)/);
    const proExpiresMatch = cookie.match(/pro_expires_at=([^;]+)/);
    
    if (!userEmailMatch) {
      return NextResponse.json({ user: null, subscription: null, isPro: false });
    }

    const email = decodeURIComponent(userEmailMatch[1]);
    const status = userStatusMatch ? decodeURIComponent(userStatusMatch[1]) : 'free';
    const proExpiresAt = proExpiresMatch ? decodeURIComponent(proExpiresMatch[1]) : null;
    
    const user = db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json({ user: null, subscription: null, isPro: false });
    }

    // Check if PRO is still valid
    let isPro = false;
    if (status === 'pro' && proExpiresAt) {
      const expiryDate = new Date(proExpiresAt);
      isPro = expiryDate > new Date();
      
      // Update user status if expired
      if (!isPro && user.status === 'pro') {
        db.users.update(user.id, { status: 'free', proExpiresAt: undefined });
      }
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      subscription: proExpiresAt ? {
        status: isPro ? 'active' : 'inactive',
        currentPeriodEnd: new Date(proExpiresAt)
      } : null,
      isPro
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null, subscription: null, isPro: false });
  }
}