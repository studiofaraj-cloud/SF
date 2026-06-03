import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { Timestamp } from 'firebase/firestore';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getQuoteById,
  updateQuote,
  getServiceRequestById,
  updateServiceRequest,
  getQuotePaymentById,
  updateQuotePayment,
  getPaymentsByQuote,
  getCompanyProfileById,
  getCompanyProfileBySubscriptionId,
  getUserProfile,
  updateProfileSubscriptionState,
  updateCompanyProfileDoc,
  type SubscriptionStatus,
} from '@/lib/firestore-data';
import { sendTransactionalEmails } from '@/lib/email/send';
import { sendHubNotification, EMAIL_SITE_URL } from '@/lib/email/hub-notify';
import { ADMIN_RECIPIENTS } from '@/lib/email/brevo-client';
import { getSubscriptionEmailCopy } from '@/lib/email/subscription-copy';
import { formatMoney } from '@/lib/money';

/** Normalize Stripe subscription status into the typed union we store. */
function normalizeSubStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case 'trialing':
    case 'active':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
      return s;
    case 'incomplete_expired':
      return 'canceled';
    case 'paused':
      return 'past_due';
    default:
      return 'incomplete';
  }
}

/**
 * Resolve the company profile this subscription belongs to. Prefers the
 * metadata.profileId we stamped at checkout; falls back to a query on the
 * subscription id (handles older subscriptions or missing metadata).
 */
async function resolveProfileForSubscription(sub: Stripe.Subscription) {
  const metaProfileId = sub.metadata?.profileId;
  if (metaProfileId) {
    const p = await getCompanyProfileById(metaProfileId);
    if (p) return p;
  }
  return getCompanyProfileBySubscriptionId(sub.id);
}

/**
 * Apply a subscription state change to the owning profile.
 * Skips silently if the event id was already applied (idempotency guard).
 */
async function handleSubscriptionEvent(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  if (sub.metadata?.type && sub.metadata.type !== 'company-profile-sub') {
    return; // Other product subscriptions on the same customer — ignore.
  }
  const profile = await resolveProfileForSubscription(sub);
  if (!profile?.id) {
    console.warn('[stripe webhook] no profile for subscription', sub.id);
    return;
  }
  if (profile.subscription?.lastEventId === event.id) return;

  const status = normalizeSubStatus(sub.status);
  const cancelAtPeriodEnd = !!(sub as any).cancel_at_period_end;

  // POLICY: trial users who cancel lose access IMMEDIATELY (no grace period).
  // Reason: they haven't paid anything; letting them keep the page until the
  // trial naturally ends rewards cancellation. Paid subscribers, on the other
  // hand, keep access until end of period because they paid for it.
  //
  // Implementation: when Stripe sends a subscription.updated event for a
  // `trialing` sub with `cancel_at_period_end === true`, we convert it to a
  // hard cancel via stripe.subscriptions.cancel(). The follow-up
  // `customer.subscription.deleted` event then fires the canceled-email
  // and final state cleanup through the normal path.
  if (status === 'trialing' && cancelAtPeriodEnd) {
    try {
      await getStripe().subscriptions.cancel(sub.id);
    } catch (err) {
      console.warn('[stripe webhook] failed to hard-cancel trial sub:', err);
    }
    // Reflect cancellation locally NOW so the page goes offline immediately,
    // without waiting for the subscription.deleted event to round-trip.
    await updateProfileSubscriptionState(
      profile.id,
      {
        status: 'canceled',
        canceledAt: Timestamp.now(),
        lastEventId: event.id,
      },
      false // isPublished = false (immediate)
    );
    return;
  }

  // Publishing rule for paid subscribers:
  //   - trialing (NOT cancelling) → page online (trial active, customer engaged)
  //   - active                    → page online (paying)
  //   - past_due                  → page STAYS online (Stripe retrying; 5d grace)
  //   - canceled / unpaid / incomplete → page offline
  // When `cancel_at_period_end === true` on an active/past_due sub, status
  // remains active until Stripe transitions to canceled at period end. We
  // honor that — the customer keeps what they paid for.
  const isPublishable = status === 'trialing' || status === 'active' || status === 'past_due';
  const currentPeriodEndUnix = (sub as any).current_period_end as number | undefined;
  const trialEndUnix = (sub as any).trial_end as number | null | undefined;
  const canceledAtUnix = (sub as any).canceled_at as number | null | undefined;

  // Capture price + billing cycle from the active subscription item.
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id;
  const interval = item?.price?.recurring?.interval;
  const billingCycle: 'monthly' | 'annual' | undefined =
    interval === 'year' ? 'annual' : interval === 'month' ? 'monthly' : undefined;

  await updateProfileSubscriptionState(
    profile.id,
    {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      billingCycle,
      status,
      currentPeriodEnd: currentPeriodEndUnix
        ? Timestamp.fromMillis(currentPeriodEndUnix * 1000)
        : undefined,
      trialEndsAt: trialEndUnix ? Timestamp.fromMillis(trialEndUnix * 1000) : undefined,
      canceledAt: canceledAtUnix ? Timestamp.fromMillis(canceledAtUnix * 1000) : undefined,
      lastEventId: event.id,
    },
    isPublishable
  );
}

