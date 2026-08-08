import { locales } from '@/i18n/config';
import { siteConfig } from '@/lib/seo';

/**
 * Sitemap helpers — shared across the sitemap index and the per-category
 * sub-sitemaps (pages, blog, projects, companies). We split into multiple
 * sitemaps so Googlebot can detect new content faster: it compares the
 * sub-sitemap's <lastmod> in the index and only refetches the ones that
 * actually changed.
 */

export const SITE_URL = siteConfig.url;
export const DEFAULT_LOCALE = 'it';

/** Build a fully-qualified URL with locale prefix. */
export function makeUrl(path: string, locale: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

/** XML-escape a string for safe inclusion in attribute/text content. */
export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface UrlEntryOptions {
  /** Path relative to the locale prefix, e.g. "/blog/my-slug" or "" for home. */
  path: string;
  /** ISO 8601 timestamp (full). */
  lastmod: string;
  /** Hint only — Googlebot ignores it, kept for other search engines. */
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never';
  /** Hint only — Googlebot ignores it. Bing still uses it. */
  priority?: string;
}

/**
 * Render a single `<url>` entry with hreflang alternates for every supported
 * locale + x-default. The same path is emitted once per locale in the caller;
 * each emission carries the full hreflang set so Google understands the
 * relationship between language variants.
 */
/**
 * Render a single `<url>` entry for content that exists in ONE language only —
 * blog posts and projects, whose text comes from a single set of Firestore
 * fields with no per-locale variant.
 *
 * Emits just the default-locale URL, with no hreflang alternates. Previously
 * these were emitted once per locale, so the sitemap submitted ~20 /en URLs
 * that served identical Italian text and annotated them as English
 * translations. The pages themselves now canonicalise /en -> /it (see
 * `defaultLocaleOnly` in src/lib/seo.ts); this keeps the sitemap consistent
 * with that instead of asking Google to crawl URLs we have canonicalised away.
 */
export function renderDefaultLocaleUrl({
  path,
  lastmod,
  changefreq,
  priority,
}: UrlEntryOptions): string {
  const optional =
    (changefreq ? `      <changefreq>${changefreq}</changefreq>\n` : '') +
    (priority ? `      <priority>${priority}</priority>\n` : '');

  return `    <url>
      <loc>${xmlEscape(makeUrl(path, DEFAULT_LOCALE))}</loc>
      <lastmod>${lastmod}</lastmod>
${optional}    </url>`;
}

export function renderLocalizedUrl(
  { path, lastmod, changefreq, priority }: UrlEntryOptions,
  locale: string,
): string {
  const loc = makeUrl(path, locale);
  const alternates = locales
    .map(
      (l) =>
        `      <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(makeUrl(path, l))}" />`,
    )
    .join('\n');
  const xDefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(makeUrl(path, DEFAULT_LOCALE))}" />`;
  const optional =
    (changefreq ? `      <changefreq>${changefreq}</changefreq>\n` : '') +
    (priority ? `      <priority>${priority}</priority>\n` : '');

  return `    <url>
      <loc>${xmlEscape(loc)}</loc>
${alternates}
${xDefault}
      <lastmod>${lastmod}</lastmod>
${optional}    </url>`;
}

/**
 * Wrap a list of `<url>...</url>` blocks in the urlset envelope with the
 * xhtml namespace for hreflang.
 */
export function wrapUrlset(urlBlocks: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join('\n')}
</urlset>
`;
}

/** Common response headers — short s-maxage so new content surfaces fast. */
export const SITEMAP_HEADERS = {
  'Content-Type': 'application/xml',
  'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
} as const;

/**
 * Return the most recent ISO timestamp among `timestamps` and the `floor`.
 * The floor is included as a candidate (not just a fallback) so that a recent
 * code/layout change to an index page bumps its lastmod even when the items
 * it lists haven't been touched in a while.
 */
export function maxLastmod(timestamps: Array<string | number | Date | undefined | null>, floor: string): string {
  let max = new Date(floor).getTime();
  if (!Number.isFinite(max)) max = 0;
  for (const t of timestamps) {
    if (!t) continue;
    const ms = new Date(t).getTime();
    if (Number.isFinite(ms) && ms > max) max = ms;
  }
  return max > 0 ? new Date(max).toISOString() : floor;
}
