'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Target, Users, FileText, Presentation, Compass,
  TrendingUp, ChevronDown, Globe, Lock, CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanRequestDialog } from '@/components/site/plan-request-dialog';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { BookingDialog } from '@/components/site/booking-dialog';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function ConsulenzaPage() {
  const locale = useLocale();
  const t = useTranslations('services.consulting');
  const [heroVisible, setHeroVisible] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <Compass className="w-6 h-6" />,
      title: t('features.strategic.title'),
      description: t('features.strategic.description')
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: t('features.goals.title'),
      description: t('features.goals.description')
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('features.audit.title'),
      description: t('features.audit.description')
    },
    {
      icon: <Presentation className="w-6 h-6" />,
      title: t('features.tech.title'),
      description: t('features.tech.description')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('features.competitor.title'),
      description: t('features.competitor.description')
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('features.growth.title'),
      description: t('features.growth.description')
    }
  ];

  const process = [
    { step: t('process.discovery.step'), title: t('process.discovery.title'), description: t('process.discovery.description') },
    { step: t('process.analysis.step'), title: t('process.analysis.title'), description: t('process.analysis.description') },
    { step: t('process.strategy.step'), title: t('process.strategy.title'), description: t('process.strategy.description') },
    { step: t('process.proposal.step'), title: t('process.proposal.title'), description: t('process.proposal.description') },
    { step: t('process.implementation.step'), title: t('process.implementation.title'), description: t('process.implementation.description') },
    { step: t('process.monitoring.step'), title: t('process.monitoring.title'), description: t('process.monitoring.description') }
  ];

  const areas = Array.from({ length: 8 }, (_, i) => t(`areas.items.${i}`));

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#d946ef"
            rippleIntensity={0.06}
            gridSize={12}
            gridThickness={20}
            fadeDistance={1.2}
            vignetteStrength={1.8}
            glowIntensity={0.15}
            opacity={0.8}
            mouseInteraction={true}
            mouseInteractionRadius={1.5}
            animationSpeed={0.8}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
        
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-fuchsia-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-pink-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
              <Lightbulb className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#d946ef', '#ec4899', '#d946ef']}
                animationSpeed={4}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
              >
                {t('title')}
              </GradientText>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mt-1">
                {t('titleHighlight')}
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('subtitle')} <span className="text-fuchsia-400 font-semibold">{t('subtitleHighlight')}</span>{t('subtitleEnd')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="group bg-fuchsia-600 hover:bg-fuchsia-700 px-8 w-full sm:w-auto"
                onClick={() => setIsBookingDialogOpen(true)}
              >
                {t('ctaCall')}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-fuchsia-500/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/chi-siamo', locale)}>{t('ctaAbout')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-fuchsia-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation opacity-50" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('features.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('features.title')}</span>
                <span className="block text-fuchsia-400">{t('features.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-fuchsia-500/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:bg-fuchsia-500 group-hover:text-white transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-fuchsia-400">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                <Zap className="w-4 h-4 mr-2" />
                {t('process.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">{t('process.title')}</span>
                <span className="block text-fuchsia-400">{t('process.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-fuchsia-500/30 mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold mb-2 text-fuchsia-400">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Areas Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollFadeIn animation="fade-up">
              <Card className="holographic-card neon-border overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-fuchsia-400">{t('areas.title')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {areas.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-fuchsia-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tariffa" className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                <Zap className="w-4 h-4 mr-2" />
                {t('pricing.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">{t('pricing.title')}</span>
                <span className="block text-fuchsia-400">{t('pricing.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="max-w-lg mx-auto">
            <ScrollFadeIn animation="fade-up" delay={100}>
              <Card className="holographic-card neon-border relative border-fuchsia-500/50 border-2 shadow-lg shadow-fuchsia-500/10 !overflow-visible">
                <div className="absolute -top-4 sm:-top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-lg shadow-fuchsia-500/30">
                    {t('pricing.hourlyBadge')}
                  </Badge>
                </div>
                <CardContent className="p-6 sm:p-7 md:p-8 pt-8 sm:pt-9">
                  <div className="text-center mb-6 sm:mb-8">
                    <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground">€{t('pricing.hourlyPrice')}</span>
                    <span className="text-muted-foreground text-lg sm:text-xl ml-1">{t('pricing.unit')}</span>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {Array.from({ length: 6 }, (_, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                        <CheckCircle className="w-5 h-5 text-fuchsia-500 shrink-0 mt-0.5" />
                        <span className="text-foreground/90 leading-relaxed">{t(`pricing.features.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <PlanRequestDialog
                    planName={t('pricing.hourlyBadge')}
                    planPrice={t('pricing.hourlyPrice')}
                    serviceName={t('label')}
                    btnClassName="w-full h-11 sm:h-12 md:h-14 text-sm sm:text-base font-semibold bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-xl hover:shadow-fuchsia-500/40 transition-all duration-300"
                    btnLabel={t('pricing.button')}
                  />
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium opacity-80">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('pricing.securePayment')}</span>
                    <CreditCard className="w-3.5 h-3.5 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 via-background to-pink-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('cta.badge')}
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">{t('cta.title')}</span>
                  <span className="block text-fuchsia-400">{t('cta.titleHighlight')}</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  {t('cta.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="group bg-fuchsia-600 hover:bg-fuchsia-700 px-8 w-full sm:w-auto"
                    onClick={() => setIsBookingDialogOpen(true)}
                  >
                    {t('cta.button')}
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-fuchsia-400" />
                    {t('cta.freeMinutes')}
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                    {t('cta.noCommitment')}
                  </span>
                </div>
              </div>
            </Card>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Booking Dialog */}
      <BookingDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen} />
    </div>
  );
}