/** Invoice events refresh the subscription state via the linked subscription. */
async function handleInvoiceEvent(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof (invoice as any).subscription === 'string'
      ? ((invoice as any).subscription as string)
      : (invoice as any).subscription?.id;
  if (!subscriptionId) return;
  try {
    const sub = await getStripe().subscriptions.retrieve(subscriptionId);
    if (sub.metadata?.type && sub.metadata.type !== 'company-profile-sub') return;
    const profile = await resolveProfileForSubscription(sub);
    if (!profile?.id) return;
    if (profile.subscription?.lastEventId === event.id) return;

    const status = normalizeSubStatus(sub.status);
    // Same publish rule as handleSubscriptionEvent — `past_due` is a grace
    // period during Stripe retry, only `unpaid`/`canceled` unpublish.
    const isPublishable = status === 'trialing' || status === 'active' || status === 'past_due';
    const currentPeriodEndUnix = (sub as any).current_period_end as number | undefined;
    await updateProfileSubscriptionState(
      profile.id,
      {
        status,
        currentPeriodEnd: currentPeriodEndUnix
          ? Timestamp.fromMillis(currentPeriodEndUnix * 1000)
          : undefined,
        lastEventId: event.id,
      },
      isPublishable
    );
  } catch (err) {
    console.error('[stripe webhook] failed to refresh sub from invoice:', err);
  }
}

/**
 * Look up the user owning a Stripe customer, fall back via the profile's
 * stored ownerUid. Returns email + display name if found.
 */
async function lookupRecipientFromProfile(profile: { ownerUid: string }) {
  const user = await getUserProfile(profile.ownerUid);
  if (!user?.email) return null;
  return {
    email: user.email,
    name: user.displayName ?? user.company ?? user.email,
    locale: (user.locale === 'en' ? 'en' : 'it') as 'it' | 'en',
  };
}

/** Generic dispatcher — reads copy from the central file and sends. */
async function sendSubscriptionEmail(
  profileId: string,
  scenario:
    | 'subscription-payment-receipt'
    | 'subscription-trial-ending'
    | 'subscription-payment-failed'
    | 'subscription-canceled'
    | 'subscription-renewal-reminder',
  extras?: { amount?: string; invoicePdfUrl?: string; periodStart?: string; periodEnd?: string; renewalDate?: string }
) {
  const profile = await getCompanyProfileById(profileId);
  if (!profile) return;
  const recipient = await lookupRecipientFromProfile(profile);
  if (!recipient) return;
  const copy = getSubscriptionEmailCopy(scenario, {
    locale: recipient.locale,
    siteUrl: EMAIL_SITE_URL,
    companyName: profile.companyName,
    slug: profile.slug,
    amount: extras?.amount,
    invoicePdfUrl: extras?.invoicePdfUrl,
    periodStart: extras?.periodStart,
    periodEnd: extras?.periodEnd,
    renewalDate: extras?.renewalDate,
  });
  await sendHubNotification({
    to: [{ email: recipient.email, name: recipient.name }],
    locale: recipient.locale,
    greetingName: recipient.name,
    subject: copy.subject,
    heading: copy.heading,
    intro: copy.intro,
    body: copy.body,
    ctaLabel: copy.ctaLabel,
    ctaUrl: copy.ctaUrl,
  }).catch((err) => console.warn(`[stripe webhook] ${scenario} email failed:`, err));
}

const emailTrialEnding = (profileId: string) =>
  sendSubscriptionEmail(profileId, 'subscription-trial-ending');

const emailPaymentFailed = (profileId: string) =>
  sendSubscriptionEmail(profileId, 'subscription-payment-failed');

const emailSubscriptionCanceled = (profileId: string) =>
  sendSubscriptionEmail(profileId, 'subscription-canceled');

/**
 * A chargeback (dispute) was opened. Take the page offline immediately + alert
 * admins. Mark `subscription.disputed = true` so the UI can show the state.
 */
async function handleDisputeCreated(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id;
  try {
    const charge = await getStripe().charges.retrieve(chargeId);
    const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;
    if (!customerId) return;
    // Find any company-profile sub for this customer.
    const subs = await getStripe().subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
    const ours = subs.data.find((s) => s.metadata?.type === 'company-profile-sub');
    if (!ours) return;
    const profile = await resolveProfileForSubscription(ours);
    if (!profile?.id) return;
    await updateCompanyProfileDoc(profile.id, {
      subscription: { ...profile.subscription, disputed: true },
      isPublished: false,
    });
    emailChargebackAlert(profile.id, dispute.amount);
  } catch (err) {
    console.error('[stripe webhook] handleDisputeCreated failed:', err);
  }
}

