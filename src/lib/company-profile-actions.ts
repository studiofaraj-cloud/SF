'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { Timestamp } from 'firebase/firestore';
import { notifyIndexNow, companyProfileUrl } from '@/lib/indexnow';
import { requireUser, requireRole } from '@/lib/auth';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getUserProfile,
  createCompanyProfileDoc,
  updateCompanyProfileDoc,
  deleteCompanyProfileDoc,
  getCompanyProfileById,
  getCompanyProfileBySlug,
  getCompanyProfilesByOwner,
  listAllCompanyProfiles,
  claimSlugForProfile,
  releaseSlugForProfile,
  saveProfileConsentRecord,
  setStripeCustomerId,
  updateProfileSubscriptionState,
  SlugTakenError,
  type CompanyProfileDoc,
  type ConsentRecord,
} from '@/lib/firestore-data';
import { slugify } from '@/lib/company-slugs';
import { TOS_VERSION } from '@/lib/legal';
import {
  CompanyProfileInputSchema,
  EU_COUNTRY_CODES,
  type CompanyProfileInput,
  type ConsentInput,
  type UpdateCompanyProfileResult,
  type SubscriptionActionResult,
  type AdminCompanyProfileSummary,
} from '@/lib/company-profile-schemas';

function serialize(data: any): any {
  if (data === null || data === undefined) return data;
  if (data instanceof Timestamp) return data.toDate().toISOString();
  if (Array.isArray(data)) return data.map(serialize);
  if (typeof data === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(data)) out[k] = serialize(v);
    return out;
  }
  return data;
}

// ─── Reads (client) ───────────────────────────────────────────────────────

/**
 * Returns the current user's primary company profile (or null if none yet).
 * Clients normally own only one; this is the one shown in /hub/company-profile.
 * For admins this returns the first non-admin-managed profile they own (or
 * null) — admins manage many via /admin/company-profiles instead.
 */
export async function getMyCompanyProfileAction(): Promise<CompanyProfileDoc | null> {
  let user;
  try { user = await requireUser(); } catch { return null; }
  const profiles = await getCompanyProfilesByOwner(user.id);
  // Client UX: pick the first non-admin-managed one (i.e., owned subscription).
  const own = profiles.find((p) => !p.adminManaged) ?? null;
  return own ? (serialize(own) as CompanyProfileDoc) : null;
}

// ─── Mutations (client) ───────────────────────────────────────────────────

/**
 * Upsert the current user's primary (non-admin-managed) profile. Creates it
 * on first call. Slug uniqueness + VAT validation enforced.
 */
