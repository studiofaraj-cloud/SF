
import "server-only";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  runTransaction,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { initializeServerSideFirebase } from '@/firebase/server-init';

// Initialize server-side Firebase and get Firestore instance
const { firestore } = initializeServerSideFirebase();
export const db = firestore;

export interface ImageMetadata {
  url: string;
  storagePath: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'code' | 'quote' | 'heading';
  content: string;
  metadata?: {
    language?: string;
    level?: number;
    alt?: string;
    caption?: string;
    [key: string]: any;
  };
}

export interface Blog {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  published: boolean;
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
  category?: string;
  clientName?: string;
  metrics?: Array<{ label: string; value: string }>;
  highlights?: string[];
  year?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  published: boolean;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  service?: string;
  budget?: string;
  source?: 'contact-form' | 'quote-dialog';
  createdAt: Timestamp;
  read: boolean;
}

export interface Subscriber {
  id?: string;
  email: string;
  subscribedAt: Timestamp;
  active: boolean;
}

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  selectedDate: Timestamp;
  selectedTime?: string | string[];
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  source?: string;
}

const COLLECTIONS = {
  BLOGS: 'blogs',
  PROJECTS: 'projects',
  MESSAGES: 'messages',
  SUBSCRIBERS: 'subscribers',
  BOOKINGS: 'bookings',
  SETTINGS: 'settings',
  REVIEWS: 'reviews',
  USERS: 'users',
  SERVICE_REQUESTS: 'serviceRequests',
  REQUEST_MESSAGES: 'requestMessages',
  REQUEST_FILES: 'requestFiles',
  QUOTES: 'quotes',
  QUOTE_PAYMENTS: 'quotePayments',
  CONVERSATIONS: 'conversations',
  CONVERSATION_MESSAGES: 'conversationMessages',
  CLIENT_FILES: 'clientFiles',
  SLUGS: 'slugs',
  COMPANY_PROFILES: 'companyProfiles',
} as const;

export const SLUG_INDEX_DOC = '_index';

/** Firestore rejects `undefined` field values; drop them before writing. */
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

/**
 * Recursive strip — required for nested objects (e.g. CompanyProfileDoc.contact)
 * because Firestore rejects undefined values at ANY depth.
 * Arrays are preserved as-is; null is preserved.
 */
function deepStripUndefined<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((v) => deepStripUndefined(v)) as unknown as T;
  }
  if (typeof value === 'object' && !((value as any) instanceof Timestamp)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v === undefined) continue;
      out[k] = deepStripUndefined(v);
    }
    return out as T;
  }
  return value;
}

// ─── Users / Roles ──────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'client';

export interface UserProfile {
  id?: string; // Firebase Auth UID (document id)
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  company?: string;
  phone?: string;
  country?: string;
  locale?: string;
  // Billing details (optional — for company-addressed invoices/fatture)
  vatNumber?: string; // P.IVA
  taxCode?: string; // Codice Fiscale
  addressLine?: string;
  city?: string;
  province?: string;
  zip?: string;
  sdiPec?: string; // Codice SDI o PEC (e-invoicing)
  stripeCustomerId?: string;
  disabled?: boolean;
  createdBy?: string; // uid of admin who created the account, if any
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;

  // Note: company profiles for the public /{slug} pages live in their own
  // collection (COMPANY_PROFILES) and reference users by ownerUid. A user can
  // own multiple profiles (admins manage many; clients normally own one).
}

export interface CompanyProfileService {
  title: string;
  description?: string;
  icon?: string;
}

export interface CompanyProfileStat {
  label: string;
  value: string;
}

export interface CompanyProfilePoint {
  title: string;
  description?: string;
}

export interface CompanyProfileContact {
  email?: string;
  phone?: string;
  website?: string;
  addressLine?: string;
  city?: string;
  country?: string;
}

export interface CompanyProfileSocial {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
}

export type TaxIdType = 'EU_VAT' | 'IT_PIVA' | 'OTHER';

export interface CompanyProfileTaxId {
  country: string; // ISO 3166-1 alpha-2
  value: string;
  type: TaxIdType;
  verified: boolean;
  verifiedAt?: Timestamp;
}

/**
 * Display-only subset of a CompanyProfileDoc (everything the public landing
 * page needs). Used as a partial input shape for updates.
 */
export interface CompanyProfileDisplay {
  companyName?: string;
  tagline?: string;
  description?: string; // max 1400 chars (enforced in Zod)
  logoUrl?: string;
  heroUrl?: string;
  services?: CompanyProfileService[];
  stats?: CompanyProfileStat[];
  pointsOfStrength?: CompanyProfilePoint[]; // max 3 (enforced in Zod)
  contact?: CompanyProfileContact;
  social?: CompanyProfileSocial;
  taxId?: CompanyProfileTaxId;
  taxIdPublic?: boolean;
  numberOfEmployees?: number;
}

/**
 * Top-level document in the `companyProfiles` collection. One user (the
 * `ownerUid`) may own many profile docs. Clients normally own one (gated by
 * Stripe). Admins may own many (each with `adminManaged: true`, auto-published,
 * no Stripe subscription required).
 */
