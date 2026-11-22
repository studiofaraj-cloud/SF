import 'server-only';

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { promises as dns } from 'node:dns';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/firebase/admin';
import { PRIVACY_VERSION } from '@/lib/legal';

/**
 * Newsletter sign-up with double opt-in.
 *
 *   form → checks (bot signals, address, rate limits) → a PENDING record and
 *   one confirmation email → the person clicks "Conferma" → ACTIVE.
 *
 * Only confirmed addresses are subscribers, so the form can't be used to sign
 * someone else up or to flood an inbox: an address gets at most one
 * confirmation email a day (three in all), and one visitor at most a few
 * sign-ups an hour. Records live in `subscribers/{id}` where the id is a hash
 * of the address (one record per address); older records with random ids,
 * from before double opt-in, are still recognised by their email field.
 *
 * Everything runs on the server through the Admin SDK; the security rules
 * give browsers no access to subscribers or rate-limit counters.
 */

const SUBSCRIBERS = 'subscribers';
const RATE_LIMITS = 'rateLimits';

export const LIMITS = {
  /** A person needs at least this long between seeing the form and sending it. */
  minFillMs: 2500,
  perIpPerHour: 5,
  perIpPerDay: 20,
  /** One confirmation email per address per day… */
  resendAfterMs: 24 * 60 * 60 * 1000,
  /** …and no more than this many in all, until it's confirmed. */
  maxConfirmations: 3,
  confirmLinkDays: 7,
  /** Unconfirmed sign-ups are deleted after this long. */
  pendingTtlDays: 30,
} as const;

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed';

export type SignupOutcome =
  | 'sent' // confirmation sent, or nothing to do (already subscribed / recently sent): the visitor sees the same message
  | 'invalid' // not an email address
  | 'undeliverable' // disposable service, or a domain that can't receive mail
  | 'limited'; // too many attempts from this visitor

// ─── Addresses ──────────────────────────────────────────────────────────────

export function normalizeEmail(raw: string): string {
  return raw.normalize('NFKC').trim().toLowerCase();
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-z]{2,63}$/i;

export function isEmailShape(email: string): boolean {
  return email.length <= 254 && EMAIL.test(email) && !email.includes('..');
}

/** Throwaway inbox services, which a newsletter has no use for. */
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.net', 'sharklasers.com', 'grr.la',
  '10minutemail.com', '10minutemail.net', 'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmailo.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'trashmail.com', 'trashmail.de', 'getnada.com', 'nada.email',
  'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'throwawaymail.com', 'fakeinbox.com', 'moakt.com',
  'emailondeck.com', 'mintemail.com', 'mohmal.com', 'spamgourmet.com', 'mailcatch.com', 'mytemp.email',
  'tempinbox.com', 'burnermail.io', 'inboxkitten.com', 'mail.tm', 'tmpmail.org', 'tmpmail.net', 'dropmail.me',
  'emailfake.com', 'luxusmail.org', 'mailpoof.com', 'spambox.us', 'jetable.org', 'mvrht.net', 'fexpost.com',
]);

export function isDisposable(email: string): boolean {
  const domain = email.split('@')[1] ?? '';
  return DISPOSABLE.has(domain) || [...DISPOSABLE].some((d) => domain.endsWith(`.${d}`));
}

/**
 * Whether the domain can receive mail (it has MX records, or at least an
 * address record, which mail servers fall back to). A lookup that fails for
 * any other reason — timeout, DNS trouble — counts as yes: never refuse a
 * real person because of a slow resolver.
 */
export async function domainReceivesMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;
  const withTimeout = <T>(p: Promise<T>) =>
    Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), 2500))]);
  try {
    const mx = await withTimeout(dns.resolveMx(domain));
    if (mx.some((r) => r.exchange && r.exchange !== '.')) return true;
    return false; // "null MX": the domain says it accepts no mail
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'ENOTFOUND') return false; // no such domain
    if (code === 'ENODATA') {
      try {
        await withTimeout(dns.resolve4(domain));
        return true;
      } catch (e) {
        return (e as { code?: string }).code !== 'ENOTFOUND' && (e as { code?: string }).code !== 'ENODATA';
      }
    }
    return true;
  }
}

