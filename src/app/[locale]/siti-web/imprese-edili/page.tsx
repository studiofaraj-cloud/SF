import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, ClipboardCheck, UserPlus, Handshake, Repeat } from 'lucide-react';
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
 * Trade child of /siti-web/edilizia — imprese edili e di costruzioni.
 *
 * No exact case study yet (GS Costruzioni is the nearest adjacency), so this
 * page leans on the two arguments that are true and unclaimed rather than on
 * proof: qualification (the committente checks you before shortlisting) and
 * recruiting (Veneto imprese cannot find skilled labour, and no agency pitches
 * a "Lavora con noi" that actually ranks).
 *
 * The buyer here is being VETTED, not browsing. That is the difference from the
 * ristrutturazione page, where the buyer is a homeowner choosing on aesthetics.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/siti-web/imprese-edili';

const PROBLEMS = [
  {
    Icon: ClipboardCheck,
    title: 'Vi controllano prima di invitarvi',
    body:
      'Prima di inserirvi in un elenco fornitori, invitarvi a una gara o affidarvi un subappalto, qualcuno cerca il nome dell\'impresa. Trovare una pagina Facebook ferma da anni, o niente, è un segnale: se non curate la vostra immagine, il dubbio si sposta su come curate il cantiere.',
  },
  {
    Icon: UserPlus,
    title: 'Trovare persone è più difficile che trovare lavoro',
    body:
      'In Veneto il collo di bottiglia non sono le commesse: sono capicantiere, muratori specializzati e tecnici. Una pagina «Lavora con noi» ottimizzata sulle ricerche di lavoro della vostra zona porta candidature spontanee. È il ritorno più rapido, ed è quello che nessuna agenzia vi propone.',
  },
  {
    Icon: Handshake,
    title: 'I general contractor cercano subappaltatori online',
    body:
      'Se lavorate in subappalto, chi vi cerca vuole sapere in fretta tre cose: cosa sapete fare, che dimensione di cantiere reggete e se siete in regola. Categorie SOA, certificazioni e importi dei lavori conclusi rispondono in dieci secondi a domande che altrimenti costano due telefonate.',
  },
  {
    Icon: Repeat,
    title: 'Il passaggio generazionale',
    body:
      'Chi oggi commissiona una ristrutturazione o una nuova costruzione ha spesso trent\'anni e valuta partendo dal telefono. Le imprese che stanno passando alla seconda generazione lo notano subito: cambia il committente prima ancora che cambi il mercato.',
  },
];

const FEATURES = [
  'Blocco qualificazione: attestazione SOA con categorie e classifica',
  'Certificazioni ISO, DURC, dati camerali e coperture assicurative',
  'Portfolio cantieri con committente, luogo, anno e importo dei lavori',
  'Sezione «Lavora con noi» con candidatura e caricamento CV',
  'Pagina dedicata alle capacità tecniche e al parco mezzi',
  'Download di referenze e documentazione per gli elenchi fornitori',
  'Pagine per provincia o area operativa, dove avete cantieri reali',
  'Area riservata per direzione lavori e committenti',
];

const SECTORS = [
  'Nuove costruzioni', 'Ristrutturazione e riqualificazione', 'Edilizia residenziale',
  'Capannoni e edilizia industriale', 'Opere pubbliche e appalti', 'Edilizia commerciale',
  'Consolidamenti e strutture', 'Movimento terra e fondazioni', 'Demolizioni',
  'Manutenzione e global service',
];

const PROCESS = [
  { step: '01', title: 'Guardiamo chi vi valuta', body: 'Committenti privati, stazioni appaltanti o general contractor cercano cose diverse. Decidiamo cosa va in prima pagina partendo da lì.' },
  { step: '02', title: 'Mettiamo in fila le credenziali', body: 'SOA, ISO, dati camerali, assicurazioni, opere concluse. È il materiale che chiude una verifica, e quasi sempre è sparso fra cartelle e vecchi PDF.' },
  { step: '03', title: 'Costruiamo il sito', body: 'Veloce, leggibile da cantiere col telefono in mano, con i cantieri conclusi come struttura portante.' },
  { step: '04', title: 'Aggiungete i cantieri da soli', body: 'Ogni opera conclusa diventa una scheda nuova dal pannello. Il sito cresce mentre lavorate, senza dover chiamare nessuno.' },
];

