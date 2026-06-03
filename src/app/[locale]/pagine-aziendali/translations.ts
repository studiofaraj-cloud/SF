/**
 * Translation strings for the Pagine Aziendali landing page.
 * Shared between the server-side `page.tsx` (metadata + JSON-LD) and the
 * client-side `body.tsx` (animated content).
 */

export type Lang = 'it' | 'en';

export const t = {
  // SEO
  metaTitle: {
    it: 'Pagine Aziendali Online — Presenza Google in 5 Minuti | Studio Faraj',
    en: 'Online Business Pages — Google Presence in 5 Minutes | Studio Faraj',
  },
  metaDescription: {
    it: 'Crea la pagina pubblica della tua azienda su studiofaraj.it/tuonome. Ottimizzata per Google, indicizzata automaticamente, condivisibile. Ideale per chi non ha un sito o vuole più backlink SEO.',
    en: 'Create your business public page at studiofaraj.it/yourname. SEO-optimized, auto-indexed by Google, instantly shareable. Perfect for those without a website or seeking more backlinks.',
  },
  // Hero
  badge: { it: 'Nuova area aziende', en: 'New business area' },
  h1: {
    it: 'Mostra la tua azienda online — anche se non hai un sito',
    en: 'Show your business online — even without a website',
  },
  heroSub: {
    it: 'Una pagina pubblica curata al tuo indirizzo personale studiofaraj.it/tuoslug. Ottimizzata per Google, pronta in 5 minuti. Trovati dai clienti quando cercano i tuoi servizi nella tua zona.',
    en: 'A polished public page at your own URL studiofaraj.it/yourslug. SEO-optimized, ready in 5 minutes. Get found by customers searching for your services in your area.',
  },
  ctaPrimary: { it: 'Inizia ora', en: 'Get started' },
  ctaSecondary: { it: 'Vedi un esempio', en: 'See an example' },
  heroFeat1: { it: 'Online in 5 minuti', en: 'Live in 5 minutes' },
  heroFeat2: { it: 'Indicizzata da Google', en: 'Indexed by Google' },
  heroFeat3: { it: 'GDPR-compliant', en: 'GDPR-compliant' },

  // For who section
  whoTitle: { it: 'Per chi è', en: "Who it's for" },
  whoSub: {
    it: 'Pensata per imprenditori, professionisti e PMI italiane che vogliono essere trovati online.',
    en: 'Built for entrepreneurs, freelancers and Italian SMEs who want to be found online.',
  },
  who1Title: { it: 'Non hai un sito web', en: "You don't have a website" },
  who1Desc: {
    it: "Hai un'azienda solida ma non ti sei mai fatto un sito. Una pagina pulita e professionale, pronta subito, indicizzata da Google entro 24 ore. Niente WordPress, niente hosting da gestire.",
    en: "You run a solid business but never built a website. A clean professional page, ready now, indexed by Google within 24 hours. No WordPress, no hosting to manage.",
  },
  who2Title: { it: 'Hai un sito ma vuoi più SEO', en: 'You have a site but want more SEO' },
  who2Desc: {
    it: 'Aggiungi un backlink di qualità da studiofaraj.it (dominio con autorità verificata). Più links rilevanti = più ranking. Linka direttamente al tuo sito web dal profilo.',
    en: 'Add a quality backlink from studiofaraj.it (an established authoritative domain). More relevant links = better ranking. Direct link to your own website from your profile.',
  },
  who3Title: { it: 'Vuoi presenza locale', en: 'You want local presence' },
  who3Desc: {
    it: 'Quando qualcuno cerca i tuoi servizi nella tua città su Google, vuoi essere tra i primi risultati. La pagina è ottimizzata con Schema.org Organization, OpenGraph, e indirizzo geografico.',
    en: "When someone searches your services in your city on Google, you want to appear in the top results. Each page ships with Schema.org Organization markup, OpenGraph, and geo address.",
  },

  // What shows
  showTitle: { it: 'Cosa appare sulla tua pagina', en: 'What appears on your page' },
  showSub: {
    it: 'Tutto quello che serve per presentare la tua azienda in modo professionale, niente di superfluo.',
    en: 'Everything you need to present your business professionally — nothing redundant.',
  },
  showItems: {
    it: [
      { icon: 'Building2', title: 'Ragione sociale & logo', desc: 'Il tuo brand in alto, ben visibile.' },
      { icon: 'Sparkles', title: 'Tagline', desc: 'Una frase che racconta cosa fai in 10 parole.' },
      { icon: 'TrendingUp', title: 'Servizi offerti', desc: 'Elenco dei tuoi servizi principali con descrizione.' },
      { icon: 'Star', title: 'Punti di forza', desc: 'Fino a 3 motivi per cui scegliere te.' },
      { icon: 'Globe', title: 'Statistiche aziendali', desc: 'Anni di attività, clienti, progetti completati.' },
      { icon: 'Phone', title: 'Contatti cliccabili', desc: 'Telefono, email, sito web — tap-to-call.' },
      { icon: 'Instagram', title: 'Profili social', desc: 'Instagram, LinkedIn, Facebook, X, YouTube, TikTok.' },
      { icon: 'ShieldCheck', title: 'Partita IVA (opzionale)', desc: 'Mostra la P.IVA per trasparenza e fiducia.' },
    ],
    en: [
      { icon: 'Building2', title: 'Company name & logo', desc: 'Your brand front and center.' },
      { icon: 'Sparkles', title: 'Tagline', desc: 'A one-liner that says what you do.' },
      { icon: 'TrendingUp', title: 'Services', desc: 'List your main services with short descriptions.' },
      { icon: 'Star', title: 'Strengths', desc: 'Up to 3 reasons to choose you.' },
      { icon: 'Globe', title: 'Business stats', desc: 'Years active, customers served, projects done.' },
      { icon: 'Phone', title: 'Clickable contacts', desc: 'Phone, email, website — tap-to-call ready.' },
      { icon: 'Instagram', title: 'Social profiles', desc: 'Instagram, LinkedIn, Facebook, X, YouTube, TikTok.' },
      { icon: 'ShieldCheck', title: 'VAT number (optional)', desc: 'Show your VAT for transparency and trust.' },
    ],
  },

  // Preview heading
  previewTitle: { it: 'Anteprima reale', en: 'Real preview' },
  previewSub: {
    it: 'Questa è esattamente la struttura della pagina pubblica che vedranno i tuoi clienti.',
    en: 'This is exactly the public page structure your customers will see.',
  },
  previewBadge: { it: 'Anteprima — Acme S.r.l.', en: 'Preview — Acme Ltd.' },
  previewServices: { it: 'Servizi', en: 'Services' },
  previewContact: { it: 'Contatti', en: 'Contact' },
  previewSlogan: {
    it: 'Soluzioni industriali su misura dal 1998',
    en: 'Custom industrial solutions since 1998',
  },
  previewServiceList: {
    it: ['Lavorazioni CNC', 'Saldatura industriale', 'Assemblaggio meccanico'],
    en: ['CNC machining', 'Industrial welding', 'Mechanical assembly'],
  },
  previewStats: {
    it: [
      { v: '27', l: 'Anni di attività' },
      { v: '450+', l: 'Clienti serviti' },
      { v: '12', l: 'Dipendenti' },
    ],
    en: [
      { v: '27', l: 'Years active' },
      { v: '450+', l: 'Clients served' },
      { v: '12', l: 'Employees' },
    ],
  },

  // Tech
  techBadge: { it: 'Sotto il cofano', en: 'Under the hood' },
  techTitle: { it: 'Tecnologia che fa ranking', en: 'Technology that ranks' },
  techSub: {
    it: 'Costruita con Next.js 16, ottimizzata per Core Web Vitals e Search Engine. Niente plugin lenti, niente template gonfi.',
    en: 'Built with Next.js 16, optimized for Core Web Vitals and search engines. No bloated plugins, no heavy themes.',
  },
  tech1Title: { it: 'Next.js 16 + Turbopack', en: 'Next.js 16 + Turbopack' },
  tech1Desc: {
    it: "Rendering server-side, edge cache, immagini ottimizzate automaticamente. La pagina carica in meno di 1 secondo da qualsiasi parte d'Italia.",
    en: 'Server-side rendering, edge cache, auto-optimized images. The page loads in under 1 second across Europe.',
  },
  tech2Title: { it: 'Core Web Vitals ottimi', en: 'Excellent Core Web Vitals' },
  tech2Desc: {
    it: 'LCP < 2.5s, CLS < 0.1, INP < 200ms. Google premia le pagine veloci con migliore ranking. Le pagine aziendali superano i benchmark Google.',
    en: "LCP < 2.5s, CLS < 0.1, INP < 200ms. Google rewards fast pages with better ranking. Our company pages exceed Google's benchmarks.",
  },
  tech3Title: { it: 'Indicizzazione automatica', en: 'Automatic indexing' },
  tech3Desc: {
    it: 'Aggiunta automatica al sitemap.xml di studiofaraj.it. Google scopre la tua pagina entro 24-48 ore dalla pubblicazione, senza dover fare nulla.',
    en: "Auto-added to studiofaraj.it's sitemap.xml. Google discovers your page within 24-48 hours of publication, no setup required.",
  },
  tech4Title: { it: 'Schema.org strutturato', en: 'Schema.org structured data' },
  tech4Desc: {
    it: 'Ogni pagina include JSON-LD Organization schema: Google capisce esattamente cosa offri, dove sei, come contattarti. Risultati rich snippet.',
    en: 'Every page ships with JSON-LD Organization schema: Google knows exactly what you offer, where you are, how to reach you. Rich snippet results.',
  },

  // FAQ
  faqTitle: { it: 'Domande frequenti', en: 'Frequently asked questions' },
  faqs: {
    it: [
      { q: 'Cosa serve per iniziare?', a: 'Solo i tuoi dati aziendali base: ragione sociale, Partita IVA, qualche servizio che offri. Bastano 5-10 minuti per compilare tutto. Logo e immagine hero sono opzionali ma consigliati.' },
      { q: 'Quando appare la mia pagina su Google?', a: 'Subito dopo la pubblicazione la pagina è online e accessibile via URL. Google la indicizza entro 24-48 ore in media (perché la sitemap di studiofaraj.it è già nota a Google e viene aggiornata in tempo reale).' },
      { q: 'Posso modificare la mia pagina quando voglio?', a: 'Sì, sempre, illimitate volte. Aggiorni qualsiasi campo dall\'area riservata e la modifica è online entro secondi.' },
      { q: 'Funziona se ho già un sito web?', a: 'Sì, anzi è un vantaggio: aggiungi un backlink dofollow dal nostro dominio al tuo sito, migliorando il tuo SEO. Più domini di autorità che linkano al tuo, meglio è.' },
      { q: 'Il mio dominio sarà studiofaraj.it/qualcosa?', a: 'Esatto, scegli tu lo slug — per esempio studiofaraj.it/acme-srl. Lo slug deve essere unico, breve, e leggibile.' },
      { q: 'Vedo statistiche di visualizzazione?', a: 'Per ora no — è in arrivo. Nel frattempo puoi usare Google Search Console verificando il dominio studiofaraj.it tramite noi.' },
    ],
    en: [
      { q: 'What do I need to get started?', a: 'Just basic business info: company name, VAT number, a few services. 5-10 minutes to fill in everything. Logo and hero image are optional but recommended.' },
      { q: 'When does my page appear on Google?', a: "Right after publication the page is live and accessible by URL. Google indexes it within 24-48 hours on average (because studiofaraj.it's sitemap is well-known to Google and updates in real time)." },
      { q: 'Can I edit my page anytime?', a: 'Yes, anytime, unlimited edits. Update any field from your private area and the change is live in seconds.' },
      { q: 'Does it work if I already have a website?', a: "Yes — actually it's a plus: add a dofollow backlink from our domain to your site, boosting your SEO. The more authoritative domains link to you, the better." },
      { q: 'Will my URL be studiofaraj.it/something?', a: 'Exactly — you choose the slug, e.g. studiofaraj.it/acme-ltd. The slug must be unique, short, and readable.' },
      { q: 'Do I see view stats?', a: 'Not yet — coming soon. Meanwhile you can use Google Search Console by verifying studiofaraj.it through us.' },
    ],
  },

  // Final CTA
  finalTitle: { it: 'Pronto a essere trovato su Google?', en: 'Ready to be found on Google?' },
  finalSub: {
    it: 'Crea la tua pagina aziendale ora. La compilazione dura 5 minuti.',
    en: 'Create your business page now. Filling it takes 5 minutes.',
  },
};

export function pick<K extends keyof typeof t>(key: K, lang: Lang): (typeof t)[K][Lang] {
  return t[key][lang];
}
