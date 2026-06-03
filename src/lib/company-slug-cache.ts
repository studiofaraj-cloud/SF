/**
 * Edge-runtime-safe published-slug lookup used by middleware.
 *
 * On the very first visit to a bare slug URL, the middleware needs to decide
 * if the path is a known company profile. We can't use the Firebase SDK from
 * the edge runtime, so we hit the Firestore REST API directly — much more
 * reliable than fetching our own `/api/slugs/check/{slug}` endpoint, which
 * adds an internal load-balancer round-trip that occasionally times out on
 * Firebase App Hosting (causes false negatives → bare URL gets `/it/`-
 * prefixed and 404s).
 *
 * Cache strategy:
 *   - Positive hits cached 10 min (slugs don't change once claimed)
 *   - Negative hits cached 30 sec (so a newly-published slug is picked up
 *     within half a minute)
 * Inflight requests for the same slug are coalesced.
 *
 * Failure mode: fail-open — if the REST call errors, return false so the
 * normal intl pipeline serves the path (and 404s if no locale page matches).
 */

const TTL_POSITIVE_MS = 10 * 60 * 1000; // 10 min — slug exists, rarely changes
const TTL_NEGATIVE_MS = 30 * 1000; // 30 sec — slug doesn't exist (yet)

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

// Per-slug cache: slug → { exists: bool, expiresAt: number }
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<boolean>>();

/**
 * Query Firestore REST API directly for the existence of /slugs/{slug}.
 * Works in edge runtime (no Firebase SDK needed). Public read on /slugs/* is
 * allowed by the current firestore.rules. 200 → exists, 404 → doesn't.
 */
async function fetchSlugExists(slug: string): Promise<boolean> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn('[slug-cache] NEXT_PUBLIC_FIREBASE_PROJECT_ID not set');
    return false;
  }
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/slugs/${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    });
    return res.ok;
  } catch (err) {
    console.warn(`[slug-cache] Firestore REST call failed for "${slug}":`, err);
    return false;
  }
}

export async function isPublishedSlug(slug: string): Promise<boolean> {
  const cached = cache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // Coalesce concurrent lookups for the same slug into a single fetch.
  let pending = inflight.get(slug);
  if (!pending) {
    pending = fetchSlugExists(slug).finally(() => {
      inflight.delete(slug);
    });
    inflight.set(slug, pending);
  }
  const exists = await pending;
  cache.set(slug, {
    value: exists,
    expiresAt: Date.now() + (exists ? TTL_POSITIVE_MS : TTL_NEGATIVE_MS),
  });
  return exists;
}

/** Test/dev helper — invalidate the cached set. Never called by middleware. */
export function _clearSlugCache(): void {
  cache.clear();
}