/** Dispute resolved — restore the page if won, keep offline if lost. */
async function handleDisputeClosed(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id;
  try {
    const charge = await getStripe().charges.retrieve(chargeId);
    const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;
    if (!customerId) return;
    const subs = await getStripe().subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
    const ours = subs.data.find((s) => s.metadata?.type === 'company-profile-sub');
    if (!ours) return;
    const profile = await resolveProfileForSubscription(ours);
    if (!profile?.id) return;
    if (dispute.status === 'won') {
      // Re-publish (subject to subscription still being active).
      const subActive = ours.status === 'trialing' || ours.status === 'active' || ours.status === 'past_due';
      await updateCompanyProfileDoc(profile.id, {
        subscription: { ...profile.subscription, disputed: false },
        isPublished: subActive,
      });
    } else {
      // Lost (or warning_closed / not_actionable): keep offline + cancel sub.
      try { await getStripe().subscriptions.cancel(ours.id); } catch {}
      await updateCompanyProfileDoc(profile.id, {
        subscription: { ...profile.subscription, disputed: false, status: 'canceled' },
        isPublished: false,
      });
    }
  } catch (err) {
    console.error('[stripe webhook] handleDisputeClosed failed:', err);
  }
}

/** Alert admins of a chargeback so they can investigate / contest. */
async function emailChargebackAlert(profileId: string, disputeAmount?: number) {
  const profile = await getCompanyProfileById(profileId);
  if (!profile) return;
  if (!ADMIN_RECIPIENTS.length) return;
  const amount = disputeAmount ? formatMoney(disputeAmount, 'eur') : '€?';
  await sendHubNotification({
    to: ADMIN_RECIPIENTS,
    locale: 'it',
    subject: `⚠ Chargeback aperto — ${profile.companyName} (${amount})`,
    heading: 'Chargeback aperto da Stripe',
    intro: `Un cliente ha contestato il pagamento. Profilo: "${profile.companyName}" (slug: ${profile.slug}). Importo contestato: ${amount}. La pagina pubblica è stata immediatamente messa offline.`,
    body: 'Apri Stripe Dashboard per decidere se contestare la disputa o accettarla. Vai alla scheda "Disputes" del customer.',
    ctaLabel: 'Apri Stripe Dashboard',
    ctaUrl: 'https://dashboard.stripe.com/disputes',
  }).catch((err) => console.warn('[stripe webhook] chargeback alert failed:', err));
}

/** Mark a quote paid + advance its request once paid payments cover the total. */
async function reconcileQuotePaid(quoteId: string) {
  const quote = await getQuoteById(quoteId);
  if (!quote || quote.status === 'paid') return;
  const payments = await getPaymentsByQuote(quoteId);
  const paidSum = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  if (quote.total > 0 && paidSum >= quote.total) {
    await updateQuote(quoteId, { status: 'paid', paidAt: Timestamp.now() });
    if (quote.requestId) {
      const request = await getServiceRequestById(quote.requestId);
      if (request && (request.status === 'quoted' || request.status === 'new')) {
        await updateServiceRequest(quote.requestId, { status: 'accepted' });
      }
    }
  }
}

