import { getBlogsAction } from '@/lib/actions';
import { renderDefaultLocaleUrl, wrapUrlset, SITEMAP_HEADERS } from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * BLOG POSTS sitemap.
 *
 * lastmod uses the post's updatedAt (falling back to createdAt) — an honest
 * freshness signal Google can trust to schedule re-crawls.
 *
 * Default locale only: a post has one set of text fields, so /en/blog/{slug}
 * serves the same Italian document as /it/blog/{slug} and canonicalises to it.
 * Emitting both (which is what the previous per-locale loop did) submitted ~13
 * duplicate English URLs annotated as translations that do not exist.
 */
export async function GET() {
  const blogs = await getBlogsAction();
  const published = blogs.filter((b) => b.published);

  const blocks: string[] = [];
  for (const { slug, createdAt, updatedAt } of published) {
    const lastmod = new Date(updatedAt || createdAt).toISOString();
    blocks.push(
      renderDefaultLocaleUrl({
        path: `/blog/${slug}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.9',
      }),
    );
  }

  return new Response(wrapUrlset(blocks), { headers: SITEMAP_HEADERS });
}
