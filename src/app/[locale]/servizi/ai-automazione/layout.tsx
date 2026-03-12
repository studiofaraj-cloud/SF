import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'AI e Automazione - Studio Faraj | Soluzioni Intelligenti',
      description: 'Integrazione intelligenza artificiale e automazione per migliorare i processi aziendali. Chatbot, sistemi di raccomandazione e automazione intelligente.',
      keywords: [
        'intelligenza artificiale',
        'AI',
        'automazione',
        'chatbot',
        'machine learning',
        'AI Sicilia',
      ],
    },
    en: {
      title: 'AI & Automation - Studio Faraj | Intelligent Solutions',
      description: 'Artificial intelligence and automation integration to improve business processes. Chatbots, recommendation systems and intelligent automation.',
      keywords: [
        'artificial intelligence',
        'AI',
        'automation',
        'chatbot',
        'machine learning',
        'AI Sicily',
      ],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/ai-automazione`;
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

export default async function AIAutomazioneLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';

  setRequestLocale(currentLocale);

  const serviceData = generateStructuredDataService(
    currentLocale === 'it' ? 'AI e Automazione' : 'AI & Automation',
    currentLocale === 'it'
      ? 'Integrazione intelligenza artificiale e automazione per migliorare i processi aziendali. Chatbot, sistemi di raccomandazione e automazione intelligente.'
      : 'Artificial intelligence and automation integration to improve business processes. Chatbots, recommendation systems and intelligent automation.',
    `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/ai-automazione`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi` },
    { name: currentLocale === 'it' ? 'AI e Automazione' : 'AI & Automation', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/ai-automazione` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
