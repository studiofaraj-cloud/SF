
import { Metadata } from 'next';
import {
  generateMetadata as generateSEOMetadata,
  generateStructuredDataPageBreadcrumb,
  generateStructuredDataPerson,
  siteConfig,
} from '@/lib/seo';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';
  
  const seoContent = {
    it: {
      title: 'Chi Siamo — Sviluppo Web a Padova dal 2020',
      description: 'Studio Faraj sviluppa siti web e applicazioni su misura a Padova dal 2020. Scopri il team, la nostra storia e come lavoriamo con le aziende del Veneto.',
      keywords: [
        'web agency Nord Est Italia',
        'agenzia web Italia per aziende europee',
        'chi siamo',
        'sviluppo web Padova',
        'team sviluppo web',
        'agenzia web Padova',
        'studio faraj',
        'sviluppatori web Veneto',
        'team digitale',
      ],
    },
    en: {
      title: 'About Us — Padova Web Studio since 2020',
      description: 'Studio Faraj has built custom websites and web apps in Padova, Italy since 2020. Meet the team, read our story and see how we work with Veneto businesses.',
      keywords: [
        'web agency Nord Est Italia',
        'agenzia web Italia per aziende europee',
        'about us',
        'web development Padova',
        'web development team',
        'web agency Padova',
        'studio faraj',
        'web developers Veneto',
        'digital team',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}/chi-siamo`;
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

export default async function ChiSiamoLayout({
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

  // Emitted from the layout because chi-siamo/page.tsx is a client component.
  // Person nodes are the E-E-A-T anchor for the studio: named, credited humans
  // rather than an anonymous brand. Kept to facts that are already on the page.
  const pageUrl = `${siteConfig.url}/${currentLocale}/chi-siamo`;
  const jsonLd = [
    generateStructuredDataPageBreadcrumb(currentLocale, {
      name: currentLocale === 'it' ? 'Chi Siamo' : 'About Us',
      path: '/chi-siamo',
    }),
    generateStructuredDataPerson({
      name: 'Hussein Faraj',
      jobTitle: 'Founder & Full-Stack Developer',
      image: '/assets/hussein-faraj-fondatore-studio-faraj.webp',
      url: pageUrl,
    }),
    generateStructuredDataPerson({
      name: 'Maria Elisa Midulla',
      jobTitle: 'Co-Founder & Frontend Developer',
      url: pageUrl,
    }),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="chi-siamo-schema" />
      {children}
    </>
  );
}
