'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Search, TrendingUp, Target, BarChart3, Globe,
  FileText, Users, ChevronDown, Megaphone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function SeoMarketingPage() {
  const locale = useLocale();
  const t = useTranslations('services.seoMarketing');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "SEO On-Page",
      description: "Ottimizzazione di contenuti, meta tag, struttura URL e performance per i motori di ricerca."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "SEO Off-Page",
      description: "Strategie di link building e digital PR per aumentare l'autorità del tuo dominio."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Content Marketing",
      description: "Creazione di contenuti ottimizzati che attraggono e convertono il tuo pubblico target."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Local SEO",
      description: "Posizionamento locale per attività con presenza fisica sul territorio."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Reporting",
      description: "Monitoraggio KPI con report dettagliati su traffico, conversioni e ROI."
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: "Campagne PPC",
      description: "Gestione campagne Google Ads e social advertising per risultati immediati."
    }
  ];

  const metrics = [
    { value: "+250%", label: "Traffico Organico" },
    { value: "Top 3", label: "Posizionamenti" },
    { value: "+180%", label: "Lead Generati" },
    { value: "4.2x", label: "ROI Medio" }
  ];

  const benefits = [
    "Audit SEO completo del sito",
    "Ricerca keyword approfondita",
    "Ottimizzazione tecnica",
    "Strategia contenuti editoriale",
    "Monitoraggio competitor",
    "Report mensili dettagliati"
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#14b8a6"
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
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-teal-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-cyan-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-teal-500/20 text-teal-400 border-teal-500/30">
              <LineChart className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#14b8a6', '#06b6d4', '#14b8a6']}
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
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group bg-teal-600 hover:bg-teal-700 px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('ctaQuote')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-teal-500/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', locale)}>{t('ctaProjects')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-teal-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="holographic-card neon-border text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
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
              <Badge className="badge-futuristic mb-4 bg-teal-500/20 text-teal-400 border-teal-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Servizi
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Strategie per</span>
                <span className="block text-teal-400">Crescere Online</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-teal-500/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-500 group-hover:text-white transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-teal-400">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollFadeIn animation="fade-up">
              <Card className="holographic-card neon-border overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-teal-400">Cosa Include il Nostro Servizio</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-500 shrink-0" />
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

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-background to-cyan-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-teal-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-teal-500/20 text-teal-400 border-teal-500/30">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Inizia Ora
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Pronto a Scalare le</span>
                  <span className="block text-teal-400">Classifiche Google?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Richiedi un audit SEO gratuito e scopri come migliorare la visibilità del tuo sito.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-teal-600 hover:bg-teal-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      Richiedi Audit Gratuito
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Audit Gratuito
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
