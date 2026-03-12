'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Brain, MessageSquare, Workflow, Cpu, Cog,
  BarChart3, ChevronDown, Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function AiAutomazionePage() {
  const locale = useLocale();
  const t = useTranslations('services.aiAutomation');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Chatbot Intelligenti",
      description: "Assistenti virtuali 24/7 che gestiscono richieste clienti e qualificano lead automaticamente."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Analisi Predittive",
      description: "Algoritmi di machine learning per prevedere trend, comportamenti e ottimizzare decisioni."
    },
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Automazione Processi",
      description: "Workflow automatizzati per ridurre attività ripetitive e aumentare l&apos;efficienza operativa."
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Integrazione LLM",
      description: "Integrazione con GPT-4, Claude e altri modelli per funzionalità avanzate di AI generativa."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Business Intelligence",
      description: "Dashboard intelligenti con insight automatici per decisioni data-driven."
    },
    {
      icon: <Cog className="w-6 h-6" />,
      title: "API & Integrazioni",
      description: "Connessione con i tuoi strumenti esistenti: CRM, ERP, email marketing e altro."
    }
  ];

  const useCases = [
    { title: "Customer Support", description: "Risposte immediate alle domande frequenti" },
    { title: "Lead Generation", description: "Qualificazione automatica dei prospect" },
    { title: "Content Creation", description: "Generazione di contenuti assistita da AI" },
    { title: "Data Analysis", description: "Analisi automatica di grandi dataset" },
    { title: "Email Automation", description: "Sequenze email personalizzate intelligenti" },
    { title: "Inventory Management", description: "Previsioni di stock e riordini automatici" }
  ];

  const benefits = [
    "Riduzione costi operativi fino al 60%",
    "Disponibilità 24/7 senza interruzioni",
    "Scalabilità illimitata",
    "Risposte coerenti e accurate",
    "Analisi in tempo reale",
    "Integrazione con sistemi esistenti"
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#ec4899"
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
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-pink-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-rose-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-pink-500/20 text-pink-400 border-pink-500/30">
              <Bot className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#ec4899', '#f43f5e', '#ec4899']}
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
              {t('subtitle')} <span className="text-pink-400 font-semibold">{t('subtitleHighlight')}</span>{t('subtitleEnd')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group bg-pink-600 hover:bg-pink-700 px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('ctaDiscover')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-pink-500/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', locale)}>{t('ctaDemo')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-pink-500/50" />
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
              <Badge className="badge-futuristic mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Soluzioni
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Il Potere dell&apos;AI</span>
                <span className="block text-pink-400">al Tuo Servizio</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-pink-500/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:bg-pink-500 group-hover:text-white transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-pink-400">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
                <Zap className="w-4 h-4 mr-2" />
                Casi d&apos;Uso
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">Applicazioni</span>
                <span className="block text-pink-400">Pratiche</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((item, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="holographic-card neon-border">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-pink-400 mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
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
                  <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-pink-400">Vantaggi Concreti</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-pink-500 shrink-0" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-background to-rose-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-pink-500/20 text-pink-400 border-pink-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  Inizia Ora
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Pronto a Integrare</span>
                  <span className="block text-pink-400">l&apos;Intelligenza Artificiale?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Scopri come l&apos;AI può trasformare il tuo business. Consulenza gratuita per valutare le tue esigenze.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-pink-600 hover:bg-pink-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      Richiedi Consulenza Gratuita
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-400" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                    Consulenza Gratuita
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
