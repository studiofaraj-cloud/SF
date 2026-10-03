/**
 * Translation strings for the Pagine Aziendali landing page.
 * Shared between the server-side `page.tsx` (metadata + JSON-LD) and the
 * client-side `body.tsx` (animated content).
 */

export type Lang = 'it' | 'en';

export const t = {
  // SEO
  // The SEO helper appends "| Studio Faraj" to the title.
  metaTitle: {
    it: 'Pagina aziendale online per la tua attività',
    en: 'An online company page for your business',
  },
  metaDescription: {
    it: 'La pagina della tua azienda su studiofaraj.it/tuonome: servizi, contatti e social in una pagina curata. 4,99 € al mese, primo mese gratuito.',
    en: 'Your company’s page at studiofaraj.it/yourname: services, contacts and social profiles on one polished page. €4.99 a month, first month free.',
  },
  // Hero
  badge: { it: 'Nuova area aziende', en: 'New business area' },
  h1: {
    it: 'Mostra la tua azienda online — anche se non hai un sito',
    en: 'Show your business online — even without a website',
  },
  heroSub: {
    it: 'Una pagina pubblica curata al tuo indirizzo studiofaraj.it/tuonome, con servizi, contatti e profili social. La compili in pochi minuti dall’area clienti e la aggiorni quando vuoi.',
    en: 'A polished public page at your own address, studiofaraj.it/yourname, with your services, contacts and social profiles. Fill it in within minutes from the client area and update it whenever you like.',
  },
  ctaPrimary: { it: 'Inizia ora', en: 'Get started' },
  ctaSecondary: { it: 'Vedi un esempio', en: 'See an example' },
  heroFeat1: { it: 'Si compila in pochi minuti', en: 'Filled in within minutes' },
  heroFeat2: { it: '4,99 € al mese', en: '€4.99 a month' },
  heroFeat3: { it: 'Primo mese gratuito', en: 'First month free' },

  // For who section
  whoTitle: { it: 'Per chi è', en: "Who it's for" },
  whoSub: {
    it: 'Per imprese, professionisti e PMI con Partita IVA che vogliono una presenza online curata.',
    en: 'For businesses, freelancers and SMEs with a VAT number who want a polished presence online.',
  },
  who1Title: { it: 'Non hai un sito web', en: "You don't have a website" },
  who1Desc: {
    it: "Hai un'azienda solida ma non ti sei mai fatto un sito. Una pagina pulita e professionale, pronta in pochi minuti, da condividere con i clienti. Niente WordPress, niente hosting da gestire.",
    en: "You run a solid business but never built a website. A clean, professional page, ready in minutes, to share with your customers. No WordPress, no hosting to manage.",
  },
  who2Title: { it: 'Hai già un sito', en: 'You already have a website' },
  who2Desc: {
    it: 'Un punto in più dove i clienti ti trovano: dalla pagina arrivano al tuo sito, ai social e ai tuoi contatti con un tocco.',
    en: 'One more place where customers find you: from the page they reach your website, social profiles and contacts in one tap.',
  },
  who3Title: { it: 'Vuoi presenza locale', en: 'You want local presence' },
  who3Desc: {
    it: 'La pagina dice chiaramente cosa fai e dove sei, con i dati strutturati (Schema.org) che aiutano i motori di ricerca a capire la tua attività e un’anteprima curata quando la condividi.',
    en: 'The page says clearly what you do and where you are, with structured data (Schema.org) that helps search engines understand your business, and a tidy preview when you share it.',
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
    it: 'Costruita con Next.js, pensata per la velocità e per i motori di ricerca. Niente plugin lenti, niente template gonfi.',
    en: 'Built with Next.js, designed for speed and for search engines. No bloated plugins, no heavy themes.',
  },
  tech1Title: { it: 'Rendering lato server', en: 'Server-side rendering' },
  tech1Desc: {
    it: 'La pagina arriva già pronta al browser, con cache e immagini ottimizzate automaticamente: si apre veloce anche da telefono.',
    en: 'The page reaches the browser ready to show, with caching and automatically optimised images: it opens fast on phones too.',
  },
  tech2Title: { it: 'Attenzione ai Core Web Vitals', en: 'Built for Core Web Vitals' },
  tech2Desc: {
    it: 'Poco codice, niente plugin, immagini leggere: la pagina è costruita tenendo d’occhio le metriche di velocità e stabilità che Google misura.',
    en: 'Little code, no plugins, light images: the page is built with an eye on the speed and stability metrics Google measures.',
  },
  tech3Title: { it: 'Nella sitemap del sito', en: 'In the site’s sitemap' },
  tech3Desc: {
    it: 'Quando pubblichi, la pagina entra nella sitemap di studiofaraj.it e viene segnalata ai motori di ricerca. Quando mostrarla nei risultati lo decidono loro.',
    en: 'When you publish, the page joins the studiofaraj.it sitemap and is announced to search engines. When to show it in results is up to them.',
  },
  tech4Title: { it: 'Dati strutturati', en: 'Structured data' },
  tech4Desc: {
    it: 'Ogni pagina include i dati Schema.org dell’azienda: cosa offri, dove sei e come contattarti, in un formato che i motori di ricerca leggono.',
    en: 'Every page includes your company’s Schema.org data: what you offer, where you are and how to reach you, in a format search engines read.',
  },

  // FAQ
  faqTitle: { it: 'Domande frequenti', en: 'Frequently asked questions' },
  faqs: {
    it: [
      { q: 'Quanto costa?', a: '4,99 € al mese oppure 49,99 € all’anno. La prima attivazione include 30 giorni di prova gratuita: il pagamento parte alla fine della prova. Puoi disdire in qualsiasi momento dall’area clienti.' },
      { q: 'Cosa serve per iniziare?', a: 'Un account gratuito nell’area clienti e i dati base dell’azienda: ragione sociale, Partita IVA, qualche servizio che offri e i contatti. Il servizio è riservato alle aziende con Partita IVA. Logo e immagine di copertina sono facoltativi ma consigliati.' },
      { q: 'Quando appare la mia pagina su Google?', a: 'Appena pubblicata la pagina è online, raggiungibile dal suo indirizzo, ed entra nella sitemap di studiofaraj.it. Se e quando mostrarla nei risultati lo decide Google: non possiamo garantire tempi né posizioni.' },
      { q: 'Posso modificare la mia pagina quando voglio?', a: 'Sì, tutte le volte che vuoi, dall’area clienti. Le modifiche sono online appena salvi.' },
      { q: 'Funziona se ho già un sito web?', a: 'Sì: dalla pagina i clienti arrivano al tuo sito, ai social e ai contatti. Essendo un servizio a pagamento, i link verso l’esterno sono segnalati ai motori di ricerca come link sponsorizzati (rel="sponsored"), come chiedono le regole di Google.' },
      { q: 'Il mio indirizzo sarà studiofaraj.it/qualcosa?', a: 'Esatto, scegli tu lo slug — per esempio studiofaraj.it/acme-srl. Deve essere unico, breve e leggibile.' },
      { q: 'Vedo statistiche di visualizzazione?', a: 'Per ora no.' },
    ],
    en: [
      { q: 'How much does it cost?', a: '€4.99 a month or €49.99 a year. The first activation includes a 30-day free trial: payment starts when the trial ends. You can cancel at any time from the client area.' },
      { q: 'What do I need to get started?', a: 'A free client-area account and your basic business details: company name, VAT number, a few services you offer and your contacts. The service is for businesses with a VAT number. A logo and cover image are optional but recommended.' },
      { q: 'When does my page appear on Google?', a: 'As soon as it is published the page is online at its address and joins the studiofaraj.it sitemap. Whether and when it shows in results is up to Google: we cannot guarantee timing or rankings.' },
      { q: 'Can I edit my page anytime?', a: 'Yes, as often as you like, from the client area. Changes go live as soon as you save.' },
      { q: 'Does it work if I already have a website?', a: 'Yes: from the page customers reach your website, social profiles and contacts. As this is a paid service, outbound links are marked to search engines as sponsored (rel="sponsored"), as Google’s rules require.' },
      { q: 'Will my address be studiofaraj.it/something?', a: 'Exactly — you choose the slug, e.g. studiofaraj.it/acme-ltd. It must be unique, short and readable.' },
      { q: 'Do I see view stats?', a: 'Not yet.' },
    ],
  },

  // Final CTA
  finalTitle: { it: 'Pronto a mostrare la tua azienda online?', en: 'Ready to show your business online?' },
  finalSub: {
    it: 'Crea la tua pagina aziendale: si compila in pochi minuti e la prima attivazione include 30 giorni gratuiti.',
    en: 'Create your company page: it takes minutes to fill in, and the first activation includes 30 free days.',
  },
};

export function pick<K extends keyof typeof t>(key: K, lang: Lang): (typeof t)[K][Lang] {
  return t[key][lang];
}
