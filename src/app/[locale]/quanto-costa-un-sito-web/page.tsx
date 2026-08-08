import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, X, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import {
  generateMetadata as buildSEOMetadata,
  generateStructuredDataFAQPage,
  generateStructuredDataPageBreadcrumb,
  siteConfig,
} from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';

/**
 * "Quanto costa un sito web" — the highest-volume commercial-intent query in
 * this space in Italian, and one where most competing results are deliberately
 * vague.
 *
 * Italian only. The English equivalent targets a market an Italian domain has
 * no realistic chance in, and a translated twin would just be a thin duplicate
 * of an Italian-slug page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PRICING IS INTENTIONALLY ABSENT.
 *
 * Publishing invented figures for a real business is not an option, and the
 * studio has not settled on public ranges yet. Everything price-shaped is
 * isolated in PRICE_BANDS below: set the `range` strings and the page renders
 * a full comparison table with no other edits.
 *
 * Be aware this page will NOT outrank competitors who publish real numbers
 * until that happens. What it does today is answer the question honestly
 * (what moves the price, what recurring costs exist, what to check before
 * signing) and route the visitor to a quote.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/quanto-costa-un-sito-web';

/** Set `range` on each tier to publish prices. null = the band is hidden. */
const PRICE_BANDS: Array<{
  name: string;
  who: string;
  includes: string[];
  timeline: string;
  range: string | null;
}> = [
  {
    name: 'Sito vetrina',
    who: 'Attività locali, studi professionali, artigiani che oggi non hanno un sito.',
    includes: [
      'Design su misura, non un template',
      '5–8 pagine (chi siamo, servizi, contatti)',
      'Modulo contatti e pulsante chiama-ora',
      'Ottimizzazione SEO di base e Google Business Profile',
      'Responsive e veloce da mobile',
    ],
    timeline: '2–4 settimane',
    range: null,
  },
  {
    name: 'Sito aziendale con funzioni',
    who: 'Aziende strutturate che devono gestire contenuti, lavori o richieste.',
    includes: [
      'Tutto quello del sito vetrina',
      'Area amministrativa per aggiornare i contenuti da soli',
      'Gallerie lavori / portfolio con schede dedicate',
      'Sistema di richiesta preventivo con notifiche',
      'Blog o sezione news indicizzabile',
      'Multilingua se serve',
    ],
    timeline: '4–8 settimane',
    range: null,
  },
  {
    name: 'E-commerce su misura',
    who: 'Chi vende online e non vuole dipendere da Shopify o dalle sue commissioni.',
    includes: [
      'Catalogo, carrello e checkout sviluppati da zero',
      'Pagamenti integrati (Stripe, PayPal, bonifico)',
      'Gestione prodotti, ordini e magazzino',
      'Dashboard vendite',
      'Nessun canone di piattaforma',
    ],
    timeline: '8–14 settimane',
    range: null,
  },
  {
    name: 'Piattaforma o gestionale su misura',
    who: 'Chi ha un processo interno che nessun software commerciale copre davvero.',
    includes: [
      'Analisi del processo prima di scrivere codice',
      'Applicazione web costruita sul flusso reale',
      'Utenti, permessi e ruoli',
      'Integrazioni con i sistemi già in uso',
      'Codice di proprietà del cliente',
    ],
    timeline: 'Da 3 mesi, definito in analisi',
    range: null,
  },
];

const COST_DRIVERS = [
  {
    title: 'Quante pagine e quanti contenuti',
    body: 'Un sito di 5 pagine e uno di 40 non costano uguale. Pesa soprattutto se i testi e le foto li fornisci tu o li produciamo noi: la produzione di contenuti è spesso la voce più sottovalutata di un preventivo.',
  },
  {
    title: 'Design su misura o template',
    body: 'Un tema comprato e adattato costa poco e si vede: lo useranno altre migliaia di aziende. Un design disegnato sul tuo brand richiede più ore, ma è tuo e non somiglia a nessun altro.',
  },
  {
    title: 'Cosa deve saper fare',
    body: 'Un modulo contatti è una cosa. Preventivi automatici, area riservata clienti, prenotazioni, pagamenti o un gestionale interno sono un\'altra: ognuna aggiunge sviluppo, test e manutenzione.',
  },
  {
    title: 'Integrazioni con quello che già usi',
    body: 'Gestionale, CRM, fatturazione elettronica, software di cantiere. Ogni integrazione va studiata sul sistema specifico e spesso è la parte meno visibile e più lunga del lavoro.',
  },
  {
    title: 'Chi aggiorna il sito dopo',
    body: 'Se vuoi essere autonomo serve un pannello di amministrazione costruito bene. Costa di più all\'inizio e ti fa risparmiare per anni, perché non devi chiamare nessuno per cambiare un testo.',
  },
  {
    title: 'Multilingua',
    body: 'Non è "tradurre le pagine": sono URL, struttura e SEO separati per ogni lingua. Sensato se lavori con l\'estero, spreco se non lo fai.',
  },
];

