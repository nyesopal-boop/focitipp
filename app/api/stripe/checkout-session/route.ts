import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: "monthly" | "quarterly" };
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
    }

    const userWithSub = await prisma.user.findUnique({ 
      where: { id: user.id }, 
      include: { subscription: true } 
    });
    
    if (!userWithSub) {
      return NextResponse.json({ error: "Felhasználó nem található." }, { status: 404 });
    }

    const priceId = plan === "quarterly"
      ? process.env.STRIPE_PRICE_ID_QUARTERLY_HUF
      : process.env.STRIPE_PRICE_ID_MONTHLY_HUF;

    if (!priceId) {
      return NextResponse.json({ error: "Hiányzó Stripe ár azonosító." }, { status: 500 });
    }

    // Stripe Customer (mentjük a Subscription táblába)
    let customerId = userWithSub.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userWithSub.email,
        name: userWithSub.name || undefined,
        metadata: { userId: userWithSub.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: userWithSub.id },
        update: { stripeCustomerId: customerId },
        create: { userId: userWithSub.id, stripeCustomerId: customerId, status: "inactive" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        userId: userWithSub.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Checkout session error:', e);
    return NextResponse.json({ error: e.message || "Stripe hiba" }, { status: 400 });
  }
}