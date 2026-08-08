import type { Metadata } from 'next';
import {
  generateMetadata as buildSEOMetadata,
  generateStructuredDataPageBreadcrumb,
  siteConfig,
} from '@/lib/seo';
import { pick, t, type Lang } from './translations';
import { PaginaAziendaliBody } from './body';

type RouteParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lang: Lang = locale === 'en' ? 'en' : 'it';
  return buildSEOMetadata({
    title: pick('metaTitle', lang),
    description: pick('metaDescription', lang),
    url: `${siteConfig.url}/${lang}/pagine-aziendali`,
    locale: lang,
    keywords:
      lang === 'it'
        ? [
            'pagina aziendale online',
            'presenza online azienda',
            'sito vetrina azienda',
            'profilo azienda Google',
            'SEO Padova',
            'backlink dofollow Italia',
            'pagina aziendale Veneto',
            'visibilità Google azienda',
            'azienda online senza sito',
            'pagina pubblica aziendale',
          ]
        : [
            'business page online',
            'online presence for business',
            'company profile Google',
            'business website alternative',
            'SEO backlinks Italy',
            'business page Italy',
            'company online visibility',
            'business without website',
          ],
  });
}

export default async function PagineAziendaliPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale } = await params;
  const lang: Lang = locale === 'en' ? 'en' : 'it';
  const faqs = t.faqs[lang];

  // JSON-LD: FAQPage schema for rich snippet results in Google.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumb = generateStructuredDataPageBreadcrumb(lang, {
    name: lang === 'it' ? 'Pagine Aziendali' : 'Business Pages',
    path: '/pagine-aziendali',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PaginaAziendaliBody lang={lang} />
    </>
  );
}
