
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  const seoContent = {
    it: {
      title: 'SEO e Marketing Digitale - Studio Faraj | Sciacca',
      description: 'Servizi SEO e marketing digitale per aumentare la visibilità online. Ottimizzazione per motori di ricerca, content marketing e campagne pubblicitarie efficaci.',
      keywords: [
        'SEO',
        'marketing digitale',
        'ottimizzazione SEO',
        'posizionamento Google',
        'marketing online',
        'SEO Sicilia',
      ],
    },
    en: {
      title: 'SEO and Digital Marketing - Studio Faraj | Sciacca',
      description: 'SEO and digital marketing services to increase online visibility. Search engine optimization, content marketing and effective advertising campaigns.',
      keywords: [
        'SEO',
        'digital marketing',
        'SEO optimization',
        'Google ranking',
        'online marketing',
        'SEO Sicily',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/seo-marketing`;
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
    `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/seo-marketing`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi` },
    { name: currentLocale === 'it' ? 'SEO e Marketing' : 'SEO & Marketing', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/seo-marketing` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
