import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataLocalBusiness,
  siteConfig,
} from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { getAggregateRating } from '@/lib/google-reviews';
import { HeroSection } from '@/components/site/hero-section';
import { HomeProjectSection } from '@/components/site/home-project-section';
import { HomeServices } from '@/components/site/home-services';
import { HomeProcess } from '@/components/site/home-process';
import { HomeStack } from '@/components/site/home-stack';
import { HomeStudio } from '@/components/site/home-studio';
import { TestimonialsServer } from '@/components/site/testimonials-server';
import { HomeBlogSection } from '@/components/site/home-blog-section';
import HomeCtaSection from '@/components/site/home-cta-section';

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

  return (
    // No page-level ClientMessages: every section is a server component with its
    // own copy, so no translations need to reach the client from this page.
    <div className="bg-background text-foreground" suppressHydrationWarning>
      {/* HeroSection renders the page's only, visible <h1> server-side. */}
      <HeroSection locale={currentLocale} />

      {/* Recent work — straight after the hero: the work is the pitch. No
          Suspense: the hero already awaited the same cached projects read. */}
      <HomeProjectSection locale={currentLocale} />

      {/* Services as one ecosystem: build / grow / run */}
      <HomeServices locale={currentLocale} />

      <HomeProcess locale={currentLocale} />

      <HomeStack locale={currentLocale} />

      <HomeStudio locale={currentLocale} />

      <TestimonialsServer />

      <HomeBlogSection locale={currentLocale} />

      <HomeCtaSection locale={currentLocale} />
      <StructuredDataServer data={localBusinessData} />
    </div>
  );
}
