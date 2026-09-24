
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';
import { ClientMessages } from '@/components/i18n/client-messages';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  const seoContent = {
    it: {
      title: 'Consulente SEO e Web Marketing a Padova',
      description: 'SEO e web marketing a Padova: ottimizzazione on-page, SEO locale, contenuti e campagne a pagamento per farti trovare dai clienti di Padova e del Veneto.',
      keywords: [
        'web agency Verona',
        'agenzia web Venezia',
        'SEO',
        'marketing digitale',
        'ottimizzazione SEO',
        'posizionamento Google',
        'marketing online',
        'SEO Veneto',
      ],
    },
    en: {
      title: 'SEO and Web Marketing in Padova, Italy',
      description: 'SEO and web marketing in Padova, Italy: on-page SEO, local SEO, content and paid campaigns so customers in Padova and the Veneto region find you.',
      keywords: [
        'web agency Verona',
        'agenzia web Venezia',
        'SEO',
        'digital marketing',
        'SEO optimization',
        'Google ranking',
        'online marketing',
        'SEO Veneto',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/servizi/seo-marketing`;
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

export default async function SEOMarketingLayout({
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
  
  const serviceData = generateStructuredDataService(
    currentLocale === 'it' ? 'SEO e Marketing' : 'SEO & Marketing',
    currentLocale === 'it'
      ? 'Servizi SEO e marketing digitale per aumentare la visibilità online. Ottimizzazione per motori di ricerca, content marketing e campagne pubblicitarie efficaci.'
      : 'SEO and digital marketing services to increase online visibility. Search engine optimization, content marketing and effective advertising campaigns.',
    `${siteConfig.url}/${currentLocale}/servizi/seo-marketing`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}/${currentLocale}/servizi` },
    { name: currentLocale === 'it' ? 'SEO e Marketing' : 'SEO & Marketing', url: `${siteConfig.url}/${currentLocale}/servizi/seo-marketing` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      <ClientMessages locale={currentLocale} namespaces={['serverActions', 'services.seoMarketing']}>
        {children}
      </ClientMessages>
    </>
  );
}
