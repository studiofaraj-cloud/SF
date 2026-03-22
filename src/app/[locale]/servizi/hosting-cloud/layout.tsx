import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'Hosting e Cloud - Studio Faraj | Soluzioni di Hosting Professionale',
      description: 'Servizi di hosting e cloud per siti web e applicazioni. Hosting veloce, sicuro e scalabile con supporto tecnico dedicato. Sciacca, Sicilia.',
      keywords: [
        'hosting',
        'cloud hosting',
        'hosting web',
        'server cloud',
        'hosting Sicilia',
        'cloud computing',
      ],
    },
    en: {
      title: 'Hosting and Cloud - Studio Faraj | Professional Hosting Solutions',
      description: 'Hosting and cloud services for websites and applications. Fast, secure and scalable hosting with dedicated technical support. Sciacca, Sicily.',
      keywords: [
        'hosting',
        'cloud hosting',
        'web hosting',
        'cloud server',
        'hosting Sicily',
        'cloud computing',
      ],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/servizi/hosting-cloud`;
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

export default async function HostingCloudLayout({
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
    currentLocale === 'it' ? 'Hosting e Cloud' : 'Hosting & Cloud',
    currentLocale === 'it'
      ? 'Servizi di hosting e cloud per siti web e applicazioni. Hosting veloce, sicuro e scalabile con supporto tecnico dedicato.'
      : 'Hosting and cloud services for websites and applications. Fast, secure and scalable hosting with dedicated technical support.',
    `${siteConfig.url}/${currentLocale}/servizi/hosting-cloud`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}/${currentLocale}/servizi` },
    { name: currentLocale === 'it' ? 'Hosting e Cloud' : 'Hosting & Cloud', url: `${siteConfig.url}/${currentLocale}/servizi/hosting-cloud` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
