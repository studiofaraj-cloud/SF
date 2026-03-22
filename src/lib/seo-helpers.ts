import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig, type Locale } from '@/lib/seo';

export interface ServiceSEOContent {
  it: {
    title: string;
    description: string;
    keywords: string[];
    serviceName: string;
    serviceDescription: string;
  };
  en: {
    title: string;
    description: string;
    keywords: string[];
    serviceName: string;
    serviceDescription: string;
  };
}

export async function generateServiceMetadata(
  params: Promise<{ locale: string }>,
  content: ServiceSEOContent,
  path: string
): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';
  
  const seoData = content[currentLocale] || content.it;
  const baseUrl = `${siteConfig.url}/${currentLocale}${path}`;
  const alternateUrls = {
    it: baseUrl.replace(`/${currentLocale}/`, '/it/'),
    en: baseUrl.replace(`/${currentLocale}/`, '/en/'),
  };
  
  return generateSEOMetadata({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
  });
}
