'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronDown, Sparkles, MapPin, Star, Circle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { HeroSlide } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import GradientText from '@/components/GradientText';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { useIsMobile } from '@/hooks/use-mobile';
import { getLocalizedPath } from '@/lib/i18n-helpers';

// Dynamically import QuoteDialog (client-only, no SSR)
const QuoteDialog = dynamic(() => import('@/components/site/quote-dialog'), {
  ssr: false,
});

// Import next-intl hooks normally - they should work after cache clear
import { useTranslations, useLocale } from 'next-intl';


const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'fallback-1',
    title: 'Professionalità Garantita',
    description: 'Un team di esperti dedicati per risultati impeccabili e affidabili.',
    imageUrl: '/assets/studio-faraj-team-sviluppo-web-padova.webp',
    imageHint: 'Team di sviluppo web Studio Faraj al lavoro a Padova',
  },
  {
    id: 'fallback-2',
    title: 'Rispetto delle Scadenze',
    description: 'Consegniamo il tuo progetto in tempo, sempre.',
    imageUrl: '/assets/studio-faraj-progetti-web-consegna-puntuale.webp',
    imageHint: 'Studio Faraj consegna progetti web puntuali nei tempi previsti',
  },
  {
    id: 'fallback-3',
    title: 'Codice Scritto su Misura',
    description: 'Soluzioni uniche e performanti, create specificamente per le tue esigenze.',
    imageUrl: '/assets/studio-faraj-codice-su-misura.webp',
    imageHint: 'Codice software scritto su misura da Studio Faraj',
  },
  {
    id: 'fallback-4',
    title: 'Area Amministrativa Inclusa',
    description: 'Gestisci il tuo sito in autonomia con un pannello di controllo intuitivo.',
    imageUrl: '/assets/studio-faraj-dashboard-gestione-sito.webp',
    imageHint: 'Dashboard di gestione sito web inclusa da Studio Faraj',
  },
];

interface HomepageClientProps {
  heroSlides?: HeroSlide[];
}

