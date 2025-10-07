import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, coupon } = await req.json();
    
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let user = db.users.findByEmail(email);
    
    if (!user) {
      user = db.users.create({
        email,
        name: email.split('@')[0],
        role: "USER",
        status: "free"
      });
    }

    let userStatus = user.status;
    let proExpiresAt = user.proExpiresAt;

    // Handle coupon redemption if provided
    if (coupon?.trim()) {
      const couponRecord = db.coupons.findByCode(coupon.trim());
      
      if (couponRecord) {
        const now = new Date();
        const startsAt = new Date(couponRecord.startsAt);
        const expiresAt = new Date(couponRecord.expiresAt);
        
        if (now >= startsAt && now <= expiresAt && 
            couponRecord.redeemedCount < couponRecord.maxRedemptions && 
            !couponRecord.redeemedByUserId) {
          
          // Redeem coupon
          db.coupons.update(couponRecord.id, {
            redeemedCount: couponRecord.redeemedCount + 1,
            redeemedByUserId: user.id,
            redeemedAt: now.toISOString(),
          });

          // Update user to PRO
          userStatus = "pro";
          proExpiresAt = couponRecord.expiresAt;
          
          db.users.update(user.id, {
            status: userStatus,
            proExpiresAt: proExpiresAt,
          });
        }
      }
    }

    const response = NextResponse.json({ 
      ok: true, 
      email, 
      status: userStatus
    });
    
    // Set cookies
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    response.cookies.set('user_email', email, { 
      httpOnly: true, 
      maxAge,
      path: '/',
      sameSite: 'lax'
    });
    response.cookies.set('user_status', userStatus, { 
      httpOnly: true, 
      maxAge,
      path: '/',
      sameSite: 'lax'
    });
    response.cookies.set('user_id', user.id, { 
      httpOnly: true, 
      maxAge,
      path: '/',
      sameSite: 'lax'
    });
    
    if (proExpiresAt) {
      response.cookies.set('pro_expires_at', proExpiresAt, { 
        httpOnly: true, 
        maxAge,
        path: '/',
        sameSite: 'lax'
      });
    }
    
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login error" }, { status: 400 });
  }
}