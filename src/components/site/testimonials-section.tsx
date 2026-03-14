'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Quote, Star as StarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

export const TESTIMONIALS_DATA = [
  {
    name: 'Marco Rossi',
    company: 'Tech Solutions S.r.l.',
    text: 'Collaborare con Studio Faraj è stata un\'esperienza eccezionale. Hanno capito fin da subito le nostre esigenze tecniche e hanno consegnato un portale performante e scalabile. La loro padronanza di Next.js e Firebase è impressionante.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Elena Bianchi',
    company: 'Innovazione Digitale',
    text: 'Cercavamo un partner che non solo scrivesse codice, ma che capisse il design. Studio Faraj ha superato le aspettative con un\'interfaccia utente pulita e moderna che ha raddoppiato il nostro tasso di conversione in soli tre mesi.',
    rating: 5,
    avatar: 'EB',
  },
  {
    name: 'Giuseppe Bruno',
    company: 'E-commerce Italia',
    text: 'Professionalità e puntualità sono i loro punti di forza. Hanno gestito la migrazione del nostro shop senza alcun downtime. Il supporto post-lancio è attento e sempre disponibile. Altamente raccomandati!',
    rating: 5,
    avatar: 'GB',
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

export default function TestimonialsSection() {
    const t = useTranslations('home.testimonials');
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
    );
}
