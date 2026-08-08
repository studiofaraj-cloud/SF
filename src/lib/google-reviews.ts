/**
 * Reviews fetcher — server only.
 *
 * Priority:
 *  1. Firestore `reviews` collection (source of truth, admin-managed, all reviews)
 *  2. Google Places API live fetch (if Firestore is empty)
 *  3. Hardcoded fallback (if both fail)
 *
 * The Google Places API returns at most 5 reviews.  The Firestore collection
 * has no such limit — the admin syncs Google reviews there and can add extras.
 */

import 'server-only';
import { cache } from 'react';

export interface GoogleReview {
  authorDisplayName: string;
  authorUri: string;
  authorPhotoUri: string;
  rating: number;
  text: string;
  languageCode: string;
  relativeTime: string;
  publishTime: string;
}

export interface PlaceSummary {
  name: string;
  rating: number;
  totalRatings: number;
  reviews: GoogleReview[];
  isLive: boolean;
}

// ---------------------------------------------------------------------------
// Internal: raw Places API (New) shapes
// ---------------------------------------------------------------------------
interface RawAuthor { displayName: string; uri: string; photoUri: string }
interface RawReview {
  rating: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: { text: string; languageCode: string };
  authorAttribution: RawAuthor;
}
interface RawPlaceResponse {
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: RawReview[];
}

