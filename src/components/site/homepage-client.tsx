'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
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
    imageUrl: '/assets/hero-1.jpg',
    imageHint: 'professional workspace',
  },
  {
    id: 'fallback-2',
    title: 'Rispetto delle Scadenze',
    description: 'Consegniamo il tuo progetto in tempo, sempre.',
    imageUrl: '/assets/hero-2.jpg',
    imageHint: 'clock deadline',
  },
  {
    id: 'fallback-3',
    title: 'Codice Scritto su Misura',
    description: 'Soluzioni uniche e performanti, create specificamente per le tue esigenze.',
    imageUrl: '/assets/hero-3.png',
    imageHint: 'abstract code',
  },
  {
    id: 'fallback-4',
    title: 'Area Amministrativa Inclusa',
    description: 'Gestisci il tuo sito in autonomia con un pannello di controllo intuitivo.',
    imageUrl: '/assets/hero-4.jpg',
    imageHint: 'dashboard ui',
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
          {/* Dark Blue Aligned Background Image */}
          <div className="absolute inset-0 z-0">
            <FirebaseImage
              src={heroSlides[activeSlide].imageUrl}
              alt={heroSlides[activeSlide].imageHint}
              fill
              priority
              className="object-cover transition-all duration-1000"
              data-ai-hint={heroSlides[activeSlide].imageHint}
            />
          </div>
          
          {/* Dark Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 via-[#0d1f3c]/90 to-background/20 z-10" />
          
          {/* Bottom Fade Overlay - 50% transparency */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent z-10 pointer-events-none" suppressHydrationWarning />
          
          {/* Floating Geometric Shapes - Reduced on mobile */}
          {/* Use mounted check to prevent hydration mismatch */}
          {mounted && !isMobileSafe && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" suppressHydrationWarning>
              <div className="floating-shape absolute top-[15%] left-[8%] w-28 h-28 md:w-36 md:h-36 border-2 border-primary/30 rotate-45" style={{ animationDelay: '0s' }} />
              <div className="floating-shape absolute top-[55%] right-[10%] w-20 h-20 md:w-28 md:h-28 border-2 border-primary/20 rounded-full" style={{ animationDelay: '2s' }} />
              <div className="floating-shape absolute bottom-[25%] left-[15%] w-14 h-14 md:w-20 md:h-20 bg-primary/10 rotate-12" style={{ animationDelay: '4s' }} />
              <div className="floating-shape absolute top-[35%] right-[20%] w-16 h-16 md:w-24 md:h-24 border border-primary/20 clip-hexagon" style={{ animationDelay: '6s' }} />
              <div className="floating-shape absolute bottom-[40%] right-[30%] w-12 h-12 border-2 border-primary/15 rounded-lg rotate-[30deg]" style={{ animationDelay: '3s' }} />
            </div>
          )}
          {/* Mobile: Show only 1-2 simple shapes */}
          {mounted && isMobileSafe && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" suppressHydrationWarning>
              <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 border-2 border-primary/20 rotate-45" style={{ animationDelay: '0s' }} />
              <div className="floating-shape absolute bottom-[30%] right-[15%] w-16 h-16 border-2 border-primary/15 rounded-full" style={{ animationDelay: '2s' }} />
            </div>
          )}
          
          {/* Decorative gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[100px] md:blur-[150px] z-10 pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-[80px] md:blur-[120px] z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
          
          {/* Hero Content */}
          <div className={`relative z-20 container mx-auto flex flex-col justify-center items-center px-4 md:px-8 py-20 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="max-w-4xl text-center">
                  {/* Futuristic Badge */}
                  <div className="mb-4 md:mb-6">
                    <Badge className="badge-futuristic px-4 py-2 text-sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('badge')}
                    </Badge>
                  </div>
                  
                  {/* Animated Gradient Title */}
                  <p className="mb-4 md:mb-6" suppressHydrationWarning aria-hidden="true">
                    <GradientText
                      colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                      animationSpeed={4}
                      className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  >
                      {heroSlides[activeSlide].title}
                    </GradientText>
                  </p>
                  
                  {/* Description */}
                  <p 
                    key={`desc-${activeSlide}`} 
                    className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto px-2 animate-fade-in-from-right" 
                    style={{ animationDelay: '0.3s' }}
                  >
                      {heroSlides[activeSlide].description}
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 px-4 md:px-0">
                      <Button 
                        size="lg" 
                        onClick={() => setQuoteDialogOpen(true)}
                        className="group relative overflow-hidden neon-glow-intense font-semibold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base w-auto max-w-[280px] md:w-auto min-h-[44px]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {t('ctaQuote')}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-2 border-primary/50 bg-white/10 backdrop-blur-md text-white hover:border-primary hover:text-primary font-semibold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base transition-all duration-300 w-auto max-w-[280px] md:w-auto min-h-[44px]" 
                        asChild
                      >
                          <Link href={getLocalizedPath('/projects', locale as any)}>{t('ctaProjects')}</Link>
                      </Button>
                  </div>
                  
                  {/* Scroll Indicator - Positioned below buttons */}
                  <div className="mt-8 md:mt-10 flex justify-center">
                    <div className="animate-bounce-slow md:animate-bounce">
                      <ChevronDown className="w-8 h-8 text-primary/50" />
                    </div>
                  </div>
                  
                  {/* Slide Indicators - Positioned at the bottom */}
                  <div className="flex items-center justify-center gap-2.5 md:gap-2 mt-8 md:mt-10">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Slide ${index + 1}`}
                        className="relative p-1.5 md:p-0 -m-1.5 md:m-0 flex items-center justify-center"
                      >
                        <span
                          className={`block h-2.5 md:h-2 rounded-full transition-all duration-700 ease-in-out ${
                            index === activeSlide
                              ? 'w-10 md:w-8 bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb,59,130,246),0.5)]'
                              : 'w-2.5 md:w-2 bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
              </div>
          </div>
      </section>
    </>
  )
}
