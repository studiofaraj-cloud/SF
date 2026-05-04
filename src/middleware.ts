import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Always show the locale prefix in the URL (e.g. /it/..., /en/...)
  localePrefix: 'always',
  // Locale is fully URL-driven, so the NEXT_LOCALE cookie and Accept-Language
  // sniffing are unnecessary. The cookie's presence forces Next.js to mark
  // responses as `cache-control: private`, which prevents Firebase App Hosting's
  // edge from applying Brotli/gzip compression to the SSR'd HTML.
  localeCookie: false,
  localeDetection: false,
});

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
