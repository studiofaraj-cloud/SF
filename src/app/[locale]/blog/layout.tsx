
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale as 'it' | 'en';
  const baseUrl = `${siteConfig.url}/${currentLocale}/blog`;
  const alternateUrls = {
    it: baseUrl.replace(`/${currentLocale}/`, '/it/'),
    en: baseUrl.replace(`/${currentLocale}/`, '/en/'),
  };
  
  const seoContent = currentLocale === 'it' ? {
    title: 'Blog - Articoli e Guide | Studio Faraj',
    description: 'Leggi gli ultimi articoli su sviluppo web, design, SEO, e-commerce e tecnologie digitali. Guide pratiche e approfondimenti dal team di Studio Faraj.',
    keywords: ['blog sviluppo web', 'articoli web design', 'guide SEO', 'blog digitale', 'notizie web'],
  } : {
    title: 'Blog - Articles and Guides | Studio Faraj',
    description: 'Read the latest articles on web development, design, SEO, e-commerce and digital technologies. Practical guides and insights from the Studio Faraj team.',
    keywords: ['web development blog', 'web design articles', 'SEO guides', 'digital blog', 'web news'],
  };
  
  return generateSEOMetadata({
    ...seoContent,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls,
  });
}

export default async function BlogLayout({
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