// ─── Ids, hashing and signed links ──────────────────────────────────────────

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set');
  return s || 'development-only-newsletter-secret';
}

/** A key of its own for the newsletter, derived from the session secret. */
function key(purpose: string): Buffer {
  return createHmac('sha256', secret()).update(`studio-faraj/newsletter/${purpose}/v1`).digest();
}

export function subscriberId(email: string): string {
  return createHash('sha256').update(`newsletter:${email}`).digest('hex').slice(0, 40);
}

/** The visitor's IP, kept only as a keyed hash in the rate-limit counters. */
export function ipKey(ip: string): string {
  return createHmac('sha256', key('ip')).update(ip).digest('hex').slice(0, 32);
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

type LinkPayload = { a: 'confirm' | 'unsubscribe'; s: string; n?: string; x?: number };

function signLink(payload: LinkPayload): string {
  const body = b64url(JSON.stringify(payload));
  const mac = createHmac('sha256', key('links')).update(body).digest();
  return `${body}.${b64url(mac)}`;
}

/** The payload of a link we signed, or null (tampered, wrong kind, expired). */
export function readLink(token: string | undefined | null, action: LinkPayload['a']): LinkPayload | null {
  if (!token || token.length > 600) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = createHmac('sha256', key('links')).update(body).digest();
  const given = Buffer.from(mac, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as LinkPayload;
    if (payload.a !== action || typeof payload.s !== 'string') return null;
    if (payload.x && Date.now() > payload.x) return null;
    return payload;
  } catch {
    return null;
  }
}

export function unsubscribeToken(id: string): string {
  return signLink({ a: 'unsubscribe', s: id });
}

/**
 * For every newsletter email sent to subscriber `id`: the unsubscribe link for
 * the email body, and the headers that give mail apps a one-click
 * "Unsubscribe" (required by Gmail and Yahoo for bulk senders).
 */
export function newsletterHeaders(id: string, locale: 'it' | 'en') {
  const site = process.env.EMAIL_SITE_URL || 'https://studiofaraj.it';
  const t = encodeURIComponent(unsubscribeToken(id));
  return {
    pageUrl: `${site}/${locale}/newsletter/annulla?t=${t}`,
    headers: {
      'List-Unsubscribe': `<${site}/api/newsletter/unsubscribe?t=${t}>, <mailto:info@studiofaraj.it?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

// ─── Rate limits ────────────────────────────────────────────────────────────

/**
 * Counts this sign-up against the visitor's hourly and daily allowance and
 * says whether it's within it. One small document per visitor, overwritten
 * as the windows roll; deleted after a day (see cleanUp).
 */
export async function withinRateLimit(ipHash: string): Promise<boolean> {
  const db = adminDb();
  const ref = db.collection(RATE_LIMITS).doc(`newsletter_${ipHash}`);
  const now = Date.now();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.exists ? (snap.data() as { hourStart: number; hourCount: number; dayStart: number; dayCount: number }) : null;
    const hourFresh = d && now - d.hourStart < 3600e3;
    const dayFresh = d && now - d.dayStart < 86400e3;
    const hourCount = hourFresh ? d!.hourCount : 0;
    const dayCount = dayFresh ? d!.dayCount : 0;
    if (hourCount >= LIMITS.perIpPerHour || dayCount >= LIMITS.perIpPerDay) return false;
    tx.set(ref, {
      hourStart: hourFresh ? d!.hourStart : now,
      hourCount: hourCount + 1,
      dayStart: dayFresh ? d!.dayStart : now,
      dayCount: dayCount + 1,
      expiresAt: Timestamp.fromMillis(now + 86400e3),
    });
    return true;
  });
}

// ─── Sign-up, confirmation, unsubscribe ─────────────────────────────────────

export type PendingSignup = { id: string; email: string; locale: 'it' | 'en'; confirmToken: string };

/**
 * Records a sign-up request. Returns the confirmation to send, or null when
 * there's nothing to send (already subscribed, or a confirmation went out
 * recently / too many times). The visitor is told the same thing either way,
 * so the form doesn't reveal who is subscribed.
 */
export async function recordSignup(input: { email: string; locale: 'it' | 'en'; source: string }): Promise<PendingSignup | null> {
  const db = adminDb();
  const { email, locale, source } = input;

  // A subscriber from before double opt-in (random document id).
  const legacy = await db.collection(SUBSCRIBERS).where('email', '==', email).limit(5).get();
  if (legacy.docs.some((d) => d.data().active === true || d.data().status === 'active')) return null;

  const id = subscriberId(email);
  const ref = db.collection(SUBSCRIBERS).doc(id);
  const nonce = randomBytes(9).toString('base64url');
  const now = Date.now();

  const send = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.exists ? snap.data()! : null;
    if (d?.status === 'active') return false;
    if (d?.status === 'pending') {
      const last = (d.lastConfirmationSentAt as Timestamp | undefined)?.toMillis() ?? 0;
      if (now - last < LIMITS.resendAfterMs || (d.confirmationsSent ?? 0) >= LIMITS.maxConfirmations) return false;
    }
    const restart = !d || d.status === 'unsubscribed';
    tx.set(
      ref,
      {
        email,
        status: 'pending' satisfies SubscriberStatus,
        active: false,
        locale,
        source,
        confirmNonce: nonce,
        lastConfirmationSentAt: Timestamp.fromMillis(now),
        confirmationsSent: restart ? 1 : FieldValue.increment(1),
        // What the person asked for, when, and under which privacy notice.
        consent: { requestedAt: Timestamp.fromMillis(now), source, policyVersion: PRIVACY_VERSION },
        ...(restart ? { subscribedAt: Timestamp.fromMillis(now), unsubscribedAt: FieldValue.delete() } : {}),
      },
      { merge: true },
    );
    return true;
  });
  if (!send) return null;

  const confirmToken = signLink({ a: 'confirm', s: id, n: nonce, x: now + LIMITS.confirmLinkDays * 86400e3 });
  return { id, email, locale, confirmToken };
}

/** Confirms a sign-up from its link. Returns the new subscriber, or null if the link no longer works. */
export async function confirmSignup(token: string): Promise<{ id: string; email: string; alreadyActive: boolean } | null> {
  const link = readLink(token, 'confirm');
  if (!link) return null;
  const db = adminDb();
  const ref = db.collection(SUBSCRIBERS).doc(link.s);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const d = snap.data()!;
    if (d.status === 'active') return { id: ref.id, email: d.email as string, alreadyActive: true };
    // Only the latest confirmation email works.
    if (d.status !== 'pending' || d.confirmNonce !== link.n) return null;
    const now = Timestamp.now();
    tx.update(ref, {
      status: 'active' satisfies SubscriberStatus,
      active: true,
      confirmedAt: now,
      'consent.confirmedAt': now,
      confirmNonce: FieldValue.delete(),
    });
    return { id: ref.id, email: d.email as string, alreadyActive: false };
  });
}

/** Unsubscribes from a link. True if the address is (now) unsubscribed. */
export async function unsubscribe(token: string): Promise<boolean> {
  const link = readLink(token, 'unsubscribe');
  if (!link) return false;
  const ref = adminDb().collection(SUBSCRIBERS).doc(link.s);
  const snap = await ref.get();
  if (!snap.exists) return true;
  if (snap.data()!.status !== 'unsubscribed') {
    await ref.update({ status: 'unsubscribed' satisfies SubscriberStatus, active: false, unsubscribedAt: Timestamp.now(), confirmNonce: FieldValue.delete() });
  }
  return true;
}

/**
 * Housekeeping, run after sign-ups: deletes sign-ups never confirmed within
 * pendingTtlDays and rate-limit counters older than a day. Small batches;
 * single-field queries, so no composite index is needed.
 */
export async function cleanUp(): Promise<void> {
  const db = adminDb();
  const cutoff = Date.now() - LIMITS.pendingTtlDays * 86400e3;
  const pending = await db.collection(SUBSCRIBERS).where('status', '==', 'pending').limit(200).get();
  const stale = pending.docs.filter((d) => ((d.data().subscribedAt as Timestamp | undefined)?.toMillis() ?? 0) < cutoff);
  const expired = await db.collection(RATE_LIMITS).where('expiresAt', '<', Timestamp.now()).limit(200).get();
  const batch = db.batch();
  for (const d of [...stale, ...expired.docs]) batch.delete(d.ref);
  if (stale.length || expired.size) await batch.commit();
}
