/**
 * Reserved top-level path segments that cannot be used as company slugs.
 *
 * These cover: existing public routes (`blog`, `projects`, `servizi`,
 * `chi-siamo`, `contatti`, etc.), framework reserved (`api`, `_next`,
 * `_vercel`), auth/locale (`it`, `en`, `admin`, `hub`), well-known assets
 * (`sitemap.xml`, `robots.txt`, `favicon.ico`), and a few future-proof
 * namespaces (`c`, `app`, `assets`, `static`, `public`).
 *
 * Imported by both the middleware (to skip the slug-cache lookup) and the
 * Zod validator (to reject the slug at creation time).
 */
export const RESERVED_SLUGS = new Set<string>([
  'it',
  'en',
  'api',
  'admin',
  '_next',
  '_vercel',
  'hub',
  'blog',
  'projects',
  'servizi',
  'chi-siamo',
  'contatti',
  'inizia',
  'pagine-aziendali',
  'faq',
  'legal',
  'terms',
  'search',
  'call-booking',
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
  'c',
  'app',
  'assets',
  'static',
  'public',
  'sitemap',
  'robots',
  'manifest.json',
]);

/** Lowercase, kebab-case slug — letters, digits, hyphens, 3-50 chars. */
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/;

/** Normalize a free-form company name into a slug candidate. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export type SlugValidationError =
  | 'EMPTY'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'INVALID_FORMAT'
  | 'RESERVED';

export function validateSlug(slug: string): SlugValidationError | null {
  if (!slug) return 'EMPTY';
  if (slug.length < 3) return 'TOO_SHORT';
  if (slug.length > 50) return 'TOO_LONG';
  if (!SLUG_REGEX.test(slug)) return 'INVALID_FORMAT';
  if (RESERVED_SLUGS.has(slug)) return 'RESERVED';
  return null;
}
