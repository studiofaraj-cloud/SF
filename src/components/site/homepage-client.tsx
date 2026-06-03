'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown, MapPin, Star } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { FirebaseImage } from '@/components/ui/firebase-image';
import type { HeroSlide } from '@/lib/definitions';

// Words that cycle as the H1's final accent.
const CYCLING_WORDS_IT = ['crescono', 'convertono', 'scalano', 'ispirano'];
const CYCLING_WORDS_EN = ['grow', 'convert', 'scale', 'inspire'];
const CYCLE_INTERVAL_MS = 2400;

// Crossfade interval for background slide images (admin-editable via dashboard).
const SLIDE_INTERVAL_MS = 6000;

// Fallback slides used if the admin hasn't configured any in the dashboard.
const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'fallback-1',
    title: 'Professionalità Garantita',
    description: '',
    imageUrl: '/assets/studio-faraj-team-sviluppo-web-padova.webp',
    imageHint: 'Team di sviluppo web Studio Faraj al lavoro a Padova',
  },
  {
    id: 'fallback-2',
    title: 'Rispetto delle Scadenze',
    description: '',
    imageUrl: '/assets/studio-faraj-progetti-web-consegna-puntuale.webp',
    imageHint: 'Studio Faraj consegna progetti web puntuali nei tempi previsti',
  },
  {
    id: 'fallback-3',
    title: 'Codice Scritto su Misura',
    description: '',
    imageUrl: '/assets/studio-faraj-codice-su-misura.webp',
    imageHint: 'Codice software scritto su misura da Studio Faraj',
  },
  {
    id: 'fallback-4',
    title: 'Area Amministrativa Inclusa',
    description: '',
    imageUrl: '/assets/studio-faraj-dashboard-gestione-sito.webp',
    imageHint: 'Dashboard di gestione sito web inclusa da Studio Faraj',
  },
];

// Dynamically import QuoteDialog (client-only, no SSR) — kept for the "richiedi preventivo" path.
const QuoteDialog = dynamic(() => import('@/components/site/quote-dialog'), { ssr: false });

// Note: the `heroSlides` prop is kept (optional) for backwards-compatibility with the
// page composition; the new editorial hero does not render slides. The admin slide
// editor remains in place for now and can be retired in a follow-up.
interface HomepageClientProps {
  heroSlides?: HeroSlide[];
}

