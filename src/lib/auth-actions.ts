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