export async function updateCompanyProfileAction(
  input: CompanyProfileInput
): Promise<UpdateCompanyProfileResult> {
  let user;
  try { user = await requireUser(); }
  catch { return { success: false, error: 'Not authenticated.' }; }

  const parsed = CompanyProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      Object.values(flat.fieldErrors)[0]?.[0] ?? flat.formErrors[0] ?? 'Invalid input.';
    const fieldPath = Object.keys(flat.fieldErrors)[0];
    return { success: false, error: first, field: fieldPath };
  }
  const data = parsed.data;

  const existing = (await getCompanyProfilesByOwner(user.id)).find((p) => !p.adminManaged);

  // Require consent on first save (or after a TOS version bump).
  if (!existing?.consent || existing.consent.tosVersion !== TOS_VERSION) {
    return {
      success: false,
      error: 'You must accept the latest terms before saving.',
      field: 'tosAccepted',
    };
  }

  const previousVerified = existing.taxId?.verified ?? false;
  const previousVerifiedAt = existing.taxId?.verifiedAt;
  const sameTaxId =
    !!existing.taxId &&
    !!data.taxId &&
    existing.taxId.country === data.taxId.country &&
    existing.taxId.value === data.taxId.value;

  const taxId = data.taxId
    ? {
        ...data.taxId,
        verified: sameTaxId ? previousVerified : false,
        verifiedAt: sameTaxId ? previousVerifiedAt : undefined,
      }
    : undefined;

  let profileId = existing.id!;

  // Create on first call, else update. Slug is written via claimSlugForProfile
  // afterwards — passing it here would make the transaction a no-op (it short-
  // circuits when currentSlug === newSlug) and the /slugs/{slug} sentinel
  // would never get written, making the page unreachable from middleware.
  try {
    if (!existing.id) {
      // create
      profileId = await createCompanyProfileDoc({
        ownerUid: user.id,
        slug: '',
        companyName: data.companyName,
        tagline: data.tagline || undefined,
        description: data.description || undefined,
        logoUrl: data.logoUrl || undefined,
        heroUrl: data.heroUrl || undefined,
        services: data.services?.length ? data.services : undefined,
        stats: data.stats?.length ? data.stats : undefined,
        pointsOfStrength: data.pointsOfStrength?.length ? data.pointsOfStrength : undefined,
        contact: data.contact,
        social: data.social,
        taxId,
        taxIdPublic: data.taxIdPublic ?? true,
        numberOfEmployees: data.numberOfEmployees,
        invoicing:
          data.invoicing && (data.invoicing.sdiCode || data.invoicing.pecEmail)
            ? data.invoicing
            : undefined,
        isPublished: false, // subscription webhook flips this
        adminManaged: false,
        subscription: existing.subscription,
        consent: existing.consent,
      });
    } else {
      await updateCompanyProfileDoc(existing.id, {
        companyName: data.companyName,
        tagline: data.tagline || undefined,
        description: data.description || undefined,
        logoUrl: data.logoUrl || undefined,
        heroUrl: data.heroUrl || undefined,
        services: data.services?.length ? data.services : undefined,
        stats: data.stats?.length ? data.stats : undefined,
        pointsOfStrength: data.pointsOfStrength?.length ? data.pointsOfStrength : undefined,
        contact: data.contact,
        social: data.social,
        taxId,
        taxIdPublic: data.taxIdPublic ?? true,
        numberOfEmployees: data.numberOfEmployees,
        invoicing:
          data.invoicing && (data.invoicing.sdiCode || data.invoicing.pecEmail)
            ? data.invoicing
            : undefined,
      });
    }
  } catch (error) {
    console.error('[company-profile-actions] save failed:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to save profile: ${msg}` };
  }

  // Claim the slug atomically (transaction enforces uniqueness across the collection).
  try {
    await claimSlugForProfile(profileId, user.id, data.slug);
  } catch (err) {
    if (err instanceof SlugTakenError) {
      return { success: false, error: 'This URL is already taken.', field: 'slug' };
    }
    console.error('[company-profile-actions] claimSlugForProfile failed:', err);
    return { success: false, error: 'Could not save the URL. Please try again.', field: 'slug' };
  }

  if (data.taxId && !sameTaxId && data.taxId.type !== 'OTHER') {
    verifyTaxIdAsync(profileId, data.taxId.country, data.taxId.value).catch(() => {});
  }

  revalidatePath('/it/hub/company-profile');
  revalidatePath('/en/hub/company-profile');
  revalidatePath(`/${data.slug}`);
  revalidatePath('/admin/company-profiles');

  return { success: true, slug: data.slug, profileId };
}

async function verifyTaxIdAsync(profileId: string, country: string, value: string): Promise<void> {
  try {
    const onlyNumber = value.toUpperCase().startsWith(country.toUpperCase())
      ? value.toUpperCase().slice(country.length)
      : value.toUpperCase();
    const url = `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(
      `${country}${onlyNumber}`
    )}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return;
    const json = (await res.json()) as { valid?: boolean };
    if (json.valid) {
      await updateCompanyProfileDoc(profileId, {
        taxId: {
          country: country.toUpperCase(),
          value,
          type: EU_COUNTRY_CODES.has(country.toUpperCase()) ? 'EU_VAT' : 'OTHER',
          verified: true,
          verifiedAt: Timestamp.now(),
        },
      });
    }
  } catch (err) {
    console.warn('[company-profile-actions] VIES verification skipped:', err);
  }
}

// ─── Consent ──────────────────────────────────────────────────────────────

/**
 * Record consent. If the user has a non-admin-managed profile, attach the
 * record there. Otherwise create a placeholder draft profile to hold the
 * consent until the user fills the rest of the form.
 */
export async function recordConsentAction(
  input: ConsentInput
): Promise<{ success: boolean; error?: string }> {
  let user;
  try { user = await requireUser(); }
  catch { return { success: false, error: 'Not authenticated.' }; }
  if (!input.tosAccepted) {
    return { success: false, error: 'You must accept the Terms of Service to continue.' };
  }
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim();
  const now = Timestamp.now();
  const record: ConsentRecord = {
    tosVersion: TOS_VERSION,
    tosAcceptedAt: now,
    tosIp: ip,
    marketingConsent: !!input.marketingConsent,
    marketingConsentAt: input.marketingConsent ? now : undefined,
    marketingIp: input.marketingConsent ? ip : undefined,
  };
  try {
    const existing = (await getCompanyProfilesByOwner(user.id)).find((p) => !p.adminManaged);
    if (existing?.id) {
      await saveProfileConsentRecord(existing.id, record);
    } else {
      // Draft placeholder profile to anchor the consent.
      await createCompanyProfileDoc({
        ownerUid: user.id,
        slug: '',
        companyName: '',
        taxIdPublic: true,
        isPublished: false,
        adminManaged: false,
        consent: record,
      });
    }
    return { success: true };
  } catch (err) {
    console.error('[company-profile-actions] saveConsentRecord failed:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to save consent: ${msg}` };
  }
}

