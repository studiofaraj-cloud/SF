'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wrench, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, RefreshCw, Bug, Gauge, Server, Shield,
  HeadphonesIcon, ChevronDown, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function ManutenzionePage() {
  const locale = useLocale();
  const t = useTranslations('services.maintenance');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Aggiornamenti Regolari",
      description: "Manteniamo CMS, plugin e dipendenze sempre aggiornati per sicurezza e performance."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sicurezza Proattiva",
      description: "Monitoraggio costante delle vulnerabilità e implementazione patch di sicurezza."
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "Ottimizzazione Performance",
      description: "Analisi e miglioramento continuo della velocità e dei Core Web Vitals."
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Backup Automatici",
      description: "Backup giornalieri con retention di 30 giorni e ripristino rapido in caso di problemi."
    },
    {
      icon: <Bug className="w-6 h-6" />,
      title: "Bug Fixing",
      description: "Risoluzione rapida di bug e problemi tecnici con priorità basata sulla severità."
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" />,
      title: "Supporto Dedicato",
      description: "Team di supporto disponibile via email, ticket system e telefono."
    }
  ];

  const plans = [
    {
      name: "Essential",
      price: "149",
      features: [
        "Aggiornamenti mensili",
        "Backup settimanali",
        "Monitoraggio uptime",
        "Supporto email",
        "2 ore intervento/mese"
      ]
    },
    {
      name: "Professional",
      price: "299",
      popular: true,
      features: [
        "Aggiornamenti settimanali",
        "Backup giornalieri",
        "Monitoraggio sicurezza",
        "Supporto prioritario",
        "5 ore intervento/mese",
        "Ottimizzazione performance"
      ]
    },
    {
      name: "Enterprise",
      price: "599",
      features: [
        "Aggiornamenti in tempo reale",
        "Backup in tempo reale",
        "Security audit trimestrale",
        "Supporto 24/7",
        "Ore illimitate",
        "Account manager dedicato"
      ]
    }
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#f97316"
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
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-orange-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-amber-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Wrench className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#f97316', '#f59e0b', '#f97316']}
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
              {t('subtitle')} 
              <span className="text-orange-400 font-semibold">{t('subtitleHighlight')}</span>{t('subtitleEnd')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group bg-orange-600 hover:bg-orange-700 px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('ctaSupport')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-orange-500/50 w-full sm:w-auto" asChild>
                <Link href="#piani">{t('ctaPlans')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-orange-500/50" />
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
              <Badge className="badge-futuristic mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('features.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('features.title')}</span>
                <span className="block text-orange-400">{t('features.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-orange-400">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="piani" className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Zap className="w-4 h-4 mr-2" />
                Piani
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">Scegli il Piano</span>
                <span className="block text-orange-400">Adatto a Te</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className={`holographic-card neon-border relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 ${
                  plan.popular 
                    ? 'border-orange-500/50 border-2 shadow-lg shadow-orange-500/10 md:scale-105 pt-4 sm:pt-5' 
                    : 'border-primary/20 hover:border-orange-500/30'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 sm:-top-3 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/30">
                        Più Popolare
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-7 md:p-8 flex flex-col flex-1">
                    <div className="mb-4 sm:mb-5">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400 mb-3 sm:mb-4">{plan.name}</h3>
                      <div className="mb-6 sm:mb-8">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">€{plan.price}</span>
                        <span className="text-muted-foreground text-base sm:text-lg ml-1">/mese</span>
                      </div>
                    </div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                          <CheckCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                          <span className="text-foreground/90 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full h-11 sm:h-12 md:h-14 text-sm sm:text-base font-semibold transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40' 
                          : 'border-2 border-primary/30 hover:border-orange-500/50 hover:bg-orange-500/10 text-foreground bg-background'
                      }`} 
                      variant={plan.popular ? 'default' : 'outline'} 
                      asChild
                    >
                      <Link href={getLocalizedPath('/contatti', locale)}>
                        Scegli {plan.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-background to-amber-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  Contattaci
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Hai Bisogno di</span>
                  <span className="block text-orange-400">Assistenza?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Il nostro team è pronto ad aiutarti. Contattaci per una valutazione gratuita del tuo sito.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-orange-600 hover:bg-orange-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      Richiedi Supporto
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    Valutazione Gratuita
                  </span>
                </div>
              </div>
            </Card>
          </ScrollFadeIn>
        </div>
      </section>
    </div>
  );
}
