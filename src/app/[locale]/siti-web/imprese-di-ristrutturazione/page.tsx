import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, Hammer, Camera, MessageSquare, Search } from 'lucide-react';
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
 * Trade child of /siti-web/edilizia — imprese di ristrutturazione.
 *
 * Built first of the trade pages for two reasons: it carries the highest
 * commercial volume in the cluster, and it is the only one with two exact-match
 * case studies already delivered (GS Costruzioni in Ticino, Colosimo Peinture in
 * Geneva). A sector page backed by real work outperforms a generic one by a wide
 * margin, so proof decides build order.
 *
 * Italian only, same reasoning as the pillar.
 *
 * The copy here is deliberately specific to this trade — the failure mode for a
 * cluster like this is one template with the noun swapped, which Google treats
 * as doorway pages.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/siti-web/imprese-di-ristrutturazione';

const PROBLEMS = [
  {
    Icon: Camera,
    title: 'I lavori migliori restano su WhatsApp',
    body:
      'Quasi ogni impresa di ristrutturazioni ha centinaia di foto di cantieri sul telefono e nessun posto dove mostrarle. È il patrimonio commerciale più forte che avete, e resta invisibile a chi vi sta cercando adesso.',
  },
  {
    Icon: Search,
    title: 'Chi cerca «ristrutturazione» cerca da mobile, di sera',
    body:
      'Il cliente tipo guarda tre o quattro imprese la stessa sera, dal divano. Se il sito è lento, non si legge bene da telefono o non ha un numero cliccabile, la scelta si riduce agli altri due.',
  },
  {
    Icon: MessageSquare,
    title: 'Le richieste arrivano incomplete',
    body:
      'Un modulo con solo nome ed email produce contatti da qualificare al telefono uno per uno. Un modulo che chiede tipo di immobile, metratura, intervento e tempistiche vi fa arrivare in sopralluogo già sapendo di cosa si parla.',
  },
  {
    Icon: Hammer,
    title: 'Sembrate tutti uguali',
    body:
      '«Serietà, professionalità, preventivi gratuiti» è scritto su ogni sito del settore. Quello che distingue davvero è il prima-dopo, il metodo di lavoro e cosa succede quando qualcosa va storto in cantiere.',
  },
];

const FEATURES = [
  'Galleria prima-dopo con confronto affiancato, per singolo intervento',
  'Schede lavoro con tipologia, zona, durata e materiali impiegati',
  'Filtri per tipo di intervento: appartamento, bagno, cucina, esterni',
  'Modulo di sopralluogo che raccoglie metratura, intervento e tempistiche',
  'Pulsante chiama-ora e WhatsApp sempre visibili da mobile',
  'Pagine per zona operativa, se coprite più comuni o cantoni',
  'Recensioni Google integrate nella pagina',
  'Sezione sui bonus edilizi attivi, se ne gestite le pratiche',
];

const SERVICES_COVERED = [
  'Ristrutturazioni complete chiavi in mano', 'Rifacimento bagni', 'Rifacimento cucine',
  'Posa pavimenti e rivestimenti', 'Parquet', 'Tinteggiature interne ed esterne',
  'Cartongesso e controsoffitti', 'Intonaci e rasature', 'Serramenti e infissi',
  'Impianti idraulici ed elettrici', 'Isolamento e cappotto termico',
  'Ristrutturazione uffici e locali commerciali',
];

const PROCESS = [
  { step: '01', title: 'Capiamo come lavorate', body: 'Che interventi fate davvero, in che zona, con quale cliente tipo. Serve a decidere cosa mettere in prima pagina e cosa lasciare fuori.' },
  { step: '02', title: 'Mettiamo ordine nei lavori', body: 'Selezioniamo i cantieri migliori dal vostro archivio e li trasformiamo in schede con prima-dopo. Se le foto sono poche vi diciamo esattamente quali fare nel prossimo cantiere.' },
  { step: '03', title: 'Costruiamo il sito', body: 'Design su misura, veloce da mobile, con il percorso costruito attorno alla richiesta di sopralluogo.' },
  { step: '04', title: 'Vi lasciamo autonomi', body: 'Aggiungete un cantiere nuovo dal pannello in pochi minuti, senza chiamarci. Il portfolio cresce da solo e continua a portare visite.' },
];

const CASES = [
  {
    client: 'GS Costruzioni & Ristrutturazioni',
    where: 'Monte Carasso, Canton Ticino',
    body: 'Ristrutturazioni chiavi in mano in Ticino e Grigioni italiani. Sito in quattro lingue costruito attorno al preventivo e alla galleria lavori.',
    slug: '/projects/sito-web-per-impresa-di-ristrutturazioni-in-ticino-gs-costruzioni-ristrutturazioni',
  },
  {
    client: 'Colosimo Peinture',
    where: 'Ginevra',
    body: 'Impresa artigianale di ristrutturazioni e finiture interne: pittura, gessatura, posa carta da parati e manutenzione. Sito orientato alla richiesta di preventivo.',
    slug: '/projects/sito-web-di-colosimo-peinture-a-ginevra',
  },
];

