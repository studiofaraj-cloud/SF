import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, CreditCard, FileText, FolderOpen, MessageSquare, Phone, UserRound } from 'lucide-react';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { ClientMessages } from '@/components/i18n/client-messages';
import { RequestPreview } from '@/components/hub/request-preview';
import { BookCallButton } from '@/components/site/book-call-button';
import HomeCtaSection from '@/components/site/home-cta-section';
import { RevealWords } from '@/components/site/reveal-words';
import { SectionEdge } from '@/components/site/section-edge';
import { FaqSection } from '@/components/site/service-faq';
import { ServiceQuoteButton } from '@/components/site/service-quote-button';
import { whatsappUrl } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { generateMetadata as generateSEOMetadata, generateStructuredDataPageBreadcrumb, siteConfig } from '@/lib/seo';
import { statusLabel } from '@/lib/service-request-status';
import type { ServiceRequestStatus } from '@/lib/firestore-data';

type Props = { params: Promise<{ locale: string }> };
type Lang = 'it' | 'en';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';
const H2 = 'rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]';

const COPY = {
  it: {
    metaTitle: 'Inizia il tuo progetto: preventivo e area clienti',
    metaDescription:
      'Racconta il tuo progetto a Studio Faraj: ricevi il preventivo, paghi online e segui il lavoro fino alla consegna. L’account è gratuito.',
    crumb: 'Inizia il tuo progetto',
    eyebrow: 'Inizia · Area clienti',
    title: ['Inizia il tuo', 'progetto.'],
    lead: 'Raccontaci cosa vuoi costruire. Dalla tua area clienti ricevi il preventivo, lo paghi online e segui il lavoro fino alla consegna.',
    register: 'Crea l’area clienti',
    login: 'Ho già un account',
    ways: {
      label: 'Tre modi per iniziare',
      recommended: 'Consigliato',
      account: {
        title: 'Crea l’area clienti',
        body: 'Racconti il progetto, ricevi il preventivo e segui ogni fase in un unico posto. L’account è gratuito.',
        go: 'Crea l’account',
      },
      quote: {
        title: 'Preventivo senza account',
        body: 'Un modulo breve, senza registrarti. Ti rispondiamo di solito entro 24 ore lavorative.',
        go: 'Richiedi un preventivo',
      },
      talk: {
        title: 'Una call o WhatsApp',
        body: 'Preferisci parlarne a voce? La prima consulenza è gratuita.',
        call: 'Prenota una call',
        whatsapp: 'WhatsApp',
        waText: 'Ciao Studio Faraj! Vi scrivo dal sito: vorrei informazioni per un progetto.',
      },
    },
    how: {
      title: 'Come funziona',
      lead: 'Ogni richiesta passa per le stesse fasi, e nell’area clienti vedi sempre a che punto è. A ogni cambio di stato ti arriva anche un’email.',
      steps: [
        { status: 'new', title: 'Racconti il progetto', body: 'Scegli il servizio e scrivi obiettivi, tempi e un budget indicativo.' },
        { status: 'quoted', title: 'Ricevi il preventivo', body: 'Leggiamo la richiesta, se serve ti facciamo qualche domanda, e carichiamo il preventivo nella tua area.' },
        { status: 'accepted', title: 'Approvi e paghi', body: 'Se il preventivo ti convince, lo paghi online dalla tua area, in modo sicuro tramite Stripe.' },
        { status: 'in_progress', title: 'Segui il lavoro', body: 'Stato, messaggi e file restano nella stessa pagina: scrivi allo studio quando vuoi.' },
        { status: 'delivered', title: 'Consegna', body: 'Ricevi il lavoro e i materiali. La richiesta resta nel tuo storico.' },
      ] as { status: ServiceRequestStatus; title: string; body: string }[],
    },
    inside: {
      title: 'Cosa trovi nell’area clienti',
      items: [
        { title: 'Richieste', body: 'Ogni progetto con il suo stato, dalla richiesta alla consegna.' },
        { title: 'Messaggi', body: 'Una chat diretta con lo studio, con l’avviso dei messaggi non letti.' },
        { title: 'File', body: 'Brief, logo, testi e consegne in un posto solo, fino a 25 MB per file.' },
        { title: 'Preventivi e pagamenti', body: 'Preventivi da approvare, pagamenti online e fatture sempre a portata di mano.' },
      ],
      company: ['Hai un’attività? Dall’area clienti puoi anche pubblicare una ', 'pagina aziendale', ' su studiofaraj.it.'],
    },
    prepare: {
      label: 'Prima di scriverci',
      title: 'Cosa preparare',
      lead: 'Non serve avere tutto. Queste informazioni però ci aiutano a capire il progetto e a darti un preventivo preciso al primo giro.',
      items: [
        'Cosa fa la tua attività e a chi ti rivolgi',
        'L’obiettivo: ricevere richieste, vendere online, gestire commesse o processi interni',
        'Due o tre siti o app che ti piacciono, e perché',
        'I contenuti che hai già: logo, testi, foto, listini',
        'Tempi e budget indicativi, anche a grandi linee',
      ],
      cost: 'Quanto costa un sito web?',
      costHref: '/quanto-costa-un-sito-web',
      after: 'Se manca qualcosa, ne parliamo insieme.',
    },
    faqTitle: 'Domande frequenti',
    faqs: [
      {
        question: 'Serve un account per chiedere un preventivo?',
        answer:
          'No. Puoi usare il modulo di preventivo, scriverci su WhatsApp o prenotare una call. L’area clienti è comoda quando vuoi seguire tutto in un posto: preventivo, pagamento, messaggi e file.',
      },
      {
        question: 'Quanto costa creare l’account?',
        answer:
          'Niente: l’account è gratuito. Paghi solo i lavori che approvi, dopo aver visto il preventivo. La pagina aziendale è un servizio a parte, a 4,99 € al mese.',
      },
      { question: 'In quanto tempo rispondete?', answer: 'Di solito entro 24 ore lavorative.' },
      {
        question: 'Come si paga?',
        answer: 'Online, direttamente dal preventivo nella tua area clienti. Il pagamento passa da Stripe: i dati della carta non arrivano a noi.',
      },
      {
        question: 'Posso accedere con Google?',
        answer: 'Sì, oppure con email e password. Se dimentichi la password puoi sceglierne una nuova dalla pagina di accesso.',
      },
      {
        question: 'Il codice del mio sito è mio?',
        answer: 'Sì. Siti, e-commerce e piattaforme che scriviamo su misura restano tuoi, codice compreso.',
      },
    ],
    ctaTitle: ['Pronto a iniziare?', 'Raccontaci il progetto.'],
    ctaLead: 'Crea l’area clienti e invia la prima richiesta in pochi minuti, oppure scrivici: rispondiamo di solito entro 24 ore lavorative.',
  },
  en: {
    metaTitle: 'Start your project: quote and client area',
    metaDescription:
      'Tell Studio Faraj about your project: get a quote, pay online and follow the work through to delivery. The account is free.',
    crumb: 'Start your project',
    eyebrow: 'Start · Client area',
    title: ['Start your', 'project.'],
    lead: 'Tell us what you want to build. From your client area you get the quote, pay it online and follow the work through to delivery.',
    register: 'Create your client area',
    login: 'I already have an account',
    ways: {
      label: 'Three ways to start',
      recommended: 'Recommended',
      account: {
        title: 'Create your client area',
        body: 'Describe the project, get the quote and follow every stage in one place. The account is free.',
        go: 'Create an account',
      },
      quote: {
        title: 'A quote without an account',
        body: 'A short form, no sign-up. We usually reply within 24 working hours.',
        go: 'Ask for a quote',
      },
      talk: {
        title: 'A call or WhatsApp',
        body: 'Rather talk it through? The first consultation is free.',
        call: 'Book a call',
        whatsapp: 'WhatsApp',
        waText: "Hi Studio Faraj! I'm writing from your website: I'd like some information about a project.",
      },
    },
    how: {
      title: 'How it works',
      lead: 'Every request goes through the same stages, and the client area always shows where it stands. Each change of status also sends you an email.',
      steps: [
        { status: 'new', title: 'Describe the project', body: 'Pick the service and write your goals, timing and a rough budget.' },
        { status: 'quoted', title: 'Get the quote', body: 'We read the request, ask a few questions if needed, and upload the quote to your area.' },
        { status: 'accepted', title: 'Approve and pay', body: 'If the quote works for you, pay it online from your area, securely through Stripe.' },
        { status: 'in_progress', title: 'Follow the work', body: 'Status, messages and files stay on one page: write to the studio whenever you like.' },
        { status: 'delivered', title: 'Delivery', body: 'You receive the work and the files. The request stays in your history.' },
      ] as { status: ServiceRequestStatus; title: string; body: string }[],
    },
    inside: {
      title: 'What’s in the client area',
      items: [
        { title: 'Requests', body: 'Each project with its status, from request to delivery.' },
        { title: 'Messages', body: 'A direct chat with the studio, with a count of unread messages.' },
        { title: 'Files', body: 'Briefs, logos, copy and deliverables in one place, up to 25 MB per file.' },
        { title: 'Quotes and payments', body: 'Quotes to approve, online payments and invoices, always at hand.' },
      ],
      company: ['Run a business? From the client area you can also publish a ', 'company page', ' on studiofaraj.it.'],
    },
    prepare: {
      label: 'Before you write',
      title: 'What to prepare',
      lead: 'You don’t need all of it. But this helps us understand the project and give you an accurate quote the first time.',
      items: [
        'What your business does and who it serves',
        'The goal: getting enquiries, selling online, managing jobs or internal processes',
        'Two or three websites or apps you like, and why',
        'The content you already have: logo, copy, photos, price lists',
        'Rough timing and budget, even broadly',
      ],
      cost: null,
      costHref: null,
      after: 'If something is missing, we’ll work it out together.',
    },
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        question: 'Do I need an account to get a quote?',
        answer:
          'No. You can use the quote form, message us on WhatsApp or book a call. The client area is handy when you want everything in one place: quote, payment, messages and files.',
      },
      {
        question: 'How much does the account cost?',
        answer:
          'Nothing: the account is free. You only pay for the work you approve, after seeing the quote. The company page is a separate service at €4.99 a month.',
      },
      { question: 'How quickly do you reply?', answer: 'Usually within 24 working hours.' },
      {
        question: 'How do I pay?',
        answer: 'Online, straight from the quote in your client area. Payments go through Stripe: your card details never reach us.',
      },
      {
        question: 'Can I sign in with Google?',
        answer: 'Yes, or with email and password. If you forget your password you can choose a new one from the sign-in page.',
      },
      {
        question: 'Is my website’s code mine?',
        answer: 'Yes. The websites, online shops and platforms we write for you are yours, code included.',
      },
    ],
    ctaTitle: ['Ready to start?', 'Tell us about the project.'],
    ctaLead: 'Create your client area and send your first request in minutes, or write to us: we usually reply within 24 working hours.',
  },
} as const;

