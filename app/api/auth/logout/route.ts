import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  // Clear all auth cookies
  response.cookies.delete('user_email');
  response.cookies.delete('user_status');
  response.cookies.delete('user_id');
  response.cookies.delete('pro_expires_at');
  
  return response;
}