
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
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { generateStructuredDataOrganization, generateStructuredDataWebSite, generateStructuredDataProfessionalService } from '@/lib/seo';

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
  const organizationData = generateStructuredDataOrganization(locale);
  const websiteData = generateStructuredDataWebSite(locale);
  const professionalServiceData = generateStructuredDataProfessionalService(locale);

  // Update the html lang attribute dynamically via a script
  // The root layout has the html/body tags, so we update the lang here
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = '${locale}';`,
        }}
      />
      <StructuredDataServer data={[organizationData, websiteData, professionalServiceData]} />
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
          </NextIntlClientProvider>
        </CookieProvider>
      </ThemeProvider>
    </>
  );
}
