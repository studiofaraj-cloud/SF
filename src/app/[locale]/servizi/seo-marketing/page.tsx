'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, CheckCircle, ArrowRight, Sparkles, Zap, Clock, 
  ShieldCheck, Search, TrendingUp, Target, BarChart3, Globe,
  FileText, Users, ChevronDown, Megaphone, Lock, CreditCard
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
      title: t('features.seoOnPage.title'),
      description: t('features.seoOnPage.description')
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('features.seoOffPage.title'),
      description: t('features.seoOffPage.description')
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('features.contentMarketing.title'),
      description: t('features.contentMarketing.description')
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: t('features.localSeo.title'),
      description: t('features.localSeo.description')
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t('features.analytics.title'),
      description: t('features.analytics.description')
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: t('features.ppc.title'),
      description: t('features.ppc.description')
    }
  ];

  const metrics = [
    { value: t('metrics.organicTraffic.value'), label: t('metrics.organicTraffic.label') },
    { value: t('metrics.rankings.value'), label: t('metrics.rankings.label') },
    { value: t('metrics.leads.value'), label: t('metrics.leads.label') },
    { value: t('metrics.roi.value'), label: t('metrics.roi.label') }
  ];

  const plans = [
    {
      name: t('plans.starter.name'),
      price: "199",
      unit: t('plans.starter.unit'),
      features: [
        t('plans.starter.features.0'),
        t('plans.starter.features.1'),
        t('plans.starter.features.2'),
        t('plans.starter.features.3'),
        t('plans.starter.features.4'),
        t('plans.starter.features.5')
      ]
    },
    {
      name: t('plans.growth.name'),
      price: "399",
      unit: t('plans.growth.unit'),
      popular: true,
      features: [
        t('plans.growth.features.0'),
        t('plans.growth.features.1'),
        t('plans.growth.features.2'),
        t('plans.growth.features.3'),
        t('plans.growth.features.4'),
        t('plans.growth.features.5'),
        t('plans.growth.features.6')
      ]
    },
    {
      name: t('plans.performance.name'),
      price: "799",
      unit: t('plans.performance.unit'),
      features: [
        t('plans.performance.features.0'),
        t('plans.performance.features.1'),
        t('plans.performance.features.2'),
        t('plans.performance.features.3'),
        t('plans.performance.features.4'),
        t('plans.performance.features.5'),
        t('plans.performance.features.6')
      ]
    }
  ];


  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] min-h-[80svh] flex items-center justify-center overflow-hidden">
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
                {t('features.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('features.title')}</span>
                <span className="block text-teal-400">{t('features.titleHighlight')}</span>
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

      {/* Pricing Section */}
      <section id="piani" className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-circuit opacity-30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4 bg-teal-500/20 text-teal-400 border-teal-500/30">
                <Zap className="w-4 h-4 mr-2" />
                {t('plans.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">{t('plans.title')}</span>
                <span className="block text-teal-400">{t('plans.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <ScrollFadeIn key={index} animation="fade-up" delay={index * 100}>
                <Card className={`holographic-card neon-border relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 ${
                  plan.popular
                    ? 'border-teal-500/50 border-2 shadow-lg shadow-teal-500/10 md:scale-105 pt-4 sm:pt-5 !overflow-visible'
                    : 'border-primary/20 hover:border-teal-500/30'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 sm:-top-3 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-lg shadow-teal-500/30">
                        {t('plans.popularBadge')}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-7 md:p-8 flex flex-col flex-1">
                    <div className="mb-4 sm:mb-5">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-400 mb-3 sm:mb-4">{plan.name}</h3>
                      <div className="mb-6 sm:mb-8">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">€{plan.price}</span>
                        <span className="text-muted-foreground text-base sm:text-lg ml-1">{plan.unit}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                          <CheckCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                          <span className="text-foreground/90 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <PlanRequestDialog
                      planName={plan.name}
                      planPrice={plan.price}
                      serviceName={t('label')}
                      btnClassName={`w-full h-11 sm:h-12 md:h-14 text-sm sm:text-base font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40'
                          : 'border-2 border-primary/30 hover:border-teal-500/50 hover:bg-teal-500/10 text-foreground bg-background'
                       }`}
                      btnVariant={plan.popular ? 'default' : 'outline'}
                      btnLabel={t('plans.requestBtn', { planName: plan.name })}
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
                  {t('cta.badge')}
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">{t('cta.title')}</span>
                  <span className="block text-teal-400">{t('cta.titleHighlight')}</span>
                </h2>
                
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  {t('cta.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-teal-600 hover:bg-teal-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', locale as any)}>
                      {t('cta.button')}
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    {t('cta.responseTime')}
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    {t('cta.freeAudit')}
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