const FAQS = [
  {
    question: 'Lavoriamo quasi solo con lo stesso committente. Serve?',
    answer:
      'È proprio la situazione in cui serve di più. Dipendere da un committente solo significa che se cambia strategia o referente vi trovate fermi. Un sito che vi rende trovabili da altre imprese e da nuovi committenti è la forma più economica di diversificazione commerciale.',
  },
  {
    question: 'Possiamo pubblicare i lavori fatti in subappalto?',
    answer:
      'Di norma sì, ma verificate il contratto: alcuni committenti vietano l\'uso del proprio nome o delle immagini del cantiere. Quando c\'è un vincolo si pubblica comunque l\'opera descrivendo tipologia, entità e ruolo svolto, senza citare il committente. Il valore per chi vi valuta resta quasi intatto.',
  },
  {
    question: 'La pagina «Lavora con noi» porta davvero candidature?',
    answer:
      'Nella nostra esperienza è la sezione che dà il ritorno più veloce, perché la concorrenza è quasi nulla: quasi nessuna impresa edile ha una pagina lavoro fatta per essere trovata. Funziona se dice cosa cercate, in che zona, che tipo di contratto e come ci si candida — non un indirizzo email generico.',
  },
  {
    question: 'Il sito aiuta con le gare d\'appalto?',
    answer:
      'Non sostituisce la documentazione di gara, e nessun sito vi fa vincere un appalto. Aiuta nella fase prima: quando una stazione appaltante o un general contractor deve decidere chi invitare o chi inserire in un elenco fornitori, un\'impresa con credenziali verificabili online parte avvantaggiata rispetto a una introvabile.',
  },
  {
    question: 'Abbiamo poche foto dei cantieri.',
    answer:
      'Si parte da quelle che ci sono, anche scattate col telefono. Vi diamo una lista breve di cosa fotografare nei prossimi cantieri — stato iniziale, fasi, opera finita, dettagli tecnici — così l\'archivio si costruisce da solo. Dopo un anno avrete materiale per anni di pagine nuove.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Siti web per imprese edili e di costruzioni',
    description:
      'Siti web per imprese edili: attestazione SOA e certificazioni in evidenza, portfolio cantieri con importi, sezione lavora con noi. Pensati per chi vi valuta prima di invitarvi.',
    keywords: [
      'sito web impresa edile',
      'sito web impresa di costruzioni',
      'sito web azienda edile',
      'realizzazione siti web imprese edili',
      'come trovare clienti impresa edile',
      'come farsi conoscere impresa edile',
      'marketing per imprese edili',
      'come trovare operai edili',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function ImpreseEdiliPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const pageUrl = `${siteConfig.url}/it${PATH}`;

  const jsonLd = [
    generateStructuredDataBreadcrumbList([
      { name: 'Home', url: `${siteConfig.url}/it` },
      { name: 'Siti web per l\'edilizia', url: `${siteConfig.url}/it/siti-web/edilizia` },
      { name: 'Imprese edili', url: pageUrl },
    ]),
    generateStructuredDataService(
      'Realizzazione siti web per imprese edili e di costruzioni',
      'Siti web per imprese di costruzioni: qualificazione SOA, portfolio cantieri con importi lavori e sezione recruiting.',
      pageUrl,
      'it',
    ),
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="imprese-edili" />

      <div className="bg-background text-foreground">
        <section className="container px-4 sm:px-6 md:px-8 pt-32 pb-10 sm:pt-40">
          <div className="max-w-3xl">
            <Link
              href={getLocalizedPath('/siti-web/edilizia', 'it')}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Edilizia e costruzioni
            </Link>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Siti web per imprese{' '}
              <span className="text-primary">edili e di costruzioni.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Chi arriva sul vostro sito non sta curiosando: vi sta valutando. Costruiamo
              siti che reggono quella verifica — credenziali in ordine, cantieri conclusi,
              e una pagina lavoro che porta candidature invece di silenzio.
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
            Quattro cose che succedono davvero
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Come lavoriamo</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.step} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <span className="text-sm font-bold text-primary">{p.step}</span>
                <h3 className="mt-2 font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tipi di lavoro</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Lo stesso sito cambia impostazione a seconda di cosa costruite abitualmente.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <li key={s} className="rounded-lg border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground">
                {s}
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
            <h2 className="text-2xl sm:text-3xl font-bold">Chi dovete convincere?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Committenti privati, stazioni appaltanti, general contractor o candidati da
              assumere. Diteci quale dei quattro conta di più e costruiamo il sito attorno
              a quello.
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
