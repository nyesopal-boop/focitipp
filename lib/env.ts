// Environment validation
const requiredEnvVars = [
  'APP_URL',
  'OPENAI_API_KEY',
  'JWT_SECRET',
] as const;

const stripeEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET', 
  'STRIPE_PRICE_ID_MONTHLY_HUF',
  'STRIPE_PRICE_ID_QUARTERLY_HUF',
] as const;

function validateEnv() {
  const missing: string[] = [];
  
  // Check required vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  // Check Stripe vars if any Stripe var is set (indicating Stripe is enabled)
  const hasAnyStripeVar = stripeEnvVars.some(envVar => process.env[envVar]);
  if (hasAnyStripeVar) {
    for (const envVar of stripeEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

// Validate on import
validateEnv();

export const env = {
  APP_URL: process.env.APP_URL!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  JWT_SECRET: process.env.JWT_SECRET!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID_MONTHLY_HUF: process.env.STRIPE_PRICE_ID_MONTHLY_HUF,
  STRIPE_PRICE_ID_QUARTERLY_HUF: process.env.STRIPE_PRICE_ID_QUARTERLY_HUF,
  ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;