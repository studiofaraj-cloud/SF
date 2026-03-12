import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { getProjectBySlugAction, getProjectsAction } from '@/lib/actions';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { ProjectPostClient } from '@/components/site/project-post-client';
import { generateMetadata as generateSEOMetadata, siteConfig, generateStructuredDataBreadcrumbList } from '@/lib/seo';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

// ─── Date helpers ─────────────────────────────────────────────────────────────
const IT_MONTHS = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDateServer(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return `${d.getUTCDate()} ${locale === 'it' ? IT_MONTHS[d.getUTCMonth()] : EN_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// ─── Static params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const projects = await getProjectsAction();
    const locales = ['it', 'en'];
    return locales.flatMap((locale) =>
      projects
        .filter((p: Project) => p.published)
        .map((p: Project) => ({ locale, slug: p.slug }))
    );
  } catch {
    return [];
  }
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'it' || locale === 'en' ? locale : 'it') as Locale;

  let project: Project | null = null;
  try {
    project = await getProjectBySlugAction(slug);
  } catch {
    // handled below
  }

  if (!project || !project.published) {
    return { title: 'Progetto non trovato | Studio Faraj' };
  }

  const baseUrl = `${siteConfig.url}/${currentLocale}/projects/${slug}`;

  return generateSEOMetadata({
    title: project.title,
    description: project.description,
    image: project.featuredImage || siteConfig.ogImage,
    url: baseUrl,
    locale: currentLocale,
    alternateUrls: {
      it: `${siteConfig.url}/it/projects/${slug}`,
      en: `${siteConfig.url}/en/projects/${slug}`,
    },
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ProjectPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'it' || locale === 'en' ? locale : 'it') as Locale;
  setRequestLocale(currentLocale);

  let project: Project | null = null;
  try {
    project = await getProjectBySlugAction(slug);
  } catch {
    notFound();
  }

  if (!project || !project.published) notFound();

  // Related projects (other published, up to 3)
  let related: Project[] = [];
  try {
    const all = await getProjectsAction();
    related = (all as Project[])
      .filter((p) => p.published && p.slug !== slug)
      .slice(0, 3);
  } catch {
    // non-critical
  }

  const postUrl = `${siteConfig.url}/${currentLocale}/projects/${slug}`;

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: postUrl,
    image: project.featuredImage || siteConfig.ogImage,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/assets/logo.png` },
    },
    ...(project.technologies ? { keywords: project.technologies.join(', ') } : {}),
  };

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: currentLocale === 'it' ? 'Progetti' : 'Projects', url: `${siteConfig.url}/${currentLocale}/projects` },
    { name: project.title, url: postUrl },
  ]);

  return (
    <>
      <StructuredDataServer data={[structuredData, breadcrumbData]} />
      <ProjectPostClient
        project={project}
        related={related}
        locale={currentLocale}
        formattedDate={formatDateServer(project.createdAt, currentLocale)}
        relatedDates={related.map(r => formatDateServer(r.createdAt, currentLocale))}
      />
    </>
  );
}
