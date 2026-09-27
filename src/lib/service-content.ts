import { getMessages } from 'next-intl/server';
import { getProjectsAction } from '@/lib/actions';
import { SERVICES, type ServiceSlug } from '@/lib/services-catalog';
import type { ServiceLocalKey } from '@/lib/service-local-content';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import type { ServicePageContent, ServiceProof, ServiceSection } from '@/components/site/service-page';

/**
 * Builds a service page's content from its existing `services.<key>`
 * messages, so the pages keep their copy while sharing one template.
 *
 * Section headings are the template's own, so badge-style titles such as
 * "Risultati Garantiti" don't reach the page, and list items that state a
 * figure (e.g. "Efficienza aumentata del 40%") are left out: the site shows
 * no statistics that nothing backs up.
 */

type Msg = Record<string, any>;
type Extra = 'process' | 'benefits' | 'useCases' | 'platforms' | 'providers' | 'areas' | 'domain';

const PAGES: Partial<Record<ServiceSlug, { key: string; localKey?: ServiceLocalKey; extras: Extra[]; bookCall?: boolean }>> = {
  'e-commerce': { key: 'ecommerce', localKey: 'ecommerce', extras: ['platforms', 'benefits'] },
  'design-ui-ux': { key: 'designUIUX', localKey: 'designUIUX', extras: ['process', 'benefits'] },
  'seo-marketing': { key: 'seoMarketing', localKey: 'seoMarketing', extras: [] },
  'ai-automazione': { key: 'aiAutomation', localKey: 'aiAutomation', extras: ['useCases', 'benefits'] },
  manutenzione: { key: 'maintenance', localKey: 'maintenance', extras: [] },
  'hosting-cloud': { key: 'hostingCloud', localKey: 'hostingCloud', extras: ['providers', 'benefits', 'domain'] },
  // Consulting starts with a call: its main action books one.
  consulenza: { key: 'consulting', localKey: 'consulting', extras: ['process', 'areas'], bookCall: true },
};

const HEADINGS: Record<Locale, Record<'process' | 'benefits' | 'useCases' | 'platforms' | 'providers', string>> = {
  it: {
    process: 'Come lavoriamo',
    benefits: 'Cosa ottieni',
    useCases: 'Dove si usa',
    platforms: 'Con cosa lo costruiamo',
    providers: 'Dove lo ospitiamo',
  },
  en: {
    process: 'How we work',
    benefits: 'What you get',
    useCases: 'Where it helps',
    platforms: 'What we build it with',
    providers: 'Where we host it',
  },
};

// The e-commerce platform names are product names, the same in both locales.
const PLATFORM_NAMES: Record<string, string> = {
  nextjs: 'Next.js & React',
  nodejs: 'Node.js & API',
  custom: 'Custom Full-Stack',
  headless: 'Headless CMS',
};

const STATES_A_FIGURE = /\d+\s*%|\b\d+(\.\d+)?x\b/i;
const CTA_TEXT_KEYS = new Set(['badge', 'title', 'titleHighlight', 'subtitle', 'button']);

const isItem = (v: unknown): v is { title: string; description: string } =>
  !!v && typeof v === 'object' && typeof (v as Msg).title === 'string' && typeof (v as Msg).description === 'string';

/** "Piattaforme … con" + "esperienza utente ottimizzata" + " e gestione …" → one sentence. */
function sentence(m: Msg) {
  return `${m.subtitle ?? ''}${m.subtitleHighlight ? ` ${m.subtitleHighlight}` : ''}${m.subtitleEnd ?? ''}`.trim();
}

function extraSection(extra: Extra, m: Msg, locale: Locale): ServiceSection | null {
  const h = HEADINGS[locale];
  switch (extra) {
    case 'process': {
      const steps = Object.values(m.process ?? {}).filter(isItem) as { title: string; description: string; step?: string }[];
      steps.sort((a, b) => String(a.step ?? '').localeCompare(String(b.step ?? '')));
      return steps.length ? { kind: 'steps', title: h.process, items: steps } : null;
    }
    case 'benefits': {
      const items = ((m.benefits?.items ?? []) as string[]).filter((i) => !STATES_A_FIGURE.test(i));
      return items.length ? { kind: 'checklist', title: h.benefits, items } : null;
    }
    case 'areas': {
      const items = (m.areas?.items ?? []) as string[];
      return items.length ? { kind: 'checklist', title: m.areas.title, items } : null;
    }
    case 'useCases': {
      const items = ((m.useCases?.items ?? []) as { title: string; description: string }[]).map((i) => ({ name: i.title, description: i.description }));
      return items.length ? { kind: 'pairs', title: h.useCases, items } : null;
    }
    case 'platforms': {
      const p = m.platforms ?? {};
      const items = Object.keys(PLATFORM_NAMES)
        .filter((k) => typeof p[k] === 'string')
        .map((k) => ({ name: PLATFORM_NAMES[k], description: p[k] as string }));
      return items.length ? { kind: 'pairs', title: h.platforms, lead: p.subtitle, items } : null;
    }
    case 'providers': {
      const p = m.providers ?? {};
      const items = Object.values(p)
        .filter((v): v is { name: string; description: string } => !!v && typeof v === 'object' && 'name' in (v as Msg))
        .map((v) => ({ name: v.name, description: v.description }));
      return items.length ? { kind: 'pairs', title: h.providers, lead: p.subtitle, items } : null;
    }
    case 'domain': {
      const d = m.domain;
      if (!d) return null;
      // Only the advice: the copy's claim that free subdomains are never
      // indexed isn't accurate, so that paragraph is left out.
      return {
        kind: 'callout',
        title: `${d.title} ${d.titleHighlight}`.trim(),
        body: `${d.description2} ${d.description2Highlight} ${d.description2End}`.replace(/\s+/g, ' ').trim(),
      };
    }
  }
}

export async function buildServiceContent(slug: ServiceSlug, locale: Locale): Promise<ServicePageContent> {
  const page = PAGES[slug];
  if (!page) throw new Error(`No template content for /servizi/${slug}`);
  const messages = (await getMessages({ locale })) as Msg;
  const m: Msg = messages.services[page.key];
  const cta: Msg = m.cta ?? {};

  return {
    slug,
    title: [m.title, m.titleHighlight].filter(Boolean).join(' '),
    lead: sentence(m),
    notes: Object.entries(cta)
      .filter(([k, v]) => !CTA_TEXT_KEYS.has(k) && typeof v === 'string')
      .map(([, v]) => v as string),
    quoteLabel: m.ctaQuote ?? m.ctaSupport ?? m.ctaCall ?? m.ctaDiscover ?? cta.button,
    primary: page.bookCall && m.ctaCall ? { label: m.ctaCall, href: '/call-booking' } : undefined,
    features: Object.values(m.features ?? {}).filter(isItem),
    sections: page.extras.map((e) => extraSection(e, m, locale)).filter((s): s is ServiceSection => s !== null),
    closing: cta.title ? { title: [cta.title, cta.titleHighlight ?? ''] as const, lead: cta.subtitle } : undefined,
    localKey: page.localKey,
  };
}

/** The real project a service page shows, if it names one and it is published. */
export async function getServiceProof(slug: ServiceSlug): Promise<ServiceProof | null> {
  const proofSlug = SERVICES[slug].proof;
  if (!proofSlug) return null;
  try {
    const p = ((await getProjectsAction()) as Project[]).find((x) => x.slug === proofSlug && x.published);
    return p ? { slug: p.slug, title: p.title, clientName: p.clientName, year: p.year, category: p.category } : null;
  } catch {
    // The portfolio is unavailable: the page names no example.
    return null;
  }
}
