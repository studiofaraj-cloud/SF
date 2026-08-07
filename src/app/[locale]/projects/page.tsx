import { setRequestLocale } from 'next-intl/server';

import { getProjectsAction } from '@/lib/actions';
import { ProjectsListClient } from '@/components/site/projects-list-client';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import {
  siteConfig,
  generateStructuredDataCollectionPage,
  generateStructuredDataBreadcrumbList,
} from '@/lib/seo';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = (locale === 'it' || locale === 'en' ? locale : 'it') as Locale;
  setRequestLocale(currentLocale);

  const projects = (await getProjectsAction()) as Project[];
  const published = projects.filter((p) => p.published);

  const listUrl = `${siteConfig.url}/${currentLocale}/projects`;
  const isIt = currentLocale === 'it';

  const collectionData = generateStructuredDataCollectionPage(
    isIt ? 'Progetti - Portfolio | Studio Faraj' : 'Projects - Portfolio | Studio Faraj',
    isIt
      ? 'Portfolio dei progetti di sviluppo web, e-commerce e applicazioni digitali realizzati da Studio Faraj.'
      : 'Portfolio of web development, e-commerce and digital application projects by Studio Faraj.',
    listUrl,
    published.map((p) => ({
      name: p.title,
      url: `${siteConfig.url}/${currentLocale}/projects/${p.slug}`,
      image: p.featuredImage || undefined,
    }))
  );

  const breadcrumbData = generateStructuredDataBreadcrumbList([
    { name: 'Home', url: `${siteConfig.url}/${currentLocale}` },
    { name: isIt ? 'Progetti' : 'Projects', url: listUrl },
  ]);

  return (
    <>
      <StructuredDataServer data={[collectionData, breadcrumbData]} />
      <ProjectsListClient projects={projects} />
    </>
  );
}
