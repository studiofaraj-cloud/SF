'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase/firestore';
import { requireUser, requireRole } from '@/lib/auth';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getServiceRequestById,
  updateServiceRequest,
  createQuote,
  getQuoteById,
  getQuotesByRequest,
  getQuotesByClient,
  listQuotes,
  updateQuote,
  getUserProfile,
  type Quote,
  type QuoteLineItem,
} from '@/lib/firestore-data';
import { sendHubNotification, EMAIL_SITE_URL } from '@/lib/email/hub-notify';
import { formatMoney } from '@/lib/money';

/** Email the client that a new quote/invoice is available (fire-and-forget). */
async function notifyClientNewQuote(opts: {
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  title: string;
  total: number;
  currency: string;
}) {
  const profile = await getUserProfile(opts.clientId);
  const email = opts.clientEmail || profile?.email;
  if (!email) return;
  const locale = profile?.locale === 'en' ? 'en' : 'it';
  const amount = formatMoney(opts.total, opts.currency, locale === 'en' ? 'en-IE' : 'it-IT');
  await sendHubNotification({
    to: [{ email, name: opts.clientName || profile?.displayName }],
    locale,
    greetingName: opts.clientName || profile?.displayName,
    subject:
      locale === 'en'
        ? `New quote: ${opts.title} — Studio Faraj`
        : `Nuovo preventivo: ${opts.title} — Studio Faraj`,
    heading: locale === 'en' ? 'You have a new quote' : 'Hai un nuovo preventivo',
    intro:
      locale === 'en'
        ? `We've prepared the quote "${opts.title}" (${amount}). You can review and pay it in your client area.`
        : `Abbiamo preparato il preventivo "${opts.title}" (${amount}). Puoi consultarlo e pagarlo nella tua area clienti.`,
    ctaLabel: locale === 'en' ? 'View & pay' : 'Vedi e paga',
    ctaUrl: `${EMAIL_SITE_URL}/${locale}/hub/quotes`,
  });
}

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

async function assertRequestAccess(requestId: string): Promise<SessionUser> {
  const user = (await requireUser()) as SessionUser;
  if (user.role === 'admin') return user;
  const request = await getServiceRequestById(requestId);
  if (!request || request.clientId !== user.id) {
    throw new Error('Forbidden');
  }
  return user;
}

const CreateQuoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  taxRate: z.number().min(0).max(100),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(300),
        quantity: z.number().int().min(1).max(1000),
        unitAmount: z.number().int().min(0), // cents
      })
    )
    .min(1, 'Add at least one line item.'),
});

// ── Admin ───────────────────────────────────────────────────────────────────

export async function createQuoteAction(
  requestId: string,
  input: { title: string; taxRate: number; lineItems: QuoteLineItem[] }
): Promise<{ success: boolean; id?: string; error?: string }> {
  await requireRole('admin');

  const parsed = CreateQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] ?? 'Invalid quote.' };
  }

  const request = await getServiceRequestById(requestId);
  if (!request) return { success: false, error: 'Request not found.' };

  const subtotal = parsed.data.lineItems.reduce((sum, li) => sum + li.quantity * li.unitAmount, 0);
  const taxAmount = Math.round((subtotal * parsed.data.taxRate) / 100);
  const total = subtotal + taxAmount;

  try {
    const id = await createQuote({
      requestId,
      clientId: request.clientId,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      title: parsed.data.title,
      currency: 'eur',
      lineItems: parsed.data.lineItems,
      taxRate: parsed.data.taxRate,
      subtotal,
      taxAmount,
      total,
      createdBy: (await requireUser()).id,
    });
    // Move the request forward to "quoted" if it's still new.
    if (request.status === 'new') {
      await updateServiceRequest(requestId, { status: 'quoted' });
    }
    notifyClientNewQuote({
      clientId: request.clientId,
      clientEmail: request.clientEmail,
      clientName: request.clientName,
      title: parsed.data.title,
      total,
      currency: 'eur',
    }).catch(() => {});
    revalidatePath('/admin/requests');
    revalidatePath('/admin/invoices');
    return { success: true, id };
  } catch (error) {
    console.error('[quote-actions] create failed:', error);
    return { success: false, error: 'Failed to create quote.' };
  }
}

export async function cancelQuoteAction(quoteId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  const quote = await getQuoteById(quoteId);
  if (!quote) return { success: false, error: 'Quote not found.' };
  if (quote.status === 'paid') return { success: false, error: 'A paid quote cannot be cancelled.' };
  try {
    await updateQuote(quoteId, { status: 'cancelled' });
    revalidatePath('/admin/requests');
    revalidatePath('/admin/invoices');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to cancel quote.' };
  }
}

