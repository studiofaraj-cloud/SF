import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'Design UI/UX Professionale - Studio Faraj | Sciacca',
      description: 'Design UI/UX moderno e user-friendly per siti web e applicazioni. Creiamo interfacce intuitive che migliorano l\'esperienza utente e aumentano le conversioni.',
      keywords: [
        'design UI/UX',
        'user experience',
        'user interface',
        'design web',
        'UX design',
        'UI design Sicilia',
      ],
    },
    en: {
      title: 'Professional UI/UX Design - Studio Faraj | Sciacca',
      description: 'Modern and user-friendly UI/UX design for websites and applications. We create intuitive interfaces that improve user experience and increase conversions.',
      keywords: [
        'UI/UX design',
        'user experience',
        'user interface',
        'web design',
        'UX design',
        'UI design Sicily',
      ],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/design-ui-ux`;
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

export default async function DesignUIUXLayout({
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
    currentLocale === 'it' ? 'Design UI/UX' : 'UI/UX Design',
    currentLocale === 'it'
      ? 'Design UI/UX moderno e user-friendly per siti web e applicazioni. Creiamo interfacce intuitive che migliorano l\'esperienza utente e aumentano le conversioni.'
      : 'Modern and user-friendly UI/UX design for websites and applications. We create intuitive interfaces that improve user experience and increase conversions.',
    `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/design-ui-ux`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi` },
    { name: currentLocale === 'it' ? 'Design UI/UX' : 'UI/UX Design', url: `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/servizi/design-ui-ux` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
