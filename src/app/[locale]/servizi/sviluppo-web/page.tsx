import { getMessages, setRequestLocale } from 'next-intl/server';
import { ServicePage, type ServicePageContent, type ServiceProof } from '@/components/site/service-page';
import { WebComparison, WebFaq, WebScenarios, WebSectors, WebTwoPaths } from '@/components/site/service-web-sections';
import { getProjectsAction } from '@/lib/actions';
import { SERVICES } from '@/lib/services-catalog';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

// Refreshed hourly, like the portfolio projects it shows.
export const revalidate = 3600;

/** A real project for each of the three scenarios. */
const EXAMPLES = {
  vetrina: 'sito-web-di-colosimo-peinture-a-ginevra',
  dashboard: 'sito-web-e-gestionale-per-concessionaria-auto-usate-minicar-di-ali-ibrahim',
  platform: 'ecommerce-personalizzato-di-olio-di-valeria',
} as const;

/**
 * /servizi/sviluppo-web — the shared service template with this page's own
 * sections (scenarios, comparison, sectors, process, stack, FAQ) and its
 * two-path closing. Copy from services.webDevelopment.v2.
 */
export default async function SviluppoWebPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);

  const messages = (await getMessages({ locale: lang })) as Record<string, any>;
  const m = messages.services.webDevelopment.v2;

  let projects: Project[] = [];
  try {
    projects = ((await getProjectsAction()) as Project[]).filter((p) => p.published && p.featuredImage);
  } catch {
    // Portfolio unavailable: the page renders without the example projects.
  }
  const proofOf = (slug?: string): ServiceProof | undefined => {
    const p = projects.find((x) => x.slug === slug);
    return p
      ? { slug: p.slug, title: p.title, clientName: p.clientName, year: p.year, category: p.category, featuredImage: p.featuredImage, projectUrl: p.projectUrl }
      : undefined;
  };

  const content: ServicePageContent = {
    slug: 'sviluppo-web',
    title: `${m.hero.titleLine1} ${m.hero.titleLine2}`,
    lead: m.hero.subtitle,
    notes: Object.values(m.hero.trust as Record<string, string>),
    quoteLabel: m.hero.ctaQuote,
    features: [],
    sections: [
      {
        kind: 'node',
        node: (
          <WebScenarios
            m={m}
            examples={{ vetrina: proofOf(EXAMPLES.vetrina), dashboard: proofOf(EXAMPLES.dashboard), platform: proofOf(EXAMPLES.platform) }}
            locale={lang}
          />
        ),
      },
      { kind: 'node', node: <WebComparison m={m} /> },
      { kind: 'node', node: <WebSectors m={m} /> },
      {
        kind: 'steps',
        title: `${m.process.title} ${m.process.titleHighlight}`,
        items: (m.process.steps as { title: string; description: string; duration?: string }[]).map((s) => ({
          title: s.title,
          description: s.description,
          meta: s.duration,
        })),
      },
      {
        kind: 'pairs',
        title: `${m.stack.title} ${m.stack.titleHighlight}`,
        lead: m.stack.subtitle,
        items: (m.stack.groups as { name: string; items: string[] }[]).map((g) => ({ name: g.name, description: g.items.join(', ') })),
      },
      { kind: 'node', node: <WebFaq m={m} /> },
    ],
    closingNode: <WebTwoPaths m={m} locale={lang} />,
  };

  return <ServicePage content={content} proof={proofOf(SERVICES['sviluppo-web'].proof) ?? null} locale={lang} />;
}
