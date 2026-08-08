/**
 * KEYWORD REGISTRY — single source of truth for the search terms each page targets.
 *
 * Why this file exists: keywords were previously inlined in ~12 different
 * `generateMetadata` blocks (`src/lib/seo.ts`, every service `layout.tsx`,
 * `pagine-aziendali/page.tsx`). That made it impossible to see whether two pages
 * were cannibalising each other — the single most common cause of a cluster
 * failing to rank. Here, every target term is visible in one place and each one
 * has exactly one owning page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT — the `band` values are ESTIMATES, not measured data.
 *
 * They are derived from Italian-market knowledge of this vertical, not from
 * Keyword Planner or GSC, because neither is connected yet (see Phase 0 of the
 * SEO plan: there is currently no Search Console property and no analytics).
 * Treat them as a prioritisation hypothesis, not as fact.
 *
 * Once Search Console has 4–6 weeks of data, replace these bands with real
 * impression counts and re-sort the build order. Do not quote these numbers to
 * a client as if they were measured.
 *
 * Band definitions (monthly searches, Italy):
 *   high   > 1000
 *   medium 200–1000
 *   low    50–200
 *   niche  < 50   — still worth targeting: near-zero competition, exact intent
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Usage: pass `keywordsFor(path)` into the existing `generateMetadata({ keywords })`
 * helper in `src/lib/seo.ts`. The `primary` term belongs in the <title> and the
 * <h1>; `secondary` in H2s and the meta description; `longTail` as FAQ questions
 * (which feed the FAQPage JSON-LD); `entities` are the domain terms Google expects
 * to co-occur on a page about this topic — they are not targets to rank for, they
 * are proof the page was written by someone who knows the trade.
 */

export type VolumeBand = 'high' | 'medium' | 'low' | 'niche';

/**
 * `problem-aware` is the highest-value intent in this vertical and deserves the
 * distinct label: the searcher has the problem the page solves ("come trovare
 * clienti come geometra") but has not yet decided a website is the answer.
 * These queries out-volume the "sito web per X" commercial terms in construction,
 * and the searcher is exactly the buyer. Own them with guides that funnel into
 * the sector page — do not try to rank the sector page itself for them.
 */
export type SearchIntent =
  | 'transactional'  // ready to buy: "preventivo sito web"
  | 'commercial'     // comparing options: "sito web impresa edile"
  | 'problem-aware'  // has the problem, not the solution: "trovare clienti edilizia"
  | 'informational'; // researching: "quanto costa un sito web"

export type Market = 'it-IT' | 'it-CH' | 'en' | 'fr-CH' | 'de-CH';

export interface Keyword {
  term: string;
  band: VolumeBand;
  intent: SearchIntent;
  /** Defaults to ['it-IT'] when omitted. */
  markets?: Market[];
}

export interface KeywordSet {
  /** Route this set owns, without locale prefix. One primary term per path — no exceptions. */
  path: string;
  primary: Keyword;
  secondary: Keyword[];
  longTail: Keyword[];
  /** Domain vocabulary that must appear in the copy. Not ranking targets. */
  entities: string[];
  /** Why this page exists / what the copy must not do. */
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTRUCTION VERTICAL — the priority cluster
// ═══════════════════════════════════════════════════════════════════════════

/** Pillar page. Ranks for the category; its real job is distributing authority. */
export const EDILIZIA_PILLAR: KeywordSet = {
  path: '/siti-web/edilizia',
  primary: { term: 'siti web per edilizia', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'realizzazione siti web edilizia', band: 'low', intent: 'commercial' },
    { term: 'web agency settore edile', band: 'niche', intent: 'commercial' },
    { term: 'sito web aziende costruzioni', band: 'low', intent: 'commercial' },
    { term: 'marketing digitale edilizia', band: 'low', intent: 'problem-aware' },
    { term: 'digitalizzazione imprese edili', band: 'medium', intent: 'problem-aware' },
  ],
  longTail: [
    { term: 'perché un\'impresa edile ha bisogno di un sito web', band: 'niche', intent: 'problem-aware' },
    { term: 'come promuovere un\'impresa edile online', band: 'low', intent: 'problem-aware' },
    { term: 'sito web per aziende del settore costruzioni', band: 'niche', intent: 'commercial' },
  ],
  entities: [
    'cantiere', 'committente', 'gara d\'appalto', 'subappalto', 'capitolato',
    'computo metrico', 'direzione lavori', 'general contractor', 'attestazione SOA',
    'DURC', 'CCIAA', 'sicurezza cantieri', 'D.Lgs 81/08', 'BIM', 'preventivo lavori',
  ],
  notes:
    'Hub only. Must link to every tier-1 child and receive a link back from each. ' +
    'Do NOT let this page compete with its children for their primary terms.',
};

