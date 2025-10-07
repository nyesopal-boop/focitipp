import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Only protect admin routes, NOT API routes
  if (pathname.startsWith("/admin")) {
    const cookieHeader = req.headers.get("cookie") || "";
    const userEmailMatch = cookieHeader.match(/user_email=([^;]+)/);
    
    if (!userEmailMatch) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // NEVER include /api here!
};