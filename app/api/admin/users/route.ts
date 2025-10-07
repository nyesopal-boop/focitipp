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

    const users = db.users.findAll();

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        subscription: {
          status: u.status === 'pro' ? 'active' : 'inactive',
          currentPeriodEnd: u.proExpiresAt,
        },
      })),
      pagination: {
        page: 1,
        limit: 100,
        total: users.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 });
  }
}