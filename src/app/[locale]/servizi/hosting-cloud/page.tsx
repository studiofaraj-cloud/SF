'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Server, CheckCircle, ArrowRight, Sparkles, Zap, Clock,
  ShieldCheck, Cloud, Globe, Database, Lock, Gauge,
  Activity, ChevronDown, HardDrive, AlertTriangle, Search, XCircle, CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanRequestDialog } from '@/components/site/plan-request-dialog';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
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
    { icon: <Gauge className="w-6 h-6" />, key: 'performance' },
    { icon: <Lock className="w-6 h-6" />, key: 'security' },
    { icon: <Activity className="w-6 h-6" />, key: 'uptime' },
    { icon: <Database className="w-6 h-6" />, key: 'databases' },
    { icon: <Cloud className="w-6 h-6" />, key: 'scaling' },
    { icon: <HardDrive className="w-6 h-6" />, key: 'storage' },
  ];

  const metricKeys = ['uptime', 'latency', 'monitoring', 'edge'] as const;

  const providerKeys = ['vercel', 'aws', 'googleCloud', 'cloudflare'] as const;

  const nonIndexedExamples = [
    "progetto.lovable.app",
    "progetto.web.app",
    "negozio.myshopify.com",
    "sito.netlify.app",
    "progetto.vercel.app"
  ];

  const hostingPlans = [
    { key: 'starter', price: '59', featureCount: 5 },
    { key: 'business', price: '99', popular: true, featureCount: 6 },
    { key: 'pro', price: '179', featureCount: 7 },
  ];

  const benefitCount = 6;

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] min-h-[80svh] flex items-center justify-center overflow-hidden">
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
            {metricKeys.map((key, index) => (
              <ScrollFadeIn key={key} animation="fade-up" delay={index * 100}>
                <Card className="holographic-card neon-border text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl md:text-4xl font-bold text-indigo-400 mb-1">{t(`metrics.${key}.value`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`metrics.${key}.label`)}</div>
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
                {t('features.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('features.title')}</span>
                <span className="block text-indigo-400">{t('features.titleHighlight')}</span>
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
                    <h3 className="text-xl font-bold mb-2 text-indigo-400">{t(`features.${feature.key}.title`)}</h3>
                    <p className="text-muted-foreground">{t(`features.${feature.key}.description`)}</p>
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
                {t('providers.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">{t('providers.title')}</span>
                <span className="block text-indigo-400">{t('providers.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                {t('providers.subtitle')}
              </p>

              <div className="space-y-4">
                {providerKeys.map((key, index) => (
                  <Card key={key} className="holographic-card neon-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-indigo-400">{t(`providers.${key}.name`)}</h4>
                        <p className="text-sm text-muted-foreground">{t(`providers.${key}.description`)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn animation="fade-left">
              <Card className="holographic-card neon-border overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-indigo-400">{t('benefits.title')}</h3>
                  <ul className="space-y-4">
                    {Array.from({ length: benefitCount }, (_, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                        <span>{t(`benefits.items.${index}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Domain & Indexing Problem Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation opacity-50" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <ScrollFadeIn animation="fade-right">
                <Badge className="badge-futuristic mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('domain.badge')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  <span className="text-foreground">{t('domain.title')}</span>
                  <span className="block text-amber-400">{t('domain.titleHighlight')}</span>
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t('domain.description1')} <span className="font-semibold text-foreground">{t('domain.description1Highlight')}</span> {t('domain.description1End')}
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('domain.description2')} <span className="text-indigo-400 font-semibold">{t('domain.description2Highlight')}</span> {t('domain.description2End')}
                </p>
              </ScrollFadeIn>

              <ScrollFadeIn animation="fade-up" className="pt-5 mt-2">
                <Card className="neon-border border-indigo-500/50 border-2 overflow-visible relative bg-card/80 backdrop-blur-sm">
                  <div className="absolute -top-4 sm:-top-3 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 !text-white px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30">
                      {t('domain.setupBadge')}
                    </Badge>
                  </div>
                  <CardContent className="p-6 sm:p-8 pt-8 sm:pt-9">
                    <div className="text-center mb-5">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">€{t('domain.setupPrice')}</span>
                      <span className="text-muted-foreground text-base sm:text-lg ml-1">{t('domain.setupUnit')}</span>
                    </div>
                    <ul className="space-y-3">
                      {Array.from({ length: 6 }, (_, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                          <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="text-foreground/90 leading-relaxed">{t(`domain.setupFeatures.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <PlanRequestDialog
                      planName={t('domain.setupBadge')}
                      planPrice={t('domain.setupPrice')}
                      serviceName={t('label')}
                      btnClassName="w-full mt-6 h-12 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300"
                      btnLabel={t('domain.setupButton')}
                    />
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            </div>

            <ScrollFadeIn animation="fade-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-mono">google.com</span>
                </div>
                {nonIndexedExamples.map((url, index) => (
                  <Card key={index} className="holographic-card neon-border border-red-500/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-red-400 truncate">{url}</p>
                        <p className="text-xs text-muted-foreground">{t('domain.notIndexedLabel')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="holographic-card neon-border border-green-500/30 mt-4">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-green-400 truncate">{t('domain.indexedDomain')}</p>
                      <p className="text-xs text-muted-foreground">{t('domain.indexedLabel')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Cloud Hosting Plans Section */}
      <section id="piani" className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/50" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                <Cloud className="w-4 h-4 mr-2" />
                {t('plans.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">{t('plans.title')}</span>
                <span className="block text-indigo-400">{t('plans.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('plans.subtitle')}
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {hostingPlans.map((plan, index) => (
              <ScrollFadeIn key={plan.key} animation="fade-up" delay={index * 100}>
                <Card className={`holographic-card neon-border relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 ${
                  plan.popular
                    ? 'border-indigo-500/50 border-2 shadow-lg shadow-indigo-500/10 md:scale-105 pt-4 sm:pt-5 !overflow-visible'
                    : 'border-primary/20 hover:border-indigo-500/30'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 sm:-top-3 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 !text-white px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30">
                        {t('plans.popularBadge')}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-7 md:p-8 flex flex-col flex-1">
                    <div className="mb-4 sm:mb-5">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-400 mb-2">{t(`plans.${plan.key}.name`)}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{t(`plans.${plan.key}.traffic`)}</p>
                      <div className="mb-6 sm:mb-8">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">€{plan.price}</span>
                        <span className="text-muted-foreground text-base sm:text-lg ml-1">{t(`plans.${plan.key}.unit`)}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                      {Array.from({ length: plan.featureCount }, (_, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                          <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="text-foreground/90 leading-relaxed">{t(`plans.${plan.key}.features.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <PlanRequestDialog
                      planName={t(`plans.${plan.key}.name`)}
                      planPrice={plan.price}
                      serviceName={t('label')}
                      btnClassName={`w-full h-11 sm:h-12 md:h-14 text-sm sm:text-base font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
                          : 'border-2 border-primary/30 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-foreground bg-background'
                      }`}
                      btnVariant={plan.popular ? 'default' : 'outline'}
                      btnLabel={t('plans.requestBtn', { planName: t(`plans.${plan.key}.name`) })}
                    />
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium opacity-80">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('plans.securePayment')}</span>
                      <CreditCard className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
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
                  {t('cta.badge')}
                </Badge>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">{t('cta.title')}</span>
                  <span className="block text-indigo-400">{t('cta.titleHighlight')}</span>
                </h2>

                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  {t('cta.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-indigo-600 hover:bg-indigo-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      {t('cta.button')}
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    {t('cta.responseTime')}
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    {t('cta.freeMigration')}
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