/**
 * Launch page #1. Chosen first for two reasons: highest commercial volume in the
 * cluster, and Colosimo Peinture (Geneva — pittura, gessatura, finiture interne)
 * is an exact-match case study. A sector page with a real case study
 * substantially outperforms one without.
 */
export const RISTRUTTURAZIONI: KeywordSet = {
  path: '/siti-web/imprese-di-ristrutturazione',
  primary: { term: 'sito web impresa ristrutturazioni', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'sito web per ristrutturazioni', band: 'low', intent: 'commercial' },
    { term: 'marketing per imprese di ristrutturazione', band: 'low', intent: 'problem-aware' },
    { term: 'pubblicità impresa ristrutturazioni', band: 'low', intent: 'problem-aware' },
    { term: 'sito web imprese edili ristrutturazione', band: 'niche', intent: 'commercial' },
  ],
  longTail: [
    { term: 'come trovare clienti per ristrutturazioni', band: 'medium', intent: 'problem-aware' },
    { term: 'come acquisire clienti ristrutturazioni casa', band: 'low', intent: 'problem-aware' },
    { term: 'come farsi conoscere come impresa di ristrutturazioni', band: 'low', intent: 'problem-aware' },
    { term: 'foto prima e dopo ristrutturazione sito web', band: 'niche', intent: 'informational' },
  ],
  entities: [
    'ristrutturazione chiavi in mano', 'finiture interne', 'cartongesso', 'gessatura',
    'pittura', 'posa pavimenti', 'rifacimento bagno', 'capitolato', 'sopralluogo',
    'preventivo ristrutturazione', 'bonus edilizi', 'SCIA', 'CILA', 'prima e dopo',
  ],
  notes:
    'TWO exact-match case studies: GS Costruzioni (gscostruzioni.ch — Monte Carasso, ' +
    'Ticino, ristrutturazioni chiavi in mano, 4-locale Swiss site) and Colosimo ' +
    'Peinture (Geneva). GS is the stronger anchor: same trade, same language, and it ' +
    'proves the Swiss delivery capability the it-CH track depends on. ' +
    'The before/after gallery is the single most persuasive element for this buyer — ' +
    'lead with it, not with the tech stack.',
};

/**
 * Launch page #2. Novametris (rilievi topografici + laser scanner 3D, Lecco) is
 * the case study. "Geometra" is a regulated Italian profession with no English
 * equivalent — which means near-zero competition from international agencies.
 */
export const GEOMETRI: KeywordSet = {
  path: '/siti-web/geometri',
  primary: { term: 'sito web per geometri', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'sito web studio tecnico', band: 'low', intent: 'commercial' },
    { term: 'sito internet geometra', band: 'niche', intent: 'commercial' },
    { term: 'sito web per topografi', band: 'niche', intent: 'commercial' },
    { term: 'sito web rilievi topografici', band: 'niche', intent: 'commercial' },
  ],
  longTail: [
    { term: 'come trovare clienti come geometra', band: 'low', intent: 'problem-aware' },
    { term: 'come pubblicizzare uno studio tecnico', band: 'low', intent: 'problem-aware' },
    { term: 'sito web per studio di geometra cosa inserire', band: 'niche', intent: 'informational' },
    { term: 'presentare rilievi laser scanner online', band: 'niche', intent: 'informational' },
  ],
  entities: [
    'albo dei geometri', 'collegio dei geometri', 'pratiche catastali', 'DOCFA',
    'accatastamento', 'visura catastale', 'rilievo topografico', 'laser scanner 3D',
    'nuvola di punti', 'scan to BIM', 'computo metrico estimativo', 'direzione lavori',
    'SCIA', 'CILA', 'permesso di costruire', 'APE', 'frazionamento',
  ],
  notes:
    'Anchor with Novametris. Its integrated quoting system + admin area is the proof ' +
    'point: this buyer wants lead capture, not a brochure. Mention the albo number ' +
    'requirement — it feeds Person/Organization schema and is a real trust signal.',
};