// ─── Suggest a unique slug from a company name ─────────────────────────────

export async function suggestSlugAction(
  companyName: string
): Promise<{ slug: string }> {
  await requireUser();
  const base = slugify(companyName);
  return { slug: base || 'my-company' };
}

// ─── Stripe subscription (client) ─────────────────────────────────────────

export type BillingCycle = 'monthly' | 'annual';

export async function startCompanyProfileSubscriptionAction(
  origin: string,
  locale: string = 'it',
  billingCycle: BillingCycle = 'monthly'
): Promise<SubscriptionActionResult> {
  let user;
  try { user = await requireUser(); }
  catch { return { success: false, error: 'You must be signed in.' }; }
  if (!isStripeConfigured()) {
    return { success: false, error: 'Online payments are not available yet. Please contact us.' };
  }
  const priceId =
    billingCycle === 'annual'
      ? process.env.STRIPE_COMPANY_PROFILE_PRICE_ID_ANNUAL
      : process.env.STRIPE_COMPANY_PROFILE_PRICE_ID;
  if (!priceId) {
    return {
      success: false,
      error:
        billingCycle === 'annual'
          ? 'Annual subscription not configured. Set STRIPE_COMPANY_PROFILE_PRICE_ID_ANNUAL.'
          : 'Subscription not configured. Set STRIPE_COMPANY_PROFILE_PRICE_ID.',
    };
  }

  const userDoc = await getUserProfile(user.id);
  if (!userDoc) return { success: false, error: 'User profile not found.' };

  const profile = (await getCompanyProfilesByOwner(user.id)).find((p) => !p.adminManaged);
  if (!profile?.consent || profile.consent.tosVersion !== TOS_VERSION) {
    return { success: false, error: 'You must accept the terms before starting a subscription.' };
  }

  const safeOrigin = /^https?:\/\//.test(origin) ? origin.replace(/\/$/, '') : '';
  const successUrl = `${safeOrigin}/${locale}/hub/company-profile/subscription?status=success`;
  const cancelUrl = `${safeOrigin}/${locale}/hub/company-profile/subscription?status=cancel`;

  try {
    const stripe = getStripe();
    let customerId = userDoc.stripeCustomerId;

    // Verify the saved customer still exists in THIS Stripe account. The
    // account may have been swapped (e.g. test sandbox → live, or one test
    // workspace → another), in which case the stored id is stale and Stripe
    // returns "No such customer". Self-heal by clearing and recreating.
    if (customerId) {
      try {
        const c = await stripe.customers.retrieve(customerId);
        if ((c as any).deleted) customerId = undefined;
      } catch (err: any) {
        if (err?.code === 'resource_missing' || err?.statusCode === 404) {
          console.warn(
            `[company-profile-actions] stored customer ${customerId} not found in current Stripe account — recreating.`
          );
          customerId = undefined;
        } else {
          throw err;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userDoc.email,
        name: profile.companyName ?? userDoc.displayName ?? undefined,
        metadata: { uid: user.id },
      });
      customerId = customer.id;
      await setStripeCustomerId(user.id, customerId);
    }

    // Guard 1: refuse if an active/trialing/past_due/incomplete company-profile
    // subscription already exists for this customer. Prevents double-billing
    // if the user revisits the start page after paying.
    // Guard 2: skip the 30-day trial if the customer has ANY subscription
    // history (active, canceled, or past) — closes the trial-abuse loop where
    // a user cancels then re-subscribes to get another free month.
    let hasHistory = false;
    try {
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 10,
      });
      const ourSubs = existingSubs.data.filter(
        (s) => s.metadata?.type === 'company-profile-sub'
      );
      const blocking = ourSubs.find((s) =>
        ['trialing', 'active', 'past_due', 'incomplete'].includes(s.status)
      );
      if (blocking) {
        return {
          success: false,
          error:
            'Hai già un abbonamento attivo per la tua pagina aziendale. Gestiscilo dalla pagina Abbonamento.',
        };
      }
      hasHistory = ourSubs.length > 0;
    } catch (err) {
      // If the list call fails, fall through — better to allow checkout than block.
      console.warn('[company-profile-actions] dup-check failed:', err);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        // First-time customers get the 30d trial; re-subscribers do not.
        ...(hasHistory ? {} : { trial_period_days: 30 }),
        metadata: {
          uid: user.id,
          profileId: profile.id!,
          type: 'company-profile-sub',
          billingCycle,
        },
      },
      metadata: {
        uid: user.id,
        profileId: profile.id!,
        type: 'company-profile-sub',
        billingCycle,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return { success: true, url: session.url ?? '' };
  } catch (error) {
    console.error('[company-profile-actions] start subscription failed:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Could not start checkout: ${msg}` };
  }
}

