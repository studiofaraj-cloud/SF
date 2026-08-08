'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import {
  getCookiePreferences,
  hasCookieConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
} from '@/lib/cookie-preferences';

/**
 * GA4, gated on the analytics cookie category.
 *
 * The site had no analytics and no Search Console verification at all, which
 * made every SEO decision unmeasurable. This is the measurement half; the
 * verification meta tags live in src/app/root-html.tsx.
 *
 * Behaviour:
 *  - Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so the repo
 *    stays inert until a real property exists.
 *  - The gtag script is NOT injected until the visitor has actually granted the
 *    analytics category. Loading it first and disabling it later still sets
 *    cookies and still phones home, which is the thing GDPR consent is for.
 *  - Re-checks when consent changes, so accepting the banner starts tracking
 *    without a reload.
 *
 * App Router client navigations do not trigger a fresh page_view, so one is
 * sent on pathname change. The query string is read imperatively rather than
 * with useSearchParams, which would force the whole tree into client rendering
 * unless wrapped in Suspense.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function analyticsAllowed(): boolean {
  return hasCookieConsent() && getCookiePreferences().analytics === true;
}

export function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed());
    sync();

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    // `storage` only fires in other tabs — keeps consent consistent across them.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!allowed || !GA_ID || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [allowed, pathname]);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
