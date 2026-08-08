
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';
  
  const seoContent = {
    it: {
      title: 'Chi Siamo — Il Nostro Team e la Nostra Storia',
      description: 'Scopri Studio Faraj: un team di esperti in sviluppo web, design e marketing digitale con sede a Padova, Veneto. Professionalità, innovazione e risultati garantiti.',
      keywords: [
        'web agency Nord Est Italia',
        'agenzia web Italia per aziende europee',
        'chi siamo',
        'team sviluppo web',
        'agenzia web Padova',
        'studio faraj',
        'sviluppatori web Veneto',
        'team digitale',
      ],
    },
    en: {
      title: 'About Us — Our Team and Our Story',
      description: 'Discover Studio Faraj: a team of experts in web development, design and digital marketing based in Padova, Veneto. Professionalism, innovation and guaranteed results.',
      keywords: [
        'web agency Nord Est Italia',
        'agenzia web Italia per aziende europee',
        'about us',
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
  
  return children;
}
