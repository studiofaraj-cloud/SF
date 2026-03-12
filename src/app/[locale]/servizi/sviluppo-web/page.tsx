'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Code, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Rocket, Globe, Server, Database, Layout,
  Smartphone, Monitor, Lock, Gauge, ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function SviluppoWebPage() {
  const locale = useLocale();
  const t = useTranslations('services.webDevelopment');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <Layout className="w-6 h-6" />,
      title: t('features.customDesign.title'),
      description: t('features.customDesign.description')
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: t('features.mobileFirst.title'),
      description: t('features.mobileFirst.description')
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: t('features.performance.title'),
      description: t('features.performance.description')
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: t('features.security.title'),
      description: t('features.security.description')
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: t('features.cms.title'),
      description: t('features.cms.description')
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: t('features.scalability.title'),
      description: t('features.scalability.description')
    }
  ];

  const technologies = [
    { name: "React / Next.js", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 88 },
    { name: "PostgreSQL / MongoDB", level: 85 },
    { name: "AWS / Vercel", level: 92 },
    { name: "GraphQL / REST API", level: 87 }
  ];

  const process = [
    { step: t('process.steps.discovery.step'), title: t('process.steps.discovery.title'), description: t('process.steps.discovery.description') },
    { step: t('process.steps.design.step'), title: t('process.steps.design.title'), description: t('process.steps.design.description') },
    { step: t('process.steps.development.step'), title: t('process.steps.development.title'), description: t('process.steps.development.description') },
    { step: t('process.steps.testing.step'), title: t('process.steps.testing.title'), description: t('process.steps.testing.description') },
    { step: t('process.steps.deploy.step'), title: t('process.steps.deploy.title'), description: t('process.steps.deploy.description') },
    { step: t('process.steps.support.step'), title: t('process.steps.support.title'), description: t('process.steps.support.description') }
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#3b82f6"
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
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-blue-500/30 rotate-45 hidden sm:block" style={{ animationDelay: '0s' }} />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-cyan-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6">
              <Code className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#3b82f6', '#06b6d4', '#3b82f6']}
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
              {t('subtitle')} <span className="text-primary font-semibold">{t('subtitleHighlight')}</span>{t('subtitleEnd')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group neon-glow px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('ctaQuote')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', locale)}>{t('ctaProjects')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-primary/50" />
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
              <Badge className="badge-futuristic mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('features.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('features.title')}</span>
                <span className="block text-primary">{t('features.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-primary">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollFadeIn animation="fade-right">
              <Badge className="badge-futuristic mb-4">
                <Zap className="w-4 h-4 mr-2" />
                {t('technologies.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">{t('technologies.title')}</span>
                <span className="block text-primary">{t('technologies.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                {t('technologies.subtitle')}
              </p>

              <div className="space-y-6">
                {technologies.map((tech, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{tech.name}</span>
                      <span className="text-primary">{tech.level}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${tech.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn animation="fade-left">
              <Card className="holographic-card neon-border overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-primary">{t('technologies.whyChoose')}</h3>
                  <ul className="space-y-4">
                    {[
                      t('technologies.benefits.0'),
                      t('technologies.benefits.1'),
                      t('technologies.benefits.2'),
                      t('technologies.benefits.3'),
                      t('technologies.benefits.4'),
                      t('technologies.benefits.5')
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4">
                <Rocket className="w-4 h-4 mr-2" />
                {t('process.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('process.title')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary/30 mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold mb-2 text-primary">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-cyan-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6">
                  <Globe className="w-4 h-4 mr-2" />
                  Inizia Ora
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Pronto a Creare il Tuo</span>
                  <span className="block text-primary">Sito Web?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Contattaci per una consulenza gratuita e scopri come possiamo trasformare la tua idea in realtà.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group neon-glow-intense px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      Richiedi Preventivo Gratuito
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
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
