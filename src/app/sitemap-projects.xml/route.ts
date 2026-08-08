import { getProjectsAction } from '@/lib/actions';
import { renderDefaultLocaleUrl, wrapUrlset, SITEMAP_HEADERS } from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * PROJECTS sitemap.
 *
 * Same pattern as the blog sitemap. lastmod is the project's updatedAt
 * (falling back to createdAt).
 *
 * Default locale only: a project has one set of text fields, so /en/projects/
 * {slug} is the same Italian document as /it/projects/{slug} and canonicalises
 * to it. Submitting both would ask Google to crawl a URL we point away from.
 */
export async function GET() {
  const projects = await getProjectsAction();
  const published = projects.filter((p) => p.published);

  const blocks: string[] = [];
  for (const { slug, createdAt, updatedAt } of published) {
    const lastmod = new Date(updatedAt || createdAt).toISOString();
    blocks.push(
      renderDefaultLocaleUrl({
        path: `/projects/${slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: '0.8',
      }),
    );
  }

  return new Response(wrapUrlset(blocks), { headers: SITEMAP_HEADERS });
}
