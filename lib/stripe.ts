import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const STRIPE_PRICE_ID_MONTHLY_HUF = process.env.STRIPE_PRICE_ID_MONTHLY_HUF!;
export const STRIPE_PRICE_ID_QUARTERLY_HUF = process.env.STRIPE_PRICE_ID_QUARTERLY_HUF!;