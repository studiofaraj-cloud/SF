import { siteConfig } from '@/lib/seo';

export const dynamic = 'force-static';

/*
 * One set of rules for every crawler. Search engines and the AI assistants'
 * crawlers are named so it is explicit that they are welcome: ChatGPT,
 * Perplexity, Claude, Gemini and Apple answer from what their crawlers read,
 * and Bing's index also feeds ChatGPT search and Copilot. A crawler that
 * finds its own name uses only that group, so they all share this one group
 * (RFC 9309 allows several user-agent lines per group) and can't drift apart.
 *
 * The client hub stays crawlable on purpose: its pages say noindex, and a
 * crawler has to fetch a page to read that.
 */
const AGENTS = [
  '*',
  // Search engines
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  // AI search and assistants
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export function GET() {
  const robotsTxt = `# Studio Faraj - robots.txt
# ${siteConfig.url}

${AGENTS.map((a) => `User-agent: ${a}`).join('\n')}
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/data/
Disallow: /search?*
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?fbclid=*

Sitemap: ${siteConfig.url}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
