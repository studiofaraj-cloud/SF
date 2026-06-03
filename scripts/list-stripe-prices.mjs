// Diagnostic script — lists all active prices in the Stripe account whose
// secret key is in .env. Run with:  node scripts/list-stripe-prices.mjs
//
// This is for debugging "No such price" errors — it shows what's actually
// available and lets you confirm the exact price ID character by character.

import 'dotenv/config';
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY is missing from .env');
  process.exit(1);
}

const mode = key.startsWith('sk_test_') ? 'TEST' : key.startsWith('sk_live_') ? 'LIVE' : 'UNKNOWN';
console.log(`\n🔑 Using Stripe secret key in ${mode} mode (${key.slice(0, 12)}…${key.slice(-4)})\n`);

const stripe = new Stripe(key);

try {
  // Identify which Stripe account this key belongs to.
  const account = await stripe.accounts.retrieve();
  console.log(`📌 Account ID: ${account.id}`);
  console.log(`📌 Account name: ${account.settings?.dashboard?.display_name ?? account.business_profile?.name ?? '(unnamed)'}`);
  console.log(`📌 Account email: ${account.email ?? '(none)'}`);
  console.log(`📌 Verify in Dashboard: top-right avatar should show account ID ${account.id}\n`);

  // Also list ALL products (active and archived) to spot anything hiding.
  const products = await stripe.products.list({ limit: 100, active: undefined });
  console.log(`Products in this account+mode: ${products.data.length}`);
  for (const p of products.data) {
    console.log(`  ${p.id} — "${p.name}" (${p.active ? 'active' : 'ARCHIVED'})`);
  }
  console.log();

  const prices = await stripe.prices.list({ limit: 100, active: true, expand: ['data.product'] });

  if (prices.data.length === 0) {
    console.log('⚠️  No active prices found in this account+mode.');
    console.log('   → Create a product/price in Stripe Dashboard while in', mode, 'mode.\n');
    process.exit(0);
  }

  console.log(`Found ${prices.data.length} active price(s):\n`);
  for (const p of prices.data) {
    const product = typeof p.product === 'object' && 'name' in p.product ? p.product.name : p.product;
    const amount = p.unit_amount ? `${(p.unit_amount / 100).toFixed(2)} ${p.currency.toUpperCase()}` : 'tiered';
    const recurring = p.recurring ? `every ${p.recurring.interval}` : 'one-time';
    console.log(`  ${p.id}`);
    console.log(`    product: ${product}`);
    console.log(`    ${amount} (${recurring})`);
    console.log('');
  }

  const envPriceId = process.env.STRIPE_COMPANY_PROFILE_PRICE_ID;
  if (envPriceId) {
    const match = prices.data.find((p) => p.id === envPriceId);
    if (match) {
      console.log(`✅ STRIPE_COMPANY_PROFILE_PRICE_ID (${envPriceId}) is valid.\n`);
    } else {
      console.log(`❌ STRIPE_COMPANY_PROFILE_PRICE_ID (${envPriceId}) does NOT match any active price.`);
      console.log('   → Copy one of the IDs above into .env, then restart npm run dev.\n');
    }
  } else {
    console.log('ℹ️  STRIPE_COMPANY_PROFILE_PRICE_ID is not set in .env yet.\n');
  }
} catch (err) {
  console.error('❌ Stripe API call failed:', err.message);
  if (err.type === 'StripeAuthenticationError') {
    console.error('   → STRIPE_SECRET_KEY appears to be invalid or for a different account.');
  }
  process.exit(1);
}
