import {
  getBlogsAction,
  getProjectsAction,
  getPublishedCompanyProfilesAction,
} from '@/lib/actions';
import {
  SITE_URL,
  xmlEscape,
  maxLastmod,
  SITEMAP_HEADERS,
} from '@/lib/sitemap-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * SITEMAP INDEX — entry point that lists the 4 per-category sub-sitemaps:
 *   /sitemap-pages.xml     static pages + service pages
 *   /sitemap-blog.xml      blog posts
 *   /sitemap-projects.xml  projects
 *   /sitemap-companies.xml company profiles (single-locale, /c/[slug])
 *
 * Each entry carries its own <lastmod> computed from the freshest item it
 * contains. Googlebot reads the index, compares each sub-sitemap's lastmod
 * against the one it last crawled, and refetches only the ones that
 * actually changed → new pages get discovered faster than with a single
 * monolithic sitemap, and we stop emitting "everything was just updated"
 * (which Google eventually learns to ignore).
 *
 * Bump this constant when you make a significant content change to a
 * static page that doesn't have a backing data source.
 */
const STATIC_PAGES_FLOOR_LASTMOD = '2026-06-02T00:00:00.000Z';

export async function GET() {
  // Fetch all three dynamic sources in parallel; same data the sub-sitemaps
  // will fetch when crawled. Cheap because the actions are cached by
  // Firestore's own SDK and the route is s-maxage=600 anyway.
  const [blogs, projects, companies] = await Promise.all([
    getBlogsAction(),
    getProjectsAction(),
    getPublishedCompanyProfilesAction(),
  ]);

  const publishedBlogs = blogs.filter((b) => b.published);
  const publishedProjects = projects.filter((p) => p.published);

  // For the dynamic-content sub-sitemaps the lastmod must reflect the actual
  // newest item — we pass a far-past epoch as the floor so it never wins.
  // Using STATIC_PAGES_FLOOR_LASTMOD here would falsely advance the blog/
  // projects sub-sitemap lastmod past their real content date, which would
  // teach Google our lastmod isn't trustworthy.
  const EPOCH = '1970-01-01T00:00:00.000Z';

  const blogLastmod = maxLastmod(
    publishedBlogs.flatMap((b) => [b.updatedAt, b.createdAt]),
    EPOCH,
  );
  const projectsLastmod = maxLastmod(
    publishedProjects.flatMap((p) => [p.updatedAt, p.createdAt]),
    EPOCH,
  );
  const companiesLastmod = maxLastmod(
    companies.flatMap((c) => [c.updatedAt, c.publishedAt]),
    EPOCH,
  );

  // The pages sub-sitemap includes static pages whose lastmod is the floor,
  // plus index pages (/blog, /projects, /pagine-aziendali) whose effective
  // lastmod is the newest item they surface. The pages sub-sitemap's overall
  // lastmod is therefore the max of the floor + all three latest-item dates.
  const pagesLastmod = maxLastmod(
    [blogLastmod, projectsLastmod, companiesLastmod],
    STATIC_PAGES_FLOOR_LASTMOD,
  );

  const subSitemaps: Array<{ path: string; lastmod: string }> = [
    { path: '/sitemap-pages.xml',     lastmod: pagesLastmod },
    { path: '/sitemap-blog.xml',      lastmod: blogLastmod },
    { path: '/sitemap-projects.xml',  lastmod: projectsLastmod },
    { path: '/sitemap-companies.xml', lastmod: companiesLastmod },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${subSitemaps
  .map(
    ({ path, lastmod }) => `  <sitemap>
    <loc>${xmlEscape(`${SITE_URL}${path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>
`;

  return new Response(body, { headers: SITEMAP_HEADERS });
}