// ---------------------------------------------------------------------------
// Fetch from Firestore (source of truth — no 5-review cap)
// ---------------------------------------------------------------------------
async function fetchFromFirestore(): Promise<GoogleReview[]> {
  try {
    const { getReviews } = await import('@/lib/firestore-data');
    const docs = await getReviews(true); // onlyVisible = true
    if (docs.length === 0) return [];
    return docs.map((d) => ({
      authorDisplayName: d.authorDisplayName,
      authorUri: d.authorUri,
      authorPhotoUri: d.authorPhotoUri,
      rating: d.rating,
      text: d.text,
      languageCode: 'it',
      relativeTime: d.relativeTime,
      publishTime: d.publishTime,
    }));
  } catch (err) {
    console.error('[GoogleReviews] Firestore fetch failed:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch from Google Places API (max 5 reviews — used only if Firestore empty)
// ---------------------------------------------------------------------------
async function fetchFromPlacesAPI(locale = 'it'): Promise<{ reviews: GoogleReview[]; rating: number; totalRatings: number }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID ?? 'ChIJV_YxeITzBAERefznEKaDrkc';
  const langCode = locale === 'en' ? 'en' : 'it';

  console.log('[GoogleReviews] Fetching from Places API. API Key present:', !!apiKey, 'Place ID:', placeId);
  if (!apiKey) {
    console.warn('[GoogleReviews] Missing API Key. Falling back.');
    return { reviews: [], rating: 5, totalRatings: 0 };
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${langCode}`;
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'displayName,rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,reviews.publishTime',
      },
      next: { revalidate: 86400, tags: ['google-reviews'] },
    });

    if (!res.ok) {
      console.error(`[GoogleReviews] Places API ${res.status}`);
      return { reviews: [], rating: 5, totalRatings: 0 };
    }

    const data: RawPlaceResponse = await res.json();
    const reviews: GoogleReview[] = (data.reviews ?? [])
      .filter((r) => r.rating >= 4 && r.text?.text)
      .map((r) => ({
        authorDisplayName: r.authorAttribution.displayName,
        authorUri: r.authorAttribution.uri,
        authorPhotoUri: r.authorAttribution.photoUri,
        rating: r.rating,
        text: r.text!.text,
        languageCode: r.text!.languageCode ?? 'it',
        relativeTime: r.relativePublishTimeDescription ?? '',
        publishTime: r.publishTime ?? '',
      }))
      .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

    return { reviews, rating: data.rating ?? 5, totalRatings: data.userRatingCount ?? 0 };
  } catch (err) {
    console.error('[GoogleReviews] Places API fetch failed:', err);
    return { reviews: [], rating: 5, totalRatings: 0 };
  }
}

// ---------------------------------------------------------------------------
// Main export — used by TestimonialsServer
// ---------------------------------------------------------------------------
async function fetchGoogleReviewsUncached(locale = 'it'): Promise<PlaceSummary> {
  // 1. Try Firestore first (no review cap, admin-managed)
  const firestoreReviews = await fetchFromFirestore();
  if (firestoreReviews.length > 0) {
    // Compute aggregate rating from stored reviews
    const avg = firestoreReviews.reduce((s, r) => s + r.rating, 0) / firestoreReviews.length;
    // Cap at 12 reviews and truncate long texts — each review adds ~1 KB to RSC
    // flight data (serialized for client hydration) and to the HTML (marquee duplicate).
    const cappedReviews = firestoreReviews.slice(0, 12).map((r) => ({
      ...r,
      text: r.text.length > 320 ? r.text.slice(0, 317) + '…' : r.text,
    }));
    return {
      name: 'Studio Faraj',
      rating: Math.round(avg * 10) / 10,
      totalRatings: firestoreReviews.length,
      reviews: cappedReviews,
      isLive: true,
    };
  }

  // 2. Firestore empty → fall back to live Places API (max 5)
  const { reviews, rating, totalRatings } = await fetchFromPlacesAPI(locale);
  console.log('[GoogleReviews] Places API response count:', reviews.length);
  if (reviews.length > 0) {
    return { name: 'Studio Faraj', rating, totalRatings, reviews, isLive: true };
  }

  // 3. Total failure → hardcoded data
  console.warn('[GoogleReviews] ALL fetches failed. Falling back to hardcoded data.');
  return hardcodedFallback();
}

/**
 * Request-scoped memoization. The homepage needs this twice per render — once
 * for the testimonials carousel and once to build the LocalBusiness
 * aggregateRating — and without cache() that is two identical Firestore
 * round-trips on every request.
 */
export const fetchGoogleReviews = cache(fetchGoogleReviewsUncached);

/**
 * Real rating for schema.org `aggregateRating`, or null when we don't have one.
 *
 * Returns null unless the numbers came from a live source AND there is at least
 * one actual review: the hardcoded fallback reports rating 5 / 0 ratings with
 * placeholder authors, and emitting that as structured data would be a
 * fabricated review snippet — the exact structured-data policy violation this
 * replaced. No data means no aggregateRating node, not an invented one.
 */
export async function getAggregateRating(
  locale = 'it',
): Promise<{ ratingValue: number; reviewCount: number } | null> {
  try {
    const place = await fetchGoogleReviews(locale);
    if (!place.isLive || place.totalRatings < 1) return null;
    return { ratingValue: place.rating, reviewCount: place.totalRatings };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hardcoded fallback
// ---------------------------------------------------------------------------
function hardcodedFallback(): PlaceSummary {
  return {
    name: 'Studio Faraj',
    rating: 5,
    totalRatings: 0,
    isLive: false,
    reviews: [
      {
        authorDisplayName: 'Marco Rossi', authorUri: '', authorPhotoUri: '',
        rating: 5, languageCode: 'it', relativeTime: '', publishTime: '',
        text: "Collaborare con Studio Faraj è stata un'esperienza eccezionale. Hanno capito fin da subito le nostre esigenze tecniche e hanno consegnato un portale performante e scalabile.",
      },
      {
        authorDisplayName: 'Elena Bianchi', authorUri: '', authorPhotoUri: '',
        rating: 5, languageCode: 'it', relativeTime: '', publishTime: '',
        text: "Cercavamo un partner che non solo scrivesse codice, ma che capisse il design. Studio Faraj ha superato le aspettative con un'interfaccia utente pulita e moderna.",
      },
      {
        authorDisplayName: 'Giuseppe Bruno', authorUri: '', authorPhotoUri: '',
        rating: 5, languageCode: 'it', relativeTime: '', publishTime: '',
        text: "Professionalità e puntualità sono i loro punti di forza. Hanno gestito la migrazione del nostro shop senza alcun downtime.",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Exported for admin: raw Places API fetch without Firestore fallback
// ---------------------------------------------------------------------------
export async function fetchReviewsFromPlacesAPI(locale = 'it') {
  return fetchFromPlacesAPI(locale);
}
