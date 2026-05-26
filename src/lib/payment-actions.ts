'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase/firestore';
import { requireUser, requireRole } from '@/lib/auth';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getQuoteById,
  updateQuote,
  getServiceRequestById,
  updateServiceRequest,
  getUserProfile,
  createQuotePayment,
  getQuotePaymentById,
  getPaymentsByQuote,
  getPaymentsByClient,
  updateQuotePayment,
  type QuotePayment,
} from '@/lib/firestore-data';
import { sendHubNotification, EMAIL_SITE_URL } from '@/lib/email/hub-notify';
import { formatMoney } from '@/lib/money';

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

type SessionUser = { id: string; name: string; email?: string; role: 'admin' | 'client' };

async function assertQuoteAccess(quoteId: string): Promise<{ user: SessionUser; quote: NonNullable<Awaited<ReturnType<typeof getQuoteById>>> }> {
  const user = (await requireUser()) as SessionUser;
  const quote = await getQuoteById(quoteId);
  if (!quote) throw new Error('Quote not found');
  if (user.role !== 'admin' && quote.clientId !== user.id) throw new Error('Forbidden');
  return { user, quote };
}

/** Email the client that a payment is due (fire-and-forget). */
async function notifyPaymentRequested(p: { clientId: string; clientEmail?: string; clientName?: string; label: string; amount: number; }) {
  const profile = await getUserProfile(p.clientId);
  const email = p.clientEmail || profile?.email;
  if (!email) return;
  const locale = profile?.locale === 'en' ? 'en' : 'it';
  const amount = formatMoney(p.amount, 'eur', locale === 'en' ? 'en-IE' : 'it-IT');
  await sendHubNotification({
    to: [{ email, name: p.clientName || profile?.displayName }],
    locale,
    greetingName: p.clientName || profile?.displayName,
    subject: locale === 'en' ? `New payment due: ${p.label} (${amount})` : `Nuovo pagamento richiesto: ${p.label} (${amount})`,
    heading: locale === 'en' ? 'A new payment is available' : 'È disponibile un nuovo pagamento',
    intro:
      locale === 'en'
        ? `A payment "${p.label}" of ${amount} has been added to your account. You can pay it from your client area.`
        : `È stato aggiunto un pagamento "${p.label}" di ${amount} al tuo account. Puoi saldarlo dalla tua area clienti.`,
    ctaLabel: locale === 'en' ? 'Pay now' : 'Paga ora',
    ctaUrl: `${EMAIL_SITE_URL}/${locale}/hub/quotes`,
  });
}

/** Email the client that a payment was registered as received. */
async function notifyPaymentReceived(p: { clientId: string; clientEmail?: string; clientName?: string; label: string; amount: number; }) {
  const profile = await getUserProfile(p.clientId);
  const email = p.clientEmail || profile?.email;
  if (!email) return;
  const locale = profile?.locale === 'en' ? 'en' : 'it';
  const amount = formatMoney(p.amount, 'eur', locale === 'en' ? 'en-IE' : 'it-IT');
  await sendHubNotification({
    to: [{ email, name: p.clientName || profile?.displayName }],
    locale,
    greetingName: p.clientName || profile?.displayName,
    subject: locale === 'en' ? `Payment received: ${p.label} (${amount})` : `Pagamento ricevuto: ${p.label} (${amount})`,
    heading: locale === 'en' ? 'Payment received' : 'Pagamento ricevuto',
    intro:
      locale === 'en'
        ? `We've registered your payment "${p.label}" of ${amount}. Thank you!`
        : `Abbiamo registrato il tuo pagamento "${p.label}" di ${amount}. Grazie!`,
    ctaLabel: locale === 'en' ? 'View payments' : 'Vedi pagamenti',
    ctaUrl: `${EMAIL_SITE_URL}/${locale}/hub/quotes`,
  });
}

/**
 * After a payment is marked paid, mark the quote paid + advance its request
 * once the paid payments cover the quote total.
 */
