import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { accessCode } = body;

    if (!accessCode) {
      return NextResponse.json({ error: 'Belépési kód megadása kötelező' }, { status: 400 });
    }

    const correctAccessCode = process.env.ADMIN_ACCESS_CODE || 'admin123';
    
    if (accessCode !== correctAccessCode) {
      return NextResponse.json({ error: 'Hibás belépési kód' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Hozzáférés engedélyezve'
    });
  } catch (error) {
    console.error('Admin access verification error:', error);
    return NextResponse.json({ error: 'Hiba történt a kód ellenőrzése során' }, { status: 500 });
  }
}