
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes";
import { CookieConsent } from '@/components/site/cookie-consent';
import { CookieProvider } from '@/contexts/cookie-context';
import { AppBody } from '@/components/site/app-body';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataWebSite } from '@/lib/seo';
import { RootHtml, sharedViewport } from '../root-html';

// This is a ROOT layout: it owns <html>/<body> for the whole public site.
export const viewport = sharedViewport;

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[LocaleLayout] Received locale from params:', locale);
  }
  
  if (!locales.includes(locale)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[LocaleLayout] Invalid locale, redirecting to not found:', locale);
    }
    notFound();
  }
  
  // Set the request locale first - this is required for other next-intl functions
  setRequestLocale(locale);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[LocaleLayout] Set request locale to:', locale);
  }

  // Load messages directly using the locale from params to ensure correctness
  // The locale from params comes directly from the [locale] segment in the URL,
  // so it's guaranteed to match what the user navigated to (e.g., /en/contatti -> locale='en')
  // This ensures we always load the correct messages for the current URL locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
    if (process.env.NODE_ENV === 'development') {
      console.log('[LocaleLayout] Directly loaded messages for locale:', locale);
    }
  } catch (error) {
    console.error(`[LocaleLayout] Failed to load messages for locale: ${locale}`, error);
    // Fallback to default locale if loading fails
    messages = (await import(`@/messages/${defaultLocale}.json`)).default;
    if (process.env.NODE_ENV === 'development') {
      console.warn('[LocaleLayout] Falling back to default locale messages:', defaultLocale);
    }
  }
  
  // Debug logging in development - verify messages are loaded correctly
  if (process.env.NODE_ENV === 'development') {
    console.log('[LocaleLayout] Loaded messages for locale:', locale);
    console.log('[LocaleLayout] Total message keys:', Object.keys(messages).length);
    console.log('[LocaleLayout] Has contactPage?', 'contactPage' in messages);
    if ('contactPage' in messages) {
      const contactPage = (messages as any).contactPage;
      const badge = contactPage?.hero?.badge;
      console.log('[LocaleLayout] contactPage.hero.badge:', badge);
      // Verify we have the correct locale by checking the badge text
      if (locale === 'en' && badge === 'Mettiti in Contatto') {
        console.error('[LocaleLayout] ERROR: English locale but Italian message detected!');
      } else if (locale === 'it' && badge === 'Get in Touch') {
        console.error('[LocaleLayout] ERROR: Italian locale but English message detected!');
      }
    }
  }
  // Site-wide schema: WebSite only.
  // Organization is emitted by pages that need it (non-home pages) to avoid
  // overlap with LocalBusiness on the homepage (both share the same fields).
  const websiteData = generateStructuredDataWebSite(locale);

  // `lang` comes straight from the [locale] route param, so the SERVED html is
  // correct for crawlers — no post-hydration patching, and hreflang annotations
  // are no longer contradicted by the document's own language declaration.
  return (
    <RootHtml lang={locale}>
      <StructuredDataServer data={websiteData} />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CookieProvider>
          <NextIntlClientProvider
            key={locale}
            locale={locale}
            messages={messages}
          >
            <AppBody>
              {children}
            </AppBody>
            <Toaster />
            <CookieConsent />
            {/* No-ops unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set AND the
                visitor granted the analytics cookie category. */}
            <GoogleAnalytics />
          </NextIntlClientProvider>
        </CookieProvider>
      </ThemeProvider>
    </RootHtml>
  );
}