/** Launch page #3. No exact case study yet — Colosimo is the nearest adjacency. */
export const IMPRESE_EDILI: KeywordSet = {
  path: '/siti-web/imprese-edili',
  primary: { term: 'sito web impresa edile', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'sito web impresa di costruzioni', band: 'low', intent: 'commercial' },
    { term: 'sito web azienda edile', band: 'low', intent: 'commercial' },
    { term: 'realizzazione siti web imprese edili', band: 'niche', intent: 'commercial' },
  ],
  longTail: [
    { term: 'come trovare clienti impresa edile', band: 'medium', intent: 'problem-aware' },
    { term: 'come farsi conoscere impresa edile', band: 'low', intent: 'problem-aware' },
    { term: 'marketing per imprese edili', band: 'low', intent: 'problem-aware' },
    { term: 'come vincere più gare d\'appalto', band: 'low', intent: 'problem-aware' },
    { term: 'come trovare operai edili', band: 'medium', intent: 'problem-aware' },
  ],
  entities: [
    'attestazione SOA', 'categorie SOA', 'classifica SOA', 'DURC', 'CCIAA',
    'gara d\'appalto', 'bando di gara', 'subappalto', 'general contractor',
    'cantiere', 'importo lavori', 'committente', 'ISO 9001', 'POS', 'PSC',
  ],
  notes:
    'Two arguments no competitor makes: (1) qualification — the committente Googles ' +
    'you before shortlisting; (2) recruiting — Veneto construction firms cannot find ' +
    'skilled labour, and a "Lavora con noi" page that ranks is an unserved need. ' +
    'The recruiting angle may convert better than the sales angle.',
};

export const STUDI_INGEGNERIA: KeywordSet = {
  path: '/siti-web/studi-di-ingegneria',
  primary: { term: 'sito web studio di ingegneria', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'sito web ingegnere', band: 'low', intent: 'commercial' },
    { term: 'sito web studio tecnico ingegneria', band: 'niche', intent: 'commercial' },
    { term: 'sito professionale ingegnere civile', band: 'niche', intent: 'commercial' },
  ],
  longTail: [
    { term: 'come trovare clienti come ingegnere libero professionista', band: 'low', intent: 'problem-aware' },
    { term: 'marketing per studi di ingegneria', band: 'niche', intent: 'problem-aware' },
    { term: 'come presentare progetti di ingegneria online', band: 'niche', intent: 'informational' },
  ],
  entities: [
    'ordine degli ingegneri', 'ingegneria strutturale', 'calcolo strutturale',
    'NTC 2018', 'sismabonus', 'collaudo statico', 'direzione lavori', 'CSP', 'CSE',
    'sicurezza cantieri', 'BIM', 'progettazione impianti', 'antincendio', 'CILA',
  ],
  notes: 'E-E-A-T page. Named partners + albo numbers + published technical articles.',
};

export const STUDI_ARCHITETTURA: KeywordSet = {
  path: '/siti-web/studi-di-architettura',
  primary: { term: 'sito web studio di architettura', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'sito web architetto', band: 'medium', intent: 'commercial' },
    { term: 'portfolio architetto online', band: 'low', intent: 'commercial' },
    { term: 'sito web per architetti', band: 'low', intent: 'commercial' },
  ],
  longTail: [
    { term: 'come trovare clienti come architetto', band: 'medium', intent: 'problem-aware' },
    { term: 'come creare un portfolio di architettura online', band: 'low', intent: 'informational' },
    { term: 'quali progetti mettere nel portfolio architetto', band: 'niche', intent: 'informational' },
  ],
  entities: [
    'ordine degli architetti', 'progettazione architettonica', 'render 3D',
    'interior design', 'permesso di costruire', 'SCIA', 'restauro',
    'riqualificazione', 'concorso di progettazione', 'BIM',
  ],
  notes:
    'Highest design expectations of any buyer in the cluster — this page is itself ' +
    'the portfolio piece. If it looks ordinary, the page fails regardless of copy.',
};

/** Absorbs idraulici + elettricisti; they are the same buyer with different trades. */
export const IMPIANTISTI: KeywordSet = {
  path: '/siti-web/impiantisti',
  primary: { term: 'sito web termoidraulico', band: 'niche', intent: 'commercial' },
  secondary: [
    { term: 'sito web idraulico', band: 'low', intent: 'commercial' },
    { term: 'sito web elettricista', band: 'low', intent: 'commercial' },
    { term: 'sito web impresa impianti elettrici', band: 'niche', intent: 'commercial' },
    { term: 'sito web azienda impianti termoidraulici', band: 'niche', intent: 'commercial' },
  ],
  longTail: [
    { term: 'come trovare clienti idraulico', band: 'medium', intent: 'problem-aware' },
    { term: 'come trovare clienti elettricista', band: 'medium', intent: 'problem-aware' },
    { term: 'pubblicità per idraulici', band: 'low', intent: 'problem-aware' },
    { term: 'come farsi trovare su Google come artigiano', band: 'low', intent: 'problem-aware' },
  ],
  entities: [
    'DM 37/08', 'dichiarazione di conformità', 'certificazione impianti',
    'pompa di calore', 'caldaia a condensazione', 'climatizzazione', 'F-Gas',
    'impianto fotovoltaico', 'antincendio', 'quadro elettrico', 'manutenzione impianti',
  ],
  notes:
    'Phone-first, mobile-first buyer. The conversion element is a tap-to-call button ' +
    'and local coverage, not a contact form. Google Business Profile matters more ' +
    'here than anywhere else in the cluster — say so on the page.',
};