const RECURRING = [
  { name: 'Dominio', body: 'Il tuo indirizzo (.it, .com). Si rinnova ogni anno e resta intestato a te.' },
  { name: 'Hosting', body: 'Il server che tiene il sito online. Il prezzo cambia molto in base al traffico e alle prestazioni richieste.' },
  { name: 'Certificato SSL', body: 'Il lucchetto https. Oggi è indispensabile ed è spesso incluso nell\'hosting.' },
  { name: 'Manutenzione', body: 'Aggiornamenti, backup, monitoraggio e sicurezza. Facoltativa, ma un sito lasciato fermo per anni diventa un problema.' },
];

const RED_FLAGS = [
  'Un preventivo di una riga sola, senza dire cosa comprende.',
  'Nessuna indicazione dei tempi di consegna.',
  'Il codice e il dominio restano intestati all\'agenzia.',
  'Canoni obbligatori senza i quali il sito smette di funzionare.',
  '"Prima pagina su Google garantita": nessuno può garantirlo.',
  'Nessuna domanda sul tuo lavoro prima di mandare il preventivo.',
];

const QUESTIONS_TO_ASK = [
  'Il codice e il dominio sono intestati a me?',
  'Cosa succede se dopo due anni voglio cambiare fornitore?',
  'Posso aggiornare i contenuti da solo, senza chiamarvi?',
  'I costi ricorrenti quali sono, e cosa succede se non li pago?',
  'Chi scrive i testi e chi fornisce le fotografie?',
  'Quanto tempo serve, e cosa vi serve da me per rispettarlo?',
];

