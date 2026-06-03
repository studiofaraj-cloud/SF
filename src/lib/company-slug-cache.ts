/**
 * Edge-runtime-safe published-slug lookup used by middleware.
 *
 * Middleware can't talk to Firestore directly (the SDK isn't edge-compatible),
 * so we hit a Node-runtime internal API route that performs a single-slug
 * existence check, and keep the boolean result in module memory for `TTL_MS`
 * to avoid per-request fetches.
 *
 * Cold start: 1 fetch per slug per instance per TTL.
 * Warm: O(1) Map lookup.
 * Failure mode: fail-open — if the fetch errors, return false, which lets the
 * normal intl pipeline serve the path (and 404 if no locale page matches).
 *
 * Why per-slug instead of a bulk index?
 *   - Newly-claimed slugs are recognised on the FIRST visit, not after the
 *     bulk index propagates (which used to take up to ~2 minutes).
 *   - The HTTP cache on the API endpoint scales naturally per-slug.
 */

const TTL_MS = 60 * 1000;

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

// Per-slug cache: slug → { exists: bool, expiresAt: number }
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<boolean>>();

async function fetchSlugExists(slug: string, origin: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${origin}/api/slugs/check/${encodeURIComponent(slug)}`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(2000),
      }
    );
    if (!res.ok) return false;
    const json = (await res.json()) as { exists?: boolean };
    return !!json.exists;
  } catch {
    return false;
  }
}

export async function isPublishedSlug(slug: string, origin: string): Promise<boolean> {
  const cached = cache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // Coalesce concurrent lookups for the same slug into a single fetch.
  let pending = inflight.get(slug);
  if (!pending) {
    pending = fetchSlugExists(slug, origin).finally(() => {
      inflight.delete(slug);
    });
    inflight.set(slug, pending);
  }
  const exists = await pending;
  cache.set(slug, { value: exists, expiresAt: Date.now() + TTL_MS });
  return exists;
}

/** Test/dev helper — invalidate the cached set. Never called by middleware. */
export function _clearSlugCache(): void {
  cache.clear();
}
