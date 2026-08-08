import {
  getBlogsAction,
  getProjectsAction,
  getPublishedCompanyProfilesAction,
} from '@/lib/actions';
import { locales } from '@/i18n/config';
import {
  renderLocalizedUrl,
  renderDefaultLocaleUrl,
  wrapUrlset,
  SITEMAP_HEADERS,
  maxLastmod,
} from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * STATIC + SERVICE PAGES sitemap.
 *
 * For non-index static pages (home, /chi-siamo, /contatti, etc.) the lastmod
 * is a hardcoded date reflecting the last real content change. Bump it when
 * you meaningfully edit the page copy. For index pages that surface dynamic
 * lists (/blog, /projects, /pagine-aziendali) we compute lastmod from the
 * latest item, so the index page is treated as "changed" when new content
 * is added.
 *
 * Why hardcoded for static pages: emitting `new Date()` on every request
 * teaches Google that our <lastmod> is unreliable — eventually it stops
 * trusting the sitemap as a freshness signal, which is the opposite of what
 * we want.
 */

// ── Hardcoded lastmod for pages without dynamic content ──────────────────────
// Update these when the page copy is meaningfully changed.
const STATIC_PAGE_LASTMOD = '2026-06-02';

interface StaticPage {
  url: string;
  priority: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Overrides STATIC_PAGE_LASTMOD when the page surfaces dynamic content. */
  computedLastmod?: string;
}

export async function GET() {
  // Fetch dynamic lists once so we can derive accurate lastmod for index pages.
  const [blogs, projects, companies] = await Promise.all([
    getBlogsAction(),
    getProjectsAction(),
    getPublishedCompanyProfilesAction(),
  ]);

  const publishedBlogs = blogs.filter((b) => b.published);
  const publishedProjects = projects.filter((p) => p.published);

  // Index pages' lastmod = most recent updatedAt/createdAt of the items they list.
  const blogIndexLastmod = maxLastmod(
    publishedBlogs.flatMap((b) => [b.updatedAt, b.createdAt]),
    STATIC_PAGE_LASTMOD,
  );
  const projectsIndexLastmod = maxLastmod(
    publishedProjects.flatMap((p) => [p.updatedAt, p.createdAt]),
    STATIC_PAGE_LASTMOD,
  );
  const companiesIndexLastmod = maxLastmod(
    companies.flatMap((c) => [c.updatedAt, c.publishedAt]),
    STATIC_PAGE_LASTMOD,
  );

  const staticPages: StaticPage[] = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/chi-siamo', priority: '0.8', changefreq: 'monthly' },
    { url: '/contatti', priority: '0.9', changefreq: 'monthly' },
    { url: '/inizia', priority: '0.9', changefreq: 'monthly' },
    {
      url: '/pagine-aziendali',
      priority: '0.95',
      changefreq: 'weekly',
      computedLastmod: companiesIndexLastmod,
    },
    { url: '/servizi', priority: '0.9', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    {
      url: '/projects',
      priority: '0.8',
      changefreq: 'weekly',
      computedLastmod: projectsIndexLastmod,
    },
    {
      url: '/blog',
      priority: '0.8',
      changefreq: 'weekly',
      computedLastmod: blogIndexLastmod,
    },
    { url: '/legal', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  const servicePages: StaticPage[] = [
    { url: '/servizi/sviluppo-web', priority: '0.9', changefreq: 'monthly' },
    { url: '/servizi/e-commerce', priority: '0.9', changefreq: 'monthly' },
    { url: '/servizi/design-ui-ux', priority: '0.9', changefreq: 'monthly' },
    { url: '/servizi/seo-marketing', priority: '0.9', changefreq: 'monthly' },
    { url: '/servizi/ai-automazione', priority: '0.9', changefreq: 'monthly' },
    { url: '/servizi/manutenzione', priority: '0.8', changefreq: 'monthly' },
    { url: '/servizi/hosting-cloud', priority: '0.8', changefreq: 'monthly' },
    { url: '/servizi/consulenza', priority: '0.8', changefreq: 'monthly' },
  ];

  /**
   * Italian-only pages. These call notFound() for any locale but `it`, so they
   * must be emitted once, without hreflang alternates pointing at URLs that 404.
   *
   * They target Italian-language queries on Italian slugs ("quanto costa un sito
   * web", "sito web impresa ristrutturazioni"); an English twin would be a thin
   * duplicate aimed at a market this domain has no realistic chance in.
   */
  const italianOnlyPages: StaticPage[] = [
    { url: '/quanto-costa-un-sito-web', priority: '0.9', changefreq: 'monthly' },
    { url: '/siti-web/edilizia', priority: '0.9', changefreq: 'monthly' },
    { url: '/siti-web/imprese-di-ristrutturazione', priority: '0.8', changefreq: 'monthly' },
  ];

  const all = [...staticPages, ...servicePages];

  const blocks: string[] = [];
  for (const page of all) {
    const lastmod = page.computedLastmod ?? STATIC_PAGE_LASTMOD;
    for (const locale of locales) {
      blocks.push(
        renderLocalizedUrl(
          {
            path: page.url,
            lastmod,
            changefreq: page.changefreq,
            priority: page.priority,
          },
          locale,
        ),
      );
    }
  }

  for (const page of italianOnlyPages) {
    blocks.push(
      renderDefaultLocaleUrl({
        path: page.url,
        lastmod: page.computedLastmod ?? STATIC_PAGE_LASTMOD,
        changefreq: page.changefreq,
        priority: page.priority,
      }),
    );
  }

  return new Response(wrapUrlset(blocks), { headers: SITEMAP_HEADERS });
}
