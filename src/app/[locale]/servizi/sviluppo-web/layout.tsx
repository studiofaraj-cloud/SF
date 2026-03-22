
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  const seoContent = {
    it: {
      title: 'Sviluppo Web su Misura - Studio Faraj | Sciacca, Sicilia',
      description: 'Sviluppo web professionale e personalizzato a Sciacca, Sicilia. Creiamo siti web moderni, responsive e performanti con le tecnologie più avanzate. Preventivo gratuito.',
      keywords: [
        'sviluppo web',
        'siti web personalizzati',
        'sviluppo web Sciacca',
        'creazione siti web',
        'web development',
        'siti responsive',
      ],
    },
    en: {
      title: 'Custom Web Development - Studio Faraj | Sciacca, Sicily',
      description: 'Professional and customized web development in Sciacca, Sicily. We create modern, responsive and high-performance websites with the most advanced technologies. Free quote.',
      keywords: [
        'web development',
        'custom websites',
        'web development Sciacca',
        'website creation',
        'web development',
        'responsive websites',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/servizi/sviluppo-web`;
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

export default async function SviluppoWebLayout({
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
    currentLocale === 'it' ? 'Sviluppo Web' : 'Web Development',
    currentLocale === 'it'
      ? 'Sviluppo web professionale e personalizzato a Sciacca, Sicilia. Creiamo siti web moderni, responsive e performanti con le tecnologie più avanzate.'
      : 'Professional and customized web development in Sciacca, Sicily. We create modern, responsive and high-performance websites with the most advanced technologies.',
    `${siteConfig.url}/${currentLocale}/servizi/sviluppo-web`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}/${currentLocale}/servizi` },
    { name: currentLocale === 'it' ? 'Sviluppo Web' : 'Web Development', url: `${siteConfig.url}/${currentLocale}/servizi/sviluppo-web` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
