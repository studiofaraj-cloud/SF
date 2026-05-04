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

  // Without an explicit cache-control, Firebase App Hosting's adapter falls
  // back to `no-store` when middleware runs, which suppresses edge compression
  // and disables CDN caching for the prerendered locale pages. Set a public,
  // cacheable policy that matches the page's `revalidate = 3600`.
  if (response && !response.headers.has('cache-control')) {
    response.headers.set(
      'cache-control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  return response;
}

export const config = {
  // Match all routes except:
  // - Next.js internals (_next, _vercel)
  // - Static files (files with an extension like .ico, .png, etc.)
  // - API routes
  // - Admin routes (handled separately without locale prefix)
  matcher: [
    '/((?!api|admin|_next|_vercel|.*\\..*).*)',
    '/',
  ],
};
