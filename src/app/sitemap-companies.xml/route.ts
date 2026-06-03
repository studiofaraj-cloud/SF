import { getPublishedCompanyProfilesAction } from '@/lib/actions';
import { SITE_URL, xmlEscape, wrapUrlset, SITEMAP_HEADERS } from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * COMPANY PROFILES sitemap.
 *
 * Profiles live under /c/[slug] (no locale prefix — they're single-locale
 * content owned by the company), so we don't emit hreflang alternates and
 * render the <url> blocks directly without renderLocalizedUrl.
 *
 * lastmod uses updatedAt (then publishedAt) — honest freshness signal.
 */
export async function GET() {
  const companies = await getPublishedCompanyProfilesAction();

  const blocks = companies.map(({ slug, updatedAt, publishedAt }) => {
    const lastmod = new Date(updatedAt || publishedAt || Date.now()).toISOString();
    return `    <url>
      <loc>${xmlEscape(`${SITE_URL}/c/${slug}`)}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`;
  });

  return new Response(wrapUrlset(blocks), { headers: SITEMAP_HEADERS });
}
