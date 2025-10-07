import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const stripeSubscriptionId = sub.id;
        const status = sub.status; // trialing, active, past_due, canceled, unpaid
        const currentPeriodEnd = new Date(((sub as any).current_period_end || 0) * 1000);

        const dbSub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
        if (dbSub) {
          await prisma.subscription.update({
            where: { id: dbSub.id },
            data: {
              stripeSubscriptionId,
              status: status === "active" ? "active" :
                      status === "past_due" ? "past_due" :
                      status === "canceled" ? "canceled" : "inactive",
              currentPeriodEnd,
            },
          });

          // Audit log
          const user = await prisma.user.findUnique({ where: { id: dbSub.userId } });
          if (user) {
            console.log(`Subscription ${status} for user: ${user.email}`);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const dbSub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
        if (dbSub) {
          await prisma.subscription.update({
            where: { id: dbSub.id },
            data: { status: "canceled", currentPeriodEnd: new Date() },
          });

          // Audit log
          const user = await prisma.user.findUnique({ where: { id: dbSub.userId } });
          if (user) {
            console.log(`Subscription canceled for user: ${user.email}`);
          }
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerId = subscription.customer as string;

          const dbSub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
          if (dbSub) {
            await prisma.subscription.update({
              where: { id: dbSub.id },
              data: {
                status: "active",
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              },
            });
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          const dbSub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
          if (dbSub) {
            await prisma.subscription.update({
              where: { id: dbSub.id },
              data: { status: "past_due" },
            });
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: e.message || "Webhook hiba" }, { status: 400 });
  }
}