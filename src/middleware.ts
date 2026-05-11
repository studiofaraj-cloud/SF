import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Always show the locale prefix in the URL (e.g. /it/..., /en/...)
  localePrefix: 'always',
  // Locale is fully URL-driven, so the NEXT_LOCALE cookie and Accept-Language
  // sniffing are unnecessary. Removing them prevents Next.js / the App Hosting
  // adapter from marking responses as `private` / `no-store`, which was
  // blocking edge Brotli/gzip compression on the prerendered HTML.
  localeCookie: false,
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Firebase App Hosting's adapter sets `cache-control: no-store` whenever
  // middleware runs, which suppresses edge Brotli compression and disables
  // CDN caching of the prerendered locale HTML. Force a public, cacheable
  // policy that matches the page's `revalidate = 3600`. Always override —
  // the upstream value is `no-store` so a guarded set would be a no-op.
  if (response) {
    response.headers.set(
      'cache-control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  return response;
}

export const config = {
  // Only intercept routes that don't already carry a locale prefix.
  // Locale-prefixed paths (/it/*, /en/*) are served directly by Next.js —
  // bypassing middleware prevents Firebase App Hosting's adapter from
  // overriding cache-control to no-store on those responses, which in turn
  // allows the CDN to apply Brotli/gzip compression on the prerendered HTML.
  matcher: [
    '/((?!it(?:/|$)|en(?:/|$)|api|admin|_next|_vercel|.*\\..*).*)',
  ],
};