/**
 * Pull the latest subscription state for the current user directly from
 * Stripe and write it to Firestore. Used after Stripe Checkout returns to
 * `?status=success` so the UI reflects the new subscription even if the
 * webhook hasn't fired yet (e.g. local dev without `stripe listen`).
 *
 * Returns the refreshed profile snapshot.
 */
export async function syncMySubscriptionAction(): Promise<{
  success: boolean;
  synced?: boolean;
  error?: string;
}> {
  let user;
  try { user = await requireUser(); }
  catch { return { success: false, error: 'Not authenticated.' }; }
  if (!isStripeConfigured()) return { success: true, synced: false };

  const userDoc = await getUserProfile(user.id);
  if (!userDoc?.stripeCustomerId) return { success: true, synced: false };

  const profile = (await getCompanyProfilesByOwner(user.id)).find((p) => !p.adminManaged);
  if (!profile?.id) return { success: true, synced: false };

  try {
    const stripe = getStripe();
    // List the latest few subscriptions for this customer and pick the most
    // recent one tagged with our metadata (company-profile-sub).
    const subs = await stripe.subscriptions.list({
      customer: userDoc.stripeCustomerId,
      status: 'all',
      limit: 10,
    });
    const ours = subs.data.find(
      (s) => s.metadata?.type === 'company-profile-sub' || s.id === profile.subscription?.stripeSubscriptionId
    );
    if (!ours) return { success: true, synced: false };

    const status = (() => {
      switch (ours.status) {
        case 'trialing':
        case 'active':
        case 'past_due':
        case 'canceled':
        case 'unpaid':
        case 'incomplete':
          return ours.status;
        case 'incomplete_expired':
          return 'canceled' as const;
        case 'paused':
          return 'past_due' as const;
        default:
          return 'incomplete' as const;
      }
    })();
    // Grace period: keep page online while Stripe is retrying (past_due).
    // Only unpublish on unpaid/canceled/incomplete.
    const isPublishable = status === 'trialing' || status === 'active' || status === 'past_due';

    // Determine billing cycle from the active price (recurring.interval).
    const item = ours.items?.data?.[0];
    const priceId = item?.price?.id;
    const interval = item?.price?.recurring?.interval;
    const billingCycle: 'monthly' | 'annual' | undefined =
      interval === 'year' ? 'annual' : interval === 'month' ? 'monthly' : undefined;

    await updateProfileSubscriptionState(
      profile.id,
      {
        stripeSubscriptionId: ours.id,
        stripePriceId: priceId,
        billingCycle,
        status,
        currentPeriodEnd: (ours as any).current_period_end
          ? Timestamp.fromMillis(((ours as any).current_period_end as number) * 1000)
          : undefined,
        trialEndsAt: (ours as any).trial_end
          ? Timestamp.fromMillis(((ours as any).trial_end as number) * 1000)
          : undefined,
        canceledAt: (ours as any).canceled_at
          ? Timestamp.fromMillis(((ours as any).canceled_at as number) * 1000)
          : undefined,
      },
      isPublishable
    );
    return { success: true, synced: true };
  } catch (err) {
    console.error('[company-profile-actions] syncMySubscriptionAction failed:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export interface MyInvoice {
  id: string;
  number?: string;
  created: number; // unix
  amountPaid: number; // cents
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
}

/**
 * List Stripe invoices for the current user's customer (most recent first).
 * Returns at most 24 invoices. Empty array if no customer or no invoices.
 */
export async function getMyInvoicesAction(): Promise<MyInvoice[]> {
  let user;
  try { user = await requireUser(); } catch { return []; }
  if (!isStripeConfigured()) return [];
  const userDoc = await getUserProfile(user.id);
  if (!userDoc?.stripeCustomerId) return [];
  try {
    const list = await getStripe().invoices.list({
      customer: userDoc.stripeCustomerId,
      limit: 24,
    });
    return list.data.map((inv) => ({
      id: inv.id ?? '',
      number: inv.number ?? undefined,
      created: inv.created,
      amountPaid: inv.amount_paid ?? 0,
      currency: inv.currency ?? 'eur',
      status: inv.status ?? 'unknown',
      hostedInvoiceUrl: inv.hosted_invoice_url ?? undefined,
      invoicePdfUrl: inv.invoice_pdf ?? undefined,
    }));
  } catch (err) {
    console.error('[company-profile-actions] getMyInvoicesAction failed:', err);
    return [];
  }
}

export type ChangeBillingCycleResult =
  | {
      success: true;
      newCycle: BillingCycle;
      /** What the user can expect on their account. */
      message: string;
    }
  | { success: false; error: string };

/**
 * Switch the user's active subscription between monthly and annual without
 * cancelling/recreating. Stripe handles proration automatically:
 *   - monthly → annual: customer is charged the prorated annual upfront
 *   - annual → monthly: customer receives a prorated credit on the next invoice
 * The trial (if any) is preserved.
 */
export async function changeBillingCycleAction(
  newCycle: BillingCycle
): Promise<ChangeBillingCycleResult> {
  let user;
  try { user = await requireUser(); }
  catch { return { success: false, error: 'You must be signed in.' }; }
  if (!isStripeConfigured()) {
    return { success: false, error: 'Stripe is not configured.' };
  }

  const targetPriceId =
    newCycle === 'annual'
      ? process.env.STRIPE_COMPANY_PROFILE_PRICE_ID_ANNUAL
      : process.env.STRIPE_COMPANY_PROFILE_PRICE_ID;
  if (!targetPriceId) {
    return {
      success: false,
      error:
        newCycle === 'annual'
          ? 'Annual plan not configured. Set STRIPE_COMPANY_PROFILE_PRICE_ID_ANNUAL.'
          : 'Monthly plan not configured. Set STRIPE_COMPANY_PROFILE_PRICE_ID.',
    };
  }

  const profile = (await getCompanyProfilesByOwner(user.id)).find((p) => !p.adminManaged);
  const subId = profile?.subscription?.stripeSubscriptionId;
  if (!profile?.id || !subId) {
    return { success: false, error: 'No active subscription found.' };
  }
  // Only allow change if the subscription is in a healthy state.
  const status = profile.subscription?.status;
  if (!['trialing', 'active', 'past_due'].includes(status ?? '')) {
    return { success: false, error: 'Subscription is not in a state that can be changed.' };
  }
  // No-op if already on this cycle.
  if (profile.subscription?.billingCycle === newCycle) {
    return { success: false, error: 'You are already on this plan.' };
  }

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subId);
    const itemId = sub.items?.data?.[0]?.id;
    if (!itemId) return { success: false, error: 'Subscription has no items to update.' };

    await stripe.subscriptions.update(subId, {
      items: [{ id: itemId, price: targetPriceId }],
      // Charge/credit immediately based on time remaining in the current period.
      proration_behavior: 'create_prorations',
      // Stripe applies prorations to the NEXT invoice for downgrades, or
      // creates a new invoice immediately for upgrades. We let Stripe decide.
    });

    // Reflect change locally so the hub shows the new plan immediately.
    await syncMySubscriptionAction().catch(() => {});

    revalidatePath('/it/hub/company-profile');
    revalidatePath('/en/hub/company-profile');
    revalidatePath('/it/hub/company-profile/subscription');
    revalidatePath('/en/hub/company-profile/subscription');

    const message =
      newCycle === 'annual'
        ? 'Piano cambiato in Annuale. Eventuale differenza prorata addebitata subito.'
        : 'Piano cambiato in Mensile. Eventuale credito prorata applicato alla prossima fattura.';
    return { success: true, newCycle, message };
  } catch (error) {
    console.error('[company-profile-actions] changeBillingCycle failed:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Impossibile cambiare piano: ${msg}` };
  }
}

export async function manageBillingAction(
  origin: string,
  locale: string = 'it'
): Promise<SubscriptionActionResult> {
  let user;
  try { user = await requireUser(); }
  catch { return { success: false, error: 'You must be signed in.' }; }
  if (!isStripeConfigured()) {
    return { success: false, error: 'Stripe is not configured.' };
  }
  const userDoc = await getUserProfile(user.id);
  if (!userDoc?.stripeCustomerId) {
    return { success: false, error: 'No subscription found.' };
  }
  const safeOrigin = /^https?:\/\//.test(origin) ? origin.replace(/\/$/, '') : '';
  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: userDoc.stripeCustomerId,
      return_url: `${safeOrigin}/${locale}/hub/company-profile/subscription`,
    });
    return { success: true, url: portal.url };
  } catch (error) {
    console.error('[company-profile-actions] billing portal failed:', error);
    return { success: false, error: 'Could not open billing portal.' };
  }
}

