import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { getSessionFromCookie } from './lib/session';
import { RESERVED_SLUGS, SLUG_REGEX } from './lib/company-slugs';
import { isPublishedSlug } from './lib/company-slug-cache';

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

const HUB_PATH = /^\/(?:(it|en)\/)?hub(?:\/.*)?$/;

function getSessionCookie(request: NextRequest) {
  return getSessionFromCookie(request.cookies.get('session')?.value);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin area: require an admin session (server-side enforcement) ──────────
  if (pathname.startsWith('/admin')) {
    // Public admin routes — login and the diagnostics page stay reachable.
    if (pathname === '/admin/login' || pathname.startsWith('/admin/system-check')) {
      return NextResponse.next();
    }
    const session = await getSessionCookie(request);
    if (!session || session.user.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Client hub: require any authenticated session ───────────────────────────
  const hubMatch = pathname.match(HUB_PATH);
  if (hubMatch) {
    const locale = hubMatch[1] ?? defaultLocale;
    // The hub login page itself must stay public.
    const isHubLogin = pathname.endsWith('/hub/login') || pathname.endsWith('/hub/register');
    if (!isHubLogin) {
      const session = await getSessionCookie(request);
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/hub/login`;
        url.search = `?next=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(url);
      }
    }
    // Authenticated (or public hub login) — let next-intl handle locale routing.
    return intlMiddleware(request);
  }

  // ── Bare company-profile slug (/{slug}) — rewrite to /c/{slug} ─────────────
  // Without this bypass next-intl would redirect /acme-corp to /it/acme-corp.
  // We can't host a top-level [companySlug] segment alongside [locale] (Next.js
  // refuses two differently-named dynamic siblings), so the actual route lives
  // at app/c/[companySlug]/page.tsx and the user-facing URL stays bare /{slug}.
  // Reserved segments and malformed slugs fall through to intl untouched.
  const firstSegment = pathname.slice(1).split('/')[0];
  if (
    firstSegment &&
    !RESERVED_SLUGS.has(firstSegment) &&
    SLUG_REGEX.test(firstSegment) &&
    pathname === `/${firstSegment}` // only treat single-segment paths as profile pages
  ) {
    const known = await isPublishedSlug(firstSegment);
    if (known) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/c/${firstSegment}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // ── Public site: intl + cacheable response (unchanged behavior) ─────────────
  const response = intlMiddleware(request);

  // Firebase App Hosting's adapter sets `cache-control: no-store` whenever
  // middleware runs, which suppresses edge Brotli compression and disables
  // CDN caching of the prerendered locale HTML. Force a public, cacheable
  // policy that matches the page's `revalidate = 3600`.
  if (response) {
    response.headers.set(
      'cache-control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Public, non-locale-prefixed paths — handled by intl + cached.
    // Locale-prefixed paths (/it/*, /en/*) are served directly by Next.js,
    // bypassing middleware so the CDN can compress prerendered HTML.
    // `/c/*` is also excluded so the company-profile rewrite target
    // (app/c/[companySlug]/page.tsx) doesn't get re-routed through intl,
    // which would prefix it to `/it/c/{slug}` and 404 there.
    '/((?!it(?:/|$)|en(?:/|$)|api|admin|c(?:/|$)|_next|_vercel|.*\\..*).*)',
    // Admin area — auth-gated (no caching).
    '/admin/:path*',
    // Client hub — auth-gated. Cover both bare and locale-prefixed forms.
    '/hub/:path*',
    '/(it|en)/hub/:path*',
  ],
};
