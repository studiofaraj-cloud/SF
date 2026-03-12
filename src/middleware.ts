import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Always show the locale prefix in the URL (e.g. /it/..., /en/...)
  localePrefix: 'always',
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
