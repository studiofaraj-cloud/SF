
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';
  
  const seoContent = {
    it: {
      title: 'Chi Siamo - Studio Faraj | Il Nostro Team e la Nostra Storia',
      description: 'Scopri Studio Faraj: un team di esperti in sviluppo web, design e marketing digitale con sede a Sciacca, Sicilia. Professionalità, innovazione e risultati garantiti.',
      keywords: [
        'chi siamo',
        'team sviluppo web',
        'agenzia web Sciacca',
        'studio faraj',
        'sviluppatori web Sicilia',
        'team digitale',
      ],
    },
    en: {
      title: 'About Us - Studio Faraj | Our Team and Our Story',
      description: 'Discover Studio Faraj: a team of experts in web development, design and digital marketing based in Sciacca, Sicily. Professionalism, innovation and guaranteed results.',
      keywords: [
        'about us',
        'web development team',
        'web agency Sciacca',
        'studio faraj',
        'web developers Sicily',
        'digital team',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/chi-siamo`;
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