export interface CompanyProfileDoc extends CompanyProfileDisplay {
  id?: string; // Firestore doc id
  ownerUid: string; // The user who can edit this profile
  slug: string; // Public URL slug (matches /slugs/{slug} sentinel)
  companyName: string; // Required — also the public h1
  taxIdPublic: boolean; // Required (defaults to true in Zod)

  isPublished: boolean;
  publishedAt?: Timestamp;
  adminManaged: boolean; // True → no Stripe gating, owner is staff

  subscription?: SubscriptionState; // Only meaningful when !adminManaged
  consent?: ConsentRecord; // Captured when the owner agrees to ToS
  invoicing?: InvoicingInfo; // E-invoicing routing (SDI / PEC)

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConsentRecord {
  tosVersion: string;
  tosAcceptedAt: Timestamp;
  tosIp?: string;
  marketingConsent: boolean;
  marketingConsentAt?: Timestamp;
  marketingIp?: string;
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

export interface SubscriptionState {
  stripeSubscriptionId?: string;
  stripePriceId?: string;          // Which Stripe price the subscription uses
  billingCycle?: 'monthly' | 'annual'; // Derived from the price (for UI)
  status?: SubscriptionStatus;
  currentPeriodEnd?: Timestamp;
  trialEndsAt?: Timestamp;
  canceledAt?: Timestamp;
  lastEventId?: string; // Idempotency guard for Stripe webhooks
  disputed?: boolean;   // Chargeback open — page kept offline until resolved
}

/**
 * E-invoicing fields collected per profile so Studio Faraj can emit fatture
 * elettroniche correctly. Both optional — if empty, fattura defaults to SDI
 * universal code `0000000` (lands in the recipient's Agenzia Entrate area).
 */
export interface InvoicingInfo {
  sdiCode?: string;  // Codice destinatario SDI (7-char alphanumeric)
  pecEmail?: string; // PEC for fattura delivery
}

// ─── Slug sentinel (uniqueness via dedicated /slugs/{slug} doc) ────────────

export interface SlugRecord {
  profileId: string;
  ownerUid: string;
  createdAt: Timestamp;
}

/** Single doc at /slugs/_index that mirrors the set of currently-claimed slugs. */
export interface SlugIndex {
  slugs: string[];
  updatedAt: Timestamp;
}

/** Fetch a user profile by Firebase UID (the document id). */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as UserProfile;
  } catch (error) {
    console.error(`Error fetching user profile ${uid}:`, error);
    return null;
  }
}

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const ref = collection(db, COLLECTIONS.USERS);
    const q = query(ref, where('email', '==', email.toLowerCase().trim()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as UserProfile;
  } catch (error) {
    console.error(`Error fetching user profile by email ${email}:`, error);
    return null;
  }
}

/**
 * Create the profile if missing, otherwise merge the provided fields.
 * The document id is always the Firebase UID so lookups are O(1).
 */
export async function upsertUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'id' | 'uid' | 'createdAt'>>
): Promise<UserProfile> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  const existing = await getDoc(ref);
  const now = Timestamp.now();

  if (!existing.exists()) {
    const profile = stripUndefined({
      uid,
      email: (data.email ?? '').toLowerCase().trim(),
      role: (data.role ?? 'client') as UserRole,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    await setDoc(ref, profile);
    return { id: uid, ...profile } as UserProfile;
  }

  const update = stripUndefined({ ...data, updatedAt: now });
  if (update.email) update.email = update.email.toLowerCase().trim();
  await updateDoc(ref, update);
  return { id: uid, ...existing.data(), ...update } as UserProfile;
}

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role,
    updatedAt: Timestamp.now(),
  });
}

