'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useCookiePreferences } from '@/contexts/cookie-context';
import { defaultLocale, type Locale } from '@/i18n/config';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { COOKIE_CONSENT_CHANGED_EVENT } from '@/lib/cookie-preferences';
import { cn } from '@/lib/utils';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  /** Kept for stored preferences; the site sets no marketing cookies, so it stays false. */
  marketing: boolean;
  functional: boolean;
}

const NONE: CookiePreferences = { essential: true, analytics: false, marketing: false, functional: false };
const ALL: CookiePreferences = { essential: true, analytics: true, marketing: false, functional: true };

const COPY = {
  it: {
    eyebrow: 'Privacy',
    title: 'Scegli tu quali cookie usare',
    body: [
      'Quelli tecnici servono al sito per funzionare.',
      'Con il tuo consenso usiamo anche Google Analytics, per capire come viene usato il sito, e Google Maps, per mostrarti la mappa.',
    ],
    reject: 'Rifiuta',
    accept: 'Accetta',
    customise: 'Personalizza',
    policy: 'Cookie policy',
    close: 'Chiudi e rifiuta',
    prefsTitle: 'Preferenze cookie',
    prefsBody: 'Attiva solo quello che vuoi. Puoi cambiare idea quando vuoi da «Preferenze cookie», in fondo a ogni pagina.',
    always: 'Sempre attivi',
    rejectAll: 'Rifiuta tutto',
    save: 'Salva le scelte',
    acceptAll: 'Accetta tutto',
    closePrefs: 'Chiudi',
    categories: {
      essential: ['Tecnici', 'Servono al sito per funzionare: lingua, tema e questa scelta.'],
      analytics: ['Statistiche', 'Google Analytics: come viene usato il sito, in forma aggregata.'],
      functional: ['Mappe', 'Google Maps nella pagina Contatti.'],
    },
  },
  en: {
    eyebrow: 'Privacy',
    title: 'Choose which cookies we use',
    body: [
      'Technical cookies keep the site working.',
      'With your consent we also use Google Analytics, to understand how the site is used, and Google Maps, to show you the map.',
    ],
    reject: 'Reject',
    accept: 'Accept',
    customise: 'Customise',
    policy: 'Cookie policy',
    close: 'Close and reject',
    prefsTitle: 'Cookie preferences',
    prefsBody: 'Turn on only what you want. You can change your mind at any time from "Cookie preferences" at the bottom of every page.',
    always: 'Always on',
    rejectAll: 'Reject all',
    save: 'Save choices',
    acceptAll: 'Accept all',
    closePrefs: 'Close',
    categories: {
      essential: ['Technical', 'Keep the site working: language, theme and this choice.'],
      analytics: ['Statistics', 'Google Analytics: how the site is used, in aggregate.'],
      functional: ['Maps', 'Google Maps on the Contact page.'],
    },
  },
} as const;

const CATEGORIES = ['essential', 'analytics', 'functional'] as const;

function readPreferences(): CookiePreferences {
  try {
    const saved = localStorage.getItem('cookie_preferences');
    if (saved) return { ...NONE, ...JSON.parse(saved), essential: true, marketing: false };
  } catch {
    // Unreadable or blocked storage: nothing is on.
  }
  return NONE;
}

/**
 * Store the choice and announce it. Writing to localStorage does not fire a
 * `storage` event in the same tab, so consent-gated scripts (GA4, the map)
 * would otherwise stay dormant until the next page load.
 */
