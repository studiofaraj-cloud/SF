
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
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
  Clock,
  MessagesSquare,
  ShieldCheck,
  Monitor,
  Tablet,
  Smartphone as SmartphoneIcon,
  ArrowRight,
  Sparkles,
  User,
  Award,
  Target,
  Users,
  Zap,
  TrendingUp,
  Calendar,
  Tag,
  FolderOpen,
  BookOpen,
  ExternalLink,
  Globe,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Lazy load heavy components — use .then() to safely extract default export
// and prevent React Error #130 (undefined component) in production builds
const TechLogosClient = dynamic(() => import('@/components/site/tech-logos-client').then(mod => mod.default ? mod : { default: mod.TechLogosClient ?? (() => null) }));
import { Badge } from '@/components/ui/badge';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataLocalBusiness } from '@/lib/seo';
import { Metadata } from 'next';
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { getHeroSlidesAction } from '@/lib/actions';
import type { HeroSlide } from '@/lib/definitions';

// Dynamically import client components — use .then() to safely extract default export
// and prevent React Error #130 (undefined component) in production builds
const ProcessTimeline = dynamic(() => import('@/components/site/process-timeline').then(mod => mod.default ? mod : { default: mod.ProcessTimeline ?? (() => null) }));
const ContactSection = dynamic(() => import('@/components/site/contact-section').then(mod => mod.default ? mod : { default: mod.ContactSection ?? (() => null) }));
const HomepageClient = dynamic(() => import('@/components/site/homepage-client').then(mod => mod.default ? mod : { default: mod.HomepageClient ?? (() => null) }));
const TestimonialsSection = dynamic(() => import('@/components/site/testimonials-section').then(mod => mod.default ? mod : { default: mod.TestimonialsSection ?? (() => null) }), { ssr: true });
const StatsSection = dynamic(() => import('@/components/site/stats-section').then(mod => mod.default ? mod : { default: mod.StatsSection ?? (() => null) }));
const ScrollFadeIn = dynamic(() => import('@/components/site/scroll-fade-in').then(mod => mod.default ? mod : { default: mod.ScrollFadeIn ?? (() => null) }));
import { TechSectionMobile } from '@/components/site/tech-section-mobile';
import { ServiceAccordionMobile } from '@/components/site/service-accordion-mobile';
// Server Components — must NOT use dynamic(), import directly and wrap in <Suspense>
import { HomeProjectSection } from '@/components/site/home-project-section';
import { HomeBlogSection } from '@/components/site/home-blog-section';
import { HomeProjectSkeleton } from '@/components/site/home-project-skeleton';
import { HomeBlogSkeleton } from '@/components/site/home-blog-skeleton';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  // Get translations for SEO content
  let t: any;
  try {
    t = await getTranslations('home');
  } catch {
    t = (key: string) => key;
  }
  
  // Locale-specific SEO content
  const seoContent = {
    it: {
      title: 'Studio Faraj - Sviluppo Web Professionale | Sciacca, Sicilia',
      description: 'Sviluppo web professionale a Sciacca, Sicilia. Creiamo siti web personalizzati, e-commerce, applicazioni web moderne e soluzioni digitali innovative per far crescere il tuo business online.',
      keywords: [
        'sviluppo web Sciacca',
        'siti web Sicilia',
        'e-commerce Sciacca',
        'web development Sicilia',
        'agenzia web Sciacca',
        'creazione siti web',
        'design UI/UX',
        'SEO Sicilia',
        'marketing digitale',
      ],
    },
    en: {
      title: 'Studio Faraj - Professional Web Development | Sciacca, Sicily',
      description: 'Professional web development in Sciacca, Sicily. We create custom websites, e-commerce, modern web applications and innovative digital solutions to grow your online business.',
      keywords: [
        'web development Sciacca',
        'websites Sicily',
        'e-commerce Sciacca',
        'web development Sicily',
        'web agency Sciacca',
        'website creation',
        'UI/UX design',
        'SEO Sicily',
        'digital marketing',
        'web design Sicily',
        'custom websites',
        'responsive design',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}`;
  const alternateUrls = {
    it: currentLocale === 'it' ? baseUrl : baseUrl.replace(`/${currentLocale}`, '/it').replace(/^\/en/, '/it'),
    en: currentLocale === 'en' ? baseUrl : baseUrl.replace(`/${currentLocale}`, '/en').replace(/^\/it/, '/en'),
  };
  
  return generateSEOMetadata({
    title: content.title,
    description: content.description,
    keywords: content.keywords,
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
  
  const localBusinessData = generateStructuredDataLocalBusiness(currentLocale);
  
  // Safely get locale and translations with error handling
  let locale: string;
  let t: any;
  let tServices: any;
  let tValues: any;
  let tProcess: any;
  let tTech: any;
  let tResponsive: any;
  let tTeam: any;
  
  try {
    locale = await getLocale();
    t = await getTranslations('home');
    tServices = await getTranslations('home.services');
    tValues = await getTranslations('home.values');
    tProcess = await getTranslations('home.process');
    tTech = await getTranslations('home.technologies');
    tResponsive = await getTranslations('home.responsive');
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
    tResponsive = emptyT;
    tTeam = emptyT;
  }

  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: tServices('webDevelopment.title'),
      description: tServices('webDevelopment.description'),
      color: "from-blue-500/20 to-cyan-500/20",
      slug: "sviluppo-web",
      orbColor: "bg-blue-500/15",
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: tServices('ecommerce.title'),
      description: tServices('ecommerce.description'),
      color: "from-emerald-500/20 to-green-500/20",
      slug: "e-commerce",
      orbColor: "bg-emerald-500/15",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: tServices('designUIUX.title'),
      description: tServices('designUIUX.description'),
      color: "from-violet-500/20 to-purple-500/20",
      slug: "design-ui-ux",
      orbColor: "bg-violet-500/15",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: tServices('maintenance.title'),
      description: tServices('maintenance.description'),
      color: "from-orange-500/20 to-amber-500/20",
      slug: "manutenzione",
      orbColor: "bg-orange-500/15",
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: tServices('aiAutomation.title'),
      description: tServices('aiAutomation.description'),
      color: "from-pink-500/20 to-rose-500/20",
      slug: "ai-automazione",
      orbColor: "bg-pink-500/15",
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: tServices('seoMarketing.title'),
      description: tServices('seoMarketing.description'),
      color: "from-teal-500/20 to-cyan-500/20",
      slug: "seo-marketing",
      orbColor: "bg-teal-500/15",
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: tServices('hostingCloud.title'),
      description: tServices('hostingCloud.description'),
      color: "from-indigo-500/20 to-blue-500/20",
      slug: "hosting-cloud",
      orbColor: "bg-indigo-500/15",
    },
    {
      icon: <DraftingCompass className="w-8 h-8" />,
      title: tServices('consulting.title'),
      description: tServices('consulting.description'),
      color: "from-fuchsia-500/20 to-pink-500/20",
      slug: "consulenza",
      orbColor: "bg-fuchsia-500/15",
    },
  ];

  const values = [
    {
      icon: <Clock className="w-7 h-7" />,
      title: tValues('fastDelivery.title'),
      description: tValues('fastDelivery.description'),
      metric: tValues('fastDelivery.metric'),
      metricLabel: tValues('fastDelivery.metricLabel'),
    },
    {
      icon: <MessagesSquare className="w-7 h-7" />,
      title: tValues('support.title'),
      description: tValues('support.description'),
      metric: tValues('support.metric'),
      metricLabel: tValues('support.metricLabel'),
    },
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: tValues('transparency.title'),
      description: tValues('transparency.description'),
      metric: tValues('transparency.metric'),
      metricLabel: tValues('transparency.metricLabel'),
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

  // Tech logos data for badges (simple strings, no JSX)
  const techLogosData = [
    { title: "React", href: "https://react.dev" },
    { title: "Next.js", href: "https://nextjs.org" },
    { title: "TypeScript", href: "https://www.typescriptlang.org" },
    { title: "JavaScript", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { title: "Tailwind CSS", href: "https://tailwindcss.com" },
    { title: "HTML5", href: "https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5" },
    { title: "CSS3", href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS3" },
    { title: "Shopify", href: "https://www.shopify.com" },
    { title: "Node.js", href: "https://nodejs.org" },
    { title: "Vercel", href: "https://vercel.com" },
    { title: "Firebase", href: "https://firebase.google.com" },
  ];

  // Fetch hero slides from Firestore (non-blocking — falls back to defaults in client)
  let heroSlides: HeroSlide[] = [];
  try {
    const raw = await getHeroSlidesAction();
    heroSlides = raw.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      imageUrl: s.imageUrl,
      imageHint: s.imageHint,
    }));
  } catch {
    // fallback handled in HomepageClient
  }

  return (
    <div className="bg-background text-foreground" suppressHydrationWarning>
      <Suspense>
        <HomepageClient heroSlides={heroSlides} />
      </Suspense>

      {/* Stats Section */}
      <Suspense>
        <StatsSection />
      </Suspense>

      {/* ============================================
          TECHNOLOGIES SECTION - Constellation Background
          ============================================ */}
      <section className="relative py-10 sm:py-16 md:py-32 lg:py-40 overflow-hidden">
        {/* Constellation Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation" />
        
        {/* Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/3 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container relative z-10 px-4 md:px-8">
          {/* Header */}
          <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
              <Badge className="badge-futuristic mb-4 md:mb-6">
                <Code className="w-3 h-3 mr-2" />
              {tTech('badge')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              <span className="text-foreground">{tTech('title')}</span>
              <span className="block text-primary mt-1 md:mt-2">{tTech('titleHighlight')}</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
              {tTech('subtitle')}
            </p>
          </div>
          </ScrollFadeIn>

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
              badges: ['Shopify', tTech('ecommerce.customCoding')],
            },
          ]} />


          {/* Technology Categories - Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-16">
            {/* Frontend */}
            <ScrollFadeIn animation="fade-right" delay={0}>
              <Card className="holographic-card neon-border overflow-hidden group h-full">
              <CardHeader className="p-4 md:p-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                    <Monitor className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <CardTitle className="text-lg md:text-xl text-primary">{tTech('frontend.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {tTech('frontend.description')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {techLogosData.filter(tech => ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5', 'CSS3'].includes(tech.title)).map((tech, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {tech.title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            </ScrollFadeIn>

            {/* Backend & Infrastructure */}
            <ScrollFadeIn animation="fade-up" delay={100}>
              <Card className="holographic-card neon-border overflow-hidden group h-full">
              <CardHeader className="p-4 md:p-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                    <Server className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <CardTitle className="text-lg md:text-xl text-primary">{tTech('backend.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {tTech('backend.description')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {techLogosData.filter(tech => ['Node.js', 'Firebase', 'Vercel'].includes(tech.title)).map((tech, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {tech.title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            </ScrollFadeIn>

            {/* E-commerce */}
            <ScrollFadeIn animation="fade-left" delay={200}>
              <Card className="holographic-card neon-border overflow-hidden group h-full">
              <CardHeader className="p-4 md:p-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                    <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <CardTitle className="text-lg md:text-xl text-primary">{tTech('ecommerce.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {tTech('ecommerce.description')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {techLogosData.filter(tech => ['Shopify'].includes(tech.title)).map((tech, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {tech.title}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {tTech('ecommerce.customCoding')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            </ScrollFadeIn>
          </div>

          {/* Animated Logo Loop */}
          <ScrollFadeIn animation="fade-up" delay={300}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
          <div className="text-primary px-4 md:px-20 lg:px-40">
            <TechLogosClient />
            </div>
          </div>
          </ScrollFadeIn>

          {/* Trust Indicators with Neon Effect */}
          <ScrollFadeIn animation="scale" delay={400}>
          <div className="mt-8 md:mt-12 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 rounded-xl holographic-card neon-border">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">{tTech('trust.secure')}</span>
              </div>
                <div className="hidden sm:block h-4 w-px bg-primary/30" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">{tTech('trust.performant')}</span>
              </div>
                <div className="hidden sm:block h-4 w-px bg-primary/30" />
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">{tTech('trust.cuttingEdge')}</span>
              </div>
            </div>
          </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ============================================
          SERVICES SECTION - Bento Grid
          ============================================ */}
      <section id="services" className="relative py-10 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Circuit Background */}
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute inset-0 bg-circuit opacity-40" />

        {/* Glowing Orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px]" />

        <div className="container relative z-10 px-4 md:px-8 lg:px-16">
          <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
              <Badge className="badge-futuristic mb-3 md:mb-4">
                <Sparkles className="w-3 h-3 mr-2" />
              {tServices('badge')}
            </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                <span className="text-foreground">{tServices('title')}</span>
                <span className="block text-primary mt-1">{tServices('titleHighlight')}</span>
            </h2>
            <p className="mt-4 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-muted-foreground px-2">
              {tServices('subtitle')}
            </p>
          </div>
          </ScrollFadeIn>

          {/* ── Mobile: Accordion List ── */}
          <ServiceAccordionMobile services={services} learnMoreLabel={tServices('learnMore')} />

          {/* ── Desktop: Bento Grid ── */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {services.map((service, index) => {
                /* Bento span assignments:
                   0 = hero (2col×2row), 4 = tall (1col×2row),
                   5 = wide (2col), 7 = full-width banner (4col) */
                const isHero   = index === 0;
                const isTall   = index === 4;
                const isWide   = index === 5;
                const isBanner = index === 7;

                const bentoSpan =
                  isHero   ? 'md:col-span-2 lg:row-span-2' :
                  isTall   ? 'lg:row-span-2' :
                  isWide   ? 'md:col-span-2' :
                  isBanner ? 'md:col-span-2 lg:col-span-4' :
                  '';

                return (
                  <ScrollFadeIn
                    key={index}
                    animation="fade-up"
                    delay={index * 75}
                    className={bentoSpan}
                  >
                    <Link
                      href={`/${locale}/servizi/${service.slug}`}
                      className="block group h-full"
                    >
                      <Card className={`h-full relative overflow-hidden holographic-card service-card-glow neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 md:hover:-translate-y-1 ${isBanner ? 'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5' : ''}`}>
                        {/* Floating orbs */}
                        <div className={`card-orb card-orb-1 ${service.orbColor}`} />
                        <div className={`card-orb card-orb-2 ${service.orbColor}`} />
                        {/* Gradient background on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${isBanner ? 'h-[2px]' : ''}`} />

                        {/* ── Card inner layout ── */}
                        <div className={`relative z-10 flex h-full ${
                          isHero   ? 'flex-col justify-between p-6 md:p-8 lg:p-10' :
                          isTall   ? 'flex-col justify-between p-5 md:p-7' :
                          isBanner ? 'flex-row items-center p-5 md:p-6 lg:p-8 gap-5 md:gap-8' :
                          isWide   ? 'flex-col sm:flex-row sm:items-center p-4 md:p-6' :
                          'flex-col p-4 md:p-6'
                        }`}>

                          {/* Icon */}
                          <div className={`shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40 ${
                            isHero   ? 'w-16 h-16 md:w-20 md:h-20 mb-6' :
                            isTall   ? 'w-14 h-14 md:w-16 md:h-16 mb-5' :
                            isBanner ? 'w-14 h-14 md:w-16 md:h-16' :
                            'w-12 h-12 md:w-14 md:h-14 mb-4 sm:mb-0'
                          } ${isWide ? 'sm:mr-5' : ''}`}>
                            {(isHero || isTall)
                              ? React.cloneElement(service.icon as React.ReactElement, { className: isHero ? 'w-9 h-9 md:w-11 md:h-11' : 'w-8 h-8 md:w-9 md:h-9' })
                              : service.icon}
                          </div>

                          {/* Text */}
                          <div className={`flex flex-col ${
                            isHero   ? 'gap-3 md:gap-4' :
                            isTall   ? 'gap-2 md:gap-3' :
                            isBanner ? 'flex-1 gap-1' :
                            'gap-2'
                          } ${isWide ? 'flex-1' : ''}`}>
                            <h3 className={`font-bold text-primary group-hover:text-primary transition-colors ${
                              isHero   ? 'text-xl md:text-2xl lg:text-3xl' :
                              isTall   ? 'text-lg md:text-xl' :
                              isBanner ? 'text-lg md:text-xl lg:text-2xl' :
                              'text-base md:text-lg'
                            }`}>
                              {service.title}
                            </h3>
                            <p className={`text-muted-foreground leading-relaxed ${
                              isHero   ? 'text-sm md:text-base lg:text-lg max-w-md' :
                              isTall   ? 'text-sm md:text-base' :
                              isBanner ? 'text-sm md:text-base max-w-2xl' :
                              'text-sm'
                            }`}>
                              {service.description}
                            </p>
                            <span className={`inline-flex items-center font-medium text-primary transition-opacity duration-300 ${
                              isBanner ? 'opacity-100 text-base' : 'opacity-0 group-hover:opacity-100'
                            } ${isHero ? 'text-base mt-2' : 'text-sm'}`}>
                              {tServices('requestInfo')}
                              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </span>
                          </div>

                          {/* Banner: extra arrow on right */}
                          {isBanner && (
                            <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-all duration-500">
                              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-primary-foreground transition-colors group-hover:translate-x-0.5" />
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </ScrollFadeIn>
                );
              })}
            </div>
          </div>

          <ScrollFadeIn animation="fade-up" delay={600}>
          <div className="text-center mt-12">
              <Button asChild size="lg" className="group neon-glow">
              <Link href={getLocalizedPath('/contatti', locale as any)} className="flex items-center gap-2">
                {tServices('cta')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ============================================
          RESPONSIVE DESIGN SECTION - Constellation Background
          ============================================ */}
      <section className="hidden md:block relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Constellation Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation opacity-50" />
        
        {/* Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-10 md:-left-20 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-10 md:-right-20 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
        
        <div className="container relative z-10 px-4 md:px-8">
          {/* Header */}
          <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
              <Badge className="badge-futuristic mb-3 md:mb-4">
                <Sparkles className="w-3 h-3 mr-2" />
              {tResponsive('badge')}
                  </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 md:mb-6">
              {tResponsive('title')}
              <span className="block text-primary mt-1 md:mt-2">{tResponsive('titleHighlight')}</span>
                  </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-2">
              {tResponsive('subtitle')}
            </p>
          </div>
          </ScrollFadeIn>

          {/* Device Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-16">
            {[
              { 
                icon: Monitor, 
                label: tResponsive('desktop.label'), 
                description: tResponsive('desktop.description'),
                size: '1920px',
                color: 'from-blue-500/20 to-cyan-500/20',
                imageUrl: '/assets/laptop.jpg',
                imageHint: 'desktop computer screen'
              },
              { 
                icon: Tablet, 
                label: tResponsive('tablet.label'), 
                description: tResponsive('tablet.description'),
                size: '768px',
                color: 'from-purple-500/20 to-pink-500/20',
                imageUrl: '/assets/ipad.jpg',
                imageHint: 'tablet device'
              },
              { 
                icon: SmartphoneIcon, 
                label: tResponsive('mobile.label'), 
                description: tResponsive('mobile.description'),
                size: '375px',
                color: 'from-emerald-500/20 to-teal-500/20',
                imageUrl: '/assets/mobile.jpg',
                imageHint: 'smartphone mobile device'
              },
                    ].map((device, index) => {
                      const DeviceIcon = device.icon;
                      return (
                        <ScrollFadeIn key={index} animation="scale" delay={index * 100}>
                          <Card className="relative overflow-hidden holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 md:hover:-translate-y-2 group">
                            {/* Background Image */}
                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                              <Image
                                src={device.imageUrl}
                                alt={device.label}
                                fill
                                className="object-cover"
                                data-ai-hint={device.imageHint}
                              />
                            </div>
                            
                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${device.color} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                            
                            {/* Dark overlay for better text readability */}
                            <div className="absolute inset-0 bg-background/40 group-hover:bg-background/30 transition-colors duration-300" />
                            
                            <CardHeader className="relative z-10 p-4 md:p-6">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                                <DeviceIcon className="w-7 h-7 md:w-8 md:h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                              </div>
                              <CardTitle className="text-xl md:text-2xl">{device.label}</CardTitle>
                              <p className="text-xs md:text-sm text-muted-foreground mt-2">{device.size}</p>
                            </CardHeader>
                            <CardContent className="relative z-10 p-4 md:p-6 pt-0">
                              <p className="text-muted-foreground">{device.description}</p>
                            </CardContent>
                          </Card>
                        </ScrollFadeIn>
                      );
                    })}
                  </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: tResponsive('features.mobileFirst.title'),
                description: tResponsive('features.mobileFirst.description'),
                icon: SmartphoneIcon,
              },
              {
                title: tResponsive('features.touchFriendly.title'),
                description: tResponsive('features.touchFriendly.description'),
                icon: Eye,
              },
              {
                title: tResponsive('features.performance.title'),
                description: tResponsive('features.performance.description'),
                icon: Rocket,
              },
              {
                title: tResponsive('features.accessibility.title'),
                description: tResponsive('features.accessibility.description'),
                icon: ShieldCheck,
              },
            ].map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <ScrollFadeIn key={index} animation="fade-up" delay={index * 75}>
                  <div className="h-full p-4 md:p-5 lg:p-6 rounded-2xl holographic-card neon-border transition-all duration-300 hover:shadow-lg group flex flex-col">
                    <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40 flex-shrink-0">
                      <FeatureIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-2 flex-shrink-0">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground flex-1">{feature.description}</p>
                  </div>
                </ScrollFadeIn>
              );
            })}
            </div>

          {/* CTA */}
          <ScrollFadeIn animation="fade-up" delay={400}>
          <div className="mt-10 md:mt-16 text-center">
              <Button size="lg" asChild className="group neon-glow w-full sm:w-auto">
              <Link href="/#services">
                {tResponsive('cta')}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE US - Circuit Background
          ============================================ */}
      <section className="relative py-10 sm:py-16 md:py-32 lg:py-40 overflow-hidden">
        {/* Circuit Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/50 to-background" />
        <div className="absolute inset-0 bg-circuit opacity-30" />
        
        {/* Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-8">
          {/* Header Section */}
          <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-20">
              <Badge className="badge-futuristic mb-4 md:mb-6">
                <Award className="w-3 h-3 mr-2" />
              {tValues('badge')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              <span className="text-foreground">{tValues('title')}</span>
              <span className="block text-primary mt-1 md:mt-2">{tValues('titleHighlight')}</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
              {tValues('subtitle')}
            </p>
          </div>
          </ScrollFadeIn>

          {/* Two Column Layout: Cards and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column: Cards */}
            <div className="space-y-4 md:space-y-6">
              {values.map((value, index) => (
                <ScrollFadeIn key={value.title} animation="fade-right" delay={index * 100}>
                  <Card className="group relative overflow-hidden holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 lg:hover:-translate-x-2">
                  <CardContent className="relative z-10 p-4 md:p-6">
                    <div className="flex items-start gap-4 md:gap-5">
                      {/* Icon with animated background */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-500 scale-0 group-hover:scale-100" />
                          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                          {value.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {value.title}
                        </CardTitle>
                            <div className="text-right ml-4">
                              <div className="text-lg md:text-xl font-bold text-primary metric-glow">{value.metric}</div>
                              <div className="text-xs text-muted-foreground">{value.metricLabel}</div>
                            </div>
                          </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {value.description}
                        </p>
                        
                          {/* Decorative line */}
                        <div className="hidden md:block mt-4 h-1 w-0 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500 rounded-full" />
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
              <div className="relative">
                  {/* Decorative frame */}
                <div className="absolute -inset-3 md:-inset-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl blur-2xl opacity-50" />
                  <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl neon-border">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                <Image
                    alt="Un team che collabora a un progetto"
                    className="w-full h-auto object-cover"
                    data-ai-hint="collaborative team"
                    height={600}
                    src="/assets/yu.png"
                    width={1200}
                />
              </div>
                
                  {/* Floating stats badges */}
                  <div className="hidden md:block absolute -top-4 -left-4 holographic-card neon-border rounded-2xl p-3 md:p-4 shadow-xl backdrop-blur-sm">
                    <div className="text-2xl md:text-3xl font-bold text-primary metric-glow">100%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t('stats.title')}</div>
            </div>
                  <div className="hidden md:block absolute -bottom-4 -right-4 holographic-card neon-border rounded-2xl p-3 md:p-4 shadow-xl backdrop-blur-sm">
                    <div className="text-2xl md:text-3xl font-bold text-primary metric-glow">24/7</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{t('stats.support')}</div>
                  </div>
                  </div>
            </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ============================================
          OUR PROCESS - Timeline Section
          ============================================ */}
      <section className="relative w-full py-10 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-constellation opacity-30" />
        
        <div className="container relative z-10 px-4 md:px-8">
          <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-3xl mx-auto">
              <Badge className="badge-futuristic mb-3 md:mb-4">
                <Rocket className="w-3 h-3 mr-2" />
                {tProcess('badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                <span className="text-foreground">{tProcess('title')}</span>
                <span className="block text-primary mt-1">{tProcess('titleHighlight')}</span>
            </h2>
            <p className="mt-4 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-muted-foreground px-2">
              {tProcess('subtitle')}
            </p>
          </div>
          </ScrollFadeIn>
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* ============================================
          CHI SIAMO - Constellation Background
          ============================================ */}
      <section className="relative py-10 sm:py-16 md:py-32 lg:py-40 overflow-hidden">
        {/* Constellation Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="absolute inset-0 bg-constellation" />
        
        {/* Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 left-0 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container relative z-10 px-4 md:px-8">
          {/* Header */}
          <ScrollFadeIn animation="fade-up">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-20">
              <Badge className="badge-futuristic mb-4 md:mb-6">
                <Users className="w-3 h-3 mr-2" />
              {tTeam('badge')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
              <span className="text-foreground">{tTeam('title')}</span>
              <span className="block text-primary mt-1 md:mt-2">{tTeam('titleHighlight')}</span>
                </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-2">
              {tTeam('subtitle')}
            </p>
                </div>
          </ScrollFadeIn>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 items-center mb-10 md:mb-16">
            {/* Left: Team Info Cards */}
            <div className="space-y-4 md:space-y-6">
              {/* Team Skills Card */}
              <ScrollFadeIn animation="fade-right" delay={0}>
                <Card className="group relative overflow-hidden holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 lg:hover:-translate-x-2">
                <CardContent className="relative z-10 p-4 md:p-8">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-500 scale-0 group-hover:scale-100" />
                        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                        <Code className="w-6 h-6 md:w-8 md:h-8" />
            </div>
                  </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-foreground group-hover:text-primary transition-colors">
                        {tTeam('expertDevelopers.title')}
                      </CardTitle>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 md:mb-4">
                        {tTeam('expertDevelopers.description')}
                      </p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {['React', 'Next.js', 'TypeScript', 'Node.js'].map((tech, i) => (
                          <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs md:text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </ScrollFadeIn>

              {/* Availability Card */}
              <ScrollFadeIn animation="fade-right" delay={100}>
                <Card className="group relative overflow-hidden holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 lg:hover:-translate-x-2">
                <CardContent className="relative z-10 p-4 md:p-8">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-500 scale-0 group-hover:scale-100" />
                        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                        <Zap className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-foreground group-hover:text-primary transition-colors">
                        {tTeam('available247.title')}
                      </CardTitle>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {tTeam('available247.description')}
                      </p>
                    </div>
                </div>
                </CardContent>
              </Card>
              </ScrollFadeIn>
            </div>

            {/* Right: CEO & Vision */}
            <div className="space-y-4 md:space-y-6">
              {/* CEO Card */}
              <ScrollFadeIn animation="fade-left" delay={0}>
                <Card className="group relative overflow-hidden holographic-card animated-gradient-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30">
                  <CardContent className="relative z-10 p-4 md:p-8 bg-card">
                  <div className="flex items-start gap-4 md:gap-6 mb-4 md:mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-xl neon-glow">
                        <User className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-1 md:mb-2 bg-primary/20 text-primary border-primary/30 text-xs md:text-sm">
                        {tTeam('ceo.role')}
                      </Badge>
                        <CardTitle className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-primary glitch-text" data-text={tTeam('ceo.title')}>
                        {tTeam('ceo.title')}
                      </CardTitle>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {tTeam('ceo.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </ScrollFadeIn>

              {/* Vision Card */}
              <ScrollFadeIn animation="fade-left" delay={100}>
                <Card className="group relative overflow-hidden holographic-card neon-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20">
                <CardContent className="relative z-10 p-4 md:p-8">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-500 scale-0 group-hover:scale-100" />
                        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/40">
                        <Target className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-foreground group-hover:text-primary transition-colors">
                        {tTeam('vision.title')}
                      </CardTitle>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {tTeam('vision.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </ScrollFadeIn>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Award, label: tTeam('stats.experience.label'), value: tTeam('stats.experience.value') },
              { icon: Users, label: tTeam('stats.clients.label'), value: tTeam('stats.clients.value') },
              { icon: TrendingUp, label: tTeam('stats.projects.label'), value: tTeam('stats.projects.value') },
            ].map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <ScrollFadeIn key={index} animation="scale" delay={index * 100}>
                  <Card className="text-center card-3d-tilt neon-border holographic-card">
                    <CardContent className="p-4 md:p-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <StatIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-1 md:mb-2 metric-glow">{stat.value}</div>
                      <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </ScrollFadeIn>
              );
            })}
          </div>

          {/* CTA */}
          <ScrollFadeIn animation="fade-up" delay={300}>
          <div className="mt-10 md:mt-16 text-center">
              <Button size="lg" asChild className="group neon-glow w-full sm:w-auto">
              <Link href={getLocalizedPath('/chi-siamo', locale as any)}>
                {tTeam('cta')}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ============================================
          LATEST PROJECTS - Circuit Background
          ============================================ */}
      <Suspense fallback={<HomeProjectSkeleton />}>
        <HomeProjectSection />
      </Suspense>

      {/* ============================================
          LATEST BLOG - Constellation Background
          ============================================ */}
      <Suspense fallback={<HomeBlogSkeleton />}>
        <HomeBlogSection />
      </Suspense>

      <TestimonialsSection />
      
      <ContactSection />
      <StructuredDataServer data={localBusinessData} />
    </div>
  );
}
