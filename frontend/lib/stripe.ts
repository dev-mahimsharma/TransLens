import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Doesn't throw at import time — lets the rest of the app run in dev
  // without Stripe configured. The checkout route will fail loudly instead.
  console.warn('STRIPE_SECRET_KEY is not set — donation checkout will fail until it is.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  typescript: true,
});