// Stripe needs the Node.js runtime (raw body + crypto), not the Edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Raw body is required for signature verification.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // ── Company Profile subscription lifecycle ───────────────────────────
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      await handleSubscriptionEvent(event);
      return NextResponse.json({ received: true });
    }
    if (event.type === 'customer.subscription.deleted') {
      await handleSubscriptionEvent(event);
      // After state is updated to canceled, notify the owner.
      const sub = event.data.object as Stripe.Subscription;
      const profile = await resolveProfileForSubscription(sub);
      if (profile?.id) emailSubscriptionCanceled(profile.id);
      return NextResponse.json({ received: true });
    }
    if (event.type === 'invoice.paid') {
      await handleInvoiceEvent(event);
      // Send a branded receipt only when an actual amount was charged
      // (trial-start invoices have amount_paid=0 — skip those).
      const invoice = event.data.object as Stripe.Invoice;
      const amountPaid = invoice.amount_paid ?? 0;
      if (amountPaid > 0) {
        const subscriptionId =
          typeof (invoice as any).subscription === 'string'
            ? ((invoice as any).subscription as string)
            : (invoice as any).subscription?.id;
        if (subscriptionId) {
          try {
            const sub = await getStripe().subscriptions.retrieve(subscriptionId);
            if (sub.metadata?.type === 'company-profile-sub') {
              const profile = await resolveProfileForSubscription(sub);
              if (profile?.id) {
                const periodStart = (invoice as any).period_start
                  ? new Date((invoice as any).period_start * 1000).toLocaleDateString('it-IT')
                  : undefined;
                const periodEnd = (invoice as any).period_end
                  ? new Date((invoice as any).period_end * 1000).toLocaleDateString('it-IT')
                  : undefined;
                const nextRenewal = (sub as any).current_period_end
                  ? new Date((sub as any).current_period_end * 1000).toLocaleDateString('it-IT')
                  : undefined;
                sendSubscriptionEmail(profile.id, 'subscription-payment-receipt', {
                  amount: formatMoney(amountPaid, (invoice.currency || 'eur') as any),
                  invoicePdfUrl: invoice.invoice_pdf ?? undefined,
                  periodStart,
                  periodEnd,
                  renewalDate: nextRenewal,
                });
              }
            }
          } catch (err) {
            console.warn('[stripe webhook] receipt email lookup failed:', err);
          }
        }
      }
      return NextResponse.json({ received: true });
    }
    if (event.type === 'invoice.payment_failed') {
      await handleInvoiceEvent(event);
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof (invoice as any).subscription === 'string'
          ? ((invoice as any).subscription as string)
          : (invoice as any).subscription?.id;
      if (subscriptionId) {
        try {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          const profile = await resolveProfileForSubscription(sub);
          if (profile?.id) emailPaymentFailed(profile.id);
        } catch {}
      }
      return NextResponse.json({ received: true });
    }
    if (event.type === 'invoice.upcoming') {
      // Stripe sends this ~3 days before the next renewal by default. We only
      // care about the one fired right after the trial: invoice.billing_reason === 'subscription_cycle'
      // and the subscription must still be in 'trialing' status.
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof (invoice as any).subscription === 'string'
          ? ((invoice as any).subscription as string)
          : (invoice as any).subscription?.id;
      if (subscriptionId) {
        try {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          if (sub.status === 'trialing') {
            const profile = await resolveProfileForSubscription(sub);
            if (profile?.id) emailTrialEnding(profile.id);
          }
        } catch {}
      }
      return NextResponse.json({ received: true });
    }
    if (event.type === 'charge.dispute.created') {
      await handleDisputeCreated(event);
      return NextResponse.json({ received: true });
    }
    if (event.type === 'charge.dispute.closed') {
      await handleDisputeClosed(event);
      return NextResponse.json({ received: true });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Subscription mode checkout for a company profile? Subscription events
      // will arrive too — this branch just no-ops gracefully.
      if (session.mode === 'subscription') {
        return NextResponse.json({ received: true });
      }
      const quoteId = session.metadata?.quoteId;
      const paymentId = session.metadata?.paymentId;
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : undefined;

      // ── Single installment / advance payment ──
      if (paymentId) {
        const payment = await getQuotePaymentById(paymentId);
        if (payment && payment.status !== 'paid') {
          await updateQuotePayment(paymentId, {
            status: 'paid',
            stripePaymentIntentId: paymentIntentId,
            paidAt: Timestamp.now(),
          });
          await reconcileQuotePaid(payment.quoteId);

          sendTransactionalEmails({
            scenario: 'payment-receipt',
            locale: 'it',
            client: { name: payment.clientName, email: payment.clientEmail },
            adminFields: [
              { label: 'Pagamento', value: payment.label },
              { label: 'Importo', value: formatMoney(payment.amount, 'eur') },
            ],
          }).catch(() => {});
        }
      } else if (quoteId) {
        const quote = await getQuoteById(quoteId);
        if (quote && quote.status !== 'paid') {
          await updateQuote(quoteId, {
            status: 'paid',
            stripePaymentIntentId:
              typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            paidAt: Timestamp.now(),
          });

          // Advance the underlying request once payment lands (if linked).
          let request = null;
          if (quote.requestId) {
            request = await getServiceRequestById(quote.requestId);
            if (request && (request.status === 'quoted' || request.status === 'new')) {
              await updateServiceRequest(quote.requestId, { status: 'accepted' });
            }
          }

          // Receipt to the client + notification to admins (fire-and-forget).
          sendTransactionalEmails({
            scenario: 'payment-receipt',
            locale: 'it',
            client: { name: request?.clientName ?? quote.clientName, email: quote.clientEmail },
            adminFields: [
              { label: 'Progetto', value: request?.title ?? quote.title },
              { label: 'Preventivo', value: quote.title },
              { label: 'Importo', value: formatMoney(quote.total, quote.currency) },
            ],
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    // Log but acknowledge — returning non-2xx makes Stripe retry indefinitely.
    console.error('[stripe webhook] handler error:', err);
  }

  return NextResponse.json({ received: true });
}
