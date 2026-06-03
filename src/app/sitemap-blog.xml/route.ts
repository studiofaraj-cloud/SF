import { getBlogsAction } from '@/lib/actions';
import { locales } from '@/i18n/config';
import { renderLocalizedUrl, wrapUrlset, SITEMAP_HEADERS } from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * BLOG POSTS sitemap.
 *
 * Each post emits one <url> per locale with hreflang alternates pointing to
 * the same slug under each locale. lastmod uses the post's updatedAt
 * (falling back to createdAt) — this is an honest freshness signal that
 * Google can trust to schedule re-crawls.
 */
export async function GET() {
  const blogs = await getBlogsAction();
  const published = blogs.filter((b) => b.published);

  const blocks: string[] = [];
  for (const { slug, createdAt, updatedAt } of published) {
    const lastmod = new Date(updatedAt || createdAt).toISOString();
    for (const locale of locales) {
      blocks.push(
        renderLocalizedUrl(
          {
            path: `/blog/${slug}`,
            lastmod,
            changefreq: 'weekly',
            priority: '0.9',
          },
          locale,
        ),
      );
    }
  }

  return new Response(wrapUrlset(blocks), { headers: SITEMAP_HEADERS });
}
