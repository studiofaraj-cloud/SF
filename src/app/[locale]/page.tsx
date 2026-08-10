
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Code,
  Smartphone,
  Server,
  LineChart,
  Bot,
  ShoppingCart,
  Rocket,
  DraftingCompass,
  Eye,
  Wrench,
  Trophy,
  Code2,
  Monitor,
  ArrowRight,
  Sparkles,
  Award,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataLocalBusiness } from '@/lib/seo';
import { getAggregateRating } from '@/lib/google-reviews';
import { Metadata } from 'next';
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server';
import { getLocalizedPath } from '@/lib/i18n-helpers';

// Client components — direct imports prevent React error #130 during
// client-side navigation in production. HomepageClient uses a thin 'use client'
// wrapper with dynamic() + ssr:false for lazy-loading without breaking chunk resolution.
import ProcessTimeline from '@/components/site/process-timeline';
import { HeroSection } from '@/components/site/hero-section';
import HomeCtaSection from '@/components/site/home-cta-section';
import { TestimonialsServer } from '@/components/site/testimonials-server';
import StatsSection from '@/components/site/stats-section';
import ScrollFadeIn from '@/components/site/scroll-fade-in';
import { TechSectionMobile } from '@/components/site/tech-section-mobile';
import { ServicesGrid } from '@/components/site/services-grid';
import { SectionHeader } from '@/components/site/section-header';
// Server Components
import { HomeProjectSection } from '@/components/site/home-project-section';
import { HomeBlogSection } from '@/components/site/home-blog-section';
import { HomeProjectSkeleton } from '@/components/site/home-project-skeleton';
import { HomeBlogSkeleton } from '@/components/site/home-blog-skeleton';