/** Tier 2 — build only after tier-1 pages show impressions in Search Console. */
export const TIER_2_PATHS = [
  '/siti-web/carpenteria-metallica',   // strong in Veneto specifically
  '/siti-web/movimento-terra',         // scavi, fondazioni, palificazioni
  '/siti-web/serramentisti',           // infissi, facciate, curtain wall
  '/siti-web/imprese-di-demolizione',
  '/siti-web/noleggio-attrezzature',   // piattaforme, ponteggi, gru
  '/siti-web/sicurezza-cantieri',      // CSP/CSE, D.Lgs 81/08
] as const;

/**
 * Taxonomy nodes that must NOT become URLs — Italian search demand is effectively
 * zero and a dedicated page for each would be a doorway-page cluster.
 * Cover them as named sections and FAQ entries inside the nearest tier-1 page so
 * the terms still appear in indexed content.
 */
export const CONTENT_ONLY_TOPICS = [
  'restauro e conservazione', 'bonifica amianto', 'prefabbricati e modulare',
  'BIM e modellazione digitale', 'geologia e geotecnica', 'computo metrico',
  'coibentazioni', 'pavimentazioni industriali', 'ripristino post-sinistro',
  'facility management', 'ascensori e montacarichi', 'commissioning e collaudi',
  'demolizione selettiva', 'logistica di cantiere', 'gru e sollevamenti',
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// COST CLUSTER — highest raw volume on the whole site
// ═══════════════════════════════════════════════════════════════════════════

export const COSTO_SITO_WEB: KeywordSet = {
  path: '/quanto-costa-un-sito-web',
  primary: { term: 'quanto costa un sito web', band: 'high', intent: 'informational' },
  secondary: [
    { term: 'quanto costa fare un sito web', band: 'high', intent: 'informational' },
    { term: 'costo realizzazione sito web', band: 'medium', intent: 'informational' },
    { term: 'prezzi sito web professionale', band: 'medium', intent: 'commercial' },
    { term: 'quanto costa un sito web aziendale', band: 'medium', intent: 'informational' },
    { term: 'quanto costa mantenere un sito web', band: 'medium', intent: 'informational' },
  ],
  longTail: [
    { term: 'quanto costa un sito web vetrina', band: 'low', intent: 'informational' },
    { term: 'quanto costa un sito web per un\'impresa edile', band: 'niche', intent: 'commercial' },
    { term: 'quanto costa un sito web fatto da un\'agenzia', band: 'low', intent: 'informational' },
    { term: 'differenza prezzo sito web freelance agenzia', band: 'low', intent: 'informational' },
  ],
  entities: [
    'dominio', 'hosting', 'certificato SSL', 'CMS', 'manutenzione annuale',
    'canone', 'una tantum', 'preventivo', 'IVA', 'template', 'sviluppo su misura',
  ],
  notes:
    'Build this BEFORE any sector page — highest-volume commercial-intent query in ' +
    'the space and most competing results are deliberately vague. Win it with real ' +
    'ranges and what moves the number. Vagueness loses this query. Include a ' +
    'construction section linking to the pillar.',
};

export const COSTO_ECOMMERCE: KeywordSet = {
  path: '/quanto-costa-un-e-commerce',
  primary: { term: 'quanto costa un e-commerce', band: 'medium', intent: 'informational' },
  secondary: [
    { term: 'quanto costa aprire un negozio online', band: 'medium', intent: 'informational' },
    { term: 'costo sviluppo e-commerce', band: 'low', intent: 'informational' },
  ],
  longTail: [
    { term: 'quanto costa un e-commerce su misura', band: 'low', intent: 'commercial' },
    { term: 'conviene Shopify o un e-commerce personalizzato', band: 'low', intent: 'commercial' },
  ],
  entities: ['Stripe', 'gateway di pagamento', 'carrello', 'magazzino', 'spedizioni', 'IVA OSS'],
};

export const COSTO_APP: KeywordSet = {
  path: '/quanto-costa-sviluppare-app',
  primary: { term: 'quanto costa sviluppare un\'app', band: 'medium', intent: 'informational' },
  secondary: [
    { term: 'costo sviluppo app', band: 'medium', intent: 'informational' },
    { term: 'quanto costa creare un\'applicazione', band: 'low', intent: 'informational' },
  ],
  longTail: [
    { term: 'quanto costa un\'app per gestire i cantieri', band: 'niche', intent: 'commercial' },
    { term: 'quanto tempo serve per sviluppare un\'app', band: 'low', intent: 'informational' },
  ],
  entities: ['MVP', 'iOS', 'Android', 'PWA', 'backend', 'manutenzione app'],
};

export const PREVENTIVO: KeywordSet = {
  path: '/preventivo-sito-web',
  primary: { term: 'preventivo sito web', band: 'medium', intent: 'transactional' },
  secondary: [
    { term: 'preventivo realizzazione sito web', band: 'low', intent: 'transactional' },
    { term: 'richiedi preventivo sito internet', band: 'low', intent: 'transactional' },
    { term: 'preventivo gratuito sito web', band: 'low', intent: 'transactional' },
  ],
  longTail: [
    { term: 'come chiedere un preventivo per un sito web', band: 'niche', intent: 'informational' },
  ],
  entities: ['preventivo gratuito', 'sopralluogo', 'brief', 'capitolato', 'tempi di consegna'],
  notes: 'Promote the existing QuoteDialog to a standalone indexable page.',
};

// ═══════════════════════════════════════════════════════════════════════════
// IDEA → PRODUCT CLUSTER
// ═══════════════════════════════════════════════════════════════════════════

export const IDEA_HUB: KeywordSet = {
  path: '/dall-idea-al-progetto',
  primary: { term: 'trasformare un\'idea in un\'app', band: 'low', intent: 'problem-aware' },
  secondary: [
    { term: 'come realizzare la mia idea digitale', band: 'low', intent: 'problem-aware' },
    { term: 'ho un\'idea per un\'app cosa faccio', band: 'low', intent: 'problem-aware' },
    { term: 'sviluppare un\'idea imprenditoriale online', band: 'niche', intent: 'problem-aware' },
  ],
  longTail: [
    { term: 'come proteggere un\'idea prima di svilupparla', band: 'low', intent: 'informational' },
    { term: 'come validare un\'idea digitale', band: 'low', intent: 'informational' },
    { term: 'a chi rivolgersi per sviluppare un\'app', band: 'low', intent: 'commercial' },
  ],
  entities: ['NDA', 'accordo di riservatezza', 'discovery', 'MVP', 'roadmap', 'proprietà del codice'],
  notes:
    'The NDA / confidentiality section removes this buyer\'s #1 objection. State ' +
    'code ownership explicitly — it is already a differentiator you claim elsewhere.',
};

export const GESTIONALE: KeywordSet = {
  path: '/servizi/software-gestionale',
  primary: { term: 'software gestionale su misura', band: 'medium', intent: 'commercial' },
  secondary: [
    { term: 'gestionale personalizzato per aziende', band: 'low', intent: 'commercial' },
    { term: 'software gestione cantieri', band: 'medium', intent: 'commercial' },
    { term: 'gestionale per imprese edili', band: 'low', intent: 'commercial' },
    { term: 'software gestione commesse', band: 'low', intent: 'commercial' },
  ],
  longTail: [
    { term: 'app per rapportini di cantiere', band: 'low', intent: 'commercial' },
    { term: 'gestionale su misura o software standard', band: 'niche', intent: 'informational' },
    { term: 'digitalizzare la gestione dei cantieri', band: 'low', intent: 'problem-aware' },
  ],
  entities: [
    'rapportini', 'commesse', 'cantieri', 'DDT', 'magazzino', 'ore lavorate',
    'stato avanzamento lavori', 'SAL', 'fatturazione elettronica', 'API',
  ],
  notes:
    'Highest-ticket page on the site, and it sits at the intersection of both ' +
    'priorities: construction + custom software. Novametris (quoting system + ' +
    'admin area) is the proof point.',
};

export const MVP_STARTUP: KeywordSet = {
  path: '/servizi/mvp-startup',
  primary: { term: 'sviluppo MVP', band: 'low', intent: 'commercial' },
  secondary: [
    { term: 'MVP per startup', band: 'low', intent: 'commercial' },
    { term: 'sviluppo prodotto minimo funzionante', band: 'niche', intent: 'informational' },
  ],
  longTail: [
    { term: 'quanto costa sviluppare un MVP', band: 'low', intent: 'informational' },
    { term: 'quanto tempo serve per un MVP', band: 'niche', intent: 'informational' },
  ],
  entities: ['MVP', 'product-market fit', 'time to market', 'iterazione', 'validazione'],
};

export const APP_SU_MISURA: KeywordSet = {
  path: '/servizi/app-su-misura',
  primary: { term: 'sviluppo app su misura', band: 'medium', intent: 'commercial' },
  secondary: [
    { term: 'creare un\'app personalizzata', band: 'low', intent: 'commercial' },
    { term: 'sviluppo applicazioni aziendali', band: 'low', intent: 'commercial' },
  ],
  longTail: [
    { term: 'app aziendale su misura o pronta all\'uso', band: 'niche', intent: 'informational' },
  ],
  entities: ['PWA', 'iOS', 'Android', 'app nativa', 'backend', 'API REST'],
};

// ═══════════════════════════════════════════════════════════════════════════
// SWISS / DACH TRACK — Italian language, high-GDP markets
// ═══════════════════════════════════════════════════════════════════════════

/**
 * No longer a bet — GS Costruzioni (gscostruzioni.ch) is delivered proof. An
 * Italian-language ristrutturazioni firm in Monte Carasso, Canton Ticino, serving
 * Ticino and Grigioni italiano, on a 4-locale Swiss site (it-CH / de-CH / fr-CH /
 * en-CH). Colosimo Peinture (Geneva) is the second construction reference and
 * Bella Napoli (Würzburg) the third Italian-language client abroad.
 *
 * The thesis those three confirm: the Italian diaspora in Switzerland (~500k) and
 * Germany (~600–800k) is historically concentrated in construction and artisan
 * trades — the same buyer as the cluster above, searching in the same language,
 * paying Swiss and German rates.
 *
 * Requires `hreflang="it-CH"` and GENUINELY DIFFERENT pages: CHF pricing, Swiss
 * regulatory context, Swiss references. Duplicating the Italian pages under an
 * it-CH tag is a canonical mess that helps nobody.
 *
 * BLOCKED until the `<html lang>` defect is fixed — studiofaraj.it currently serves
 * `lang="it"` in raw HTML on every locale, which makes all hreflang moot. Note the
 * irony: gscostruzioni.ch already does 4-locale hreflang correctly. The client work
 * is technically ahead of our own site.
 */
export const SWISS_KEYWORDS: Keyword[] = [
  { term: 'creazione siti web Ticino',            band: 'low',    intent: 'commercial', markets: ['it-CH'] },
  { term: 'web agency Ticino',                    band: 'low',    intent: 'commercial', markets: ['it-CH'] },
  { term: 'agenzia web Lugano',                   band: 'low',    intent: 'commercial', markets: ['it-CH'] },
  { term: 'realizzazione siti web Svizzera',      band: 'low',    intent: 'commercial', markets: ['it-CH'] },
  { term: 'sito web impresa edile Svizzera',      band: 'niche',  intent: 'commercial', markets: ['it-CH'] },
  { term: 'sito web impresa ristrutturazioni Svizzera', band: 'niche', intent: 'commercial', markets: ['it-CH'] },
  { term: 'sito web per artigiani in Svizzera',   band: 'niche',  intent: 'commercial', markets: ['it-CH'] },
  { term: 'quanto costa un sito web in Svizzera', band: 'low',    intent: 'informational', markets: ['it-CH'] },
  { term: 'sito web per imprese italiane in Svizzera', band: 'niche', intent: 'commercial', markets: ['it-CH'] },
  { term: 'sito web per imprese italiane in Germania',  band: 'niche', intent: 'commercial', markets: ['it-CH'] },
];

export const SWISS_ENTITIES = [
  'CHF', 'norme SIA', 'permesso di costruire', 'Cantone', 'Ticino', 'Romandia',
  'IVA svizzera', 'registro di commercio', 'AVS', 'SUVA', 'preventivo in franchi',
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// ENGLISH — nearshore repositioning
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The current EN site translates Italian pages targeting "web agency Italy" —
 * unwinnable and low-value. Competing for "web design agency" against US/UK
 * incumbents is not realistic for a 2024 domain.
 *
 * Nearshore is the one English angle that is both winnable and true: UK, DACH and
 * Nordic companies actively search for EU-based development partners, the queries
 * are far less contested, and the deals are high-ticket B2B.
 *
 * If this repositioning is not taken, the EN site should be noindex'd rather than
 * left as thin duplicate-intent content.
 */
export const NEARSHORE: KeywordSet = {
  path: '/en/nearshore-development',
  primary: { term: 'nearshore web development', band: 'medium', intent: 'commercial', markets: ['en'] },
  secondary: [
    { term: 'nearshore software development Europe', band: 'medium', intent: 'commercial', markets: ['en'] },
    { term: 'EU based development team', band: 'low', intent: 'commercial', markets: ['en'] },
    { term: 'GDPR compliant development partner', band: 'low', intent: 'commercial', markets: ['en'] },
    { term: 'outsource web development Europe', band: 'medium', intent: 'commercial', markets: ['en'] },
    { term: 'Italian web development agency', band: 'low', intent: 'commercial', markets: ['en'] },
  ],
  longTail: [
    { term: 'nearshore vs offshore development cost', band: 'low', intent: 'informational', markets: ['en'] },
    { term: 'hiring a development team in the EU', band: 'low', intent: 'commercial', markets: ['en'] },
    { term: 'same timezone development team Europe', band: 'niche', intent: 'commercial', markets: ['en'] },
  ],
  entities: [
    'GDPR', 'EU data residency', 'CET timezone', 'staff augmentation',
    'fixed price', 'time and materials', 'code ownership', 'IP transfer',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXISTING PAGES — de-duplicated
// ═══════════════════════════════════════════════════════════════════════════

/**
 * These already exist. Listed here so the new cluster does not cannibalise them.
 * Each term below is OWNED by the stated path — no new page may target it.
 */
export const EXISTING_OWNERSHIP: Record<string, Keyword> = {
  '/': { term: 'agenzia web Padova', band: 'medium', intent: 'commercial' },
  '/servizi': { term: 'servizi sviluppo web', band: 'low', intent: 'commercial' },
  '/servizi/sviluppo-web': { term: 'realizzazione siti web', band: 'high', intent: 'commercial' },
  '/servizi/e-commerce': { term: 'realizzazione e-commerce', band: 'medium', intent: 'commercial' },
  '/servizi/design-ui-ux': { term: 'design UI UX', band: 'low', intent: 'commercial' },
  '/servizi/seo-marketing': { term: 'consulenza SEO', band: 'medium', intent: 'commercial' },
  '/servizi/ai-automazione': { term: 'automazione con AI aziende', band: 'low', intent: 'commercial' },
  '/servizi/hosting-cloud': { term: 'hosting gestito', band: 'low', intent: 'commercial' },
  '/servizi/manutenzione': { term: 'manutenzione sito web', band: 'medium', intent: 'commercial' },
  '/servizi/consulenza': { term: 'consulenza informatica aziende', band: 'low', intent: 'commercial' },
  '/pagine-aziendali': { term: 'pagina aziendale online', band: 'low', intent: 'commercial' },
  '/projects': { term: 'portfolio siti web realizzati', band: 'low', intent: 'informational' },
};

/**
 * LOCAL — deliberately NOT an active target set, and deliberately not in ALL_SETS.
 *
 * `findCannibalisation()` flagged the original version of this: a
 * `/web-agency/padova` page claimed "agenzia web Padova", which the HOMEPAGE
 * already owns via `seoConfig.defaultKeywords` in `src/lib/seo.ts` (alongside
 * "sviluppo siti web Padova" and "web designer Padova").
 *
 * The conclusion is not to reshuffle the terms — it is that the city page should
 * not exist. The homepage IS the Padova page, and it is the strongest page on the
 * domain; a second page chasing the same city would split signals and win nothing.
 *
 * A city page only earns its place for a city the homepage does NOT already
 * compete for, AND where there is real local proof (a client, a project, a named
 * reference). Today that is nowhere. Revisit when it isn't.
 *
 * Under no circumstances build a trade × city matrix (6 trades × 5 cities = 30
 * near-duplicate pages) — that is the fastest way to get the whole cluster
 * classified as doorway pages.
 */
export const LOCAL_DEFERRED = {
  ownedByHomepage: [
    'agenzia web Padova',
    'web agency Padova',
    'realizzazione siti web Padova',
    'sviluppo siti web Padova',
    'web designer Padova',
  ],
  /** Only with real local proof. Empty until then — see the note above. */
  candidateCities: [] as string[],
  entities: ['Padova', 'Veneto', 'provincia di Padova', 'Vicenza', 'Treviso', 'Venezia'],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BLOG — problem-aware content that funnels into the cluster
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Two posts per month. Each MUST link to its target sector page — that is the
 * whole point: these queries out-volume the commercial terms, and the searcher
 * is the buyer before they know they need a website.
 */
export const BLOG_PIPELINE: Array<{ title: string; target: string; keyword: Keyword }> = [
  {
    title: 'Come far trovare la tua impresa edile su Google',
    target: '/siti-web/imprese-edili',
    keyword: { term: 'come trovare clienti impresa edile', band: 'medium', intent: 'problem-aware' },
  },
  {
    title: 'Come trovare clienti per ristrutturazioni: la guida completa',
    target: '/siti-web/imprese-di-ristrutturazione',
    keyword: { term: 'come trovare clienti per ristrutturazioni', band: 'medium', intent: 'problem-aware' },
  },
  {
    title: 'Sito web per geometri: cosa non può mancare',
    target: '/siti-web/geometri',
    keyword: { term: 'come trovare clienti come geometra', band: 'low', intent: 'problem-aware' },
  },
  {
    title: 'Usare il sito aziendale per qualificarsi alle gare d\'appalto',
    target: '/siti-web/imprese-edili',
    keyword: { term: 'come vincere più gare d\'appalto', band: 'low', intent: 'problem-aware' },
  },
  {
    title: 'Trovare operai e tecnici con il sito aziendale',
    target: '/siti-web/imprese-edili',
    keyword: { term: 'come trovare operai edili', band: 'medium', intent: 'problem-aware' },
  },
  {
    title: 'Come presentare i cantieri sul sito: guida al portfolio lavori',
    target: '/siti-web/edilizia',
    keyword: { term: 'come promuovere un\'impresa edile online', band: 'low', intent: 'problem-aware' },
  },
  {
    title: 'Il sito web serve davvero a un\'impresa di costruzioni?',
    target: '/siti-web/edilizia',
    keyword: { term: 'perché un\'impresa edile ha bisogno di un sito web', band: 'niche', intent: 'problem-aware' },
  },
  {
    title: 'Come trovare clienti come idraulico o elettricista',
    target: '/siti-web/impiantisti',
    keyword: { term: 'come trovare clienti idraulico', band: 'medium', intent: 'problem-aware' },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY + HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const ALL_SETS: KeywordSet[] = [
  EDILIZIA_PILLAR, RISTRUTTURAZIONI, GEOMETRI, IMPRESE_EDILI,
  STUDI_INGEGNERIA, STUDI_ARCHITETTURA, IMPIANTISTI,
  COSTO_SITO_WEB, COSTO_ECOMMERCE, COSTO_APP, PREVENTIVO,
  IDEA_HUB, GESTIONALE, MVP_STARTUP, APP_SU_MISURA,
  NEARSHORE,
  // LOCAL is intentionally absent — see LOCAL_DEFERRED.
];

export const KEYWORD_REGISTRY: Record<string, KeywordSet> = Object.fromEntries(
  ALL_SETS.map((set) => [set.path, set]),
);

/**
 * Flat keyword list for a path, ready to pass to `generateMetadata({ keywords })`
 * in `src/lib/seo.ts`. Primary first — some engines still weight order, and it
 * costs nothing to be deliberate about it.
 *
 * Note that Google ignores the meta keywords tag entirely; the real value of this
 * function is that it forces every page to declare its targets in one place, where
 * overlap between pages is visible.
 */
export function keywordsFor(path: string): string[] {
  const set = KEYWORD_REGISTRY[path];
  if (!set) return [];
  return [
    set.primary.term,
    ...set.secondary.map((k) => k.term),
    ...set.longTail.map((k) => k.term),
  ];
}

/** The one term a page must win. Use it in the <title> and the <h1>. */
export function primaryKeyword(path: string): string | undefined {
  return KEYWORD_REGISTRY[path]?.primary.term;
}

/** Domain vocabulary the copy must contain to read as trade-literate. */
export function entitiesFor(path: string): readonly string[] {
  return KEYWORD_REGISTRY[path]?.entities ?? [];
}

/**
 * Guard against the failure mode this file exists to prevent: two pages chasing
 * the same term. Run in a test or a build script — if it ever returns a non-empty
 * array, one of the two pages will lose and neither will rank well.
 */
export function findCannibalisation(): Array<{ term: string; paths: string[] }> {
  const owners = new Map<string, string[]>();

  const claim = (term: string, path: string) => {
    const key = term.toLowerCase().trim();
    owners.set(key, [...(owners.get(key) ?? []), path]);
  };

  for (const set of ALL_SETS) {
    claim(set.primary.term, set.path);
    for (const k of set.secondary) claim(k.term, set.path);
  }
  for (const [path, kw] of Object.entries(EXISTING_OWNERSHIP)) {
    claim(kw.term, path);
  }

  return [...owners.entries()]
    .filter(([, paths]) => new Set(paths).size > 1)
    .map(([term, paths]) => ({ term, paths: [...new Set(paths)] }));
}

/** Build order for Phase 2 — proof-backed pages first (see the SEO plan). */
export const PHASE_2_BUILD_ORDER: string[] = [
  '/quanto-costa-un-sito-web',              // highest volume on the site
  '/siti-web/edilizia',                     // pillar
  '/siti-web/imprese-di-ristrutturazione',  // Colosimo Peinture case study
  '/siti-web/geometri',                     // Novametris case study
  '/siti-web/imprese-edili',
  '/dall-idea-al-progetto',
];
