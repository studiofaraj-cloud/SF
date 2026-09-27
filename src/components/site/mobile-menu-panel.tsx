'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Clock, Phone, Plus, Search, Star } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

import type { HeaderRating } from './mobile-menu';

const COPY = {
  it: {
    open: 'Apri il menu',
    close: 'Chiudi il menu',
    title: 'Menu',
    search: 'Cerca nel sito',
    allServices: 'Tutti i servizi',
    role: 'Fondatore · Padova, dal 2020',
    available: 'Disponibili per nuovi progetti',
    reply: 'Rispondiamo di solito entro 24 ore',
    rating: (value: string, perfect: boolean) => (perfect ? 'Recensioni a 5 stelle su Google' : `Valutazione ${value} su Google`),
    start: 'Inizia il tuo progetto',
    clientArea: 'Area clienti',
    call: 'Chiama',
  },
  en: {
    open: 'Open menu',
    close: 'Close menu',
    title: 'Menu',
    search: 'Search the site',
    allServices: 'All services',
    role: 'Founder · Padova, since 2020',
    available: 'Available for new projects',
    reply: 'We usually reply within 24 hours',
    rating: (value: string, perfect: boolean) => (perfect ? '5-star reviews on Google' : `Rated ${value} on Google`),
    start: 'Start your project',
    clientArea: 'Client area',
    call: 'Call',
  },
} as const;

const NAV = [
  { href: '/', key: 'home' },
  { href: '/chi-siamo', key: 'about' },
  { href: '/servizi', key: 'services' },
  { href: '/pagine-aziendali', key: 'companyPages' },
  { href: '/projects', key: 'projects' },
  { href: '/blog', key: 'blog' },
  { href: '/contatti', key: 'contact' },
] as const;

const SERVICES = [
  { href: '/servizi/sviluppo-web', key: 'webDevelopment' },
  { href: '/servizi/e-commerce', key: 'ecommerce' },
  { href: '/servizi/design-ui-ux', key: 'designUIUX' },
  { href: '/servizi/seo-marketing', key: 'seoMarketing' },
  { href: '/servizi/ai-automazione', key: 'aiAutomation' },
  { href: '/servizi/manutenzione', key: 'maintenance' },
  { href: '/servizi/hosting-cloud', key: 'hostingCloud' },
  { href: '/servizi/consulenza', key: 'consulting' },
] as const;

export type Rect = { x: number; y: number; w: number; h: number };

// Where the menu button sits in the header before it has been measured.
export const FALLBACK: Rect = { x: -1, y: 20, w: 40, h: 40 };

/**
 * The mobile menu's panel (below lg), loaded when the menu button is first
 * used (see mobile-menu.tsx). A full-screen navy panel that grows out of the menu
 * button as a circle; its two lines turn into the close button's X in the
 * same spot. Numbered links rise in one after another, then a trust card
 * (founder, availability, reply time, the live Google rating), the calls to
 * action and the direct contacts. Radix Dialog provides the focus trap,
 * Escape and scroll lock; the motion is CSS (globals.css, .mm-*) and is
 * skipped with reduced motion.
 */
