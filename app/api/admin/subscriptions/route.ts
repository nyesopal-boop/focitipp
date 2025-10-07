import { NextRequest, NextResponse } from 'next/server';
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

    const users = db.users.findAll();
    const subscriptions = users
      .filter(u => u.status === 'pro' || u.proExpiresAt)
      .map(u => ({
        id: `sub_${u.id}`,
        status: u.status === 'pro' ? 'ACTIVE' : 'INACTIVE',
        currentPeriodEnd: u.proExpiresAt,
        stripeSubscriptionId: null,
        createdAt: u.createdAt,
        user: {
          email: u.email,
          name: u.name,
        },
      }));

    return NextResponse.json({
      subscriptions,
      pagination: {
        page: 1,
        limit: 100,
        total: subscriptions.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 });
  }
}