// ─── Admin actions (admin-managed profiles bypass Stripe) ─────────────────

export interface BillingMetrics {
  activeCount: number;
  trialingCount: number;
  pastDueCount: number;
  canceledCount: number;
  mrrCents: number; // monthly recurring revenue in EUR cents
  churnRate30d: number; // 0..1
  trialConversionRate: number; // 0..1
  subscribers: Array<{
    profileId: string;
    companyName: string;
    slug: string;
    ownerUid: string;
    ownerEmail?: string;
    status: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
    canceledAt?: string;
    adminManaged: boolean;
  }>;
}

const COMPANY_PROFILE_MONTHLY_CENTS = 499; // €4.99
const COMPANY_PROFILE_ANNUAL_CENTS = 4999; // €49.99 (counted as €4.17/mo in MRR)

export async function adminBillingMetricsAction(): Promise<BillingMetrics> {
  await requireRole('admin');
  const profiles = await listAllCompanyProfiles();
  const ownerCache: Record<string, string | undefined> = {};

  let activeCount = 0;
  let trialingCount = 0;
  let pastDueCount = 0;
  let canceledCount = 0;
  let canceled30d = 0;
  let totalSubscribed = 0; // active + canceled — denominator for churn

  // MRR accumulator. Monthly subs contribute full price; annual subs are
  // normalised by dividing by 12 (so an annual €49.99 ≈ €4.17/month).
  let mrrCents = 0;

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const subscribers: BillingMetrics['subscribers'] = [];

  for (const p of profiles) {
    if (!(p.ownerUid in ownerCache)) {
      const u = await getUserProfile(p.ownerUid);
      ownerCache[p.ownerUid] = u?.email;
    }
    const s = p.subscription;
    const status = s?.status ?? 'none';
    if (status === 'active') activeCount++;
    else if (status === 'trialing') trialingCount++;
    else if (status === 'past_due') pastDueCount++;
    else if (status === 'canceled' || status === 'unpaid') {
      canceledCount++;
      const cancelledMs = s?.canceledAt?.toMillis?.();
      if (cancelledMs && cancelledMs >= thirtyDaysAgo) canceled30d++;
    }
    if (s?.stripeSubscriptionId) totalSubscribed++;

    // Add to MRR only if the sub is currently generating revenue (excludes
    // trialing — they aren't being charged yet).
    if (status === 'active' || status === 'past_due') {
      mrrCents +=
        s?.billingCycle === 'annual'
          ? Math.round(COMPANY_PROFILE_ANNUAL_CENTS / 12)
          : COMPANY_PROFILE_MONTHLY_CENTS;
    }

    subscribers.push({
      profileId: p.id!,
      companyName: p.companyName || '(unnamed)',
      slug: p.slug || '',
      ownerUid: p.ownerUid,
      ownerEmail: ownerCache[p.ownerUid],
      status,
      trialEndsAt: s?.trialEndsAt?.toDate().toISOString(),
      currentPeriodEnd: s?.currentPeriodEnd?.toDate().toISOString(),
      canceledAt: s?.canceledAt?.toDate().toISOString(),
      adminManaged: !!p.adminManaged,
    });
  }
  const churnRate30d = totalSubscribed > 0 ? canceled30d / totalSubscribed : 0;
  // Trial conversion: of subscriptions ever started, how many became active?
  const trialConversionRate = totalSubscribed > 0 ? activeCount / totalSubscribed : 0;

  // Sort: active first, then trialing, then past_due, then canceled, by name.
  subscribers.sort((a, b) => {
    const order = ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'none'];
    const rank = (x: string) => order.indexOf(x);
    const r = rank(a.status) - rank(b.status);
    if (r !== 0) return r;
    return a.companyName.localeCompare(b.companyName);
  });

  return {
    activeCount,
    trialingCount,
    pastDueCount,
    canceledCount,
    mrrCents,
    churnRate30d,
    trialConversionRate,
    subscribers,
  };
}

