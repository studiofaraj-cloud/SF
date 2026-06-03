import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateMetadata as generateSEOMetadata, siteConfig, generateStructuredDataFAQPage } from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { FaqAccordion, type FaqItem, type FaqCategoryKey } from '@/components/site/faq-accordion';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'FAQ - Domande Frequenti | Studio Faraj',
      description: 'Trova risposte alle domande più frequenti su sviluppo web, e-commerce, design UI/UX, SEO e servizi digitali. Studio Faraj risponde alle tue domande.',
      keywords: ['FAQ', 'domande frequenti', 'sviluppo web FAQ', 'e-commerce domande', 'preventivo sito web', 'tempi sviluppo'],
    },
    en: {
      title: 'FAQ - Frequently Asked Questions | Studio Faraj',
      description: 'Find answers to the most frequently asked questions about web development, e-commerce, UI/UX design, SEO and digital services. Studio Faraj answers your questions.',
      keywords: ['FAQ', 'frequently asked questions', 'web development FAQ', 'e-commerce questions', 'website quote', 'development timeline'],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/faq`;
  const alternateUrls = {
    it: `${siteConfig.url}/it/faq`,
    en: `${siteConfig.url}/en/faq`,
  };

  return generateSEOMetadata({
    ...content,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
  });
}

// Maps each question key to a category. Categories are visual grouping only —
// they don't change the i18n content, so this stays in code.
const CATEGORY_BY_KEY: Record<string, FaqCategoryKey> = {
  services: 'services',
  ai:       'services',
  cost:     'pricing',
  timeline: 'process',
  existing: 'process',
  support:  'support',
};

const QUESTION_KEYS = ['services', 'cost', 'timeline', 'support', 'ai', 'existing'] as const;

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const currentLocale = localeParam as 'it' | 'en';

  setRequestLocale(currentLocale);

  const t = await getTranslations('faq');
  const tQuestions = await getTranslations('faq.questions');
  const tCategories = await getTranslations('faq.categories');
  const tStill = await getTranslations('faq.stillHaveQuestions');

  const faqs: FaqItem[] = QUESTION_KEYS.map((key) => ({
    id: key,
    category: CATEGORY_BY_KEY[key],
    question: tQuestions(`${key}.question`),
    answer: tQuestions(`${key}.answer`),
  }));

  // Plain {q,a} pairs for FAQ schema.org structured data
  const faqStructuredData = generateStructuredDataFAQPage(
    faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <div className="bg-background text-foreground">
      <StructuredDataServer data={faqStructuredData} />

      {/* ============================================
          HERO — gradient + blur orbs + headline
          ============================================ */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 md:w-[400px] h-64 md:h-[400px] bg-primary/8 rounded-full blur-[100px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              {t('badge')}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              <span className="text-foreground">{t('title')} </span>
              <span className="text-primary">{t('titleHighlight')}</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ LIST — search + category filter + accordion
          ============================================ */}
      <section className="relative pb-20 md:pb-28">
        <div className="container px-4 md:px-8">
          <FaqAccordion
            faqs={faqs}
            labels={{
              searchPlaceholder: t('searchPlaceholder'),
              categoryAll: t('categoryAll'),
              categories: {
                services: tCategories('services'),
                pricing:  tCategories('pricing'),
                process:  tCategories('process'),
                support:  tCategories('support'),
              },
              noResults: t('noResults'),
              noResultsDesc: t('noResultsDesc'),
            }}
          />
        </div>
      </section>

      {/* ============================================
          STILL HAVE QUESTIONS — bottom CTA
          ============================================ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-background pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-72 max-w-3xl mx-auto bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm px-6 md:px-10 py-10 md:py-12 shadow-xl shadow-primary/5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-5">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              {tStill('badge')}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
              <span className="text-foreground">{tStill('title')} </span>
              <span className="text-primary">{tStill('titleHighlight')}</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-7 max-w-md mx-auto">
              {tStill('subtitle')}
            </p>
            <Button size="lg" asChild className="group w-full sm:w-auto px-8">
              <Link href={getLocalizedPath('/contatti', currentLocale)} title={tStill('cta')}>
                {tStill('cta')}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
