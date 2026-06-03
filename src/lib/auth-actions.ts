'use server';

import { Timestamp } from 'firebase/firestore';
import { createSession, deleteSession, requireRole, requireUser, type SessionRole } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/firebase-token';
import {
  getUserProfile,
  upsertUserProfile,
  setUserRole,
  listUsers,
  type UserProfile,
  type UserRole,
} from '@/lib/firestore-data';
import { sendTransactionalEmails, normalizeLocale } from '@/lib/email/send';

/**
 * Emails that are always granted the admin role on sign-in. Acts as the
 * bootstrap so the first/owner accounts are admins without manual promotion.
 */
function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS ?? '';
  const fallback = 'studiofarajhussein@gmail.com,info@studiofaraj.it,husseinfaraj101@gmail.com';
  return (fromEnv || fallback)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export interface EstablishSessionResult {
  ok: boolean;
  role?: SessionRole;
  error?: string;
}

/**
 * Exchanges a verified Firebase ID token for a role-bearing session cookie.
 * Called by the client right after Firebase sign-in (email/password or OAuth).
 *
 * Role resolution:
 *  - bootstrap admin emails are always 'admin'
 *  - otherwise keep an existing profile's role (preserves manual promotions)
 *  - brand-new accounts default to 'client'
 */
export async function establishSession(idToken: string): Promise<EstablishSessionResult> {
  try {
    const fbUser = await verifyFirebaseIdToken(idToken);
    const existing = await getUserProfile(fbUser.uid);
    const isBootstrapAdmin = getAdminEmails().includes(fbUser.email);

    const role: UserRole = isBootstrapAdmin
      ? 'admin'
      : existing?.role ?? 'client';

    await upsertUserProfile(fbUser.uid, {
      email: fbUser.email,
      displayName: fbUser.name ?? existing?.displayName,
      photoURL: fbUser.picture ?? existing?.photoURL,
      role,
      lastLoginAt: Timestamp.now(),
    });

    await createSession(
      fbUser.uid,
      fbUser.name || fbUser.email,
      role,
      fbUser.email
    );

    // First-time signup → welcome email fan-out (client + admin alert).
    // Fire-and-forget: never block the session creation on email delivery.
    // No `existing.locale` yet for a brand-new user — default to Italian.
    if (!existing && role !== 'admin') {
      const clientName = fbUser.name || fbUser.email;
      sendTransactionalEmails({
        scenario: 'welcome',
        locale: normalizeLocale('it'),
        client: { name: clientName, email: fbUser.email },
        adminFields: [
          { label: 'Email', value: fbUser.email },
          ...(fbUser.name ? [{ label: 'Nome', value: fbUser.name }] : []),
        ],
      }).catch((err) =>
        console.warn('[auth-actions] welcome email failed (non-fatal):', err)
      );
    }

    return { ok: true, role };
  } catch (error) {
    console.error('[auth-actions] establishSession failed:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to establish session',
    };
  }
}

export async function signOutAction(): Promise<void> {
  await deleteSession();
}

/** Admin-only: change a user's role. */
export async function setUserRoleAction(uid: string, role: UserRole): Promise<void> {
  await requireRole('admin');
  await setUserRole(uid, role);
}

/** Convert Firestore Timestamps to ISO strings for client serialization. */
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

/** Admin-only: list users (optionally filtered by role). */
export async function listUsersAction(role?: UserRole): Promise<UserProfile[]> {
  await requireRole('admin');
  const users = await listUsers(role ? { role } : undefined);
  return users.map(serialize);
}

/** Admin-only: fetch a single user's profile (e.g. for billing on invoices). */
export async function adminGetUserProfileAction(uid: string): Promise<UserProfile | null> {
  await requireRole('admin');
  const profile = await getUserProfile(uid);
  return profile ? serialize(profile) : null;
}

/**
 * Admin-only: full detail snapshot for the client detail page.
 * Returns user profile + their company profiles + Stripe invoices (if customer exists).
 */
export interface AdminClientDetail {
  user: UserProfile | null;
  companyProfiles: any[]; // CompanyProfileDoc[] — kept as any to avoid circular import
  invoices: Array<{
    id: string;
    number?: string;
    created: number;
    amountPaid: number;
    currency: string;
    status: string;
    hostedInvoiceUrl?: string;
    invoicePdfUrl?: string;
  }>;
}

export async function adminGetClientDetailAction(uid: string): Promise<AdminClientDetail> {
  await requireRole('admin');
  const { getCompanyProfilesByOwner } = await import('@/lib/firestore-data');
  const { getStripe, isStripeConfigured } = await import('@/lib/stripe');

  const userProfile = await getUserProfile(uid);
  const companyProfiles = await getCompanyProfilesByOwner(uid);

  let invoices: AdminClientDetail['invoices'] = [];
  if (userProfile?.stripeCustomerId && isStripeConfigured()) {
    try {
      const list = await getStripe().invoices.list({
        customer: userProfile.stripeCustomerId,
        limit: 20,
      });
      invoices = list.data.map((inv) => ({
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
      console.warn('[auth-actions] failed to fetch invoices for', uid, err);
    }
  }

  return {
    user: userProfile ? serialize(userProfile) : null,
    companyProfiles: companyProfiles.map(serialize),
    invoices,
  };
}

// ── Client profile / billing details ──────────────────────────────────────────

export interface MyProfileInput {
  displayName?: string;
  phone?: string;
  company?: string;
  vatNumber?: string;
  taxCode?: string;
  addressLine?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  sdiPec?: string;
  locale?: string;
}

export async function getMyProfileAction(): Promise<UserProfile | null> {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);
  return profile ? serialize(profile) : null;
}

export async function updateMyProfileAction(
  input: MyProfileInput
): Promise<{ success: boolean; error?: string }> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Not authenticated.' };
  }

  const clean = (v?: string) => (typeof v === 'string' ? v.trim() : undefined);
  const data = {
    displayName: clean(input.displayName),
    phone: clean(input.phone),
    company: clean(input.company),
    vatNumber: clean(input.vatNumber),
    taxCode: clean(input.taxCode),
    addressLine: clean(input.addressLine),
    city: clean(input.city),
    province: clean(input.province),
    zip: clean(input.zip),
    country: clean(input.country),
    sdiPec: clean(input.sdiPec),
    locale: input.locale === 'en' ? 'en' : input.locale === 'it' ? 'it' : undefined,
  };

  try {
    await upsertUserProfile(user.id, data);
    return { success: true };
  } catch (error) {
    console.error('[auth-actions] updateMyProfile failed:', error);
    return { success: false, error: 'Failed to save profile.' };
  }
}
