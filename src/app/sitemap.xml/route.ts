import { getBlogsAction, getProjectsAction } from '@/lib/actions';
import { siteConfig } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const revalidate = 3600; // Regenerate sitemap every hour

const staticPages = [
  { url: '', priority: '1.0', changefreq: 'daily' },
  { url: '/chi-siamo', priority: '0.8', changefreq: 'monthly' },
  { url: '/contatti', priority: '0.9', changefreq: 'monthly' },
  { url: '/servizi', priority: '0.9', changefreq: 'monthly' },
  { url: '/faq', priority: '0.7', changefreq: 'monthly' },
  { url: '/projects', priority: '0.8', changefreq: 'weekly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/legal', priority: '0.3', changefreq: 'yearly' },
];

const servicePages = [
  { url: '/servizi/sviluppo-web', priority: '0.9', changefreq: 'monthly' },
  { url: '/servizi/e-commerce', priority: '0.9', changefreq: 'monthly' },
  { url: '/servizi/design-ui-ux', priority: '0.9', changefreq: 'monthly' },
  { url: '/servizi/seo-marketing', priority: '0.9', changefreq: 'monthly' },
  { url: '/servizi/ai-automazione', priority: '0.9', changefreq: 'monthly' },
  { url: '/servizi/manutenzione', priority: '0.8', changefreq: 'monthly' },
  { url: '/servizi/hosting-cloud', priority: '0.8', changefreq: 'monthly' },
  { url: '/servizi/consulenza', priority: '0.8', changefreq: 'monthly' },
];

export async function GET() {
  const siteUrl = siteConfig.url;

  const blogs = await getBlogsAction();
  const projects = await getProjectsAction();

  // Generate URLs for all locales, always with a prefix
  const generateUrl = (path: string, locale: string) => {
    return `${siteUrl}/${locale}${path}`;
  };

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${locales.map(locale => 
    staticPages
      .map((page) => {
        const url = generateUrl(page.url, locale);
        const alternateUrls = locales
          .map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(page.url, l)}" />`)
          .join('\n      ');
        return `
    <url>
      <loc>${url}</loc>
      ${alternateUrls}
      <xhtml:link rel="alternate" hreflang="x-default" href="${generateUrl(page.url, 'it')}" />
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `;
      })
      .join('')
  ).join('')}
  ${locales.map(locale => 
    servicePages
      .map((page) => {
        const url = generateUrl(page.url, locale);
        const alternateUrls = locales
          .map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(page.url, l)}" />`)
          .join('\n      ');
        return `
    <url>
      <loc>${url}</loc>
      ${alternateUrls}
      <xhtml:link rel="alternate" hreflang="x-default" href="${generateUrl(page.url, 'it')}" />
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `;
      })
      .join('')
  ).join('')}
  ${blogs
    .filter(blog => blog.published)
    .map(({ slug, createdAt, updatedAt }) => {
      return locales.map(locale => {
        const url = generateUrl(`/blog/${slug}`, locale);
        const alternateUrls = locales
          .map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(`/blog/${slug}`, l)}" />`)
          .join('\n      ');
        return `
    <url>
      <loc>${url}</loc>
      ${alternateUrls}
      <xhtml:link rel="alternate" hreflang="x-default" href="${generateUrl(`/blog/${slug}`, 'it')}" />
      <lastmod>${new Date(updatedAt || createdAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>
  `;
      }).join('');
    })
    .join('')}
  ${projects
    .filter(project => project.published)
    .map(({ slug, createdAt, updatedAt }) => {
      return locales.map(locale => {
        const url = generateUrl(`/projects/${slug}`, locale);
        const alternateUrls = locales
          .map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${generateUrl(`/projects/${slug}`, l)}" />`)
          .join('\n      ');
        return `
    <url>
      <loc>${url}</loc>
      ${alternateUrls}
      <xhtml:link rel="alternate" hreflang="x-default" href="${generateUrl(`/projects/${slug}`, 'it')}" />
      <lastmod>${new Date(updatedAt || createdAt).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
      }).join('');
    })
    .join('')}
</urlset>
`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
