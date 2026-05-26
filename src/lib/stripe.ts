import 'server-only';

import Stripe from 'stripe';

/**
 * Lazily-initialized Stripe client. Payments are optional: when
 * STRIPE_SECRET_KEY is unset the app still runs and payment actions return a
 * friendly "not configured" error instead of crashing.
 */

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }
  if (!cached) {
    cached = new Stripe(key);
  }
  return cached;
}
