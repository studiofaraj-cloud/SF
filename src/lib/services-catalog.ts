import type { Locale } from '@/i18n/config';

/**
 * The services, in one place: how they are grouped and described (homepage
 * services section and the /servizi hub), which quote-form value each one
 * preselects, and which real portfolio project its page shows as proof.
 */

export type ServiceSlug =
  | 'sviluppo-web'
  | 'e-commerce'
  | 'software-gestionale'
  | 'design-ui-ux'
  | 'seo-marketing'
  | 'ai-automazione'
  | 'hosting-cloud'
  | 'manutenzione'
  | 'consulenza';

type Service = {
  name: Record<Locale, string>;
  line: Record<Locale, string>;
  /** Only published in Italian (the page 404s in other locales): never link it there. */
  itOnly?: boolean;
  /** `service` value preselected in the quote form (see contactServices). */
  quoteValue?: string;
  /** A published project that genuinely shows this service, by slug. */
  proof?: string;
};

export const SERVICES: Record<ServiceSlug, Service> = {
  'sviluppo-web': {
    name: { it: 'Siti web su misura', en: 'Custom websites' },
    line: {
      it: 'Siti aziendali e applicazioni web veloci, sicuri e pensati per crescere.',
      en: 'Company websites and web applications that are fast, secure and built to grow.',
    },
    quoteValue: 'sviluppo-web',
    proof: 'sito-web-per-serramentista-in-romagna-a-infissi-gambettola',
  },
  'e-commerce': {
    name: { it: 'E-commerce', en: 'E-commerce' },
    line: {
      it: 'Negozi online completi, dal catalogo ai pagamenti, senza piattaforme terze.',
      en: 'Complete online stores, from catalogue to payments, with no third-party platform.',
    },
    quoteValue: 'e-commerce',
    proof: 'ecommerce-personalizzato-di-olio-di-valeria',
  },
  'software-gestionale': {
    name: { it: 'Software gestionale', en: 'Business software' },
    line: {
      it: 'Gestionali e CRM costruiti sul tuo processo: commesse, clienti, avanzamento lavori.',
      en: 'Management systems and CRMs built around your process: jobs, clients, progress.',
    },
    itOnly: true,
    quoteValue: 'altro',
    proof: 'sito-web-e-gestionale-per-concessionaria-auto-usate-minicar-di-ali-ibrahim',
  },
  'design-ui-ux': {
    name: { it: 'Design UI/UX', en: 'UI/UX design' },
    line: {
      it: 'Interfacce chiare, progettate per ogni dispositivo prima di scrivere codice.',
      en: 'Clear interfaces, designed for every device before any code is written.',
    },
    quoteValue: 'design-ui-ux',
    proof: 'corso-italiamo',
  },
  'seo-marketing': {
    name: { it: 'SEO e web marketing', en: 'SEO and web marketing' },
    line: {
      it: 'Visibilità sui motori di ricerca con strategie SEO mirate e campagne misurabili.',
      en: 'Search visibility through targeted SEO strategy and measurable campaigns.',
    },
    quoteValue: 'seo-marketing',
    proof: 'sito-web-per-impresa-di-ristrutturazioni-in-ticino-gs-costruzioni-ristrutturazioni',
  },
  'ai-automazione': {
    name: { it: 'AI e automazione', en: 'AI and automation' },
    line: {
      it: 'Chatbot, analisi e automazioni che lavorano dentro i tuoi strumenti.',
      en: 'Chatbots, analysis and automations working inside the tools you use.',
    },
    quoteValue: 'ai-automazione',
  },
  'hosting-cloud': {
    name: { it: 'Hosting e cloud', en: 'Hosting and cloud' },
    line: {
      it: 'Hosting gestito ad alte prestazioni, ottimizzato per velocità e sicurezza.',
      en: 'High-performance managed hosting, tuned for speed and security.',
    },
    quoteValue: 'hosting-cloud',
  },
  manutenzione: {
    name: { it: 'Manutenzione', en: 'Maintenance' },
    line: {
      it: 'Piani flessibili per tenere il sito aggiornato, sicuro e performante.',
      en: 'Flexible plans that keep your site updated, secure and fast.',
    },
    quoteValue: 'manutenzione',
  },
  consulenza: {
    name: { it: 'Consulenza', en: 'Consulting' },
    line: {
      it: 'Ti affianchiamo nelle scelte strategiche e tecnologiche, dall’analisi in poi.',
      en: 'We support your strategic and technical decisions, from analysis onwards.',
    },
    quoteValue: 'consulenza',
  },
};

export const SERVICE_GROUPS: {
  id: 'build' | 'grow' | 'run';
  title: Record<Locale, string>;
  about: Record<Locale, string>;
  services: ServiceSlug[];
}[] = [
  {
    id: 'build',
    title: { it: 'Costruire', en: 'Build' },
    about: { it: 'Il prodotto, dal sito al gestionale.', en: 'The product, from website to business system.' },
    services: ['sviluppo-web', 'e-commerce', 'software-gestionale', 'design-ui-ux'],
  },
  {
    id: 'grow',
    title: { it: 'Far crescere', en: 'Grow' },
    about: { it: 'Farlo trovare e farlo lavorare di più.', en: 'Getting it found, and making it work harder.' },
    services: ['seo-marketing', 'ai-automazione'],
  },
  {
    id: 'run',
    title: { it: 'Gestire', en: 'Run' },
    about: { it: 'Tenerlo veloce, sicuro e aggiornato.', en: 'Keeping it fast, secure and up to date.' },
    services: ['hosting-cloud', 'manutenzione', 'consulenza'],
  },
];

/** The groups as a locale sees them: Italian-only services are left out elsewhere. */
export function serviceGroupsFor(locale: Locale) {
  return SERVICE_GROUPS.map((g) => ({
    ...g,
    services: g.services.filter((s) => locale === 'it' || !SERVICES[s].itOnly),
  })).filter((g) => g.services.length > 0);
}
