import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'Consulenza Digitale - Studio Faraj | Strategia e Pianificazione',
      description: 'Consulenza digitale per aziende e professionisti. Analisi, strategia e pianificazione per progetti web di successo. Consulenza personalizzata a Sciacca, Sicilia.',
      keywords: [
        'consulenza digitale',
        'consulenza web',
        'strategia digitale',
        'consulenza IT',
        'pianificazione web',
        'consulenza Sicilia',
      ],
    },
    en: {
      title: 'Digital Consulting - Studio Faraj | Strategy and Planning',
      description: 'Digital consulting for companies and professionals. Analysis, strategy and planning for successful web projects. Personalized consulting in Sciacca, Sicily.',
      keywords: [
        'digital consulting',
        'web consulting',
        'digital strategy',
        'IT consulting',
        'web planning',
        'consulting Sicily',
      ],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/consulenza`;
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

export default async function ConsulenzaLayout({
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
    currentLocale === 'it' ? 'Consulenza' : 'Consulting',
    currentLocale === 'it'
      ? 'Consulenza digitale per aziende e professionisti. Analisi, strategia e pianificazione per progetti web di successo.'
      : 'Digital consulting for companies and professionals. Analysis, strategy and planning for successful web projects.',
    `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/consulenza`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi` },
    { name: currentLocale === 'it' ? 'Consulenza' : 'Consulting', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/consulenza` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
