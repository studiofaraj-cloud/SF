import 'server-only';
import { siteConfig } from '@/lib/seo';

/**
 * IndexNow client — notifies Bing, Yandex, Naver, Seznam (and any other
 * adopters) that one or more URLs have been added/updated/removed.
 *
 * A single POST to api.indexnow.org fans out to every participating engine,
 * so we don't need to call each one individually.
 *
 * Google is NOT a participant. They deprecated the sitemap ping endpoint in
 * 2023 and their Indexing API is limited to JobPosting / BroadcastEvent
 * schemas. For us, Google will discover the new URLs through normal sitemap
 * crawls — but with the honest <lastmod> values in our new sitemap-*.xml
 * sub-sitemaps, those crawls are now efficient.
 *
 * Spec: https://www.indexnow.org/documentation
 *
 * Key file: /public/indexnow-key.txt is served verbatim at
 * https://<host>/indexnow-key.txt — IndexNow verifies ownership by fetching
 * that URL and confirming it returns the key value.
 */

// 32-char hex key. Public by design — IndexNow keys identify the host, they
// don't grant any privilege. Can be overridden via env for staging/rotation.
const FALLBACK_KEY = 'b7e2a8c49f3d4e1a8b5c6d7e8f9a0b1c';

function getKey(): string {
  return process.env.INDEXNOW_KEY?.trim() || FALLBACK_KEY;
}

function getKeyLocation(): string {
  return `${siteConfig.url}/indexnow-key.txt`;
}

function getHost(): string {
  // The IndexNow `host` field expects just the bare hostname (no scheme).
  try {
    return new URL(siteConfig.url).host;
  } catch {
    return 'studiofaraj.it';
  }
}

interface NotifyResult {
  ok: boolean;
  status?: number;
  count: number;
  error?: string;
}

/**
 * Notify IndexNow about a batch of URLs. Fire-and-forget by default — the
 * caller usually doesn't want a content-publish action to fail because Bing
 * is having a bad day. Returns a Promise that resolves with a result you can
 * await + log if you want.
 *
 * Silently no-ops when `INDEXNOW_DISABLED` is truthy, or when the URL list
 * is empty.
 */
export async function notifyIndexNow(urls: string[]): Promise<NotifyResult> {
  // Hard disable knob — used in tests / when temporarily quieting submissions.
  if (process.env.INDEXNOW_DISABLED) {
    return { ok: true, count: 0 };
  }

  // Dev safety: siteConfig.url is hardcoded to production, so a stray publish
  // from `npm run dev` would tell IndexNow about URLs that don't reflect the
  // real production state. Skip outside production unless explicitly enabled.
  if (process.env.NODE_ENV !== 'production' && !process.env.INDEXNOW_FORCE) {
    console.log('[IndexNow] skipped — non-production env (set INDEXNOW_FORCE=1 to override)');
    return { ok: true, count: 0 };
  }

  const cleanUrls = Array.from(
    new Set(urls.map((u) => u?.trim()).filter((u): u is string => !!u)),
  );

  if (cleanUrls.length === 0) {
    return { ok: true, count: 0 };
  }

  const body = {
    host: getHost(),
    key: getKey(),
    keyLocation: getKeyLocation(),
    urlList: cleanUrls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      // Reasonable timeout so we never block a server action for too long.
      // 5s is more than enough for IndexNow's geographically-distributed
      // endpoint; if it's slower than that, something's wrong upstream and
      // we'd rather fail fast and move on.
      signal: AbortSignal.timeout(5000),
    });

    // Per spec: 200 = accepted, 202 = accepted (deferred), 4xx = client error.
    // Anything in 2xx is a successful submission.
    if (res.status >= 200 && res.status < 300) {
      console.log(`[IndexNow] submitted ${cleanUrls.length} URL(s), status=${res.status}`);
      return { ok: true, status: res.status, count: cleanUrls.length };
    }

    const text = await res.text().catch(() => '');
    console.warn(
      `[IndexNow] non-2xx response: status=${res.status} body=${text.slice(0, 200)}`,
    );
    return { ok: false, status: res.status, count: cleanUrls.length, error: text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[IndexNow] request failed:', msg);
    return { ok: false, count: cleanUrls.length, error: msg };
  }
}

// ─── URL builders ────────────────────────────────────────────────────────────

/** Build the public URL for a blog post in a given locale. */
export function blogUrl(slug: string, locale: 'it' | 'en'): string {
  return `${siteConfig.url}/${locale}/blog/${slug}`;
}

/** Build the public URL for a project in a given locale. */
export function projectUrl(slug: string, locale: 'it' | 'en'): string {
  return `${siteConfig.url}/${locale}/projects/${slug}`;
}

/** Build the public URL for a company profile (single-locale). */
export function companyProfileUrl(slug: string): string {
  return `${siteConfig.url}/c/${slug}`;
}

/** Convenience: notify all locale variants for blog/project content. */
export function notifyContentPublished(
  type: 'blog' | 'project',
  slug: string,
): Promise<NotifyResult> {
  const builder = type === 'blog' ? blogUrl : projectUrl;
  return notifyIndexNow([builder(slug, 'it'), builder(slug, 'en')]);
}
