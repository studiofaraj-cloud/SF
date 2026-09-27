import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { getProjectBySlugAction, getProjectsAction } from '@/lib/actions';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { ProjectCaseStudy, type NextProject } from '@/components/site/project-case-study';
import { generateMetadata as generateSEOMetadata, siteConfig, generateStructuredDataBreadcrumbList } from '@/lib/seo';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

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

  // A failed read throws rather than falling through to "not found" — see the page below.
  const project: Project | null = await getProjectBySlugAction(slug);

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
    // A project has one set of Firestore text fields, so /en/projects/{slug}
    // serves the identical document as /it/projects/{slug}. Canonicalise both
    // to the Italian URL instead of claiming a translation exists.
    defaultLocaleOnly: true,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ProjectPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentLocale = (locale === 'it' || locale === 'en' ? locale : 'it') as Locale;
  setRequestLocale(currentLocale);

  // Only a project that doesn't exist is a 404: a failed read throws, so Next
  // keeps serving the last good version of this page instead of caching
  // "not found" for a real project.
  const project: Project | null = await getProjectBySlugAction(slug);

  if (!project || !project.published) notFound();

  // The next project in portfolio order (wrapping round), for the closing link.
  let next: NextProject | null = null;
  try {
    const published = ((await getProjectsAction()) as Project[]).filter((p) => p.published);
    const at = published.findIndex((p) => p.slug === slug);
    const candidate = published.length > 1 ? published[(at + 1) % published.length] : null;
    if (candidate && candidate.slug !== slug) {
      next = {
        slug: candidate.slug,
        title: candidate.title,
        featuredImage: candidate.featuredImage,
        projectUrl: candidate.projectUrl,
        clientName: candidate.clientName,
      };
    }
  } catch {
    // non-critical
  }

  const postUrl = `${siteConfig.url}/${currentLocale}/projects/${slug}`;

  // Full image set for structured data (featured + gallery, deduped)
  const images = Array.from(
    new Set([project.featuredImage, ...(project.gallery || [])].filter(Boolean))
  );
  const imageValue = images.length > 0 ? images : siteConfig.ogImage;

  // Indexable case-study narrative folded into the schema
  const caseStudyText = [project.challenge, project.solution, project.results]
    .filter(Boolean)
    .join('\n\n');

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: postUrl,
    mainEntityOfPage: postUrl,
    image: imageValue,
    datePublished: project.createdAt,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/assets/logo.png` },
    },
    ...(caseStudyText ? { abstract: caseStudyText } : {}),
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
      <ProjectCaseStudy project={project} next={next} locale={currentLocale} />
    </>
  );
}