const FAQS = [
  {
    question: 'Non ho foto professionali dei cantieri. È un problema?',
    answer:
      'No, e non serve un fotografo. Le foto scattate col telefono funzionano benissimo se sono fatte con un minimo di criterio: stessa inquadratura prima e dopo, luce naturale, ambiente sgombro. Vi diamo una lista di cosa fotografare nel prossimo cantiere; nel frattempo partiamo con quello che avete già.',
  },
  {
    question: 'Meglio mostrare i prezzi degli interventi?',
    answer:
      'Raramente conviene un listino, perché ogni ristrutturazione fa storia a sé e un numero fuori contesto spaventa. Funziona meglio indicare fasce indicative per tipo di intervento, oppure spiegare cosa fa salire e scendere il preventivo. Serve a filtrare chi ha un budget fuori scala senza perdere chi è indeciso.',
  },
  {
    question: 'Ricevo già lavoro col passaparola. Cosa cambia?',
    answer:
      'Cambia chi vi sceglie. Il passaparola porta il nome, ma il cliente cerca comunque l\'impresa online prima di far entrare degli sconosciuti in casa per settimane. Il sito serve a chiudere quella verifica a vostro favore — e con il tempo porta richieste da chi non vi conosce affatto.',
  },
  {
    question: 'Serve una pagina per ogni comune in cui lavoro?',
    answer:
      'Solo se in quel comune avete lavorato davvero. Pagine locali costruite su cantieri reali, con foto e riferimenti, funzionano; venti pagine identiche col nome del paese cambiato vengono trattate da Google come pagine-esca e possono penalizzare tutto il sito. Meglio poche pagine vere.',
  },
  {
    question: 'Lavorate con imprese italiane all\'estero?',
    answer:
      'Sì, ed è una parte crescente del nostro lavoro. GS Costruzioni opera in Canton Ticino e Colosimo Peinture a Ginevra: stessa lingua, stesso fuso orario, e siti pensati per mercati dove convivono più lingue.',
  },
  {
    question: 'Quanto tempo serve per andare online?',
    answer:
      'Per un\'impresa di ristrutturazioni tipicamente qualche settimana. Il collo di bottiglia non è lo sviluppo: è la selezione dei lavori da pubblicare. Chi arriva con le foto già ordinate va online molto più in fretta.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Siti web per imprese di ristrutturazione',
    description:
      'Siti web per imprese di ristrutturazioni: galleria prima-dopo, schede cantiere, richiesta di sopralluogo e ottimizzazione mobile. Casi reali in Italia e in Svizzera.',
    keywords: [
      'sito web impresa ristrutturazioni',
      'sito web per ristrutturazioni',
      'marketing per imprese di ristrutturazione',
      'pubblicità impresa ristrutturazioni',
      'come trovare clienti per ristrutturazioni',
      'come farsi conoscere come impresa di ristrutturazioni',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function RistrutturazioniPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const pageUrl = `${siteConfig.url}/it${PATH}`;

  const jsonLd = [
    generateStructuredDataBreadcrumbList([
      { name: 'Home', url: `${siteConfig.url}/it` },
      { name: 'Siti web per l\'edilizia', url: `${siteConfig.url}/it/siti-web/edilizia` },
      { name: 'Imprese di ristrutturazione', url: pageUrl },
    ]),
    generateStructuredDataService(
      'Realizzazione siti web per imprese di ristrutturazione',
      'Siti web per imprese di ristrutturazioni e finiture: portfolio prima-dopo, schede cantiere e richiesta di sopralluogo.',
      pageUrl,
      'it',
    ),
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="ristrutturazioni" />

      <div className="bg-background text-foreground">
        {/* Hero */}
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
              <span className="text-primary">di ristrutturazione.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Il vostro miglior venditore è una foto prima-dopo. Costruiamo il sito attorno
              ai lavori che avete già fatto, con un percorso che porta il visitatore a
              chiedervi un sopralluogo invece di chiudere la scheda.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Richiedi un preventivo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/quanto-costa-un-sito-web', 'it')}>
                  Quanto costa
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Problems */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quattro problemi che vediamo in quasi ogni impresa
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

        {/* Cases */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Imprese come la vostra</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {CASES.map((c) => (
              <Link
                key={c.client}
                href={getLocalizedPath(c.slug, 'it')}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/40 hover:bg-card"
              >
                <h3 className="text-lg font-semibold text-foreground">{c.client}</h3>
                <p className="mt-1 text-sm text-primary">{c.where}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Vedi il progetto
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
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

        {/* Process */}
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

        {/* Services covered */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Interventi che raccontiamo bene
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ogni tipo di lavoro ha una sua pagina o una sua scheda, così chi cerca un
            intervento specifico trova esattamente quello.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {SERVICES_COVERED.map((s) => (
              <li key={s} className="rounded-lg border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground">
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
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
            <h2 className="text-2xl sm:text-3xl font-bold">Mostriamo i vostri lavori come meritano</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Mandateci qualche foto di un cantiere concluso. Vi facciamo vedere come
              diventerebbe online, prima ancora di parlare di preventivi.
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
