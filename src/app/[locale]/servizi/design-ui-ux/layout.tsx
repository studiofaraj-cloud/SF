import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'Web Design e UI/UX a Padova',
      description: 'Web design e UI/UX a Padova: interfacce chiare e siti progettati per convertire, su desktop e mobile. Per aziende e professionisti del Veneto.',
      keywords: [
        'design UI/UX',
        'user experience',
        'user interface',
        'design web',
        'UX design',
        'UI design Veneto',
      ],
    },
    en: {
      title: 'Web Design and UI/UX in Padova, Italy',
      description: 'Web design and UI/UX in Padova, Italy: clear interfaces and websites designed to convert on desktop and mobile. For businesses across the Veneto region.',
      keywords: [
        'UI/UX design',
        'user experience',
        'user interface',
        'web design',
        'UX design',
        'UI design Veneto',
      ],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/servizi/design-ui-ux`;
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
    `${siteConfig.url}/${currentLocale}/servizi/design-ui-ux`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}/${currentLocale}/servizi` },
    { name: currentLocale === 'it' ? 'Design UI/UX' : 'UI/UX Design', url: `${siteConfig.url}/${currentLocale}/servizi/design-ui-ux` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