export default function MobileMenuPanel({
  open,
  onOpenChange: setOpen,
  origin,
  rating,
  onSearchOpen,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the menu button is: the panel grows from it and puts the close button there. */
  origin: Rect;
  rating: HeaderRating;
  onSearchOpen: () => void;
  /** The menu button, which gets focus back when the panel closes. */
  trigger: RefObject<HTMLButtonElement | null>;
}) {
  const locale = useLocale() as Locale;
  const copy = COPY[locale];
  const t = useTranslations('nav');
  const tServices = useTranslations('services');
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onServicePage = pathname.includes('/servizi');
  const [servicesOpen, setServicesOpen] = useState(onServicePage);

  // On a service page the services list starts open.
  useEffect(() => {
    if (open) setServicesOpen(onServicePage);
  }, [open, onServicePage]);

  const isActive = (href: string) => {
    const localized = getLocalizedPath(href, locale);
    if (href === '/') return pathname === localized;
    return pathname === localized || pathname.startsWith(`${localized}/`);
  };

  const ratingText = rating
    ? copy.rating(
        rating.value.toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        Math.round(rating.value * 10) >= 50,
      )
    : null;

  const cx = origin.x < 0 ? 'calc(100% - 48px)' : `${origin.x + origin.w / 2}px`;
  const cy = `${origin.y + origin.h / 2}px`;
  const closeStyle: CSSProperties =
    origin.x < 0
      ? { top: FALLBACK.y, right: 28, width: FALLBACK.w, height: FALLBACK.h }
      : { top: origin.y, left: origin.x, width: origin.w, height: origin.h };
  const item = (i: number) => ({ '--i': i }) as CSSProperties;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            closeRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            trigger.current?.focus();
          }}
          className="mm-panel fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-navy text-white outline-none lg:hidden"
          style={{ '--mm-x': cx, '--mm-y': cy } as CSSProperties}
        >
          <Dialog.Title className="sr-only">{copy.title}</Dialog.Title>

          {/* Texture, and a glow where the panel grew from. */}
          <div aria-hidden className="tech-grid pointer-events-none fixed inset-0 opacity-50" />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            style={{ background: 'radial-gradient(420px circle at var(--mm-x) var(--mm-y), rgba(56,189,248,0.16), transparent 70%)' }}
          />

          {/* Top bar: logo where the header's is, close where the menu button was. */}
          <div
            className="sticky top-0 z-10 flex items-center bg-navy/85 backdrop-blur-md"
            style={{ height: origin.y * 2 + origin.h }}
          >
            <Link
              href={getLocalizedPath('/', locale)}
              onClick={() => setOpen(false)}
              className="ml-7 flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Image src="/assets/logo-white.webp" alt="" width={32} height={32} unoptimized className="h-8 w-8" />
              <span className="font-brand text-sm font-semibold">
                Studio <span className="text-sky-300">Faraj</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label={copy.search}
              onClick={() => {
                setOpen(false);
                setTimeout(onSearchOpen, 360);
              }}
              className="absolute grid h-10 w-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={
                origin.x < 0
                  ? { top: FALLBACK.y, right: 28 + FALLBACK.w + 8 }
                  : { top: origin.y + (origin.h - 40) / 2, left: origin.x - 48 }
              }
            >
              <Search className="h-5 w-5" />
            </button>
            <Dialog.Close
              ref={closeRef}
              aria-label={copy.close}
              className="absolute grid place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={closeStyle}
            >
              <span aria-hidden className="relative h-5 w-5">
                <span className="mm-x mm-x-a" />
                <span className="mm-x mm-x-b" />
              </span>
            </Dialog.Close>
          </div>

          <div className="relative mx-auto max-w-lg pb-10">
            {/* ── Navigation ── */}
            <nav aria-label={copy.title} className="px-7 pt-2">
              <ol className="border-t border-white/10">
                {NAV.map((entry, i) => {
                  const index = String(i + 1).padStart(2, '0');
                  const active = entry.key === 'services' ? onServicePage : isActive(entry.href);

                  if (entry.key === 'services') {
                    return (
                      <li key={entry.key} className="mm-item border-b border-white/10" style={item(i)}>
                        <button
                          type="button"
                          aria-expanded={servicesOpen}
                          aria-controls="mm-services"
                          onClick={() => setServicesOpen((v) => !v)}
                          className="flex w-full items-center gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
                        >
                          <span className={cn('w-6 font-mono text-xs', active ? 'text-sky-300' : 'text-white/40')}>{index}</span>
                          <span className="flex-1 font-display text-[1.7rem] font-bold leading-none tracking-[-0.025em]">
                            {t(entry.key)}
                          </span>
                          <Plus className={cn('h-5 w-5 text-white/70 transition-transform duration-300', servicesOpen && 'rotate-45 text-sky-300')} />
                        </button>
                        <div
                          id="mm-services"
                          inert={!servicesOpen}
                          className={cn(
                            'grid transition-[grid-template-rows] duration-300 ease-out',
                            servicesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                          )}
                        >
                          <div className="overflow-hidden">
                            <ul className="grid grid-cols-2 gap-x-4 pb-4 pl-10">
                              {SERVICES.map((s) => {
                                const current = isActive(s.href);
                                return (
                                  <li key={s.href}>
                                    <Link
                                      href={getLocalizedPath(s.href, locale)}
                                      onClick={() => setOpen(false)}
                                      aria-current={current ? 'page' : undefined}
                                      className={cn(
                                        'flex min-h-[40px] items-center gap-2 text-sm transition-colors',
                                        current ? 'font-semibold text-white' : 'text-white/70 hover:text-white',
                                      )}
                                    >
                                      <span aria-hidden className={cn('h-1 w-1 shrink-0 rounded-full', current ? 'bg-sky-300' : 'bg-white/30')} />
                                      {tServices(`${s.key}.label`)}
                                    </Link>
                                  </li>
                                );
                              })}
                              <li className="col-span-2 mt-1">
                                <Link
                                  href={getLocalizedPath('/servizi', locale)}
                                  onClick={() => setOpen(false)}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200"
                                >
                                  {copy.allServices}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={entry.key} className="mm-item border-b border-white/10" style={item(i)}>
                      <Link
                        href={getLocalizedPath(entry.href, locale)}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className="group flex items-center gap-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
                      >
                        <span className={cn('w-6 font-mono text-xs', active ? 'text-sky-300' : 'text-white/40')}>{index}</span>
                        <span
                          className={cn(
                            'flex-1 font-display text-[1.7rem] font-bold leading-none tracking-[-0.025em] transition-colors',
                            active ? 'text-white' : 'text-white/80 group-hover:text-white',
                          )}
                        >
                          {t(entry.key)}
                        </span>
                        {active ? (
                          <span aria-hidden className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_2px_rgba(56,189,248,0.7)]" />
                        ) : (
                          <ArrowRight
                            aria-hidden
                            className="h-5 w-5 -translate-x-2 text-sky-300 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* ── Who you'd be working with ── */}
            <div className="mm-item mx-7 mt-6 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10" style={item(NAV.length)}>
              <div className="flex items-center gap-3.5">
                <Image
                  src="/assets/hussein-faraj-fondatore-studio-faraj.webp"
                  alt=""
                  width={52}
                  height={52}
                  className="h-[52px] w-[52px] rounded-full object-cover ring-2 ring-white/15"
                />
                <div className="min-w-0">
                  <p className="font-semibold">Hussein Faraj</p>
                  <p className="text-sm text-white/55">{copy.role}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <span aria-hidden className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400/60 motion-reduce:hidden" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {copy.available}
                </li>
                <li className="flex items-center gap-3">
                  <Clock aria-hidden className="h-4 w-4 text-sky-300" />
                  {copy.reply}
                </li>
                {rating && ratingText && (
                  <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span aria-hidden className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn('h-3.5 w-3.5', i < Math.round(rating.value) ? 'fill-amber-400 text-amber-400' : 'text-white/25')}
                        />
                      ))}
                    </span>
                    {ratingText}
                  </li>
                )}
              </ul>
            </div>

            {/* ── Act ── */}
            <div className="mm-item mx-7 mt-4 grid gap-2.5" style={item(NAV.length + 1)}>
              <Link
                href={getLocalizedPath('/inizia', locale)}
                onClick={() => setOpen(false)}
                className="group flex h-14 items-center justify-between rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                {copy.start}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/${locale}/hub/login`}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {copy.clientArea}
                </Link>
                <a
                  href="tel:+393202223322"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Phone aria-hidden className="h-4 w-4 text-sky-300" />
                  {copy.call}
                </a>
              </div>
            </div>

            <p className="mm-item mx-7 mt-6 flex flex-col gap-1 font-mono text-xs text-white/45" style={item(NAV.length + 2)}>
              <a href="mailto:info@studiofaraj.it" className="w-fit transition-colors hover:text-white">
                info@studiofaraj.it
              </a>
              <span>Via Ludovico Ariosto 42, 35128 Padova</span>
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