const INSIDE_ICONS = [FileText, MessageSquare, FolderOpen, CreditCard];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang: Lang = locale === 'en' ? 'en' : 'it';
  return generateSEOMetadata({
    title: COPY[lang].metaTitle,
    description: COPY[lang].metaDescription,
    url: `${siteConfig.url}/${lang}/inizia`,
    locale: lang,
    alternateUrls: { it: `${siteConfig.url}/it/inizia`, en: `${siteConfig.url}/en/inizia` },
  });
}

/**
 * /inizia — how to start working with the studio, and the client area that
 * goes with it. Server component; the quote and booking buttons are the only
 * client islands. The sign-in itself lives at /hub/login (not indexed): this
 * is the page that explains it to people and to search engines.
 */
export default async function StartPage({ params }: Props) {
  const { locale } = await params;
  const lang: Lang = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const c = COPY[lang];
  const registerHref = `/${lang}/hub/login?mode=register&next=${encodeURIComponent(`/${lang}/hub/requests/new`)}`;
  const loginHref = `/${lang}/hub/login`;

  return (
    <div className="bg-background text-foreground">
      <StructuredDataServer
        data={generateStructuredDataPageBreadcrumb(lang, { name: c.crumb, path: '/inizia' })}
        id="inizia-breadcrumb"
      />

      <section className="relative overflow-clip bg-navy pb-40 pt-32 text-white md:pb-48 md:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_85%_0%,#1d3a72_0%,transparent_60%)]" />
        <div className="container relative mx-auto grid gap-14 px-5 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <p className={`${MONO} text-[#93b4ff]`}>{c.eyebrow}</p>
            <h1 className="mt-7 font-display text-[3.25rem] font-extrabold leading-[0.93] tracking-[-0.035em] sm:text-7xl lg:text-[5rem]">
              {c.title[0]} <span className="block">{c.title[1]}</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-white/70 sm:text-xl sm:leading-relaxed">{c.lead}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={registerHref}
                prefetch={false}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                {c.register}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href={loginHref}
                prefetch={false}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-7 text-base font-semibold ring-1 ring-inset ring-white/25 transition-colors hover:bg-white hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {c.login}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <RequestPreview locale={lang} className="mx-auto max-w-[470px]" />
          </div>
        </div>
        <SectionEdge shape="arc" edge="bottom" />
      </section>

      <section aria-labelledby="ways-title" className="container relative mx-auto -mt-28 px-5 md:-mt-32 md:px-8">
        <h2 id="ways-title" className="sr-only">{c.ways.label}</h2>
        <ClientMessages locale={lang} namespaces={['bookingDialog']}>
          <div className="grid gap-3 rounded-[28px] bg-card p-3 shadow-[0_40px_90px_-40px_rgba(10,22,40,0.35)] ring-1 ring-border md:grid-cols-3 md:p-4">
            <article className="relative flex flex-col rounded-[20px] p-6 ring-2 ring-primary md:p-7">
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {c.ways.recommended}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <UserRound aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.01em]">{c.ways.account.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{c.ways.account.body}</p>
              <Link href={registerHref} prefetch={false} className="group mt-5 inline-flex items-center gap-1.5 self-start font-semibold text-primary">
                {c.ways.account.go}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </article>

            <article className="flex flex-col rounded-[20px] p-6 ring-1 ring-border md:p-7">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground">
                <FileText aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.01em]">{c.ways.quote.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{c.ways.quote.body}</p>
              <ServiceQuoteButton
                label={c.ways.quote.go}
                variant="plain"
                className="group mt-5 inline-flex items-center gap-1.5 self-start font-semibold text-primary"
              >
                {c.ways.quote.go}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </ServiceQuoteButton>
            </article>

            <article className="flex flex-col rounded-[20px] p-6 ring-1 ring-border md:p-7">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground">
                <Phone aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.01em]">{c.ways.talk.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{c.ways.talk.body}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-semibold">
                <BookCallButton className="group inline-flex items-center gap-1.5 text-primary">
                  {c.ways.talk.call}
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </BookCallButton>
                <a
                  href={whatsappUrl(c.ways.talk.waText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
                >
                  {c.ways.talk.whatsapp}
                </a>
              </div>
            </article>
          </div>
        </ClientMessages>
      </section>

      <div className="space-y-24 py-24 md:space-y-32 md:py-32">
        <section className="container mx-auto px-5 md:px-8">
          <header className="grid gap-5 md:grid-cols-12 md:items-end">
            <h2 className={`${H2} md:col-span-6`}>
              <RevealWords text={c.how.title} />
            </h2>
            <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-6">{c.how.lead}</p>
          </header>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 md:mt-16 lg:grid-cols-5 lg:gap-6">
            {c.how.steps.map((s, i) => (
              <li key={s.status} className="rv border-t border-foreground pt-5" style={{ '--i': i } as CSSProperties}>
                <p className={`${MONO} flex items-center justify-between gap-3 text-muted-foreground`}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate normal-case tracking-normal text-primary">{statusLabel(s.status, lang)}</span>
                </p>
                <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.01em]">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="container mx-auto px-5 md:px-8">
          <h2 className={H2}>
            <RevealWords text={c.inside.title} />
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
            {c.inside.items.map((item, i) => {
              const Icon = INSIDE_ICONS[i];
              return (
                <li key={item.title} className="rv rounded-[20px] bg-mist p-6 dark:bg-card dark:ring-1 dark:ring-border" style={{ '--i': i } as CSSProperties}>
                  <Icon aria-hidden className="h-6 w-6 text-primary" />
                  <h3 className="mt-5 font-display text-lg font-bold tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              );
            })}
          </ul>
          <p className="rv mt-8 text-muted-foreground">
            {c.inside.company[0]}
            <Link
              href={getLocalizedPath('/pagine-aziendali', lang)}
              className="font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
            >
              {c.inside.company[1]}
            </Link>
            {c.inside.company[2]}
          </p>
        </section>

        <section className="container mx-auto grid gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className={`${MONO} text-muted-foreground`}>{c.prepare.label}</p>
            <h2 className={`${H2} mt-5`}>
              <RevealWords text={c.prepare.title} />
            </h2>
            <p className="rv mt-6 text-lg leading-relaxed text-muted-foreground">{c.prepare.lead}</p>
            {c.prepare.cost && c.prepare.costHref && (
              <Link
                href={getLocalizedPath(c.prepare.costHref, lang)}
                className="rv mt-6 inline-flex items-center gap-1.5 font-medium underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
              >
                {c.prepare.cost}
              </Link>
            )}
          </div>
          <div className="lg:col-span-7">
            <ul className="border-t border-border">
              {c.prepare.items.map((item, i) => (
                <li key={item} className="rv flex items-start gap-4 border-b border-border py-5 text-lg" style={{ '--i': i } as CSSProperties}>
                  <Check aria-hidden className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-muted-foreground">{c.prepare.after}</p>
          </div>
        </section>

        <FaqSection title={c.faqTitle} faqs={[...c.faqs]} id="inizia-faq" />
      </div>

      <HomeCtaSection locale={lang} title={c.ctaTitle} lead={c.ctaLead} start={{ label: c.register, href: registerHref }} />
    </div>
  );
}
