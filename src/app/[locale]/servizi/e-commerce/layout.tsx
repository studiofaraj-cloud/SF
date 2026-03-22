
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  const baseUrl = `${siteConfig.url}/${currentLocale}/servizi/e-commerce`;
  const alternateUrls = {
    it: baseUrl.replace(`/${currentLocale}/`, '/it/'),
    en: baseUrl.replace(`/${currentLocale}/`, '/en/'),
  };
  
  const seoContent = currentLocale === 'it' ? {
    title: 'E-commerce e Piattaforme Online - Studio Faraj | Sciacca',
    description: 'Soluzioni e-commerce complete per vendere online. Creiamo negozi digitali performanti con integrazione pagamenti, gestione ordini e marketing. Sciacca, Sicilia.',
    keywords: ['e-commerce', 'negozio online', 'vendita online', 'piattaforma e-commerce', 'shop online', 'e-commerce Sicilia'],
  } : {
    title: 'E-commerce and Online Platforms - Studio Faraj | Sciacca',
    description: 'Complete e-commerce solutions for selling online. We create high-performance digital stores with payment integration, order management and marketing. Sciacca, Sicily.',
    keywords: ['e-commerce', 'online store', 'online sales', 'e-commerce platform', 'online shop', 'e-commerce Sicily'],
  };
  
  return generateSEOMetadata({
    ...seoContent,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
  });
}

export default async function ECommerceLayout({
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
    currentLocale === 'it' ? 'E-Commerce' : 'E-Commerce',
    currentLocale === 'it'
      ? 'Soluzioni e-commerce complete per vendere online. Creiamo negozi digitali performanti con integrazione pagamenti, gestione ordini e marketing.'
      : 'Complete e-commerce solutions for selling online. We create high-performance digital stores with payment integration, order management and marketing.',
    `${siteConfig.url}/${currentLocale}/servizi/e-commerce`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}/${currentLocale}/servizi` },
    { name: currentLocale === 'it' ? 'E-Commerce' : 'E-Commerce', url: `${siteConfig.url}/${currentLocale}/servizi/e-commerce` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