const FAQS = [
  {
    question: 'Perché non pubblicate un prezzo fisso?',
    answer:
      'Perché un prezzo fisso è onesto solo se il lavoro è sempre lo stesso, e non lo è. Due siti da "cinque pagine" possono richiedere il doppio del lavoro l\'uno rispetto all\'altro a seconda di contenuti, funzioni e integrazioni. Preferiamo guardare il progetto e dare un numero reale: il preventivo è gratuito e senza impegno.',
  },
  {
    question: 'Quanto costa mantenere un sito web ogni anno?',
    answer:
      'Le voci ricorrenti sono dominio, hosting e, se la scegli, la manutenzione. Il dominio è la voce più piccola e si rinnova annualmente; l\'hosting dipende dal traffico e dalle prestazioni; la manutenzione copre aggiornamenti, backup, monitoraggio e sicurezza ed è facoltativa. Le indichiamo sempre separate dal costo di realizzazione, così sai cosa paghi una volta sola e cosa ogni anno.',
  },
  {
    question: 'Conviene un template o un sito su misura?',
    answer:
      'Un template costa meno e si mette online in fretta, ma lo condividi con migliaia di altre aziende, è difficile da modificare oltre un certo punto e spesso porta con sé codice inutile che rallenta il sito. Un sito su misura costa di più all\'inizio, è più veloce, cresce con te e resta di tua proprietà. Se il sito è un biglietto da visita, il template può bastare; se è uno strumento di lavoro, no.',
  },
  {
    question: 'Perché due preventivi per lo stesso sito sono così diversi?',
    answer:
      'Quasi sempre perché non comprendono le stesse cose. Controlla se sono inclusi contenuti e fotografie, il pannello di amministrazione, l\'ottimizzazione SEO, i test su mobile, la formazione all\'uso e quali costi ricorrenti restano a carico tuo. A parità di voci le differenze si riducono molto.',
  },
  {
    question: 'Quanto tempo ci vuole?',
    answer:
      'Un sito vetrina richiede tipicamente qualche settimana, un e-commerce o una piattaforma su misura diversi mesi. La variabile che sposta di più i tempi non è lo sviluppo: sono i contenuti. I progetti che rallentano sono quasi sempre quelli in attesa di testi, foto o approvazioni.',
  },
  {
    question: 'Il sito è mio o vostro?',
    answer:
      'Tuo. Dominio, codice e contenuti restano intestati al cliente. Non usiamo piattaforme proprietarie che ti obblighino a restare con noi: se un giorno vuoi cambiare fornitore, porti via tutto.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Quanto costa un sito web nel 2026? Guida ai prezzi reali',
    description:
      'Cosa determina davvero il prezzo di un sito web: pagine, design, funzioni, integrazioni e costi ricorrenti. Più le domande da fare prima di firmare un preventivo.',
    keywords: [
      'quanto costa un sito web',
      'quanto costa fare un sito web',
      'costo realizzazione sito web',
      'prezzi sito web professionale',
      'quanto costa un sito web aziendale',
      'quanto costa mantenere un sito web',
      'preventivo sito web',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function CostoSitoWebPage({ params }: Props) {
  const { locale } = await params;
  // Italian-only page: an English twin would be a thin duplicate on an
  // Italian slug, targeting a market this domain cannot win.
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const jsonLd = [
    generateStructuredDataPageBreadcrumb('it', {
      name: 'Quanto costa un sito web',
      path: PATH,
    }),
    generateStructuredDataFAQPage(FAQS),
  ];

  const published = PRICE_BANDS.filter((b) => b.range);

  return (
    <>
      <StructuredDataServer data={jsonLd} id="costo-sito-web" />

      <div className="bg-background text-foreground">
        {/* Hero */}
        <section className="container px-4 sm:px-6 md:px-8 pt-28 pb-10 sm:pt-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5 border-primary/20 bg-primary/10 text-primary">
              Guida ai prezzi
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Quanto costa <span className="text-primary">un sito web?</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              La risposta onesta è «dipende» — ma dipende da cose precise, non misteriose.
              Qui trovi cosa sposta davvero il prezzo, quali costi tornano ogni anno e quali
              domande fare prima di firmare. Senza promesse di prima pagina garantita.
            </p>
          </div>
        </section>

        {/* Cost drivers */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Cosa determina il prezzo
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Sei variabili spiegano quasi tutta la differenza fra un preventivo e l&apos;altro.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {COST_DRIVERS.map((d) => (
              <div key={d.title} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <h3 className="font-semibold text-foreground">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Le quattro tipologie di progetto
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Quasi ogni richiesta ricade in una di queste. Ti servono per capire in quale
            fascia ti trovi prima ancora di chiedere un preventivo.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {PRICE_BANDS.map((b) => (
              <div key={b.name} className="flex flex-col rounded-2xl border border-border/60 bg-card/50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">{b.name}</h3>
                  {b.range && (
                    <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {b.range}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{b.who}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {b.includes.map((i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-medium text-foreground">
                  Tempi indicativi: <span className="text-muted-foreground">{b.timeline}</span>
                </p>
              </div>
            ))}
          </div>
          {published.length === 0 && (
            <p className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              Non pubblichiamo listini fissi: due progetti che sembrano uguali possono
              richiedere lavoro molto diverso. Raccontaci il tuo e ricevi un preventivo
              dettagliato, gratuito e senza impegno.
            </p>
          )}
        </section>

        {/* Recurring */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            I costi che tornano ogni anno
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            È la parte che quasi nessuno spiega prima della firma, ed è la causa più comune
            di brutte sorprese.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {RECURRING.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border/60 bg-card/50 p-5">
                <h3 className="font-semibold text-foreground">{r.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Red flags + questions */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Campanelli d&apos;allarme in un preventivo
              </h2>
              <ul className="mt-5 space-y-3">
                {RED_FLAGS.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Domande da fare prima di firmare
              </h2>
              <ul className="mt-5 space-y-3">
                {QUESTIONS_TO_ASK.map((q) => (
                  <li key={q} className="flex gap-2.5 text-sm text-muted-foreground">
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ — plain <details> so the answers are in the HTML without JS */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Domande frequenti</h2>
          <div className="mt-8 max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/50">
            {FAQS.map((f) => (
              <details key={f.question} className="group p-6">
                <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
                  {f.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container px-4 sm:px-6 md:px-8 pb-24 pt-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Vuoi un numero, non una forbice?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Raccontaci cosa ti serve. Guardiamo il progetto e ti mandiamo un preventivo
              dettagliato, voce per voce — gratuito e senza impegno.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Richiedi un preventivo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/servizi', 'it')}>Vedi tutti i servizi</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