export default function HomepageClient({ heroSlides: heroSlidesProp }: HomepageClientProps = {}) {
  const isMobile = useIsMobile();
  const locale = useLocale();
  const t = useTranslations('home.hero');
  const [mounted, setMounted] = useState(false);

  // Ensure consistent initial render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const heroSlides: HeroSlide[] = useMemo(
    () => (heroSlidesProp && heroSlidesProp.length > 0 ? heroSlidesProp : FALLBACK_HERO_SLIDES),
    [heroSlidesProp]
  );
  const isEnglish = locale === 'en';
  const slideTitle = (slide: HeroSlide) =>
    isEnglish && slide.titleEn ? slide.titleEn : slide.title;
  const slideDescription = (slide: HeroSlide) =>
    isEnglish && slide.descriptionEn ? slide.descriptionEn : slide.description;
  const slideDuration = 5000; // 5 seconds

  const [activeSlide, setActiveSlide] = useState(0);
  const [isQuoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
    
    const slideTimeout = setTimeout(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, slideDuration);

    return () => {
      clearTimeout(slideTimeout);
    };
  }, [activeSlide, heroSlides.length, slideDuration]);
  
  // Use false as default during SSR to prevent hydration mismatch
  const isMobileSafe = mounted ? isMobile : false;

  return (
    <>
        <QuoteDialog open={isQuoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
        {/* Hero Section - 2050 Futuristic Design */}
        <section className="relative w-full min-h-screen hero-section-mobile overflow-hidden flex items-center justify-center">
          {/* Background Images — stacked layers crossfade between slides */}
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <div
                  key={slide.id ?? index}
                  className="absolute inset-0"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
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

          {/* Dark Blue Gradient Overlay - stronger on mobile for AAA contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 via-[#0d1f3c]/90 to-background/60 md:to-background/20 z-10" />

          {/* Bottom Fade Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 md:from-background/50 via-transparent to-transparent z-10 pointer-events-none" suppressHydrationWarning />

          {/* Decorative grid overlay (cohesive single texture) */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-30 md:opacity-40 bg-constellation" suppressHydrationWarning />

          {/* Floating Geometric Shapes — desktop only */}
          {mounted && !isMobileSafe && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" suppressHydrationWarning>
              <div className="floating-shape absolute top-[15%] left-[8%] w-28 h-28 md:w-36 md:h-36 border-2 border-primary/30 rotate-45" style={{ animationDelay: '0s' }} />
              <div className="floating-shape absolute top-[55%] right-[10%] w-20 h-20 md:w-28 md:h-28 border-2 border-primary/20 rounded-full" style={{ animationDelay: '2s' }} />
              <div className="floating-shape absolute bottom-[25%] left-[15%] w-14 h-14 md:w-20 md:h-20 bg-primary/10 rotate-12" style={{ animationDelay: '4s' }} />
              <div className="floating-shape absolute top-[35%] right-[20%] w-16 h-16 md:w-24 md:h-24 border border-primary/20 clip-hexagon" style={{ animationDelay: '6s' }} />
              <div className="floating-shape absolute bottom-[40%] right-[30%] w-12 h-12 border-2 border-primary/15 rounded-lg rotate-[30deg]" style={{ animationDelay: '3s' }} />
            </div>
          )}

          {/* Decorative gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[100px] md:blur-[150px] z-10 pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-[80px] md:blur-[120px] z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

          {/* Hero Content */}
          <div className={`relative z-20 container mx-auto flex flex-col justify-center items-center px-5 md:px-8 py-16 md:py-20 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="max-w-4xl text-center w-full">
                  {/* Trust strip — mobile only (compact, builds credibility) */}
                  <div className="flex md:hidden items-center justify-center gap-2 mb-4 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                      </span>
                      {t('trustAvailability')}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {t('trustRating')}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      {t('trustLocation')}
                    </span>
                  </div>

                  {/* Futuristic Badge - desktop / hidden on mobile (replaced by trust strip) */}
                  <div className="hidden md:block mb-4 md:mb-6">
                    <Badge className="badge-futuristic px-4 py-2 text-sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('badge')}
                    </Badge>
                  </div>

                  {/* Animated Gradient Title */}
                  <div
                    key={`title-${activeSlide}`}
                    className="mb-3 md:mb-6 hero-text-in"
                    suppressHydrationWarning
                    aria-hidden="true"
                  >
                    <GradientText
                      colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                      animationSpeed={4}
                      className="text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  >
                      {slideTitle(heroSlides[activeSlide])}
                    </GradientText>
                  </div>

                  {/* Description - clamped on mobile to prevent layout shift on slide change */}
                  <p
                    key={`desc-${activeSlide}`}
                    className="mt-3 md:mt-6 text-[15px] md:text-lg lg:text-xl leading-relaxed text-white max-w-2xl mx-auto px-2 hero-text-in line-clamp-3 md:line-clamp-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    style={{ animationDelay: '180ms' }}
                  >
                      {slideDescription(heroSlides[activeSlide])}
                  </p>

                  {/* CTA stack — mobile: primary button + secondary text link / desktop: two buttons */}
                  <div className="mt-7 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 px-2 md:px-0">
                      <Button
                        size="lg"
                        onClick={() => setQuoteDialogOpen(true)}
                        className="group relative overflow-hidden neon-glow-intense font-semibold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base w-full md:w-auto max-w-[360px] md:max-w-none min-h-[52px] md:min-h-[44px]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {t('ctaQuote')}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>

                      {/* Mobile: subtle text link */}
                      <Link
                        href={getLocalizedPath('/projects', locale as any)}
                        title={t('ctaProjects')}
                        className="md:hidden inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-primary transition-colors mt-1 py-2 min-h-[40px]"
                      >
                        {t('ctaProjects')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {/* Desktop: full secondary button */}
                      <Button
                        size="lg"
                        variant="outline"
                        className="hidden md:inline-flex border-2 border-primary/50 bg-white/10 backdrop-blur-md text-white hover:border-primary hover:text-primary font-semibold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base transition-all duration-300 w-auto min-h-[44px]"
                        asChild
                      >
                          <Link href={getLocalizedPath('/projects', locale as any)} title={t('ctaProjects')}>{t('ctaProjects')}</Link>
                      </Button>
                  </div>

                  {/* Scroll Indicator - desktop only (mobile uses peek of next section) */}
                  <div className="hidden md:flex mt-8 md:mt-10 justify-center">
                    <div className="animate-bounce">
                      <ChevronDown className="w-8 h-8 text-primary/50" />
                    </div>
                  </div>

                  {/* Slide Indicators - desktop dots */}
                  <div className="hidden md:flex items-center justify-center gap-2.5 mt-8 md:mt-10">
                    {heroSlides.map((_, index) => {
                      const isActive = index === activeSlide;
                      return (
                        <button
                          key={index}
                          onClick={() => setActiveSlide(index)}
                          aria-label={`Slide ${index + 1}`}
                          aria-current={isActive ? 'true' : undefined}
                          className="group relative p-1.5 -m-1.5 flex items-center justify-center focus:outline-none focus-visible:outline-none"
                        >
                          <span
                            style={{
                              transition:
                                'width 700ms cubic-bezier(0.22, 1, 0.36, 1), background-color 500ms ease, box-shadow 500ms ease, transform 400ms ease',
                            }}
                            className={`relative block h-[6px] rounded-full overflow-hidden ${
                              isActive
                                ? 'w-9 bg-gradient-to-r from-primary via-primary to-primary/70 shadow-[0_0_14px_-2px_rgba(var(--primary-rgb,59,130,246),0.55),inset_0_1px_0_0_rgba(255,255,255,0.25)]'
                                : 'w-[6px] bg-white/25 group-hover:bg-white/55 group-hover:scale-110'
                            }`}
                          >
                            {isActive && (
                              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
              </div>
          </div>

          {/* Mobile slide progress bar — pinned to bottom edge of hero */}
          <div className="md:hidden absolute bottom-3 left-0 right-0 z-20 px-6">
            <div className="flex items-center justify-center gap-1.5">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className="relative flex-1 max-w-[60px] h-[3px] rounded-full bg-white/15 overflow-hidden"
                >
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70 shadow-[0_0_8px_rgba(var(--primary-rgb,59,130,246),0.55)] ${
                      index === activeSlide
                        ? 'hero-progress-fill'
                        : index < activeSlide
                          ? 'w-full'
                          : 'w-0'
                    }`}
                    key={`fill-${index}-${activeSlide}`}
                  />
                </button>
              ))}
            </div>
          </div>
      </section>
    </>
  )
}
