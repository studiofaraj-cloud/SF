'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { MAPS_CID } from '@/lib/contact-info';
import {
  getCookiePreferences,
  hasCookieConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
} from '@/lib/cookie-preferences';

function functionalCookiesAllowed(): boolean {
  return hasCookieConsent() && getCookiePreferences().functional === true;
}

/**
 * The Google Maps embed of /contatti, filling its (positioned) parent.
 *
 * The embed loads Google's scripts and cookies, so — like GA4 — it waits for
 * consent: it appears on its own once the visitor has allowed functional
 * cookies, otherwise a placeholder loads it on click. The address and the
 * directions links beside it work either way.
 */
export default function ContattiMap() {
  const t = useTranslations('contactPage.map');
  const locale = useLocale();
  const [consented, setConsented] = useState(false);
  const [loadRequested, setLoadRequested] = useState(false);

  useEffect(() => {
    const sync = () => setConsented(functionalCookiesAllowed());
    sync();

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    // `storage` only fires in other tabs — keeps consent consistent across them.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (consented || loadRequested) {
    return (
      <iframe
        title={t('iframeTitle')}
        src={`https://maps.google.com/maps?cid=${MAPS_CID}&hl=${locale === 'en' ? 'en' : 'it'}&z=16&output=embed`}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allowFullScreen
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
      {/* Faint street grid so the empty frame still reads as a map */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-70"
      />
      <div className="relative max-w-sm">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <MapPin className="h-6 w-6" />
        </span>
        <button
          type="button"
          onClick={() => setLoadRequested(true)}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t('loadMap')}
        </button>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {t('consentNote')}{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
            {t('privacyLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
