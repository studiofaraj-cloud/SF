'use client';

import React, { useEffect, useState } from 'react';
import { Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BookingDialog } from './booking-dialog';

const PHONE_HREF = 'tel:+393202223322';
const PHONE_LABEL = '320 222 33 22';
const EMAIL_HREF = 'mailto:info@studiofaraj.it';

/**
 * Mobile-only quick contact strip + sticky bottom action bar.
 * - Strip: 3 tappable tiles (Call / Email / Book a call) inserted between hero and form.
 * - Sticky bar: thin pinned bar with Call + Email, appears after the user scrolls
 *   past the hero, hides when the form has focus (keyboard up).
 * Hidden on `sm:` and up — desktop already exposes these channels.
 */
export default function ContattiQuickStrip() {
  const t = useTranslations('contact');
  const tHero = useTranslations('contactPage.hero');
  const [stickyVisible, setStickyVisible] = useState(false);
  const [formFocused, setFormFocused] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show sticky bar after the user has scrolled past ~60% of viewport (past hero)
      const threshold = window.innerHeight * 0.6;
      setStickyVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Hide sticky when any input/textarea inside the contact form is focused
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('#contact-section-form')) setFormFocused(true);
    };
    const onBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('#contact-section-form')) setFormFocused(false);
    };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  const tiles = [
    {
      key: 'call',
      icon: <Phone className="w-5 h-5" />,
      label: tHero('callUs'),
      sub: PHONE_LABEL,
      href: PHONE_HREF,
      onClick: undefined,
    },
    {
      key: 'email',
      icon: <Mail className="w-5 h-5" />,
      label: t('methods.email.title'),
      sub: t('methods.email.metric'),
      href: EMAIL_HREF,
      onClick: undefined,
    },
    {
      key: 'book',
      icon: <Calendar className="w-5 h-5" />,
      label: t('bookCall'),
      sub: t('trust.freeConsultation'),
      href: undefined,
      onClick: () => setBookingOpen(true),
    },
  ];

  const showSticky = stickyVisible && !formFocused;

  return (
    <>
      {/* 3-up tile strip — mobile only */}
      <section className="sm:hidden relative -mt-6 px-4 pb-2 z-30">
        <div className="grid grid-cols-3 gap-2.5">
          {tiles.map((tile) => {
            const inner = (
              <>
                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-active:bg-primary/20 transition-colors">
                  {tile.icon}
                </span>
                <span className="text-[13px] font-semibold text-foreground leading-tight">
                  {tile.label}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 leading-tight truncate w-full text-center">
                  {tile.sub}
                </span>
              </>
            );
            const className =
              'group relative flex flex-col items-center justify-center text-center min-h-[88px] rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-2 py-3 active:scale-[0.97] transition-transform shadow-sm';

            return tile.href ? (
              <a key={tile.key} href={tile.href} className={className} aria-label={tile.label}>
                {inner}
              </a>
            ) : (
              <button
                key={tile.key}
                type="button"
                onClick={tile.onClick}
                className={className}
                aria-label={tile.label}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticky bottom action bar — mobile only */}
      <div
        aria-hidden={!showSticky}
        className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 pointer-events-none transition-all duration-300 ${
          showSticky ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="pointer-events-auto mx-auto max-w-md flex items-stretch gap-2 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-md shadow-xl shadow-black/10 p-2">
          <a
            href={PHONE_HREF}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm py-3 active:scale-[0.98] transition-transform shadow-md shadow-primary/30"
          >
            <Phone className="w-4 h-4" />
            {tHero('callUs')}
          </a>
          <a
            href={EMAIL_HREF}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 text-foreground font-semibold text-sm py-3 active:scale-[0.98] transition-transform"
          >
            <Mail className="w-4 h-4" />
            {t('methods.email.title')}
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </div>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
}
