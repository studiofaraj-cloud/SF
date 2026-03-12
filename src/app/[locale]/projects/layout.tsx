
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  const baseUrl = `${siteConfig.url}${currentLocale === 'it' ? '' : `/${currentLocale}`}/projects`;
  const alternateUrls = {
    it: currentLocale === 'it' ? baseUrl : baseUrl.replace(`/${currentLocale}`, '/it').replace(/^\/en/, '/it'),
    en: currentLocale === 'en' ? baseUrl : baseUrl.replace(`/${currentLocale}`, '/en').replace(/^\/it/, '/en'),
  };
  
  const seoContent = currentLocale === 'it' ? {
    title: 'Progetti - Portfolio | Studio Faraj',
    description: 'Scopri i nostri progetti di sviluppo web, e-commerce e applicazioni digitali. Portfolio di successi realizzati per clienti in tutta Italia.',
    keywords: ['portfolio', 'progetti web', 'case study', 'progetti sviluppo web', 'portfolio digitale'],
  } : {
    title: 'Projects - Portfolio | Studio Faraj',
    description: 'Discover our web development, e-commerce and digital application projects. Portfolio of successes achieved for clients throughout Italy.',
    keywords: ['portfolio', 'web projects', 'case study', 'web development projects', 'digital portfolio'],
  };
  
  return generateSEOMetadata({
    ...seoContent,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
  });
}

export default async function ProjectsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en') ? locale : 'it';
  setRequestLocale(currentLocale);
  return children;
}
