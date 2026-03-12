'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, Quote, ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import dynamic from 'next/dynamic';
import type { HeroSlide } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import GradientText from '@/components/GradientText';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { useIsMobile } from '@/hooks/use-mobile';
import { getLocalizedPath } from '@/lib/i18n-helpers';

// Dynamically import QuoteDialog to avoid Turbopack HMR issues with next-intl
const QuoteDialog = dynamic(() => import('@/components/site/quote-dialog').then(mod => ({ default: mod.QuoteDialog })), {
  ssr: false,
});

// Import next-intl hooks normally - they should work after cache clear
import { useTranslations, useLocale } from 'next-intl';


function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Testimonials data - defined outside component to prevent hydration mismatches
const TESTIMONIALS_DATA = [
  {
    name: 'Alessandro Romano',
    company: 'Romano & Associati Studio Legale',
    text: 'Studio Faraj ha creato per noi un sito web istituzionale che riflette perfettamente la professionalità del nostro studio. Il risultato ha superato ogni aspettativa, con un design elegante e funzionalità all\'avanguardia.',
    rating: 5,
    avatar: 'AR',
  },
  {
    name: 'Giulia Ferrara',
    company: 'Famila',
    text: 'Il nostro e-commerce è diventato un vero successo grazie al lavoro di Studio Faraj. Hanno capito perfettamente le nostre esigenze e creato una piattaforma intuitiva che ha aumentato le vendite del 40%.',
    rating: 5,
    avatar: 'GF',
  },
  {
    name: 'Marco De Luca',
    company: 'Accenture',
    text: 'Professionalità, competenza e attenzione ai dettagli. Studio Faraj ha trasformato la nostra presenza digitale con un sito moderno, veloce e ottimizzato per i motori di ricerca. Consigliatissimi!',
    rating: 5,
    avatar: 'MD',
  },
  {
    name: 'Elena Santoro',
    company: 'Foster + Partners',
    text: 'Un team eccezionale che ha saputo tradurre la nostra visione architettonica in un portfolio digitale di grande impatto. Il sito rispecchia perfettamente il nostro stile e ha attirato molti nuovi clienti.',
    rating: 5,
    avatar: 'ES',
  },
  {
    name: 'Francesco Lombardi',
    company: 'La Scala',
    text: 'Il nostro sito web ha completamente rivoluzionato il modo in cui i clienti ci trovano e prenotano. Studio Faraj ha creato un\'esperienza utente fantastica che ha aumentato le prenotazioni online del 60%.',
    rating: 5,
    avatar: 'FL',
  },
  {
    name: 'Sofia Ricci',
    company: 'Virgin Active',
    text: 'Grazie a Studio Faraj abbiamo un sito che comunica perfettamente i nostri valori di benessere e professionalità. L\'interfaccia è intuitiva e il sistema di prenotazione funziona alla perfezione.',
    rating: 5,
    avatar: 'SR',
  },
  {
    name: 'Davide Marino',
    company: 'Immobiliare.it',
    text: 'Studio Faraj ha sviluppato per noi una piattaforma immobiliare completa e funzionale. Il sistema di ricerca avanzato e la gestione delle proprietà hanno semplificato notevolmente il nostro lavoro quotidiano.',
    rating: 5,
    avatar: 'DM',
  },
] as const;

export function TestimonialsSection() {
    const t = useTranslations('home.testimonials');
    // Use stable reference to prevent hydration mismatches
    const testimonials = TESTIMONIALS_DATA;
    return (
        <section className="relative w-full pt-16 sm:pt-24 md:pt-32 lg:pt-40 pb-24 sm:pb-32 md:pb-40 lg:pb-48">
          {/* Constellation Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
          <div className="absolute inset-0 bg-constellation" />

          {/* Floating Shapes - contained so they don't overflow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="floating-shape absolute top-[15%] left-[5%] w-20 h-20 border-2 border-primary/20 rotate-45" style={{ animationDelay: '0s' }} />
            <div className="floating-shape absolute top-[60%] right-[8%] w-16 h-16 border-2 border-primary/15 rounded-full" style={{ animationDelay: '2s' }} />
            <div className="floating-shape absolute bottom-[25%] left-[12%] w-12 h-12 bg-primary/5 rotate-12" style={{ animationDelay: '4s' }} />
          </div>

          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${25 + (i % 2) * 40}%`,
                  animationDelay: `${i * 2}s`
                }}
              />
            ))}
          </div>

          <div className="container relative z-10 px-4 md:px-8">
            <div className="text-center mb-10 md:mb-16">
              <Badge className="badge-futuristic mb-4 md:mb-6">
                <Quote className="w-3 h-3 mr-2" />
                {t('badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                <span className="text-foreground">{t('title')}</span>
                <span className="block text-primary mt-1 md:mt-2">{t('titleHighlight')}</span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
                {t('subtitle')}
              </p>
            </div>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4 py-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
                    <div className="h-full p-1">
                      <Card className="h-full flex flex-col justify-between relative overflow-hidden holographic-card neon-border group transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 md:hover:-translate-y-2">
                        
                        {/* Quote icon with neon glow */}
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 text-primary/20 group-hover:text-primary/40 transition-colors duration-300">
                          <Quote className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        
                        <CardContent className="relative z-10 p-4 md:p-6 flex-grow">
                          {/* Star rating with glow */}
                          <div className="flex mb-3 md:mb-4 gap-1">
                              {Array.from({ length: testimonial.rating }).map((_, i) => (
                                  <StarIcon 
                                    key={i} 
                                    className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" 
                                  />
                              ))}
                          </div>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic line-clamp-6 md:line-clamp-none">
                            &ldquo;{testimonial.text}&rdquo;
                          </p>
                        </CardContent>
                        <CardHeader className="relative z-10 pt-0 border-t border-primary/20 p-4 md:p-6">
                          <div className="flex items-center gap-3">
                            {/* Avatar with neon border */}
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-xs md:text-sm neon-glow">
                              {testimonial.avatar}
                            </div>
                            <div>
                              <CardTitle className="text-sm md:text-base text-primary">
                                {testimonial.name}
                              </CardTitle>
                              <p className="text-xs md:text-sm text-muted-foreground">{testimonial.company}</p>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 neon-border" />
              <CarouselNext className="hidden md:flex -right-12 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 neon-border" />
            </Carousel>
            {/* Mobile swipe indicator */}
            <div className="flex justify-center mt-4 md:hidden">
              <p className="text-xs text-muted-foreground">{t('swipeHint')}</p>
            </div>
          </div>
      </section>
    )
}

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

export function HomepageClient({ heroSlides: heroSlidesProp }: HomepageClientProps = {}) {
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
                  <div className="mb-4 md:mb-6" suppressHydrationWarning>
                    <GradientText 
                      colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                      animationSpeed={4}
                      className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  >
                      {heroSlides[activeSlide].title}
                    </GradientText>
                  </div>
                  
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
