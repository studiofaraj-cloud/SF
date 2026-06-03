import { getProjectsAction } from '@/lib/actions';
import { locales } from '@/i18n/config';
import { renderLocalizedUrl, wrapUrlset, SITEMAP_HEADERS } from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * PROJECTS sitemap.
 *
 * Same pattern as the blog sitemap. lastmod is the project's updatedAt
 * (falling back to createdAt).
 */
export async function GET() {
  const projects = await getProjectsAction();
  const published = projects.filter((p) => p.published);

  const blocks: string[] = [];
  for (const { slug, createdAt, updatedAt } of published) {
    const lastmod = new Date(updatedAt || createdAt).toISOString();
    for (const locale of locales) {
      blocks.push(
        renderLocalizedUrl(
          {
            path: `/projects/${slug}`,
            lastmod,
            changefreq: 'monthly',
            priority: '0.8',
          },
          locale,
        ),
      );
    }
  }

  return new Response(wrapUrlset(blocks), { headers: SITEMAP_HEADERS });
}
