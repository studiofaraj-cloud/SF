import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateStructuredDataService, generateStructuredDataBreadcrumbList, siteConfig } from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';

  const seoContent = {
    it: {
      title: 'Manutenzione e Supporto Web - Studio Faraj | Sciacca',
      description: 'Servizi di manutenzione e supporto per siti web. Aggiornamenti, backup, sicurezza e ottimizzazione delle performance. Supporto continuo per il tuo sito.',
      keywords: [
        'manutenzione siti web',
        'supporto web',
        'aggiornamenti sito',
        'backup sito web',
        'sicurezza web',
        'manutenzione Sicilia',
      ],
    },
    en: {
      title: 'Website Maintenance and Support - Studio Faraj | Sciacca',
      description: 'Website maintenance and support services. Updates, backups, security and performance optimization. Continuous support for your website.',
      keywords: [
        'website maintenance',
        'web support',
        'website updates',
        'website backup',
        'web security',
        'maintenance Sicily',
      ],
    },
  };

  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/servizi/manutenzione`;
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

export default async function ManutenzioneLayout({
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
    currentLocale === 'it' ? 'Manutenzione' : 'Maintenance',
    currentLocale === 'it'
      ? 'Servizi di manutenzione e supporto per siti web. Aggiornamenti, backup, sicurezza e ottimizzazione delle performance. Supporto continuo per il tuo sito.'
      : 'Website maintenance and support services. Updates, backups, security and performance optimization. Continuous support for your website.',
    `${siteConfig.url}/${currentLocale}/servizi/manutenzione`,
    currentLocale
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: currentLocale === 'it' ? 'Home' : 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Servizi' : 'Services', url: `${siteConfig.url}/${currentLocale}/servizi` },
    { name: currentLocale === 'it' ? 'Manutenzione' : 'Maintenance', url: `${siteConfig.url}/${currentLocale}/servizi/manutenzione` },
  ]);

  return (
    <>
      <StructuredDataServer data={[serviceData, breadcrumbData]} />
      {children}
    </>
  );
}
