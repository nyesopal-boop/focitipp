import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json() as { code?: string };
    
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    if (!code?.trim()) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim() } });
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    const now = new Date();
    if (now < coupon.startsAt) {
      return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 });
    }
    if (now > coupon.expiresAt) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check single-use constraint
    if (coupon.redeemedCount >= coupon.maxRedemptions || coupon.redeemedByUserId) {
      return NextResponse.json({ error: "Coupon has already been used" }, { status: 400 });
    }

    // Redeem coupon and activate PRO in transaction
    await prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          redeemedCount: { increment: 1 },
          redeemedByUserId: user.id,
          redeemedAt: now,
        },
      });

      await tx.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          status: "active",
          currentPeriodEnd: coupon.expiresAt,
        },
        update: {
          status: "active",
          currentPeriodEnd: coupon.expiresAt,
        },
      });
    });

    const expiryDate = coupon.expiresAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return NextResponse.json({ 
      ok: true, 
      message: `PRO activated until ${expiryDate}` 
    });
  } catch (e: any) {
    console.error('Coupon redeem error:', e);
    return NextResponse.json({ error: "Failed to redeem coupon" }, { status: 500 });
  }
}