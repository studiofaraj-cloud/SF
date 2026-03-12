'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Server, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Cloud, Globe, Database, Lock, Gauge,
  Activity, ChevronDown, HardDrive
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollFadeIn } from '@/components/site/scroll-fade-in';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

export default function HostingCloudPage() {
  const locale = useLocale();
  const t = useTranslations('services.hostingCloud');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "Performance Elevate",
      description: "Server SSD NVMe con CDN globale per tempi di caricamento ultrarapidi."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Sicurezza Avanzata",
      description: "Certificati SSL, firewall WAF, protezione DDoS e backup automatici."
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Uptime 99.9%",
      description: "Infrastruttura ridondante con monitoraggio 24/7 e failover automatico."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Database Gestiti",
      description: "PostgreSQL, MySQL e MongoDB con backup automatici e scaling."
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Scalabilità Automatica",
      description: "Risorse che si adattano automaticamente al traffico del tuo sito."
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: "Storage Illimitato",
      description: "Spazio di archiviazione scalabile per file, media e backup."
    }
  ];

  const metrics = [
    { value: "99.9%", label: "Uptime Garantito" },
    { value: "<100ms", label: "Latenza Media" },
    { value: "24/7", label: "Monitoraggio" },
    { value: "50+", label: "Edge Locations" }
  ];

  const providers = [
    { name: "Vercel", description: "Deploy istantaneo per Next.js e React" },
    { name: "AWS", description: "Infrastruttura cloud enterprise" },
    { name: "Google Cloud", description: "Servizi cloud scalabili" },
    { name: "Cloudflare", description: "CDN e protezione DDoS" }
  ];

  const benefits = [
    "Setup e migrazione gratuita",
    "Certificato SSL gratuito",
    "Backup giornalieri automatici",
    "CDN globale incluso",
    "Supporto tecnico 24/7",
    "Pannello di controllo intuitivo"
  ];

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <RippleGrid
            gridColor="#6366f1"
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
          <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-indigo-500/30 rotate-45 hidden sm:block" />
          <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-blue-500/20 rounded-full" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="badge-futuristic mb-4 sm:mb-6 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              <Server className="w-4 h-4 mr-2" />
              {t('badge')}
            </Badge>

            <div className="mb-4 sm:mb-6">
              <GradientText 
                colors={['#6366f1', '#3b82f6', '#6366f1']}
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
              <Button size="lg" className="group bg-indigo-600 hover:bg-indigo-700 px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', locale)}>
                  {t('ctaQuote')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-indigo-500/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/projects', locale)}>{t('ctaProjects')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-indigo-500/50" />
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
                    <div className="text-3xl md:text-4xl font-bold text-indigo-400 mb-1">{metric.value}</div>
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
              <Badge className="badge-futuristic mb-4 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Caratteristiche
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Infrastruttura</span>
                <span className="block text-indigo-400">Enterprise-Grade</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className="h-full holographic-card neon-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/20 group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-indigo-400">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollFadeIn animation="fade-right">
              <Badge className="badge-futuristic mb-4 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                <Zap className="w-4 h-4 mr-2" />
                Partner Tecnologici
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">Lavoriamo con i</span>
                <span className="block text-indigo-400">Migliori Provider</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Scegliamo l&apos;infrastruttura più adatta alle tue esigenze, garantendo performance e affidabilità.
              </p>

              <div className="space-y-4">
                {providers.map((provider, index) => (
                  <Card key={index} className="holographic-card neon-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-indigo-400">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn animation="fade-left">
              <Card className="holographic-card neon-border overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-indigo-400">Incluso in Ogni Piano</h3>
                  <ul className="space-y-4">
                    {benefits.map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
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

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-background to-blue-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  Inizia Ora
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Pronto per un Hosting</span>
                  <span className="block text-indigo-400">Senza Pensieri?</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Migrazione gratuita e supporto dedicato. Contattaci per una consulenza personalizzata.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-indigo-600 hover:bg-indigo-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      Richiedi Preventivo Gratuito
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Migrazione Gratuita
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
