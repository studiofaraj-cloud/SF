import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, Ruler, BadgeCheck, Clock, FileSearch, Scan } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import {
  generateMetadata as buildSEOMetadata,
  generateStructuredDataBreadcrumbList,
  generateStructuredDataFAQPage,
  generateStructuredDataService,
  siteConfig,
} from '@/lib/seo';
import { getLocalizedPath } from '@/lib/i18n-helpers';

/**
 * Trade child of /siti-web/edilizia — studi di geometra.
 *
 * A regulated Italian profession with no English equivalent, which means
 * essentially zero competition from international agencies for the query.
 * Novametris (rilievi topografici e laser scanner 3D, Lecco) is the case study.
 *
 * This buyer is NOT the impresa buyer. A geometra sells personal credibility —
 * albo number, pratiche handled, response time — not a before/after gallery.
 * The page is written around that difference on purpose: copying the
 * ristrutturazione template here is exactly what turns a cluster into doorway
 * pages.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/siti-web/geometri';

const PROBLEMS = [
  {
    Icon: FileSearch,
    title: 'Il cliente non sa cosa fa un geometra',
    body:
      'Chi deve vendere casa cerca «APE», chi eredita cerca «voltura catastale», chi ristruttura cerca «CILA». Quasi nessuno cerca «geometra» e basta. Un sito che elenca solo «servizi tecnici» non intercetta nessuna di quelle ricerche: servono pagine sulle pratiche vere, chiamate come le chiama il cliente.',
  },
  {
    Icon: Clock,
    title: 'Chi vi cerca ha fretta',
    body:
      'Un attestato energetico serve prima del rogito, una pratica catastale sblocca una compravendita ferma. È intento immediato: chi arriva sul sito vuole sapere se ve ne occupate, in quanto tempo e come contattarvi. Se deve cercarlo, chiama il collega.',
  },
  {
    Icon: BadgeCheck,
    title: 'La fiducia è personale, non aziendale',
    body:
      'Nessuno affida una perizia a un logo. Nome, cognome, collegio di appartenenza, numero di iscrizione e anni di attività valgono più di qualunque slogan. È anche ciò che i motori di ricerca usano per capire che dietro al sito c\'è un professionista reale.',
  },
  {
    Icon: Scan,
    title: 'Le competenze tecniche restano invisibili',
    body:
      'Se fate rilievi con laser scanner, restituzioni in nuvola di punti o modellazione BIM, siete su un piano diverso dallo studio che lavora ancora a rotella metrica. Ma se il sito non lo mostra, il cliente confronta solo i preventivi.',
  },
];

const PRATICHE = [
  'Pratiche catastali e DOCFA', 'Accatastamento e variazioni', 'Volture e successioni',
  'Frazionamenti e tipi mappali', 'Attestato di prestazione energetica (APE)',
  'SCIA, CILA e permesso di costruire', 'Agibilità e conformità urbanistica',
  'Rilievi topografici', 'Laser scanner 3D e nuvole di punti', 'Restituzioni e scan to BIM',
  'Computo metrico estimativo', 'Direzione lavori e contabilità di cantiere',
  'Perizie e stime immobiliari', 'Sicurezza cantieri e coordinamento',
];

const FEATURES = [
  'Una pagina per ogni pratica, con il nome che usa il cliente',
  'Blocco credenziali: collegio, numero di iscrizione, anni di attività',
  'Tempi di risposta e di evasione dichiarati apertamente',
  'Modulo che raccoglie tipo di pratica, comune e dati catastali',
  'Portfolio di rilievi e opere seguite, con luogo e anno',
  'Presentazione della strumentazione: stazione totale, GPS, laser scanner, drone',
  'Area riservata per lo scambio di documenti con il cliente',
  'Sezione news per aggiornamenti normativi e scadenze',
];

const CASE = {
  client: 'Novametris',
  where: 'Lecco',
  body:
    'Marchio specializzato in rilievi topografici e laser scanner 3D. Abbiamo costruito una piattaforma con sistema di preventivazione integrato, area amministrativa completa e infrastruttura su Google Cloud: il cliente configura la richiesta e lo studio la riceve già qualificata.',
  slug: '/projects/novametris-sito-web-per-marchio-di-rilievi-topografici-e-laser-scanner-3d',
};

const FAQS = [
  {
    question: 'Ho già un profilo sulle pagine del collegio. Non basta?',
    answer:
      'Un elenco vi rende trovabili da chi sta già cercando un geometra in zona e vi mette accanto a decine di colleghi con la stessa scheda. Un sito vi rende trovabili da chi cerca la pratica che gli serve — «quanto costa un APE», «come si fa una voltura catastale» — e vi lascia lo spazio per spiegare perché scegliere voi.',
  },
  {
    question: 'Posso indicare i prezzi delle pratiche?',
    answer:
      'Per le pratiche standard spesso conviene: chi cerca un APE vuole soprattutto sapere quanto costa e in quanto tempo, e un prezzo chiaro fa arrivare contatti già decisi. Per perizie, rilievi complessi o direzione lavori conviene invece una fascia indicativa e un sopralluogo. Molti studi usano entrambe le formule sulla stessa pagina.',
  },
  {
    question: 'Serve un sito se lavoro quasi solo su segnalazione di agenzie immobiliari?',
    answer:
      'Sì, per due motivi. Le agenzie stesse controllano online prima di segnalarvi a un cliente, e il proprietario segnalato vi cerca comunque prima di affidarvi la pratica. Inoltre riduce la dipendenza da pochi segnalatori: se un\'agenzia cambia referente, il canale si chiude in un giorno.',
  },
  {
    question: 'Facciamo rilievi con laser scanner. Come si mostra un lavoro così?',
    answer:
      'Con le immagini della nuvola di punti, i modelli generati e il confronto con lo stato di fatto: è materiale visivamente forte e la maggior parte dei clienti non l\'ha mai visto. È esattamente la strada seguita con Novametris, dove la strumentazione e le restituzioni sono parte dell\'argomento di vendita, non un dettaglio tecnico nascosto.',
  },
  {
    question: 'Siamo uno studio di due persone. Non è sovradimensionato?',
    answer:
      'No, anzi: gli studi piccoli sono quelli che ci guadagnano di più, perché un sito che filtra e qualifica le richieste fa risparmiare proprio il tempo che manca. Un modulo che chiede in anticipo tipo di pratica, comune e dati catastali evita metà delle telefonate interlocutorie.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Siti web per geometri e studi tecnici',
    description:
      'Siti web per studi di geometra: una pagina per ogni pratica, credenziali in evidenza, moduli che qualificano le richieste. Rilievi topografici e laser scanner inclusi.',
    keywords: [
      'sito web per geometri',
      'sito web studio tecnico',
      'sito internet geometra',
      'sito web per topografi',
      'sito web rilievi topografici',
      'come trovare clienti come geometra',
      'come pubblicizzare uno studio tecnico',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function GeometriPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const pageUrl = `${siteConfig.url}/it${PATH}`;

  const jsonLd = [
    generateStructuredDataBreadcrumbList([
      { name: 'Home', url: `${siteConfig.url}/it` },
      { name: 'Siti web per l\'edilizia', url: `${siteConfig.url}/it/siti-web/edilizia` },
      { name: 'Geometri e studi tecnici', url: pageUrl },
    ]),
    generateStructuredDataService(
      'Realizzazione siti web per studi di geometra',
      'Siti web per geometri e studi tecnici: pagine per pratica, credenziali professionali, rilievi topografici e moduli di richiesta qualificati.',
      pageUrl,
      'it',
    ),
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="geometri" />

      <div className="bg-background text-foreground">
        <section className="container px-4 sm:px-6 md:px-8 pt-28 pb-10 sm:pt-32">
          <div className="max-w-3xl">
            <Link
              href={getLocalizedPath('/siti-web/edilizia', 'it')}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Edilizia e costruzioni
            </Link>
            <Badge variant="secondary" className="mt-4 mb-5 flex w-fit items-center gap-1.5 border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Ruler className="h-3.5 w-3.5" />
              Geometri e studi tecnici
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Siti web per geometri{' '}
              <span className="text-primary">e studi tecnici.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              I vostri clienti non cercano «geometra»: cercano l&apos;APE, la voltura, il
              frazionamento. Costruiamo il sito attorno alle pratiche che seguite, con le
              credenziali in evidenza e moduli che vi fanno arrivare richieste già complete.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Richiedi un preventivo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/quanto-costa-un-sito-web', 'it')}>Quanto costa</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Perché uno studio tecnico non viene trovato
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {PROBLEMS.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Un caso reale</h2>
          <Link
            href={getLocalizedPath(CASE.slug, 'it')}
            className="group mt-8 flex max-w-3xl flex-col rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8 transition-colors hover:border-primary/40 hover:bg-card"
          >
            <h3 className="text-xl font-semibold text-foreground">{CASE.client}</h3>
            <p className="mt-1 text-sm text-primary">{CASE.where}</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">{CASE.body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Vedi il progetto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Cosa contiene il sito</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-2.5 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Le pratiche a cui diamo una pagina
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ognuna è una ricerca reale che qualcuno fa oggi nella vostra provincia.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {PRATICHE.map((p) => (
              <li key={p} className="rounded-lg border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground">
                {p}
              </li>
            ))}
          </ul>
        </section>

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

        <section className="container px-4 sm:px-6 md:px-8 pb-24 pt-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Partiamo dalle vostre pratiche</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Diteci quali seguite più spesso e in quali comuni lavorate. Vi mostriamo quali
              ricerche potete intercettare e con quanto lavoro.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Parliamone
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/pagine-aziendali', 'it')}>
                  Parti da una pagina aziendale
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
