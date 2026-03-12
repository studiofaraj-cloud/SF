
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  
  const seoContent = {
    it: {
      title: 'Contatti - Studio Faraj | Richiedi un Preventivo Gratuito',
      description: 'Contatta Studio Faraj a Sciacca, Sicilia. Richiedi un preventivo gratuito per il tuo progetto web. Siamo disponibili per consulenze e collaborazioni.',
      keywords: [
        'contatti',
        'preventivo',
        'consulenza web',
        'studio faraj contatti',
        'Sciacca',
        'Sicilia',
      ],
    },
    en: {
      title: 'Contact - Studio Faraj | Request a Free Quote',
      description: 'Contact Studio Faraj in Sciacca, Sicily. Request a free quote for your web project. We are available for consultations and collaborations.',
      keywords: [
        'contact',
        'quote',
        'web consultation',
        'studio faraj contact',
        'Sciacca',
        'Sicily',
      ],
    },
  };
  
  const content = seoContent[currentLocale] || seoContent.it;
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/contatti`;
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

export default async function ContattiLayout({
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