async function reconcileQuote(quoteId: string) {
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

const AddPaymentSchema = z.object({
  label: z.string().trim().min(1, 'Label is required.').max(120),
  amount: z.number().int().min(1, 'Amount must be greater than zero.'),
  dueDate: z.string().optional(),
});

// ── Admin ───────────────────────────────────────────────────────────────────

export async function addQuotePaymentAction(
  quoteId: string,
  input: { label: string; amount: number; dueDate?: string }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const admin = await requireRole('admin');
  const parsed = AddPaymentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().formErrors[0] ?? 'Invalid payment.' };

  const quote = await getQuoteById(quoteId);
  if (!quote) return { success: false, error: 'Quote not found.' };

  try {
    const id = await createQuotePayment({
      quoteId,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      label: parsed.data.label,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate ? Timestamp.fromDate(new Date(parsed.data.dueDate)) : undefined,
      createdBy: admin.id,
    });
    notifyPaymentRequested({
      clientId: quote.clientId,
      clientEmail: quote.clientEmail,
      clientName: quote.clientName,
      label: parsed.data.label,
      amount: parsed.data.amount,
    }).catch(() => {});
    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${quoteId}`);
    return { success: true, id };
  } catch (error) {
    console.error('[payment-actions] add failed:', error);
    return { success: false, error: 'Failed to add payment.' };
  }
}

const GeneratePlanSchema = z.object({
  advance: z.number().int().min(0),
  installments: z.number().int().min(1).max(36),
});

/** Admin: generate an advance + N equal installments covering the quote total. */
export async function generatePaymentPlanAction(
  quoteId: string,
  input: { advance: number; installments: number }
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole('admin');
  const parsed = GeneratePlanSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid plan.' };

  const quote = await getQuoteById(quoteId);
  if (!quote) return { success: false, error: 'Quote not found.' };

  const { advance, installments } = parsed.data;
  if (advance > quote.total) return { success: false, error: 'Advance exceeds the total.' };

  const remaining = quote.total - advance;
  const base = Math.floor(remaining / installments);
  const remainder = remaining - base * installments;

  try {
    const common = {
      quoteId,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      createdBy: admin.id,
    };
    if (advance > 0) {
      await createQuotePayment({ ...common, label: 'Acconto', amount: advance });
    }
    for (let i = 0; i < installments; i++) {
      // Add the rounding remainder to the last installment so the sum is exact.
      const amount = base + (i === installments - 1 ? remainder : 0);
      if (amount > 0) await createQuotePayment({ ...common, label: `Rata ${i + 1}`, amount });
    }

    // One summary email for the generated plan.
    notifyPaymentRequested({
      clientId: quote.clientId,
      clientEmail: quote.clientEmail,
      clientName: quote.clientName,
      label: advance > 0 ? `Acconto + ${installments} rate` : `${installments} rate`,
      amount: quote.total,
    }).catch(() => {});

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${quoteId}`);
    return { success: true };
  } catch (error) {
    console.error('[payment-actions] generate plan failed:', error);
    return { success: false, error: 'Failed to generate plan.' };
  }
}

export async function markPaymentPaidAction(paymentId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  const payment = await getQuotePaymentById(paymentId);
  if (!payment) return { success: false, error: 'Payment not found.' };
  if (payment.status === 'paid') return { success: true };
  try {
    await updateQuotePayment(paymentId, { status: 'paid', paidAt: Timestamp.now() });
    await reconcileQuote(payment.quoteId);
    notifyPaymentReceived(payment).catch(() => {});
    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${payment.quoteId}`);
    return { success: true };
  } catch (error) {
    console.error('[payment-actions] mark paid failed:', error);
    return { success: false, error: 'Failed to mark as paid.' };
  }
}

export async function cancelPaymentAction(paymentId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  const payment = await getQuotePaymentById(paymentId);
  if (!payment) return { success: false, error: 'Payment not found.' };
  if (payment.status === 'paid') return { success: false, error: 'A paid payment cannot be cancelled.' };
  try {
    await updateQuotePayment(paymentId, { status: 'cancelled' });
    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${payment.quoteId}`);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to cancel payment.' };
  }
}

// ── Shared / client reads ─────────────────────────────────────────────────────

export async function getPaymentsForQuoteAction(quoteId: string): Promise<QuotePayment[]> {
  await assertQuoteAccess(quoteId);
  const payments = await getPaymentsByQuote(quoteId);
  return payments.map(serialize);
}

export async function getMyPaymentsAction(): Promise<QuotePayment[]> {
  const user = (await requireUser()) as SessionUser;
  const payments = await getPaymentsByClient(user.id);
  return payments.map(serialize);
}

// ── Client checkout for a single installment ──────────────────────────────────

export async function createPaymentCheckoutAction(
  paymentId: string,
  origin: string,
  locale: string = 'it'
): Promise<{ success: boolean; url?: string; error?: string }> {
  let user: SessionUser;
  try {
    user = (await requireUser()) as SessionUser;
  } catch {
    return { success: false, error: 'You must be signed in.' };
  }
  if (!isStripeConfigured()) {
    return { success: false, error: 'Online payments are not available yet. Please contact us.' };
  }

  const payment = await getQuotePaymentById(paymentId);
  if (!payment) return { success: false, error: 'Payment not found.' };
  if (user.role !== 'admin' && payment.clientId !== user.id) {
    return { success: false, error: 'You do not have access to this payment.' };
  }
  if (payment.status !== 'pending') {
    return { success: false, error: 'This payment is no longer payable.' };
  }

  const quote = await getQuoteById(payment.quoteId);
  const safeOrigin = /^https?:\/\//.test(origin) ? origin.replace(/\/$/, '') : EMAIL_SITE_URL;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: payment.amount,
            product_data: { name: `${quote?.title ?? 'Pagamento'} — ${payment.label}` },
          },
        },
      ],
      customer_email: payment.clientEmail || user.email,
      success_url: `${safeOrigin}/${locale}/hub/checkout/success`,
      cancel_url: `${safeOrigin}/${locale}/hub/checkout/cancel`,
      metadata: { paymentId, quoteId: payment.quoteId },
    });
    await updateQuotePayment(paymentId, { stripeSessionId: session.id });
    return { success: true, url: session.url ?? undefined };
  } catch (error) {
    console.error('[payment-actions] checkout failed:', error);
    return { success: false, error: 'Could not start checkout. Please try again.' };
  }
}
