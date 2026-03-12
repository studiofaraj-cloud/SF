'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Palette, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Eye, Smartphone, Monitor, Layers, PenTool,
  MousePointer2, Figma, ChevronDown, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function DesignUiUxPage() {
  const locale = useLocale();
  const t = useTranslations('services.designUIUX');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "UI Design",
      description: "Interfacce visivamente accattivanti che catturano l&apos;attenzione e comunicano il tuo brand."
    },
    {
      icon: <MousePointer2 className="w-6 h-6" />,
      title: "UX Research",
      description: "Analisi approfondita degli utenti per creare esperienze intuitive e coinvolgenti."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Design Responsivo",
      description: "Layout che si adattano perfettamente a qualsiasi dispositivo e risoluzione."
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Design System",
      description: "Creazione di sistemi di design scalabili per garantire coerenza visiva."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Prototipazione",
      description: "Prototipi interattivi per testare e validare le idee prima dello sviluppo."
    },
    {
      icon: <Figma className="w-6 h-6" />,
      title: "Handoff Sviluppo",
      description: "Consegna organizzata con specifiche dettagliate per gli sviluppatori."
    }
  ];

  const process = [
    { step: "01", title: "Discovery", description: "Analisi del brand, competitor e target audience" },
    { step: "02", title: "Wireframing", description: "Struttura e architettura dell'informazione" },
    { step: "03", title: "Visual Design", description: "Creazione dell'identità visiva dell'interfaccia" },
    { step: "04", title: "Prototipo", description: "Versione interattiva per test e validazione" },
    { step: "05", title: "User Testing", description: "Feedback reali per ottimizzare l'esperienza" },
    { step: "06", title: "Delivery", description: "Consegna file e documentazione completa" }
  ];

  const benefits = [
    "Aumento dell'engagement utente",
    "Riduzione del bounce rate",
    "Miglioramento delle conversioni",
    "Brand identity coerente",
    "Accessibilità WCAG 2.1",
    "Micro-interazioni animate"
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#8b5cf6"
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
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-violet-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-purple-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-violet-500/20 text-violet-400 border-violet-500/30">
              <Palette className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#8b5cf6', '#a855f7', '#8b5cf6']}
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
              <Button size="lg" className="group bg-violet-600 hover:bg-violet-700 px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('ctaQuote')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-violet-500/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', locale)}>{t('ctaProjects')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-violet-500/50" />
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
              <Badge className="badge-futuristic mb-4 bg-violet-500/20 text-violet-400 border-violet-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Servizi
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Design che</span>
                <span className="block text-violet-400">Fa la Differenza</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-violet-400">{feature.title}</h3>
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
              <Badge className="badge-futuristic mb-4 bg-violet-500/20 text-violet-400 border-violet-500/30">
                <Zap className="w-4 h-4 mr-2" />
                Processo
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">Il Nostro Approccio</span>
                <span className="block text-violet-400">al Design</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-violet-500/30 mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold mb-2 text-violet-400">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollFadeIn animation="fade-up">
              <Card className="holographic-card neon-border overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-violet-400">Risultati Garantiti</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-violet-500 shrink-0" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-background to-purple-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-violet-500/20 text-violet-400 border-violet-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  Inizia Ora
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Pronto a Migliorare la Tua</span>
                  <span className="block text-violet-400">User Experience?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Contattaci per una consulenza gratuita e scopri come il design può trasformare il tuo business.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-violet-600 hover:bg-violet-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      Richiedi Preventivo Gratuito
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    Preventivo Gratuito
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