/** Admin: create a standalone quote/invoice for a client (no linked request). */
export async function adminCreateQuoteForClientAction(
  clientId: string,
  input: { title: string; taxRate: number; lineItems: QuoteLineItem[] }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const admin = await requireRole('admin');

  if (!clientId) return { success: false, error: 'Select a client.' };
  const parsed = CreateQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] ?? 'Invalid quote.' };
  }

  const profile = await getUserProfile(clientId);
  if (!profile) return { success: false, error: 'Client not found.' };

  const subtotal = parsed.data.lineItems.reduce((sum, li) => sum + li.quantity * li.unitAmount, 0);
  const taxAmount = Math.round((subtotal * parsed.data.taxRate) / 100);
  const total = subtotal + taxAmount;

  try {
    const id = await createQuote({
      clientId,
      clientName: profile.displayName,
      clientEmail: profile.email,
      title: parsed.data.title,
      currency: 'eur',
      lineItems: parsed.data.lineItems,
      taxRate: parsed.data.taxRate,
      subtotal,
      taxAmount,
      total,
      createdBy: admin.id,
    });
    notifyClientNewQuote({
      clientId,
      clientEmail: profile.email,
      clientName: profile.displayName,
      title: parsed.data.title,
      total,
      currency: 'eur',
    }).catch(() => {});
    revalidatePath('/admin/invoices');
    return { success: true, id };
  } catch (error) {
    console.error('[quote-actions] standalone create failed:', error);
    return { success: false, error: 'Failed to create quote.' };
  }
}

/** Admin: mark a quote as paid manually (e.g. bank transfer / offline). */
export async function markQuotePaidAction(quoteId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole('admin');
  const quote = await getQuoteById(quoteId);
  if (!quote) return { success: false, error: 'Quote not found.' };
  if (quote.status === 'paid') return { success: true };
  try {
    await updateQuote(quoteId, { status: 'paid', paidAt: Timestamp.now() });
    if (quote.requestId) {
      const request = await getServiceRequestById(quote.requestId);
      if (request && (request.status === 'quoted' || request.status === 'new')) {
        await updateServiceRequest(quote.requestId, { status: 'accepted' });
      }
    }
    revalidatePath('/admin/requests');
    revalidatePath('/admin/invoices');
    return { success: true };
  } catch (error) {
    console.error('[quote-actions] mark paid failed:', error);
    return { success: false, error: 'Failed to mark as paid.' };
  }
}

/** Admin: list all quotes/invoices. */
export async function listAllQuotesAction(): Promise<Quote[]> {
  await requireRole('admin');
  const quotes = await listQuotes();
  return quotes.map(serialize);
}

/** Admin: fetch a single quote/invoice. */
export async function getQuoteAction(quoteId: string): Promise<Quote | null> {
  await requireRole('admin');
  const quote = await getQuoteById(quoteId);
  return quote ? serialize(quote) : null;
}

/** Client: list my own quotes/invoices. */
export async function getMyQuotesAction(): Promise<Quote[]> {
  const user = (await requireUser()) as SessionUser;
  const quotes = await getQuotesByClient(user.id);
  return quotes.map(serialize);
}

// ── Shared (owner client OR admin) ────────────────────────────────────────────

export async function getQuotesForRequestAction(requestId: string): Promise<Quote[]> {
  await assertRequestAccess(requestId);
  const quotes = await getQuotesByRequest(requestId);
  return quotes.map(serialize);
}

// ── Client checkout ───────────────────────────────────────────────────────────

export async function createQuoteCheckoutAction(
  quoteId: string,
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

  const quote = await getQuoteById(quoteId);
  if (!quote) return { success: false, error: 'Quote not found.' };

  // Only the owning client (or an admin, for testing) may pay.
  if (user.role !== 'admin' && quote.clientId !== user.id) {
    return { success: false, error: 'You do not have access to this quote.' };
  }
  if (quote.status !== 'sent') {
    return { success: false, error: 'This quote is no longer payable.' };
  }

  const safeOrigin = /^https?:\/\//.test(origin) ? origin.replace(/\/$/, '') : EMAIL_SITE_URL;

  try {
    const stripe = getStripe();

    const line_items = quote.lineItems.map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency: quote.currency,
        unit_amount: li.unitAmount,
        product_data: { name: li.description },
      },
    }));

    if (quote.taxAmount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: quote.currency,
          unit_amount: quote.taxAmount,
          product_data: { name: `IVA (${quote.taxRate}%)` },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: quote.clientEmail || user.email,
      success_url: `${safeOrigin}/${locale}/hub/checkout/success`,
      cancel_url: `${safeOrigin}/${locale}/hub/checkout/cancel`,
      metadata: { quoteId, requestId: quote.requestId ?? '' },
    });

    await updateQuote(quoteId, { stripeSessionId: session.id });

    return { success: true, url: session.url ?? undefined };
  } catch (error) {
    console.error('[quote-actions] checkout failed:', error);
    return { success: false, error: 'Could not start checkout. Please try again.' };
  }
}