export async function adminListCompanyProfilesAction(): Promise<AdminCompanyProfileSummary[]> {
  await requireRole('admin');
  const profiles = await listAllCompanyProfiles();
  const out: AdminCompanyProfileSummary[] = [];
  // Resolve owner emails (small N expected).
  const ownerCache: Record<string, string | undefined> = {};
  for (const p of profiles) {
    if (!(p.ownerUid in ownerCache)) {
      const u = await getUserProfile(p.ownerUid);
      ownerCache[p.ownerUid] = u?.email;
    }
    out.push({
      id: p.id!,
      slug: p.slug || '',
      companyName: p.companyName || '(unnamed)',
      ownerUid: p.ownerUid,
      ownerEmail: ownerCache[p.ownerUid],
      adminManaged: !!p.adminManaged,
      isPublished: !!p.isPublished,
      subscriptionStatus: p.subscription?.status,
      updatedAt: p.updatedAt ? p.updatedAt.toDate().toISOString() : new Date().toISOString(),
    });
  }
  return out;
}

export async function adminGetCompanyProfileAction(
  profileId: string
): Promise<CompanyProfileDoc | null> {
  await requireRole('admin');
  const p = await getCompanyProfileById(profileId);
  return p ? (serialize(p) as CompanyProfileDoc) : null;
}

