'use client';

import { useEffect, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import {
  getCookiePreferences,
  hasCookieConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
} from '@/lib/cookie-preferences';

// Google Business Profile listing. The keyless embed is pinned by `cid`, which
// keeps pointing at the listing even if its name or the search results change;
// `q=place_id:…` does not work there (it searches for the word "place").
const MAPS_CID = '5165210571911986297';
const PLACE_ID = 'ChIJV_YxeITzBAERefznEKaDrkc';
const MAPS_QUERY = encodeURIComponent('Studio Faraj, Via Ludovico Ariosto 42, 35128 Padova');
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}&destination_place_id=${PLACE_ID}`;
const OPEN_IN_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}&query_place_id=${PLACE_ID}`;

function functionalCookiesAllowed(): boolean {
  return hasCookieConsent() && getCookiePreferences().functional === true;
}

/**
 * "Dove siamo" block for /contatti: address, directions and a Google Maps embed.
 *
 * The embed loads Google's scripts and cookies, so — like GA4 — it waits for
 * consent: it appears on its own once the visitor has allowed functional
 * cookies, otherwise a placeholder loads it on click. The address and the
 * directions / open-in-Maps links work either way.
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

  const showMap = consented || loadRequested;
  const embedSrc = `https://maps.google.com/maps?cid=${MAPS_CID}&hl=${locale === 'en' ? 'en' : 'it'}&z=16&output=embed`;

  return (
    <section id="dove-siamo" className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <Badge className="badge-futuristic mb-3 sm:mb-4">
              <MapPin className="w-3 h-3 mr-1.5 sm:mr-2" />
              {t('badge')}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              <span className="text-foreground">{t('title')}</span>{' '}
              <span className="text-primary">{t('titleHighlight')}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              {t('subtitle')}
            </p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn animation="fade-up" delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm p-3 sm:p-4">
            {/* Address + actions */}
            <div className="flex flex-col justify-between gap-6 p-3 sm:p-4">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {t('addressLabel')}
                </p>
                <address className="not-italic text-lg font-semibold leading-snug text-foreground">
                  Studio Faraj
                  <br />
                  Via Ludovico Ariosto, 42
                  <br />
                  35128 Padova (PD)
                </address>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <Button asChild className="group sm:flex-1 lg:flex-none">
                  <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 mr-2" />
                    {t('directions')}
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10 sm:flex-1 lg:flex-none">
                  <a href={OPEN_IN_MAPS_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('openInMaps')}
                  </a>
                </Button>
              </div>
            </div>

            {/* Map, or the consent placeholder until it may load */}
            <div className="relative lg:col-span-2 h-[320px] sm:h-[380px] lg:h-[420px] overflow-hidden rounded-xl sm:rounded-2xl border border-border/60 bg-secondary/40">
              {showMap ? (
                <iframe
                  title={t('iframeTitle')}
                  src={embedSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  {/* Faint street grid so the empty frame still reads as a map */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]"
                  />
                  <div className="relative max-w-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <Button onClick={() => setLoadRequested(true)}>
                      {t('loadMap')}
                    </Button>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {t('consentNote')}{' '}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        {t('privacyLink')}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
