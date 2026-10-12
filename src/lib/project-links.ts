import type { ServiceSlug } from '@/lib/services-catalog';

/**
 * How the portfolio links into the rest of the site: each case study names
 * the services it shows and, when there is one, the sector page it belongs
 * to; each service page lists the case studies that genuinely show it. Every
 * pairing comes from what the project's own page says it includes — keep it
 * that way when adding projects (a slug that isn't published is skipped).
 */

/** The Italian sector landing pages (/siti-web/…), named as their H1s are. */
export const SECTOR_PAGES = {
  edilizia: 'Siti web per l’edilizia',
  'imprese-edili': 'Siti web per imprese edili',
  geometri: 'Siti web per geometri',
  'imprese-di-ristrutturazione': 'Siti web per imprese di ristrutturazione',
} as const;
export type SectorSlug = keyof typeof SECTOR_PAGES;

export const PROJECT_LINKS: Record<string, { services: ServiceSlug[]; sectors?: SectorSlug[] }> = {
  'sito-web-e-gestionale-per-concessionaria-auto-usate-minicar-di-ali-ibrahim': { services: ['sviluppo-web', 'software-gestionale'] },
  'sito-web-per-unimpresa-di-pulizie-adc-service': { services: ['sviluppo-web', 'software-gestionale', 'seo-marketing'] },
  'menu-digitale-ristorante-bella-napoli-da-luigi-a-wrzburg': { services: ['sviluppo-web', 'design-ui-ux'] },
  'sito-web-per-serramentista-in-romagna-a-infissi-gambettola': { services: ['sviluppo-web', 'seo-marketing'], sectors: ['edilizia'] },
  'sito-web-di-colosimo-peinture-a-ginevra': { services: ['sviluppo-web', 'design-ui-ux'], sectors: ['imprese-di-ristrutturazione'] },
  'ecommerce-personalizzato-di-olio-di-valeria': { services: ['e-commerce'] },
  'corso-italiamo': { services: ['sviluppo-web', 'design-ui-ux', 'ai-automazione'] },
  'novametris-sito-web-per-marchio-di-rilievi-topografici-e-laser-scanner-3d': { services: ['sviluppo-web', 'design-ui-ux'], sectors: ['geometri', 'edilizia'] },
  'sito-web-per-impresa-di-ristrutturazioni-in-ticino-gs-costruzioni-ristrutturazioni': {
    services: ['sviluppo-web', 'seo-marketing'],
    sectors: ['imprese-di-ristrutturazione', 'imprese-edili'],
  },
};

/**
 * Case studies shown at the bottom of a service page, besides the example in
 * its hero. A service without a genuine second example lists none.
 */
export const SERVICE_PROJECTS: Partial<Record<ServiceSlug, string[]>> = {
  'software-gestionale': ['sito-web-per-unimpresa-di-pulizie-adc-service'],
  'design-ui-ux': [
    'novametris-sito-web-per-marchio-di-rilievi-topografici-e-laser-scanner-3d',
    'sito-web-di-colosimo-peinture-a-ginevra',
    'menu-digitale-ristorante-bella-napoli-da-luigi-a-wrzburg',
  ],
  'seo-marketing': ['sito-web-per-serramentista-in-romagna-a-infissi-gambettola', 'sito-web-per-unimpresa-di-pulizie-adc-service'],
  'ai-automazione': ['corso-italiamo'],
};
