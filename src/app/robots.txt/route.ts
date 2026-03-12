import { siteConfig } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  const siteUrl = siteConfig.url;

  const robotsTxt = `# Studio Faraj - robots.txt
# https://www.studiofaraj.it

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /search?*
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?fbclid=*

# Allow important paths explicitly
Allow: /it/
Allow: /en/
Allow: /blog/
Allow: /projects/
Allow: /servizi/
Allow: /chi-siamo
Allow: /contatti
Allow: /faq
Allow: /legal

# Google-specific directives
User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot-Image
Allow: /assets/
Allow: /_next/image

# Bing-specific directives
User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 1

# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