/**
 * Admin creates a new company profile owned by themselves (or a specified
 * ownerUid). `adminManaged: true` skips Stripe and publishes immediately.
 */
export async function adminCreateCompanyProfileAction(
  input: CompanyProfileInput,
  options?: { ownerUid?: string; publish?: boolean }
): Promise<UpdateCompanyProfileResult> {
  const admin = await requireRole('admin');
  const parsed = CompanyProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      Object.values(flat.fieldErrors)[0]?.[0] ?? flat.formErrors[0] ?? 'Invalid input.';
    return { success: false, error: first, field: Object.keys(flat.fieldErrors)[0] };
  }
  const data = parsed.data;
  const ownerUid = options?.ownerUid ?? admin.id;
  const publish = options?.publish ?? true;

  const taxId = data.taxId
    ? { ...data.taxId, verified: false, verifiedAt: undefined }
    : undefined;

  try {
    // Create with an empty slug first; the slug-claim transaction below sets
    // both the profile.slug AND the /slugs/{slug} sentinel atomically. Passing
    // the slug in here would make the transaction short-circuit and never
    // write the sentinel — see the comment in updateCompanyProfileAction.
    const profileId = await createCompanyProfileDoc({
      ownerUid,
      slug: '',
      companyName: data.companyName,
      tagline: data.tagline || undefined,
      description: data.description || undefined,
      logoUrl: data.logoUrl || undefined,
      heroUrl: data.heroUrl || undefined,
      services: data.services?.length ? data.services : undefined,
      stats: data.stats?.length ? data.stats : undefined,
      pointsOfStrength: data.pointsOfStrength?.length ? data.pointsOfStrength : undefined,
      contact: data.contact,
      social: data.social,
      taxId,
      taxIdPublic: data.taxIdPublic ?? true,
      numberOfEmployees: data.numberOfEmployees,
      invoicing:
        data.invoicing && (data.invoicing.sdiCode || data.invoicing.pecEmail)
          ? data.invoicing
          : undefined,
      isPublished: publish,
      publishedAt: publish ? Timestamp.now() : undefined,
      adminManaged: true,
    });

    try {
      await claimSlugForProfile(profileId, ownerUid, data.slug);
    } catch (err) {
      // Roll back the doc if the slug is taken.
      await deleteCompanyProfileDoc(profileId);
      if (err instanceof SlugTakenError) {
        return { success: false, error: 'This URL is already taken.', field: 'slug' };
      }
      throw err;
    }

    if (data.taxId && data.taxId.type !== 'OTHER') {
      verifyTaxIdAsync(profileId, data.taxId.country, data.taxId.value).catch(() => {});
    }

    revalidatePath('/admin/company-profiles');
    revalidatePath(`/c/${data.slug}`);
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-companies.xml');

    // Notify IndexNow only when actually publishing — silent drafts shouldn't
    // be announced to crawlers.
    if (publish) {
      after(() => notifyIndexNow([companyProfileUrl(data.slug)]));
    }

    return { success: true, slug: data.slug, profileId };
  } catch (error) {
    console.error('[company-profile-actions] adminCreate failed:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to create profile: ${msg}` };
  }
}

