
import { Metadata } from 'next';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataPageBreadcrumb,
  siteConfig,
} from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';
import { ClientMessages } from '@/components/i18n/client-messages';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  const seoContent = {
    it: {
      title: 'Contatti — Preventivo Sito Web Padova, Veneto',
      description: 'Chiedi a Studio Faraj un preventivo gratuito per il tuo sito web o la tua app. Siamo a Padova e lavoriamo in tutto il Veneto. Tel. +39 320 222 3322.',
      keywords: [
        'contatti',
        'preventivo',
        'preventivo sito web Padova',
        'preventivo sito web Veneto',
        'consulenza web',
        'studio faraj contatti',
        'Padova',
        'Veneto',
      ],
    },
    en: {
      title: 'Contact — Website Quote in Padova & Veneto',
      description: 'Get a free quote from Studio Faraj for your website or web app. Based in Padova, working with businesses across Veneto. Call +39 320 222 3322.',
      keywords: [
        'contact',
        'quote',
        'website quote Padova',
        'web consultation',
        'studio faraj contact',
        'Padova',
        'Veneto',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/contatti`;
  const alternateUrls = {
    it: baseUrl.replace(`/${currentLocale}/`, '/it/'),
    en: baseUrl.replace(`/${currentLocale}/`, '/en/'),
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

export default async function ContattiLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';
  
  // Enable static rendering by setting the request locale
  setRequestLocale(currentLocale);

  // Emitted here because contatti/page.tsx is a client component.
  return (
    <>
      <StructuredDataServer
        data={generateStructuredDataPageBreadcrumb(currentLocale, {
          name: currentLocale === 'it' ? 'Contatti' : 'Contact',
          path: '/contatti',
        })}
        id="contatti-breadcrumb"
      />
      <ClientMessages locale={currentLocale} namespaces={['bookingDialog', 'contact', 'contactPage']}>
        {children}
      </ClientMessages>
    </>
  );
}