export async function listUsers(filters?: { role?: UserRole }): Promise<UserProfile[]> {
  try {
    const ref = collection(db, COLLECTIONS.USERS);
    const constraints: QueryConstraint[] = [];
    if (filters?.role) constraints.push(where('role', '==', filters.role));
    const snap = await getDocs(query(ref, ...constraints));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
    // Sort newest-first in memory to avoid a composite index requirement.
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}

/** Lookup used by Stripe webhooks to map a Customer ID back to a user. */
export async function getUserProfileByStripeCustomerId(
  customerId: string
): Promise<UserProfile | null> {
  try {
    const ref = collection(db, COLLECTIONS.USERS);
    const q = query(ref, where('stripeCustomerId', '==', customerId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as UserProfile;
  } catch (error) {
    console.error(`Error fetching user by stripe customer ${customerId}:`, error);
    return null;
  }
}

// ─── Company Profile + Slug Management ────────────────────────────────────

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" is already taken`);
    this.name = 'SlugTakenError';
  }
}

/**
 * Atomically claim a slug for the given profile. If the profile already holds
 * a different slug, releases the old one in the same transaction. Throws
 * SlugTakenError if another profile owns the requested slug.
 */
export async function claimSlugForProfile(
  profileId: string,
  ownerUid: string,
  newSlug: string
): Promise<void> {
  const profileRef = doc(db, COLLECTIONS.COMPANY_PROFILES, profileId);
  const newSlugRef = doc(db, COLLECTIONS.SLUGS, newSlug);

  await runTransaction(db, async (tx) => {
    const profileSnap = await tx.get(profileRef);
    if (!profileSnap.exists()) throw new Error('Profile not found');
    const currentSlug: string | undefined = profileSnap.data()?.slug;

    if (currentSlug === newSlug) return; // No-op

    const newSlugSnap = await tx.get(newSlugRef);
    if (newSlugSnap.exists() && newSlugSnap.data()?.profileId !== profileId) {
      throw new SlugTakenError(newSlug);
    }

    tx.set(newSlugRef, {
      profileId,
      ownerUid,
      createdAt: Timestamp.now(),
    } satisfies SlugRecord);

    if (currentSlug && currentSlug !== newSlug) {
      const oldRef = doc(db, COLLECTIONS.SLUGS, currentSlug);
      const oldSnap = await tx.get(oldRef);
      if (oldSnap.exists() && oldSnap.data()?.profileId === profileId) {
        tx.delete(oldRef);
      }
    }

    tx.update(profileRef, { slug: newSlug, updatedAt: Timestamp.now() });
  });

  refreshSlugIndex().catch((err) =>
    console.warn('[firestore-data] refreshSlugIndex failed:', err)
  );
}

/** Release a slug from /slugs/{slug} and clear the field on the profile. */
export async function releaseSlugForProfile(profileId: string): Promise<void> {
  const profileRef = doc(db, COLLECTIONS.COMPANY_PROFILES, profileId);
  await runTransaction(db, async (tx) => {
    const profileSnap = await tx.get(profileRef);
    if (!profileSnap.exists()) return;
    const currentSlug: string | undefined = profileSnap.data()?.slug;
    if (!currentSlug) return;
    const slugRef = doc(db, COLLECTIONS.SLUGS, currentSlug);
    const slugSnap = await tx.get(slugRef);
    if (slugSnap.exists() && slugSnap.data()?.profileId === profileId) {
      tx.delete(slugRef);
    }
    tx.update(profileRef, { slug: null, updatedAt: Timestamp.now() });
  });
  refreshSlugIndex().catch(() => {});
}

/** Resolve a slug to its profile id (used by the public /{slug} route). */
export async function getProfileIdBySlug(slug: string): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SLUGS, slug));
    if (!snap.exists()) return null;
    return (snap.data() as SlugRecord).profileId;
  } catch (error) {
    console.error(`Error resolving slug ${slug}:`, error);
    return null;
  }
}

/**
 * Walk /slugs and rebuild /slugs/_index. Called after any slug claim/release.
 * Safe to call concurrently — last writer wins on the index doc.
 */
export async function refreshSlugIndex(): Promise<void> {
  const snap = await getDocs(collection(db, COLLECTIONS.SLUGS));
  const slugs = snap.docs
    .map((d) => d.id)
    .filter((id) => id !== SLUG_INDEX_DOC);
  await setDoc(doc(db, COLLECTIONS.SLUGS, SLUG_INDEX_DOC), {
    slugs,
    updatedAt: Timestamp.now(),
  } satisfies SlugIndex);
}

export async function getSlugIndex(): Promise<SlugIndex | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SLUGS, SLUG_INDEX_DOC));
    if (!snap.exists()) return null;
    return snap.data() as SlugIndex;
  } catch (error) {
    console.error('Error fetching slug index:', error);
    return null;
  }
}

export interface PublishedCompanyProfileRef {
  slug: string;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

/** Sitemap helper — published company profiles with their last update times. */
export async function getPublishedCompanyProfiles(): Promise<PublishedCompanyProfileRef[]> {
  try {
    const ref = collection(db, COLLECTIONS.COMPANY_PROFILES);
    const snap = await getDocs(query(ref, where('isPublished', '==', true)));
    const out: PublishedCompanyProfileRef[] = [];
    for (const d of snap.docs) {
      const data = d.data() as CompanyProfileDoc;
      if (!data.slug) continue;
      out.push({
        slug: data.slug,
        updatedAt: data.updatedAt,
        publishedAt: data.publishedAt,
      });
    }
    return out;
  } catch (error) {
    console.error('Error listing published company profiles:', error);
    return [];
  }
}

// ─── CRUD on the companyProfiles collection ────────────────────────────

export async function createCompanyProfileDoc(
  data: Omit<CompanyProfileDoc, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();
  const payload = deepStripUndefined({ ...data, createdAt: now, updatedAt: now });
  const ref = await addDoc(collection(db, COLLECTIONS.COMPANY_PROFILES), payload);
  return ref.id;
}

export async function getCompanyProfileById(
  id: string
): Promise<CompanyProfileDoc | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.COMPANY_PROFILES, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as CompanyProfileDoc;
  } catch (error) {
    console.error(`Error fetching company profile ${id}:`, error);
    return null;
  }
}

export async function getCompanyProfileBySlug(
  slug: string
): Promise<CompanyProfileDoc | null> {
  const id = await getProfileIdBySlug(slug);
  if (!id) return null;
  return getCompanyProfileById(id);
}

