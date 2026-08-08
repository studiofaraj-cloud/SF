'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Code, CheckCircle, ArrowRight, Sparkles, Zap, Clock,
  ShieldCheck, Rocket, Globe, ChevronDown, X, Check, Minus,
  Star, MapPin, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import GradientText from '@/components/GradientText';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import QuoteDialog, { type QuoteDialogPrefill } from '@/components/site/quote-dialog';
import { BookingDialog } from '@/components/site/booking-dialog';

type ArchetypeKey = 'vetrina' | 'dashboard' | 'platform';

export default function SviluppoWebPage() {
  const locale = useLocale();
  const t = useTranslations('services.webDevelopment.v2');
  const [heroVisible, setHeroVisible] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [prefill, setPrefill] = useState<QuoteDialogPrefill | undefined>(undefined);

  useEffect(() => { setHeroVisible(true); }, []);

  const openQuote = (next?: QuoteDialogPrefill) => {
    setPrefill(next);
    setQuoteOpen(true);
  };

  const diffRows = t.raw('differentiators.rows') as Array<{
    feature: string; noCode: string; freelance: string; us: string;
  }>;
  const industries = t.raw('industries.items') as Array<{ icon: string; name: string; desc: string }>;
  const processSteps = t.raw('process.steps') as Array<{ step: string; title: string; duration: string; description: string }>;
  const stackGroups = t.raw('stack.groups') as Array<{ name: string; items: string[] }>;
  const kpiItems = t.raw('kpi.items') as Array<{ value: string; label: string }>;
  const faqItems = t.raw('faq.items') as Array<{ q: string; a: string }>;

  const archetypes: { key: ArchetypeKey; flagship?: boolean }[] = [
    { key: 'vetrina' },
    { key: 'dashboard', flagship: true },
    { key: 'platform' },
  ];

  // FAQ JSON-LD
  const faqJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }), [faqItems]);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[80vh] min-h-[80svh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />

        <div className="relative z-20 container px-4 sm:px-6 md:px-8 py-16 md:py-20">
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="lg:col-span-7 text-center lg:text-left">
              <Badge className="badge-futuristic mb-4 sm:mb-6">
                <Code className="w-4 h-4 mr-2" />
                {t('hero.badge')}
              </Badge>

              {/* Child selectors target span, not div: GradientText renders a
                  span here so it can be nested inside the <h1>. */}
              <h1 className="mb-5 sm:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] [&_.animate-gradient]:!inline [&>span:first-child]:lg:!mx-0 [&>span:first-child]:lg:!justify-start">
                <GradientText
                  as="span"
                  colors={['#3b82f6', '#06b6d4', '#3b82f6']}
                  animationSpeed={4}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]"
                >
                  {t('hero.titleLine1')}
                </GradientText>
                <span className="block text-foreground mt-1">
                  {t('hero.titleLine2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Button size="lg" className="group neon-glow px-8 w-full sm:w-auto" onClick={() => openQuote({ service: 'sviluppo-web' })}>
                  {t('hero.ctaQuote')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/50 w-full sm:w-auto" asChild>
                  <Link href={getLocalizedPath('/projects', locale)}>{t('hero.ctaProjects')}</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{t('hero.trust.response')}</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />{t('hero.trust.free')}</span>
                <span className="flex items-center gap-2"><Code className="w-4 h-4 text-primary" />{t('hero.trust.owned')}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{t('hero.trust.italy')}</span>
              </div>
            </div>

            {/* Code card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-cyan-500/20 to-primary/10 blur-2xl rounded-3xl" />
                <div className="relative rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/20 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20 bg-background/50">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs text-muted-foreground font-mono">{t('hero.codeCardLabel')}</span>
                  </div>
                  <pre className="text-[11px] sm:text-xs md:text-[13px] leading-relaxed p-4 sm:p-5 font-mono text-foreground/90 overflow-x-auto">
{`export default function YourSite() {
  const { products } = useInventory();

  return (
    <Page seo={meta} schema="Product">
      <Hero animated />
      <Catalog
        items={products}
        filters={['price','area','year']}
      />
      <AdminDashboard role="owner" />
    </Page>
  );
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center animate-bounce">
            <ChevronDown className="w-7 h-7 text-primary/50" />
          </div>
        </div>
      </section>

      {/* ===================== DIFFERENTIATORS ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation opacity-40" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="badge-futuristic mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('differentiators.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('differentiators.title')}</span>{' '}
                <span className="text-primary block sm:inline">{t('differentiators.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground">{t('differentiators.subtitle')}</p>
            </div>
          </ScrollFadeIn>

          {/* Desktop table */}
          <ScrollFadeIn animation="fade-up">
            <div className="hidden md:block overflow-hidden rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 border-b border-primary/20">
                    <th className="text-left p-4 font-semibold text-muted-foreground w-1/4">{t('differentiators.columns.feature')}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t('differentiators.columns.noCode')}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t('differentiators.columns.freelance')}</th>
                    <th className="text-left p-4 font-bold text-primary bg-primary/5">{t('differentiators.columns.us')}</th>
                  </tr>
                </thead>
                <tbody>
                  {diffRows.map((row, i) => (
                    <tr key={i} className="border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="p-4 font-semibold text-foreground">{row.feature}</td>
                      <td className="p-4 text-muted-foreground"><span className="inline-flex items-start gap-2"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />{row.noCode}</span></td>
                      <td className="p-4 text-muted-foreground"><span className="inline-flex items-start gap-2"><Minus className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />{row.freelance}</span></td>
                      <td className="p-4 text-foreground bg-primary/5"><span className="inline-flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><span className="font-medium">{row.us}</span></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollFadeIn>

          {/* Mobile stacked */}
          <div className="md:hidden space-y-4">
            {diffRows.map((row, i) => (
              <ScrollFadeIn key={i} animation="fade-up" delay={i * 60}>
                <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-primary">{row.feature}</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <p className="flex items-start gap-2 text-muted-foreground"><X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><span><span className="font-medium text-foreground/80">{t('differentiators.columns.noCode')}:</span> {row.noCode}</span></p>
                      <p className="flex items-start gap-2 text-muted-foreground"><Minus className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" /><span><span className="font-medium text-foreground/80">{t('differentiators.columns.freelance')}:</span> {row.freelance}</span></p>
                      <p className="flex items-start gap-2 text-foreground bg-primary/10 -mx-2 px-2 py-2 rounded-md"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><span><span className="font-bold text-primary">{t('differentiators.columns.us')}:</span> {row.us}</span></p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button size="lg" variant="outline" className="border-primary/50" onClick={() => openQuote({ service: 'consulenza', message: t('prefill.differentiators') })}>
              {t('differentiators.cta')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== ARCHETYPES ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/40" />
        <div className="absolute inset-0 bg-circuit opacity-20" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="badge-futuristic mb-4">
                <Building2 className="w-4 h-4 mr-2" />
                {t('archetypes.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('archetypes.title')}</span>{' '}
                <span className="text-primary block sm:inline">{t('archetypes.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground">{t('archetypes.subtitle')}</p>
            </div>
          </ScrollFadeIn>

          <div className="space-y-12 md:space-y-20">
            {archetypes.map((arch, i) => {
              const reverse = i % 2 === 1;
              const k = arch.key;
              const bullets = t.raw(`archetypes.${k}.bullets`) as string[];
              const techs = t.raw(`archetypes.${k}.techs`) as string[];
              const examples = k === 'dashboard' ? (t.raw('archetypes.dashboard.examples') as string[]) : null;
              const serviceMap: Record<ArchetypeKey, string> = {
                vetrina: 'sviluppo-web',
                dashboard: 'sviluppo-web',
                platform: 'e-commerce',
              };
              return (
                <ScrollFadeIn key={k} animation="fade-up">
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                    {/* Text */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className={arch.flagship ? 'bg-primary !text-white hover:bg-primary' : 'bg-primary/15 !text-primary hover:bg-primary/15'}>
                          {arch.flagship && <Star className="w-3.5 h-3.5 mr-1.5" />}
                          {t(`archetypes.${k}.tag`)}
                        </Badge>
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground">
                        {t(`archetypes.${k}.title`)}
                      </h3>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-5">
                        {t(`archetypes.${k}.description`)}
                      </p>

                      {k === 'dashboard' && (
                        <p className="border-l-4 border-primary/60 pl-4 italic text-foreground/80 mb-5">
                          {t('archetypes.dashboard.painLine')}
                        </p>
                      )}

                      <ul className="space-y-2.5 mb-6">
                        {bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-3 text-foreground/85">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {examples && (
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-primary mb-2">{t('archetypes.dashboard.examplesTitle')}</p>
                          <div className="flex flex-wrap gap-2">
                            {examples.map((ex, ei) => (
                              <span key={ei} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-foreground/80">{ex}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-6">
                        {techs.map((tech) => (
                          <span key={tech} className="text-xs font-mono px-2.5 py-1 rounded-md bg-secondary/60 border border-primary/20 text-muted-foreground">{tech}</span>
                        ))}
                      </div>

                      <Button size="lg" className="neon-glow group" onClick={() => openQuote({ service: serviceMap[k], message: t(`prefill.${k}`) })}>
                        {t(`archetypes.${k}.cta`)}
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                      <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 to-cyan-500/15 blur-3xl rounded-full" />
                      <Card className="relative holographic-card neon-border bg-card/80 backdrop-blur-md aspect-[4/3] overflow-hidden">
                        <CardContent className="p-0 h-full flex items-center justify-center relative">
                          {/* Stylized mockup */}
                          <ArchetypeMockup variant={k} />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollFadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== INDUSTRIES ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="badge-futuristic mb-4">
                <Globe className="w-4 h-4 mr-2" />
                {t('industries.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('industries.title')}</span>{' '}
                <span className="text-primary block sm:inline">{t('industries.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground">{t('industries.subtitle')}</p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {industries.map((ind, i) => (
              <ScrollFadeIn key={i} animation="fade-up" delay={i * 40}>
                <button
                  type="button"
                  onClick={() => openQuote({ service: 'sviluppo-web', message: t('prefill.industries').replace('[scrivi qui il tuo settore]', ind.name).replace('[write your industry here]', ind.name) })}
                  className="w-full text-left h-full holographic-card neon-border bg-card/70 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 group"
                >
                  <div className="text-2xl md:text-3xl mb-2">{ind.icon}</div>
                  <div className="font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">{ind.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-snug">{ind.desc}</div>
                </button>
              </ScrollFadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground italic max-w-2xl mx-auto mb-5">{t('industries.footer')}</p>
            <Button size="lg" variant="outline" className="border-primary/50" onClick={() => openQuote({ service: 'consulenza', message: t('prefill.industries') })}>
              {t('industries.cta')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== PROCESS (timeline) ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/40" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge className="badge-futuristic mb-4">
                <Rocket className="w-4 h-4 mr-2" />
                {t('process.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                <span className="text-foreground">{t('process.title')}</span>{' '}
                <span className="text-primary block sm:inline">{t('process.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent md:-translate-x-1/2" />

            <div className="space-y-10 md:space-y-14">
              {processSteps.map((s, i) => {
                const left = i % 2 === 0;
                return (
                  <ScrollFadeIn key={i} animation={left ? 'fade-right' : 'fade-left'}>
                    <div className={`relative md:grid md:grid-cols-2 md:gap-10 items-start`}>
                      {/* Node */}
                      <div className="absolute left-5 md:left-1/2 top-2 -translate-x-1/2 z-10">
                        <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-[0_0_0_3px_rgba(59,130,246,0.3)]" />
                      </div>

                      <div className={`pl-14 md:pl-0 ${left ? 'md:pr-10 md:text-right' : 'md:col-start-2 md:pl-10'}`}>
                        <div className={`flex items-baseline gap-3 mb-2 ${left ? 'md:justify-end' : ''}`}>
                          <span className="text-3xl md:text-4xl font-bold text-primary/40 font-mono">{s.step}</span>
                          <span className="text-xs uppercase tracking-wider text-primary font-semibold">{s.duration}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{s.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                  </ScrollFadeIn>
                );
              })}
            </div>
          </div>

          <div className="mt-14 text-center">
            <Button size="lg" className="neon-glow group" onClick={() => openQuote({ service: 'consulenza', message: t('prefill.process') })}>
              {t('process.cta')}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== STACK ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="badge-futuristic mb-4">
                <Zap className="w-4 h-4 mr-2" />
                {t('stack.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">{t('stack.title')}</span>{' '}
                <span className="text-primary block sm:inline">{t('stack.titleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground">{t('stack.subtitle')}</p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stackGroups.map((g, i) => (
              <ScrollFadeIn key={i} animation="fade-up" delay={i * 80}>
                <Card className="h-full holographic-card neon-border bg-card/70 backdrop-blur-sm">
                  <CardContent className="p-5">
                    <h3 className="text-base font-bold text-primary mb-3 uppercase tracking-wide">{g.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <span key={item} className="text-xs font-mono px-2.5 py-1.5 rounded-md bg-secondary/70 border border-primary/20 text-foreground/85 hover:border-primary/50 hover:text-primary transition-colors cursor-default">
                          {item}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== KPI ===================== */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-background to-cyan-500/10" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center mb-10">
              <Badge className="badge-futuristic">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('kpi.badge')}
              </Badge>
            </div>
          </ScrollFadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {kpiItems.map((k, i) => (
              <ScrollFadeIn key={i} animation="scale" delay={i * 80}>
                <div className="text-center p-5 md:p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/20">
                  <div className="text-3xl md:text-5xl font-bold mb-2">
                    <GradientText colors={['#3b82f6', '#06b6d4', '#3b82f6']} animationSpeed={4} className="font-bold">
                      {k.value}
                    </GradientText>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">{k.label}</div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30" />

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="badge-futuristic mb-4">{t('faq.badge')}</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                <span className="text-foreground">{t('faq.title')}</span>{' '}
                <span className="text-primary block sm:inline">{t('faq.titleHighlight')}</span>
              </h2>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn animation="fade-up">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((it, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border border-primary/20 rounded-xl bg-card/60 backdrop-blur-sm px-5 data-[state=open]:border-primary/50 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/10 transition-all"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary py-4">
                      {it.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {it.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ===================== FINAL CTA (two paths) ===================== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-cyan-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeIn animation="scale">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <Badge className="badge-futuristic mb-4">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('ctaFinal.badge')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
                  <span className="text-foreground">{t('ctaFinal.title')}</span>{' '}
                  <span className="text-primary block sm:inline">{t('ctaFinal.titleHighlight')}</span>
                </h2>
                <p className="text-muted-foreground">{t('ctaFinal.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Path A */}
                <Card className="holographic-card neon-border bg-card/80 backdrop-blur-md group hover:shadow-xl hover:shadow-primary/20 transition-all">
                  <CardContent className="p-7 md:p-8 text-center md:text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mx-auto md:mx-0 mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Code className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{t('ctaFinal.pathA.title')}</h3>
                    <p className="text-muted-foreground mb-5">{t('ctaFinal.pathA.description')}</p>
                    <Button className="w-full sm:w-auto neon-glow" onClick={() => openQuote({ service: 'sviluppo-web' })}>
                      {t('ctaFinal.pathA.cta')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Path B */}
                <Card className="holographic-card neon-border bg-card/80 backdrop-blur-md group hover:shadow-xl hover:shadow-primary/20 transition-all">
                  <CardContent className="p-7 md:p-8 text-center md:text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mx-auto md:mx-0 mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">{t('ctaFinal.pathB.title')}</h3>
                    <p className="text-muted-foreground mb-5">{t('ctaFinal.pathB.description')}</p>
                    <Button variant="outline" className="w-full sm:w-auto border-primary/50" onClick={() => setBookingOpen(true)}>
                      {t('ctaFinal.pathB.cta')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{t('ctaFinal.trustResponse')}</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />{t('ctaFinal.trustFree')}</span>
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />{t('ctaFinal.trustPiva')}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{t('ctaFinal.trustHQ')}</span>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Dialogs */}
      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} prefill={prefill} />
      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
}

/* ----------------- Mockup illustrations ----------------- */
function ArchetypeMockup({ variant }: { variant: ArchetypeKey }) {
  if (variant === 'vetrina') {
    return (
      <div className="w-full h-full p-6 flex flex-col gap-3">
        <div className="h-6 rounded-md bg-primary/20 w-1/3" />
        <div className="h-3 rounded bg-foreground/10 w-2/3" />
        <div className="h-3 rounded bg-foreground/10 w-1/2" />
        <div className="grid grid-cols-3 gap-2 mt-2 flex-1">
          <div className="rounded-lg bg-gradient-to-br from-primary/30 to-cyan-500/20" />
          <div className="rounded-lg bg-gradient-to-br from-cyan-500/30 to-primary/20" />
          <div className="rounded-lg bg-gradient-to-br from-primary/40 to-blue-500/20" />
        </div>
        <div className="h-9 rounded-md bg-primary/80 w-32 mt-2" />
      </div>
    );
  }
  if (variant === 'dashboard') {
    return (
      <div className="w-full h-full grid grid-cols-[80px_1fr] gap-2 p-3">
        <div className="rounded-lg bg-secondary/80 p-2 space-y-2">
          {[0,1,2,3,4].map(i => <div key={i} className="h-3 rounded bg-primary/30" />)}
        </div>
        <div className="rounded-lg bg-secondary/40 p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="h-3 w-24 rounded bg-foreground/20" />
            <div className="h-6 w-16 rounded bg-primary/70" />
          </div>
          <div className="grid grid-cols-3 gap-2 flex-1">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="rounded-md bg-card/80 border border-primary/20 p-1.5 flex flex-col gap-1">
                <div className="h-8 rounded bg-gradient-to-br from-primary/30 to-cyan-500/20" />
                <div className="h-1.5 rounded bg-foreground/20" />
                <div className="h-1.5 rounded bg-foreground/10 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // platform
  return (
    <div className="w-full h-full p-5 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-md bg-secondary/70 border border-primary/20" />
        <div className="h-8 w-20 rounded-md bg-primary/80" />
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="rounded-xl bg-card/80 border border-primary/30 p-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-2 rounded bg-foreground/20 w-1/2" />
            <div className="h-2 rounded bg-foreground/10 w-2/3" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-10 rounded bg-blue-500/40" />
            <div className="h-5 w-10 rounded bg-primary/40" />
            <div className="h-5 w-10 rounded bg-cyan-500/40" />
          </div>
        </div>
        <div className="rounded-xl bg-card/80 border border-primary/30 p-3 flex flex-col gap-2">
          <div className="h-2 rounded bg-foreground/20 w-1/3" />
          <div className="flex-1 grid grid-cols-4 gap-1 items-end">
            {[40,70,55,85].map((h,i) => (
              <div key={i} className="rounded-t bg-gradient-to-t from-primary/80 to-cyan-400/60" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="h-10 rounded-lg bg-gradient-to-r from-primary/30 via-cyan-500/20 to-primary/30 flex items-center justify-center text-xs text-primary font-mono">
        💳 €  ✉️  🤖
      </div>
    </div>
  );
}