function saveConsent(prefs: CookiePreferences) {
  const consent = prefs.analytics && prefs.functional ? 'accepted' : prefs.analytics || prefs.functional ? 'custom' : 'refused';
  try {
    localStorage.setItem('cookie_preferences', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent', consent);
  } catch {
    // Storage blocked: the choice holds for this page only.
  }
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
}

/**
 * The cookie banner — a card in the bottom-left corner (a bottom card on
 * phones) with Reject and Accept of equal weight; closing it refuses, as the
 * Garante's guidelines ask. "Personalizza" and the footer's "Preferenze
 * cookie" open the preferences, where the choice can be changed at any time.
 */
export function CookieConsent() {
  const params = useParams();
  const locale = ((params?.locale as Locale) ?? defaultLocale) === 'en' ? 'en' : 'it';
  const copy = COPY[locale];
  const { showPreferences, setShowPreferences } = useCookiePreferences();
  const [showBanner, setShowBanner] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(NONE);

  useEffect(() => {
    try {
      if (!localStorage.getItem('cookie_consent')) setShowBanner(true);
    } catch {
      setShowBanner(true);
    }
  }, []);

  // Opening the preferences shows what is saved now.
  useEffect(() => {
    if (showPreferences) setPrefs(readPreferences());
  }, [showPreferences]);

  const decide = (next: CookiePreferences) => {
    saveConsent(next);
    setShowBanner(false);
    setShowPreferences(false);
  };

  return (
    <>
      {showBanner && !showPreferences && (
        <section
          role="region"
          aria-labelledby="cookie-title"
          className="ck-in fixed inset-x-2.5 bottom-2.5 z-[55] rounded-3xl bg-card p-6 text-card-foreground shadow-[0_40px_90px_-30px_rgba(10,22,40,0.5)] ring-1 ring-border sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[26.5rem] sm:p-7"
        >
          <button
            type="button"
            onClick={() => decide(NONE)}
            aria-label={copy.close}
            title={copy.close}
            className="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{copy.eyebrow}</p>
          <h2 id="cookie-title" className="mt-2.5 pr-8 font-display text-[1.35rem] font-bold tracking-[-0.02em]">
            {copy.title}
          </h2>
          {/* Two short blocks rather than one paragraph, so the banner never
              outweighs the page's own text as its largest paint (LCP). */}
          {copy.body.map((line) => (
            <p key={line} className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground first-of-type:mt-2.5">
              {line}
            </p>
          ))}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => decide(NONE)}
              className="h-11 rounded-xl bg-background text-sm font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {copy.reject}
            </button>
            <button
              type="button"
              onClick={() => decide(ALL)}
              className="h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.accept}
            </button>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
            >
              {copy.customise}
            </button>
            <Link
              href={getLocalizedPath('/legal', locale)}
              className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              {copy.policy}
            </Link>
          </div>
        </section>
      )}

      <DialogPrimitive.Root open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className={cn(
              'fixed inset-x-2.5 bottom-2.5 z-[70] max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-3xl bg-card text-card-foreground shadow-[0_40px_90px_-30px_rgba(10,22,40,0.6)] outline-none ring-1 ring-border',
              'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[30rem] sm:-translate-x-1/2 sm:-translate-y-1/2',
              'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4',
            )}
          >
            <div className="px-6 pb-2 pt-6 sm:px-7 sm:pt-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{copy.eyebrow}</p>
              <DialogPrimitive.Title className="mt-2.5 pr-8 font-display text-[1.35rem] font-bold tracking-[-0.02em]">
                {copy.prefsTitle}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {copy.prefsBody}
              </DialogPrimitive.Description>
            </div>

            <ul className="mt-3 px-6 sm:px-7">
              {CATEGORIES.map((id) => {
                const [name, text] = copy.categories[id];
                const locked = id === 'essential';
                return (
                  <li key={id} className="flex items-center gap-4 border-t border-border py-3.5">
                    <label htmlFor={`cookie-${id}`} className={cn('flex-1', !locked && 'cursor-pointer')}>
                      <span className="block text-[15px] font-semibold">{name}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                        {text}
                        {locked && <> · {copy.always}</>}
                      </span>
                    </label>
                    <Switch
                      id={`cookie-${id}`}
                      checked={locked || prefs[id]}
                      disabled={locked}
                      onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [id]: checked }))}
                    />
                  </li>
                );
              })}
            </ul>

            <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/50 px-6 py-5 sm:px-7">
              <button
                type="button"
                onClick={() => decide(NONE)}
                className="h-11 rounded-xl bg-background text-sm font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {copy.rejectAll}
              </button>
              <button
                type="button"
                onClick={() => decide({ ...prefs, essential: true, marketing: false })}
                className="h-11 rounded-xl bg-background text-sm font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {copy.save}
              </button>
              <button
                type="button"
                onClick={() => decide(ALL)}
                className="col-span-2 h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {copy.acceptAll}
              </button>
            </div>

            <DialogPrimitive.Close
              aria-label={copy.closePrefs}
              className="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-[18px] w-[18px]" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