export async function adminUpdateCompanyProfileAction(
  profileId: string,
  input: CompanyProfileInput,
  options?: { publish?: boolean }
): Promise<UpdateCompanyProfileResult> {
  await requireRole('admin');
  const parsed = CompanyProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      Object.values(flat.fieldErrors)[0]?.[0] ?? flat.formErrors[0] ?? 'Invalid input.';
    return { success: false, error: first, field: Object.keys(flat.fieldErrors)[0] };
  }
  const data = parsed.data;

  const existing = await getCompanyProfileById(profileId);
  if (!existing) return { success: false, error: 'Profile not found.' };

  const sameTaxId =
    !!existing.taxId &&
    !!data.taxId &&
    existing.taxId.country === data.taxId.country &&
    existing.taxId.value === data.taxId.value;
  const taxId = data.taxId
    ? {
        ...data.taxId,
        verified: sameTaxId ? existing.taxId?.verified ?? false : false,
        verifiedAt: sameTaxId ? existing.taxId?.verifiedAt : undefined,
      }
    : undefined;

  try {
    await updateCompanyProfileDoc(profileId, {
      companyName: data.companyName,
      tagline: data.tagline || undefined,
      description: data.description || undefined,
      logoUrl: data.logoUrl || undefined,
      heroUrl: data.heroUrl || undefined,
      services: data.services?.length ? data.services : undefined,
      stats: data.stats?.length ? data.stats : undefined,
      pointsOfStrength: data.pointsOfStrength?.length ? data.pointsOfStrength : undefined,
      contact: data.contact,
      social: data.social,
      taxId,
      taxIdPublic: data.taxIdPublic ?? true,
      numberOfEmployees: data.numberOfEmployees,
      invoicing:
        data.invoicing && (data.invoicing.sdiCode || data.invoicing.pecEmail)
          ? data.invoicing
          : undefined,
      ...(options?.publish !== undefined
        ? {
            isPublished: options.publish,
            ...(options.publish ? { publishedAt: Timestamp.now() } : {}),
          }
        : {}),
    });
    await claimSlugForProfile(profileId, existing.ownerUid, data.slug);

    if (data.taxId && !sameTaxId && data.taxId.type !== 'OTHER') {
      verifyTaxIdAsync(profileId, data.taxId.country, data.taxId.value).catch(() => {});
    }

    revalidatePath('/admin/company-profiles');
    revalidatePath(`/admin/company-profiles/${profileId}/edit`);
    revalidatePath(`/c/${data.slug}`);
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-companies.xml');

    // If the update set isPublished to true (or kept it true), ping IndexNow.
    // We can't tell from `options.publish === undefined` alone whether the
    // profile is currently live, so consult the post-update state implied by
    // existing.isPublished merged with the new flag.
    const willBePublished = options?.publish ?? existing.isPublished ?? false;
    if (willBePublished) {
      after(() => notifyIndexNow([companyProfileUrl(data.slug)]));
    }

    return { success: true, slug: data.slug, profileId };
  } catch (err) {
    if (err instanceof SlugTakenError) {
      return { success: false, error: 'This URL is already taken.', field: 'slug' };
    }
    console.error('[company-profile-actions] adminUpdate failed:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to update profile: ${msg}` };
  }
}

export async function adminSetPublishedAction(
  profileId: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  try {
    await updateCompanyProfileDoc(profileId, {
      isPublished: publish,
      ...(publish ? { publishedAt: Timestamp.now() } : {}),
    });
    revalidatePath('/admin/company-profiles');
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-companies.xml');

    // Notify IndexNow on publish. We need the slug to build the URL.
    if (publish) {
      const profile = await getCompanyProfileById(profileId);
      if (profile?.slug) {
        const slug = profile.slug;
        revalidatePath(`/c/${slug}`);
        after(() => notifyIndexNow([companyProfileUrl(slug)]));
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[company-profile-actions] setPublished failed:', error);
    return { success: false, error: 'Failed to update.' };
  }
}

export async function adminDeleteCompanyProfileAction(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  try {
    // Cancel any active Stripe subscription FIRST so the customer stops being
    // billed. If this fails (Stripe down, sub already cancelled, etc.) log
    // and continue with the local delete — never block deletion on Stripe.
    const profile = await getCompanyProfileById(profileId);
    const subId = profile?.subscription?.stripeSubscriptionId;
    if (subId && isStripeConfigured()) {
      try {
        await getStripe().subscriptions.cancel(subId);
      } catch (err: any) {
        if (err?.code !== 'resource_missing') {
          console.warn(
            `[company-profile-actions] could not cancel Stripe sub ${subId} during delete:`,
            err
          );
        }
      }
    }
    await deleteCompanyProfileDoc(profileId);
    revalidatePath('/admin/company-profiles');
    return { success: true };
  } catch (error) {
    console.error('[company-profile-actions] delete failed:', error);
    return { success: false, error: 'Failed to delete.' };
  }
}