export async function getCompanyProfilesByOwner(
  ownerUid: string
): Promise<CompanyProfileDoc[]> {
  try {
    const ref = collection(db, COLLECTIONS.COMPANY_PROFILES);
    const snap = await getDocs(query(ref, where('ownerUid', '==', ownerUid)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CompanyProfileDoc));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error listing company profiles for owner ${ownerUid}:`, error);
    return [];
  }
}

export async function listAllCompanyProfiles(): Promise<CompanyProfileDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.COMPANY_PROFILES));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CompanyProfileDoc));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error('Error listing all company profiles:', error);
    return [];
  }
}

export async function updateCompanyProfileDoc(
  id: string,
  patch: Partial<Omit<CompanyProfileDoc, 'id' | 'ownerUid' | 'createdAt'>>
): Promise<void> {
  const updates = deepStripUndefined({ ...patch, updatedAt: Timestamp.now() });
  await updateDoc(doc(db, COLLECTIONS.COMPANY_PROFILES, id), updates);
}

export async function deleteCompanyProfileDoc(id: string): Promise<void> {
  // Release the slug first to keep /slugs in sync.
  await releaseSlugForProfile(id);
  await deleteDoc(doc(db, COLLECTIONS.COMPANY_PROFILES, id));
}

/** Webhook fallback: find a profile by its stored Stripe subscription id. */
export async function getCompanyProfileBySubscriptionId(
  subscriptionId: string
): Promise<CompanyProfileDoc | null> {
  try {
    const ref = collection(db, COLLECTIONS.COMPANY_PROFILES);
    const snap = await getDocs(
      query(ref, where('subscription.stripeSubscriptionId', '==', subscriptionId), limit(1))
    );
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as CompanyProfileDoc;
  } catch (error) {
    console.error(`Error finding profile by sub ${subscriptionId}:`, error);
    return null;
  }
}

/**
 * Update embedded subscription state on a profile, optionally toggling
 * isPublished. Used by the Stripe webhook to react to subscription lifecycle.
 */
export async function updateProfileSubscriptionState(
  profileId: string,
  patch: Partial<SubscriptionState>,
  publishOverride?: boolean
): Promise<void> {
  const updates: Record<string, any> = { updatedAt: Timestamp.now() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) updates[`subscription.${k}`] = v;
  }
  if (publishOverride !== undefined) {
    updates['isPublished'] = publishOverride;
    if (publishOverride) {
      updates['publishedAt'] = Timestamp.now();
    }
  }
  await updateDoc(doc(db, COLLECTIONS.COMPANY_PROFILES, profileId), updates);
}

/** Persist the consent record on a profile. */
export async function saveProfileConsentRecord(
  profileId: string,
  consent: ConsentRecord
): Promise<void> {
  // deepStripUndefined: ConsentRecord has optional fields (tosIp,
  // marketingConsentAt, marketingIp) that may be undefined — Firestore rejects
  // nested undefined values, so strip them recursively before write.
  const payload = deepStripUndefined({
    consent,
    updatedAt: Timestamp.now(),
  });
  await updateDoc(doc(db, COLLECTIONS.COMPANY_PROFILES, profileId), payload);
}

/** Persist a stripeCustomerId on the user (created on first subscription). */
export async function setStripeCustomerId(uid: string, customerId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    stripeCustomerId: customerId,
    updatedAt: Timestamp.now(),
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewDocument {
  id?: string;
  authorDisplayName: string;
  authorPhotoUri: string;
  authorUri: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string; // ISO 8601 — used for sorting
  source: 'google' | 'manual';
  visible: boolean;
  createdAt: Timestamp;
}

export async function getReviews(onlyVisible = false): Promise<ReviewDocument[]> {
  try {
    const ref = collection(db, COLLECTIONS.REVIEWS);
    // Use only a single-field filter to avoid needing a composite Firestore index.
    // Sorting is done in memory so no (visible + publishTime) composite index is required.
    const snap = await getDocs(
      onlyVisible ? query(ref, where('visible', '==', true)) : query(ref)
    );
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReviewDocument));
    // Sort newest-first in memory
    return docs.sort((a, b) =>
      new Date(b.publishTime || 0).getTime() - new Date(a.publishTime || 0).getTime()
    );
  } catch (err) {
    console.error('Error fetching reviews from Firestore:', err);
    return [];
  }
}

export async function upsertReview(review: Omit<ReviewDocument, 'id' | 'createdAt'>): Promise<string> {
  // Deduplicate by (authorDisplayName + publishTime)
  const ref = collection(db, COLLECTIONS.REVIEWS);
  const existing = await getDocs(
    query(ref,
      where('authorDisplayName', '==', review.authorDisplayName),
      where('publishTime', '==', review.publishTime)
    )
  );
  if (!existing.empty) {
    const docRef = existing.docs[0].ref;
    await updateDoc(docRef, { ...review });
    return existing.docs[0].id;
  }
  const newDoc = await addDoc(ref, {
    ...review,
    createdAt: Timestamp.now(),
  });
  return newDoc.id;
}

export async function addReview(review: Omit<ReviewDocument, 'id' | 'createdAt'>): Promise<string> {
  const ref = collection(db, COLLECTIONS.REVIEWS);
  const newDoc = await addDoc(ref, { ...review, createdAt: Timestamp.now() });
  return newDoc.id;
}

export async function updateReview(id: string, data: Partial<ReviewDocument>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.REVIEWS, id), data);
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.REVIEWS, id));
}

// ─── Hero Slides ───────────────────────────────────────────────────────────────

export interface HeroSlideData {
  id: string;
  title: string;
  description: string;
  titleEn?: string;
  descriptionEn?: string;
  imageUrl: string;
  imageHint: string;
  order: number;
}

const HERO_SLIDES_DOC = 'heroSlides';

export async function getHeroSlides(): Promise<HeroSlideData[]> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, HERO_SLIDES_DOC);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    const data = docSnap.data();
    const slides: HeroSlideData[] = data.slides || [];
    return slides.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
}

export async function saveHeroSlides(slides: HeroSlideData[]): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, HERO_SLIDES_DOC);
    // setDoc with merge:true creates the document if it doesn't exist, or updates it
    await setDoc(docRef, { slides }, { merge: true });
  } catch (error) {
    console.error('Error saving hero slides:', error);
    throw new Error(`Failed to save hero slides: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogs(filters?: {
  published?: boolean;
  limitCount?: number;
}): Promise<Blog[]> {
  try {
    const blogsRef = collection(db, COLLECTIONS.BLOGS);
    const constraints: QueryConstraint[] = [];

    if (filters?.published !== undefined) {
      constraints.push(where('published', '==', filters.published));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(blogsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Blog[];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error(`Failed to fetch blogs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, id);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      return null;
    }

    return {
      id: blogSnap.id,
      ...blogSnap.data(),
    } as Blog;
  } catch (error) {
    console.error(`Error fetching blog with id ${id}:`, error);
    throw new Error(`Failed to fetch blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    // Validate slug before querying Firestore
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.warn('getBlogBySlug: Invalid slug provided', slug);
      return null;
    }

    const blogsRef = collection(db, COLLECTIONS.BLOGS);
    const q = query(blogsRef, where('slug', '==', slug.trim()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Blog;
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    throw new Error(`Failed to fetch blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBlogData(blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const blogsRef = collection(db, COLLECTIONS.BLOGS);
    const now = Timestamp.now();

    const newBlog = {
      ...blogData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(blogsRef, newBlog);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error(`Failed to create blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBlogData(id: string, blogData: Partial<Omit<Blog, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, id);
    
    const updateData = {
      ...blogData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(blogRef, updateData);
  } catch (error) {
    console.error(`Error updating blog with id ${id}:`, error);
    throw new Error(`Failed to update blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBlogData(id: string): Promise<void> {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, id);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error(`Error deleting blog with id ${id}:`, error);
    throw new Error(`Failed to delete blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjects(filters?: {
  limitCount?: number;
}): Promise<Project[]> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const constraints: QueryConstraint[] = [];

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(projectsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return null;
    }

    return {
      id: projectSnap.id,
      ...projectSnap.data(),
    } as Project;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    throw new Error(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    // Validate slug before querying Firestore
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.warn('getProjectBySlug: Invalid slug provided', slug);
      return null;
    }

    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where('slug', '==', slug.trim()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Project;
  } catch (error) {
    console.error(`Error fetching project with slug ${slug}:`, error);
    throw new Error(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createProjectData(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const now = Timestamp.now();

    const newProject = {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateProjectData(id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    
    const updateData = {
      ...projectData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(projectRef, updateData);
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteProjectData(id: string): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMessages(filters?: {
  read?: boolean;
  source?: 'contact-form' | 'quote-dialog';
  limitCount?: number;
}): Promise<Message[]> {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const constraints: QueryConstraint[] = [];

    if (filters?.read !== undefined) {
      constraints.push(where('read', '==', filters.read));
    }

    if (filters?.source) {
      constraints.push(where('source', '==', filters.source));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(messagesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMessageById(id: string): Promise<Message | null> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      return null;
    }

    return {
      id: messageSnap.id,
      ...messageSnap.data(),
    } as Message;
  } catch (error) {
    console.error(`Error fetching message with id ${id}:`, error);
    throw new Error(`Failed to fetch message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createMessageData(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);

    const newMessage = {
      ...messageData,
      createdAt: Timestamp.now(),
      read: messageData.read ?? false,
    };

    const docRef = await addDoc(messagesRef, newMessage);
    return docRef.id;
  } catch (error) {
    console.error('Error creating message:', error);
    throw new Error(`Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateMessageData(id: string, messageData: Partial<Omit<Message, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await updateDoc(messageRef, messageData);
  } catch (error) {
    console.error(`Error updating message with id ${id}:`, error);
    throw new Error(`Failed to update message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteMessageData(id: string): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error(`Error deleting message with id ${id}:`, error);
    throw new Error(`Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function markMessageAsRead(id: string): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await updateDoc(messageRef, { read: true });
  } catch (error) {
    console.error(`Error marking message as read with id ${id}:`, error);
    throw new Error(`Failed to mark message as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function markMessageAsUnread(id: string): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await updateDoc(messageRef, { read: false });
  } catch (error) {
    console.error(`Error marking message as unread with id ${id}:`, error);
    throw new Error(`Failed to mark message as unread: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMessagesBySource(source: 'contact-form' | 'quote-dialog'): Promise<Message[]> {
  return getMessages({ source });
}

export async function getSubscribers(filters?: {
  active?: boolean;
  limitCount?: number;
}): Promise<Subscriber[]> {
  try {
    const subscribersRef = collection(db, COLLECTIONS.SUBSCRIBERS);
    const constraints: QueryConstraint[] = [];

    if (filters?.active !== undefined) {
      constraints.push(where('active', '==', filters.active));
    }

    constraints.push(orderBy('subscribedAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(subscribersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscriber[];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw new Error(`Failed to fetch subscribers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubscriberById(id: string): Promise<Subscriber | null> {
  try {
    const subscriberRef = doc(db, COLLECTIONS.SUBSCRIBERS, id);
    const subscriberSnap = await getDoc(subscriberRef);

    if (!subscriberSnap.exists()) {
      return null;
    }

    return {
      id: subscriberSnap.id,
      ...subscriberSnap.data(),
    } as Subscriber;
  } catch (error) {
    console.error(`Error fetching subscriber with id ${id}:`, error);
    throw new Error(`Failed to fetch subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  try {
    const subscribersRef = collection(db, COLLECTIONS.SUBSCRIBERS);
    const q = query(subscribersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Subscriber;
  } catch (error) {
    console.error(`Error fetching subscriber with email ${email}:`, error);
    throw new Error(`Failed to fetch subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createSubscriberData(subscriberData: Omit<Subscriber, 'id' | 'subscribedAt'>): Promise<string> {
  try {
    const subscribersRef = collection(db, COLLECTIONS.SUBSCRIBERS);

    const newSubscriber = {
      ...subscriberData,
      subscribedAt: Timestamp.now(),
      active: subscriberData.active ?? true,
    };

    const docRef = await addDoc(subscribersRef, newSubscriber);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscriber:', error);
    throw new Error(`Failed to create subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateSubscriberData(id: string, subscriberData: Partial<Omit<Subscriber, 'id' | 'subscribedAt'>>): Promise<void> {
  try {
    const subscriberRef = doc(db, COLLECTIONS.SUBSCRIBERS, id);
    await updateDoc(subscriberRef, subscriberData);
  } catch (error) {
    console.error(`Error updating subscriber with id ${id}:`, error);
    throw new Error(`Failed to update subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteSubscriberData(id: string): Promise<void> {
  try {
    const subscriberRef = doc(db, COLLECTIONS.SUBSCRIBERS, id);
    await deleteDoc(subscriberRef);
  } catch (error) {
    console.error(`Error deleting subscriber with id ${id}:`, error);
    throw new Error(`Failed to delete subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Booking Functions
export async function getBookings(filters?: {
  status?: 'pending' | 'confirmed' | 'cancelled';
  limitCount?: number;
}): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('selectedDate', 'asc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(bookingsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, id);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return null;
    }

    return {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;
  } catch (error) {
    console.error(`Error fetching booking with id ${id}:`, error);
    throw new Error(`Failed to fetch booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBookingData(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<string> {
  try {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);

    const newBooking = {
      ...bookingData,
      createdAt: Timestamp.now(),
      status: bookingData.status ?? 'pending',
    };

    const docRef = await addDoc(bookingsRef, newBooking);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBookingData(id: string, bookingData: Partial<Omit<Booking, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, id);
    await updateDoc(bookingRef, bookingData);
  } catch (error) {
    console.error(`Error updating booking with id ${id}:`, error);
    throw new Error(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBookingData(id: string): Promise<void> {
  try {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, id);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error(`Error deleting booking with id ${id}:`, error);
    throw new Error(`Failed to delete booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ─── Service Requests ───────────────────────────────────────────────────────

export type ServiceRequestStatus =
  | 'new'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export interface ServiceRequest {
  id?: string;
  clientId: string; // Firebase UID of the requesting client
  clientName?: string;
  clientEmail?: string;
  type: string; // service type, e.g. 'sviluppo-web'
  title: string;
  brief: string;
  budget?: string;
  status: ServiceRequestStatus;
  assignedTo?: string;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createServiceRequest(
  data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: ServiceRequestStatus;
  }
): Promise<string> {
  const ref = collection(db, COLLECTIONS.SERVICE_REQUESTS);
  const now = Timestamp.now();
  const docRef = await addDoc(ref, stripUndefined({
    ...data,
    status: data.status ?? 'new',
    createdAt: now,
    updatedAt: now,
  }));
  return docRef.id;
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SERVICE_REQUESTS, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ServiceRequest;
  } catch (error) {
    console.error(`Error fetching service request ${id}:`, error);
    return null;
  }
}

export async function getServiceRequestsByClient(clientId: string): Promise<ServiceRequest[]> {
  try {
    const ref = collection(db, COLLECTIONS.SERVICE_REQUESTS);
    // Single-field filter + in-memory sort avoids a composite index requirement.
    const snap = await getDocs(query(ref, where('clientId', '==', clientId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceRequest));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching service requests for client ${clientId}:`, error);
    return [];
  }
}

export async function listServiceRequests(filters?: {
  status?: ServiceRequestStatus;
}): Promise<ServiceRequest[]> {
  try {
    const ref = collection(db, COLLECTIONS.SERVICE_REQUESTS);
    const constraints: QueryConstraint[] = [];
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    const snap = await getDocs(query(ref, ...constraints));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceRequest));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error('Error listing service requests:', error);
    return [];
  }
}

export async function updateServiceRequest(
  id: string,
  data: Partial<Omit<ServiceRequest, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.SERVICE_REQUESTS, id), stripUndefined({
    ...data,
    updatedAt: Timestamp.now(),
  }));
}

// ─── Request Messages (per-request thread) ──────────────────────────────────

export interface RequestMessage {
  id?: string;
  requestId: string;
  senderId: string;
  senderName?: string;
  senderRole: 'admin' | 'client';
  body: string;
  createdAt: Timestamp;
}

export async function createRequestMessage(
  data: Omit<RequestMessage, 'id' | 'createdAt'>
): Promise<string> {
  const ref = collection(db, COLLECTIONS.REQUEST_MESSAGES);
  const docRef = await addDoc(ref, stripUndefined({ ...data, createdAt: Timestamp.now() }));
  return docRef.id;
}

export async function getRequestMessages(requestId: string): Promise<RequestMessage[]> {
  try {
    const ref = collection(db, COLLECTIONS.REQUEST_MESSAGES);
    const snap = await getDocs(query(ref, where('requestId', '==', requestId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestMessage));
    // Oldest-first for a chat view; in-memory sort avoids a composite index.
    return docs.sort(
      (a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching messages for request ${requestId}:`, error);
    return [];
  }
}

// ─── Request Files (per-request attachments) ────────────────────────────────

export interface RequestFile {
  id?: string;
  requestId: string;
  uploaderId: string;
  uploaderName?: string;
  uploaderRole: 'admin' | 'client';
  url: string;
  storagePath: string;
  filename: string;
  size: number;
  contentType?: string;
  createdAt: Timestamp;
}

export async function createRequestFile(
  data: Omit<RequestFile, 'id' | 'createdAt'>
): Promise<string> {
  const ref = collection(db, COLLECTIONS.REQUEST_FILES);
  const docRef = await addDoc(ref, stripUndefined({ ...data, createdAt: Timestamp.now() }));
  return docRef.id;
}

export async function getRequestFiles(requestId: string): Promise<RequestFile[]> {
  try {
    const ref = collection(db, COLLECTIONS.REQUEST_FILES);
    const snap = await getDocs(query(ref, where('requestId', '==', requestId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestFile));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching files for request ${requestId}:`, error);
    return [];
  }
}

export async function getRequestFileById(id: string): Promise<RequestFile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.REQUEST_FILES, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as RequestFile;
  } catch (error) {
    console.error(`Error fetching request file ${id}:`, error);
    return null;
  }
}

export async function deleteRequestFile(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.REQUEST_FILES, id));
}

// ─── Client Files (standalone client area uploads) ──────────────────────────

export interface ClientFile {
  id?: string;
  clientId: string;
  uploaderId: string;
  uploaderName?: string;
  uploaderRole: 'admin' | 'client';
  url: string;
  storagePath: string;
  filename: string;
  size: number; // bytes
  contentType?: string;
  createdAt: Timestamp;
}

export async function createClientFile(data: Omit<ClientFile, 'id' | 'createdAt'>): Promise<string> {
  const ref = collection(db, COLLECTIONS.CLIENT_FILES);
  const docRef = await addDoc(ref, stripUndefined({ ...data, createdAt: Timestamp.now() }));
  return docRef.id;
}

export async function getClientFileById(id: string): Promise<ClientFile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.CLIENT_FILES, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ClientFile;
  } catch (error) {
    console.error(`Error fetching client file ${id}:`, error);
    return null;
  }
}

export async function getClientFiles(clientId: string): Promise<ClientFile[]> {
  try {
    const ref = collection(db, COLLECTIONS.CLIENT_FILES);
    const snap = await getDocs(query(ref, where('clientId', '==', clientId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClientFile));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching client files for ${clientId}:`, error);
    return [];
  }
}

export async function deleteClientFile(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CLIENT_FILES, id));
}

// ─── Quotes / Invoices ──────────────────────────────────────────────────────

export type QuoteStatus = 'sent' | 'paid' | 'cancelled';

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unitAmount: number; // minor units (cents)
}

export interface Quote {
  id?: string;
  requestId?: string; // optional — quotes/invoices can be standalone
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  title: string;
  currency: string; // ISO code, lowercase (e.g. 'eur')
  lineItems: QuoteLineItem[];
  taxRate: number; // percent, e.g. 22 for IT VAT
  subtotal: number; // cents
  taxAmount: number; // cents
  total: number; // cents
  status: QuoteStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: Timestamp;
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createQuote(
  data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: QuoteStatus }
): Promise<string> {
  const ref = collection(db, COLLECTIONS.QUOTES);
  const now = Timestamp.now();
  const docRef = await addDoc(
    ref,
    stripUndefined({ ...data, status: data.status ?? 'sent', createdAt: now, updatedAt: now })
  );
  return docRef.id;
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.QUOTES, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Quote;
  } catch (error) {
    console.error(`Error fetching quote ${id}:`, error);
    return null;
  }
}

export async function getQuotesByRequest(requestId: string): Promise<Quote[]> {
  try {
    const ref = collection(db, COLLECTIONS.QUOTES);
    const snap = await getDocs(query(ref, where('requestId', '==', requestId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quote));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching quotes for request ${requestId}:`, error);
    return [];
  }
}

export async function listQuotes(filters?: { status?: QuoteStatus }): Promise<Quote[]> {
  try {
    const ref = collection(db, COLLECTIONS.QUOTES);
    const constraints: QueryConstraint[] = [];
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    const snap = await getDocs(query(ref, ...constraints));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quote));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error('Error listing quotes:', error);
    return [];
  }
}

export async function getQuotesByClient(clientId: string): Promise<Quote[]> {
  try {
    const ref = collection(db, COLLECTIONS.QUOTES);
    const snap = await getDocs(query(ref, where('clientId', '==', clientId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quote));
    return docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching quotes for client ${clientId}:`, error);
    return [];
  }
}

export async function updateQuote(id: string, data: Partial<Omit<Quote, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.QUOTES, id), stripUndefined({ ...data, updatedAt: Timestamp.now() }));
}

// ─── Quote Payments (installments / advance) ────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface QuotePayment {
  id?: string;
  quoteId: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  label: string; // e.g. "Acconto", "Rata 1", "Saldo"
  amount: number; // cents
  status: PaymentStatus;
  dueDate?: Timestamp;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: Timestamp;
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createQuotePayment(
  data: Omit<QuotePayment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: PaymentStatus }
): Promise<string> {
  const ref = collection(db, COLLECTIONS.QUOTE_PAYMENTS);
  const now = Timestamp.now();
  const docRef = await addDoc(
    ref,
    stripUndefined({ ...data, status: data.status ?? 'pending', createdAt: now, updatedAt: now })
  );
  return docRef.id;
}

export async function getQuotePaymentById(id: string): Promise<QuotePayment | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.QUOTE_PAYMENTS, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as QuotePayment;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    return null;
  }
}

export async function getPaymentsByQuote(quoteId: string): Promise<QuotePayment[]> {
  try {
    const ref = collection(db, COLLECTIONS.QUOTE_PAYMENTS);
    const snap = await getDocs(query(ref, where('quoteId', '==', quoteId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuotePayment));
    // Oldest-first (advance → installments).
    return docs.sort(
      (a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching payments for quote ${quoteId}:`, error);
    return [];
  }
}

export async function getPaymentsByClient(clientId: string): Promise<QuotePayment[]> {
  try {
    const ref = collection(db, COLLECTIONS.QUOTE_PAYMENTS);
    const snap = await getDocs(query(ref, where('clientId', '==', clientId)));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuotePayment));
    return docs.sort(
      (a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
    );
  } catch (error) {
    console.error(`Error fetching payments for client ${clientId}:`, error);
    return [];
  }
}

export async function updateQuotePayment(
  id: string,
  data: Partial<Omit<QuotePayment, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.QUOTE_PAYMENTS, id), stripUndefined({ ...data, updatedAt: Timestamp.now() }));
}

// ─── Direct Conversations (client ↔ team) ───────────────────────────────────

export type ConversationRole = 'admin' | 'client';

export interface Conversation {
  id?: string; // = clientId
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  lastSenderRole?: ConversationRole;
  unreadForAdmin: number;
  unreadForClient: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConversationMessage {
  id?: string;
  conversationId: string; // = clientId
  senderId: string;
  senderName?: string;
  senderRole: ConversationRole;
  body: string;
  createdAt: Timestamp;
}

export async function getConversation(clientId: string): Promise<Conversation | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.CONVERSATIONS, clientId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Conversation;
  } catch (error) {
    console.error(`Error fetching conversation ${clientId}:`, error);
    return null;
  }
}

export async function createConversationMessage(
  data: Omit<ConversationMessage, 'id' | 'createdAt'>
): Promise<string> {
  const ref = collection(db, COLLECTIONS.CONVERSATION_MESSAGES);
  const docRef = await addDoc(ref, stripUndefined({ ...data, createdAt: Timestamp.now() }));
  return docRef.id;
}

/**
 * Update conversation metadata after a new message and bump the unread counter
 * for the *recipient* role. Creates the conversation doc on first message.
 */
export async function touchConversation(
  clientId: string,
  data: {
    clientName?: string;
    clientEmail?: string;
    lastMessage: string;
    lastSenderRole: ConversationRole;
    recipient: ConversationRole; // whose unread counter to bump
  }
): Promise<void> {
  const ref = doc(db, COLLECTIONS.CONVERSATIONS, clientId);
  const snap = await getDoc(ref);
  const now = Timestamp.now();

  if (!snap.exists()) {
    await setDoc(
      ref,
      stripUndefined({
        clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        lastMessage: data.lastMessage,
        lastMessageAt: now,
        lastSenderRole: data.lastSenderRole,
        unreadForAdmin: data.recipient === 'admin' ? 1 : 0,
        unreadForClient: data.recipient === 'client' ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      })
    );
    return;
  }

  const counterField = data.recipient === 'admin' ? 'unreadForAdmin' : 'unreadForClient';
  await updateDoc(
    ref,
    stripUndefined({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      lastMessage: data.lastMessage,
      lastMessageAt: now,
      lastSenderRole: data.lastSenderRole,
      [counterField]: increment(1),
      updatedAt: now,
    })
  );
}

export async function markConversationRead(clientId: string, role: ConversationRole): Promise<void> {
  const ref = doc(db, COLLECTIONS.CONVERSATIONS, clientId);
  const field = role === 'admin' ? 'unreadForAdmin' : 'unreadForClient';
  await updateDoc(ref, { [field]: 0, updatedAt: Timestamp.now() }).catch(() => {});
}

    