export default function HomepageClient({ heroSlides }: HomepageClientProps = {}) {
  const t = useTranslations('home.hero');
  const locale = useLocale();
  const en = locale === 'en';

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : FALLBACK_HERO_SLIDES;

  const [mounted, setMounted] = useState(false);
  const [isQuoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const words = en ? CYCLING_WORDS_EN : CYCLING_WORDS_IT;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx((i) => (i + 1) % words.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <>
      <QuoteDialog open={isQuoteDialogOpen} onOpenChange={setQuoteDialogOpen} />

      {/* Hero — editorial statement with crossfading background images */}
      <section className="relative w-full min-h-[100svh] hero-section-mobile overflow-hidden flex items-center justify-center">
        {/* Layer 0: crossfading admin-editable slide images */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;
            return (
              <div
                key={slide.id ?? index}
                className="absolute inset-0"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                aria-hidden={!isActive}
              >
                <div
                  key={isActive ? `kb-${activeSlide}` : `idle-${index}`}
                  className={`absolute inset-0 ${isActive ? 'hero-kenburns' : ''}`}
                >
                  <FirebaseImage
                    src={slide.imageUrl}
                    alt={slide.imageHint}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    data-ai-hint={slide.imageHint}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Layer 1: dark overlay so the editorial text stays legible while the photo still shows
            through. Inline gradient on purpose — Tailwind's opacity modifier on arbitrary-hex
            gradient stops (`from-[#0a1628]/92`) silently fails to generate, which left the hero
            with no scrim at all and washed-out white text. */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to bottom, rgba(10,22,40,0.82) 0%, rgba(13,31,60,0.64) 45%, rgba(10,22,40,0.88) 100%)' }}
          suppressHydrationWarning
        />
        <div className="absolute inset-0 z-10 opacity-25 md:opacity-35 bg-constellation pointer-events-none" suppressHydrationWarning />

        {/* Bottom fade — soft faded white at the very base, kept short so it dissolves the hero
            edge into the section below without sitting behind the white trust strip / scroll cue */}
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 z-10 bg-gradient-to-t from-white/50 via-white/15 to-transparent pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute -top-24 left-1/4 w-72 h-72 md:w-[480px] md:h-[480px] bg-primary/25 rounded-full blur-[120px] z-10 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 md:w-96 md:h-96 bg-sky-400/15 rounded-full blur-[100px] z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-32 h-32 md:w-48 md:h-48 bg-primary/10 rounded-full blur-[80px] z-10 pointer-events-none" />

        {/* Floating decorative shapes — desktop only */}
        {mounted && (
          <div className="hidden md:block absolute inset-0 z-10 pointer-events-none overflow-hidden" suppressHydrationWarning>
            <div className="floating-shape absolute top-[18%] left-[7%] w-28 h-28 border-2 border-primary/30 rotate-45" style={{ animationDelay: '0s' }} />
            <div className="floating-shape absolute top-[60%] right-[9%] w-20 h-20 border-2 border-primary/20 rounded-full" style={{ animationDelay: '2s' }} />
            <div className="floating-shape absolute bottom-[18%] left-[14%] w-14 h-14 bg-primary/10 rotate-12" style={{ animationDelay: '4s' }} />
            <div className="floating-shape absolute top-[35%] right-[18%] w-16 h-16 border border-primary/20 clip-hexagon" style={{ animationDelay: '6s' }} />
          </div>
        )}

        {/* Content */}
        <div className="relative z-20 container mx-auto px-5 md:px-8 py-20 md:py-24 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Since badge */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <Badge className="badge-futuristic px-4 py-2 text-sm gap-2">
                <span>{t('since')}</span>
                <span className="opacity-50">·</span>
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{t('trustLocation')}</span>
              </Badge>
            </div>

            {/* Editorial H1 — short statement, cycling accent on the final word */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold tracking-tight leading-[1.05]"
              style={{ color: '#ffffff' }}
              suppressHydrationWarning
            >
              <span className="block">{en ? 'We build sites that' : 'Costruiamo siti che'}</span>
              <span
                className="relative block mt-2 md:mt-4"
                style={{ overflow: 'hidden', paddingBottom: '0.12em' }}
              >
                {/* Key change re-mounts the span so the CSS animation re-runs.
                    Replaces a framer-motion AnimatePresence — same entrance
                    behavior, no JS bundle cost beyond a className. */}
                <span
                  key={words[wordIdx]}
                  className="brand-wordmark inline-block animate-word-rise"
                >
                  {words[wordIdx]}.
                </span>
              </span>
            </h1>

            {/* CTAs */}
            <div className="mt-14 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
              <Button
                asChild
                size="lg"
                className="group neon-glow-intense font-semibold px-7 md:px-9 py-5 md:py-6 text-sm md:text-base w-full sm:w-auto min-h-[52px] md:min-h-[52px]"
              >
                <Link href={`/${locale}/inizia`} title={t('ctaStart')}>
                  <span className="flex items-center justify-center gap-2">
                    {t('ctaStart')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary/50 bg-white/10 backdrop-blur-md text-white hover:border-primary hover:text-primary font-semibold px-7 md:px-9 py-5 md:py-6 text-sm md:text-base transition-all duration-300 w-full sm:w-auto min-h-[52px] md:min-h-[52px]"
              >
                <Link href={getLocalizedPath('/projects', locale as any)} title={t('ctaProjects')}>
                  {t('ctaProjects')}
                </Link>
              </Button>
            </div>

            {/* Subtle "or request a quote" link — keeps the lead-capture path */}
            <button
              type="button"
              onClick={() => setQuoteDialogOpen(true)}
              className="mt-7 md:mt-9 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-primary transition-colors"
            >
              {en ? 'Or request a quote' : 'Oppure richiedi un preventivo'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Trust strip */}
            <div className="mt-14 md:mt-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs md:text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                {t('trustAvailability')}
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {t('trustRatingFull')}
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-semibold text-white">{t('trustProjects')}</span>
              </span>
            </div>

            {/* Scroll cue — desktop only */}
            <div className="hidden md:flex mt-16 lg:mt-20 justify-center">
              <div className="animate-bounce">
                <ChevronDown className="w-7 h-7 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
