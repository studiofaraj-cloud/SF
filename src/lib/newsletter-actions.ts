'use server';

import { after } from 'next/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  LIMITS,
  cleanUp,
  confirmSignup,
  domainReceivesMail,
  ipKey,
  isDisposable,
  isEmailShape,
  normalizeEmail,
  recordSignup,
  unsubscribe,
  withinRateLimit,
  type SignupOutcome,
} from '@/lib/newsletter';
import { sendConfirmationEmail, sendNewSubscriberAlert } from '@/lib/email/newsletter-email';

export type SignupState = { outcome: SignupOutcome | null };

const SignupSchema = z.object({
  email: z.string().max(320),
  locale: z.enum(['it', 'en']).catch('it'),
  // Hidden from people; bots fill it in.
  website: z.string().max(500).optional(),
  // Milliseconds between the form appearing and being sent.
  elapsed: z.coerce.number().optional(),
  source: z.string().max(60).optional(),
});

/** Where the request comes from, for the rate limit (first hop of the proxy chain). */
async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'unknown').trim();
}

/**
 * The newsletter form. Bots are dropped silently (they get the same answer as
 * a person, so there's nothing to learn from it); people get a clear message.
 * Nothing is subscribed here: a confirmation email is sent, and the address
 * becomes a subscriber only from its link.
 */
export async function subscribeToNewsletter(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { outcome: 'invalid' };
  const { locale, website, elapsed, source } = parsed.data;

  // Bot signals: the hidden field filled in, or sent faster than a person types.
  if (website || elapsed === undefined || elapsed < LIMITS.minFillMs) return { outcome: 'sent' };

  const email = normalizeEmail(parsed.data.email);
  if (!isEmailShape(email)) return { outcome: 'invalid' };
  if (isDisposable(email) || !(await domainReceivesMail(email))) return { outcome: 'undeliverable' };

  try {
    if (!(await withinRateLimit(ipKey(await clientIp())))) return { outcome: 'limited' };

    const pending = await recordSignup({ email, locale, source: source || 'footer' });
    if (pending) await sendConfirmationEmail(pending);
    after(() => cleanUp().catch((err) => console.warn('[newsletter] clean-up failed:', err)));
    revalidatePath('/admin/subscribers');
    return { outcome: 'sent' };
  } catch (err) {
    console.error('[newsletter] sign-up failed:', err);
    return { outcome: 'invalid' };
  }
}

/** The "Conferma l'iscrizione" button on the page the email links to. */
export async function confirmNewsletter(formData: FormData): Promise<void> {
  const locale = formData.get('locale') === 'en' ? 'en' : 'it';
  const result = await confirmSignup(String(formData.get('t') ?? ''));
  if (result && !result.alreadyActive) {
    after(() => sendNewSubscriberAlert(result.email).catch(() => {}));
    revalidatePath('/admin/subscribers');
  }
  redirect(`/${locale}/newsletter/conferma?stato=${result ? 'ok' : 'scaduto'}`);
}

/** The "Annulla l'iscrizione" button on the unsubscribe page. */
export async function unsubscribeFromNewsletter(formData: FormData): Promise<void> {
  const locale = formData.get('locale') === 'en' ? 'en' : 'it';
  const ok = await unsubscribe(String(formData.get('t') ?? ''));
  if (ok) revalidatePath('/admin/subscribers');
  redirect(`/${locale}/newsletter/annulla?stato=${ok ? 'ok' : 'errore'}`);
}