// Use ISR instead of static prerendering to avoid Turbopack worker timeouts on this large page
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  // Defer to seoConfig defaults in src/lib/seo.ts (single source of truth for
  // title, description, keywords). Only the canonical/alternate URLs are page-specific.
  const baseUrl = `${siteConfig.url}/${currentLocale}`;
  const alternateUrls = {
    it: `${siteConfig.url}/it`,
    en: `${siteConfig.url}/en`,
  };

  return generateSEOMetadata({
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
  });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const currentLocale = localeParam as 'it' | 'en';

  // Enable static rendering by setting the request locale
  setRequestLocale(currentLocale);

  // Real review aggregate, or null when there is no live data — in which case
  // the schema simply omits aggregateRating rather than inventing one.
  // fetchGoogleReviews is request-memoized, so this shares the fetch with the
  // TestimonialsServer section below instead of hitting Firestore twice.
  const aggregateRating = await getAggregateRating(currentLocale);
  const localBusinessData = generateStructuredDataLocalBusiness(currentLocale, aggregateRating);

  // Safely get locale and translations with error handling
  let locale: string;
  let t: any;
  let tServices: any;
  let tValues: any;
  let tProcess: any;
  let tTech: any;
  let tTeam: any;

  try {
    locale = await getLocale();
    t = await getTranslations('home');
    tServices = await getTranslations('home.services');
    tValues = await getTranslations('home.values');
    tProcess = await getTranslations('home.process');
    tTech = await getTranslations('home.technologies');
    tTeam = await getTranslations('home.team');
  } catch (error) {
    console.error('[Home] Failed to load locale/translations:', error);
    // Fallback to default locale and empty translation functions
    locale = currentLocale;
    const emptyT = (key: string) => key;
    t = emptyT;
    tServices = emptyT;
    tValues = emptyT;
    tProcess = emptyT;
    tTech = emptyT;
    tTeam = emptyT;
  }

  const services = [
    {
      icon: <Code />,
      title: tServices('webDevelopment.title'),
      description: tServices('webDevelopment.description'),
      slug: 'sviluppo-web',
    },
    {
      icon: <ShoppingCart />,
      title: tServices('ecommerce.title'),
      description: tServices('ecommerce.description'),
      slug: 'e-commerce',
    },
    {
      icon: <Smartphone />,
      title: tServices('designUIUX.title'),
      description: tServices('designUIUX.description'),
      slug: 'design-ui-ux',
    },
    {
      icon: <Wrench />,
      title: tServices('maintenance.title'),
      description: tServices('maintenance.description'),
      slug: 'manutenzione',
    },
    {
      icon: <Bot />,
      title: tServices('aiAutomation.title'),
      description: tServices('aiAutomation.description'),
      slug: 'ai-automazione',
    },
    {
      icon: <LineChart />,
      title: tServices('seoMarketing.title'),
      description: tServices('seoMarketing.description'),
      slug: 'seo-marketing',
    },
    {
      icon: <Server />,
      title: tServices('hostingCloud.title'),
      description: tServices('hostingCloud.description'),
      slug: 'hosting-cloud',
    },
    {
      icon: <DraftingCompass />,
      title: tServices('consulting.title'),
      description: tServices('consulting.description'),
      slug: 'consulenza',
    },
  ];

  const values = [
    {
      icon: <Trophy className="w-7 h-7" />,
      title: tValues('topRanked.title'),
      description: tValues('topRanked.description'),
      metric: tValues('topRanked.metric'),
      metricLabel: tValues('topRanked.metricLabel'),
      badge: tValues('topRanked.badge'),
      featured: true,
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: tValues('quality.title'),
      description: tValues('quality.description'),
      metric: tValues('quality.metric'),
      metricLabel: tValues('quality.metricLabel'),
      featured: false,
    },
    {
      icon: <Code2 className="w-7 h-7" />,
      title: tValues('cleanCode.title'),
      description: tValues('cleanCode.description'),
      metric: tValues('cleanCode.metric'),
      metricLabel: tValues('cleanCode.metricLabel'),
      featured: false,
    },
  ];

  const processSteps = [
    {
      number: tProcess('steps.analysis.number'),
      title: tProcess('steps.analysis.title'),
      description: tProcess('steps.analysis.description'),
      icon: <Eye className="w-10 h-10" />
    },
    {
      number: tProcess('steps.design.number'),
      title: tProcess('steps.design.title'),
      description: tProcess('steps.design.description'),
      icon: <DraftingCompass className="w-10 h-10" />
    },
    {
      number: tProcess('steps.development.number'),
      title: tProcess('steps.development.title'),
      description: tProcess('steps.development.description'),
      icon: <Code className="w-10 h-10" />
    },
    {
      number: tProcess('steps.launch.number'),
      title: tProcess('steps.launch.title'),
      description: tProcess('steps.launch.description'),
      icon: <Rocket className="w-10 h-10" />
    },
  ];

  // Tech logos data for the category chips (simple strings, no JSX)
  const techLogosData = [
    { title: 'React' },
    { title: 'Next.js' },
    { title: 'TypeScript' },
    { title: 'JavaScript' },
    { title: 'Tailwind CSS' },
    { title: 'HTML5' },
    { title: 'CSS3' },
    { title: 'Node.js' },
    { title: 'Firebase' },
    { title: 'Vercel' },
  ];

  return (
    <div className="bg-background text-foreground" suppressHydrationWarning>
      {/* The hidden keyword-stuffed <h1 class="sr-only"> that used to sit here is
          gone: HeroSection renders the real, visible <h1> server-side, so the
          workaround for a client-only hero is no longer needed — and hidden
          text stuffed with keywords is what Google's spam policies describe. */}
      <HeroSection locale={currentLocale} />

      {/* Stats Section */}
      <StatsSection />

      {/* ============================================
          TECHNOLOGIES SECTION
          ============================================ */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="container relative z-10 px-4 md:px-8">
          <SectionHeader
            eyebrow={tTech('badge')}
            eyebrowIcon={<Code className="w-3.5 h-3.5" />}
            title={tTech('title')}
            titleHighlight={tTech('titleHighlight')}
            subtitle={tTech('subtitle')}
            className="mb-10 md:mb-14"
          />

          {/* Technology Categories - Mobile Tabs */}
          <TechSectionMobile categories={[
            {
              id: 'frontend',
              icon: <Monitor className="w-3.5 h-3.5" />,
              title: tTech('frontend.title'),
              description: tTech('frontend.description'),
              badges: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5', 'CSS3'],
            },
            {
              id: 'backend',
              icon: <Server className="w-3.5 h-3.5" />,
              title: tTech('backend.title'),
              description: tTech('backend.description'),
              badges: ['Node.js', 'Firebase', 'Vercel'],
            },
            {
              id: 'ecommerce',
              icon: <ShoppingCart className="w-3.5 h-3.5" />,
              title: tTech('ecommerce.title'),
              description: tTech('ecommerce.description'),
              badges: ['Next.js', 'Node.js', tTech('ecommerce.customCoding')],
            },
          ]} />

          {/* Technology Categories - Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Monitor className="w-6 h-6" />,
                title: tTech('frontend.title'),
                description: tTech('frontend.description'),
                badges: techLogosData.filter(tech => ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5', 'CSS3'].includes(tech.title)).map(t => t.title),
                delay: 0,
                anim: 'fade-right' as const,
              },
              {
                icon: <Server className="w-6 h-6" />,
                title: tTech('backend.title'),
                description: tTech('backend.description'),
                badges: techLogosData.filter(tech => ['Node.js', 'Firebase', 'Vercel'].includes(tech.title)).map(t => t.title),
                delay: 100,
                anim: 'fade-up' as const,
              },
              {
                icon: <ShoppingCart className="w-6 h-6" />,
                title: tTech('ecommerce.title'),
                description: tTech('ecommerce.description'),
                badges: [...techLogosData.filter(tech => ['Next.js', 'Node.js'].includes(tech.title)).map(t => t.title), tTech('ecommerce.customCoding')],
                delay: 200,
                anim: 'fade-left' as const,
              },
            ].map((cat) => (
              <ScrollFadeIn key={cat.title} animation={cat.anim} delay={cat.delay}>
                <Card className="h-full rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {cat.icon}
                    </div>
                    <CardTitle className="text-lg text-foreground">{cat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="mb-4 text-sm text-muted-foreground">{cat.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.badges.map((b, i) => (
                        <Badge key={i} variant="secondary" className="tech-badge">{b}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES SECTION - Compact grid
          ============================================ */}
      <section id="services" className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-secondary/40" />

        <div className="container relative z-10 px-4 md:px-8">
          <SectionHeader
            eyebrow={tServices('badge')}
            eyebrowIcon={<Sparkles className="w-3.5 h-3.5" />}
            title={tServices('title')}
            titleHighlight={tServices('titleHighlight')}
            subtitle={tServices('subtitle')}
            className="mb-10 md:mb-14"
          />

          <ServicesGrid services={services} learnMoreLabel={tServices('learnMore')} />

          <ScrollFadeIn animation="fade-up" delay={200}>
            <div className="text-center mt-12">
              <Button asChild size="lg" className="group">
                <Link href={getLocalizedPath('/contatti', locale as any)} title={tServices('cta')} className="flex items-center gap-2">
                  {tServices('cta')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US
          ============================================ */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        {/* Single focal orb (static) */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="container relative z-10 px-4 md:px-8">
          <SectionHeader
            eyebrow={tValues('badge')}
            eyebrowIcon={<Award className="w-3.5 h-3.5" />}
            title={tValues('title')}
            titleHighlight={tValues('titleHighlight')}
            subtitle={tValues('subtitle')}
            className="mb-10 md:mb-16"
          />

          {/* Two Column Layout: Cards and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column: Cards */}
            <div className="space-y-4 md:space-y-6">
              {values.map((value, index) => (
                <ScrollFadeIn key={value.title} animation="fade-right" delay={index * 100}>
                  <Card className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 ${
                    value.featured ? 'animated-gradient-border holographic-card' : 'rounded-xl border border-border bg-card'
                  }`}>
                    {value.featured && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
                    )}
                    <CardContent className="relative z-10 p-5 md:p-6">
                      {value.featured && value.badge && (
                        <Badge variant="secondary" className="mb-3 bg-primary/15 text-primary border-primary/30 text-xs">
                          <Trophy className="w-3 h-3 mr-1.5" />
                          {value.badge}
                        </Badge>
                      )}
                      <div className="flex items-start gap-4 md:gap-5">
                        <div className="relative flex-shrink-0 inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {value.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2 gap-4">
                            <CardTitle className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                              {value.title}
                            </CardTitle>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-bold text-primary">{value.metric}</div>
                              <div className="text-xs text-muted-foreground">{value.metricLabel}</div>
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-sm">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollFadeIn>
              ))}
            </div>

            {/* Right Column: Image */}
            <ScrollFadeIn animation="fade-left" delay={200}>
              <div className="relative mt-8 lg:mt-0">
                <div className="absolute -inset-3 md:-inset-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-3xl blur-2xl opacity-50" />
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent z-10" />
                  <Image
                    alt="Team Studio Faraj che collabora allo sviluppo web a Padova"
                    className="w-full h-auto object-cover"
                    data-ai-hint="collaborative team"
                    height={600}
                    src="/assets/studio-faraj-sviluppo-web-padova.webp"
                    width={1200}
                  />
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ============================================
          OUR PROCESS - Timeline Section
          ============================================ */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="container relative z-10 px-4 md:px-8">
          <SectionHeader
            eyebrow={tProcess('badge')}
            eyebrowIcon={<Rocket className="w-3.5 h-3.5" />}
            title={tProcess('title')}
            titleHighlight={tProcess('titleHighlight')}
            subtitle={tProcess('subtitle')}
          />
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* ============================================
          CHI SIAMO — slim intro band + CTA
          ============================================ */}
      <section className="relative py-12 md:py-16 overflow-hidden border-y border-border/60 bg-secondary/30">
        <div className="container relative z-10 px-4 md:px-8">
          <ScrollFadeIn animation="fade-up">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="max-w-2xl">
                <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Users className="w-3.5 h-3.5" />
                  {tTeam('badge')}
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {tTeam('title')} <span className="text-primary">{tTeam('titleHighlight')}</span>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {tTeam('subtitle')}
                </p>
              </div>
              <Button size="lg" asChild className="group shrink-0 w-full sm:w-auto px-8">
                <Link href={getLocalizedPath('/chi-siamo', locale as any)} title={tTeam('cta')}>
                  {tTeam('cta')}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ============================================
          LATEST PROJECTS
          ============================================ */}
      <Suspense fallback={<HomeProjectSkeleton />}>
        <HomeProjectSection />
      </Suspense>

      {/* ============================================
          LATEST BLOG
          ============================================ */}
      <Suspense fallback={<HomeBlogSkeleton />}>
        <HomeBlogSection />
      </Suspense>

      <TestimonialsServer />

      <HomeCtaSection locale={currentLocale} />
      <StructuredDataServer data={localBusinessData} />
    </div>
  );
}
