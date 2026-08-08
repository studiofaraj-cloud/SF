import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  ArrowRight, HardHat, FileCheck, Users, Images, FileText, MapPin, Check,
} from 'lucide-react';
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
 * PILLAR — siti web per l'edilizia e le costruzioni.
 *
 * Parent of the construction cluster. Its job is less about ranking for the
 * category head term than about holding the cluster together: it links to every
 * trade child and receives a link back from each.
 *
 * Italian only, deliberately. The buyer is an Italian-speaking construction
 * firm — in Italy, in Ticino, or an Italian-run business in DACH. An English
 * twin on an Italian slug would be a thin duplicate targeting a market this
 * domain cannot win.
 *
 * Two rules this page exists to respect:
 *  - The project-sector axis (residenziale / commerciale / industriale /
 *    infrastrutture) is CONTENT here, never separate URLs. Crossing trade ×
 *    sector is the doorway-page matrix that gets whole clusters demoted.
 *  - Trades with effectively no Italian search demand (restauro, amianto,
 *    prefabbricati, BIM, ascensori…) are named in copy so the terms are
 *    indexed, without spawning thin pages of their own.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/siti-web/edilizia';

/** Live children only. Add entries as each trade page ships. */
const TRADE_PAGES: Array<{ name: string; path: string; blurb: string }> = [
  {
    name: 'Imprese di ristrutturazione',
    path: '/siti-web/imprese-di-ristrutturazione',
    blurb:
      'Ristrutturazioni chiavi in mano, finiture, rifacimento bagni. Il prima-dopo è l\'argomento di vendita: il sito deve essere costruito attorno alla galleria lavori.',
  },
  {
    name: 'Imprese edili e di costruzioni',
    path: '/siti-web/imprese-edili',
    blurb:
      'Chi arriva sul sito vi sta valutando. Attestazione SOA, certificazioni, cantieri conclusi con importi — e la pagina lavoro che porta candidature.',
  },
  {
    name: 'Geometri e studi tecnici',
    path: '/siti-web/geometri',
    blurb:
      'I clienti cercano l\'APE o la voltura, non «geometra». Una pagina per pratica, credenziali in evidenza, rilievi e laser scanner mostrati come si deve.',
  },
];

const WHY = [
  {
    Icon: FileCheck,
    title: 'Il committente ti cerca prima di invitarti',
    body:
      'Prima di inserirti in un elenco fornitori o invitarti a una gara, chi ti sta valutando cerca il nome dell\'impresa su Google. Se non trova niente — o trova una pagina Facebook ferma al 2019 — sei già in svantaggio rispetto a un concorrente che mostra attestazione SOA, certificazioni ISO, dati camerali e cantieri conclusi.',
  },
  {
    Icon: Users,
    title: 'Le persone: il problema che nessuno affronta',
    body:
      'In Veneto trovare operai specializzati, capicantiere e tecnici è più difficile che trovare commesse. Una sezione «Lavora con noi» fatta bene e indicizzata sulle ricerche giuste porta candidature spontanee. È il motivo per cui diverse imprese rifanno il sito, e praticamente nessuna agenzia lo propone.',
  },
  {
    Icon: Images,
    title: 'I cantieri sono un archivio che lavora per te',
    body:
      'Ogni opera conclusa può diventare una scheda con foto, luogo, tipologia di intervento, anno e importo dei lavori. Non è una brochure: sono pagine che continuano a farsi trovare per anni, anche per ricerche legate al territorio in cui hai lavorato.',
  },
  {
    Icon: FileText,
    title: 'Documenti tecnici come strumento commerciale',
    body:
      'Capitolati, schede tecniche, certificazioni e referenze scaricabili dietro un semplice modulo trasformano visite anonime in contatti qualificati. Chi scarica un capitolato non sta curiosando.',
  },
];

const AUDIENCES = [
  {
    title: 'Imprese di costruzioni e general contractor',
    body:
      'Attestazione SOA con categorie e classifica, certificazioni ISO, dati CCIAA, DURC, portfolio cantieri con importo lavori e committente. Il sito serve a superare una valutazione, non a fare scena.',
  },
  {
    title: 'Studi tecnici: ingegneri, geometri, architetti',
    body:
      'Ordine o collegio di appartenenza e numero di iscrizione, partner con nome e cognome, opere realizzate, pubblicazioni tecniche. Qui la credibilità è personale prima che aziendale.',
  },
  {
    title: 'Imprese specializzate e subappaltatori',
    body:
      'Il cliente è un\'altra impresa. Servono capacità produttiva, attrezzature, certificazioni, area di copertura e un modulo di richiesta rapido: chi cerca un subappaltatore ha fretta.',
  },
  {
    title: 'Noleggi, trasporti e servizi di cantiere',
    body:
      'Parco mezzi o catalogo, zone servite, disponibilità e richiesta preventivo. Traffico quasi tutto da mobile: il numero di telefono deve essere a un tocco di distanza.',
  },
];

const FEATURES = [
  'Galleria cantieri con schede per opera (luogo, tipologia, anno, importo)',
  'Sezione «Lavora con noi» con candidatura online',
  'Blocco certificazioni: SOA, ISO, iscrizioni, assicurazioni',
  'Richiesta di sopralluogo o preventivo con notifica immediata',
  'Download di capitolati e schede tecniche con raccolta contatto',
  'Area riservata per committenti o direzione lavori',
  'Pagine per zona operativa, se lavori su più province',
  'Multilingua per chi opera in Svizzera o all\'estero',
];

const PROJECT_SECTORS = [
  'Residenziale', 'Commerciale e retail', 'Industriale e logistica',
  'Istituzionale e scolastico', 'Infrastrutture e opere civili',
  'Energia e impianti', 'Ristrutturazione e riqualificazione',
];

const ALSO_SERVED = [
  'restauro e conservazione', 'bonifica amianto', 'prefabbricati e modulare',
  'BIM e modellazione digitale', 'geologia e geotecnica', 'computo metrico',
  'coibentazioni', 'pavimentazioni industriali', 'ripristino post-sinistro',
  'facility management', 'sicurezza cantieri e coordinamento CSP/CSE',
];

const CASE_STUDIES = [
  {
    client: 'GS Costruzioni & Ristrutturazioni',
    where: 'Monte Carasso, Canton Ticino',
    body:
      'Impresa di ristrutturazioni chiavi in mano attiva in Ticino e nei Grigioni italiani. Sito multilingua (italiano, tedesco, francese, inglese) costruito attorno alla richiesta di preventivo e alla galleria dei lavori conclusi.',
    slug: '/projects/sito-web-per-impresa-di-ristrutturazioni-in-ticino-gs-costruzioni-ristrutturazioni',
  },
  {
    client: 'Novametris',
    where: 'Lecco',
    body:
      'Marchio specializzato in rilievi topografici e laser scanner 3D. Piattaforma con sistema di preventivazione integrato, area amministrativa completa e infrastruttura su Google Cloud.',
    slug: '/projects/novametris-sito-web-per-marchio-di-rilievi-topografici-e-laser-scanner-3d',
  },
];

const FAQS = [
  {
    question: 'Un\'impresa edile ha davvero bisogno di un sito, se lavora già a passaparola?',
    answer:
      'Il passaparola porta il nome, il sito lo conferma. Chi riceve una segnalazione cerca comunque l\'impresa online prima di chiamare: il sito serve a chiudere quella verifica a tuo favore, non a sostituire il passaparola. Vale lo stesso per committenti e imprese che ti valutano come subappaltatore.',
  },
  {
    question: 'Può aiutarci a trovare personale?',
    answer:
      'Sì, ed è spesso il ritorno più immediato. Una pagina «Lavora con noi» ottimizzata per le ricerche di lavoro nella tua zona, con candidatura online, intercetta persone che oggi non sanno che stai assumendo. Molte imprese ricevono più candidature che richieste di preventivo nei primi mesi.',
  },
  {
    question: 'Serve pubblicare gli importi dei lavori nel portfolio?',
    answer:
      'Non è obbligatorio, ma aiuta se punti a commesse della stessa dimensione: dice al committente che sei abituato a quel tipo di cantiere. Quando l\'importo è riservato si può indicare una fascia oppure ometterlo e lasciare tipologia, luogo e anno.',
  },
  {
    question: 'Lavorate anche con imprese italiane in Svizzera?',
    answer:
      'Sì. GS Costruzioni & Ristrutturazioni, in Canton Ticino, è uno dei nostri progetti: sito multilingua pensato per un mercato dove convivono italiano, tedesco e francese. Il fuso e la lingua sono gli stessi, quindi la collaborazione funziona esattamente come con un cliente italiano.',
  },
  {
    question: 'Quanto tempo serve?',
    answer:
      'Un sito per un\'impresa strutturata richiede tipicamente qualche settimana. La variabile che pesa di più non è lo sviluppo ma il materiale: fotografie dei cantieri, elenco delle opere, certificazioni aggiornate. Le imprese che hanno già un archivio fotografico decente vanno online molto più in fretta.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Siti web per l\'edilizia e le costruzioni',
    description:
      'Siti web per imprese edili, studi tecnici e imprese specializzate: portfolio cantieri, certificazioni SOA, richiesta preventivo e sezione lavora con noi. Da Padova, in tutta Italia e in Svizzera.',
    keywords: [
      'siti web per edilizia',
      'sito web impresa edile',
      'realizzazione siti web edilizia',
      'sito web imprese di costruzioni',
      'web agency settore edile',
      'marketing digitale edilizia',
      'digitalizzazione imprese edili',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function EdiliziaPillarPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const pageUrl = `${siteConfig.url}/it${PATH}`;

  const jsonLd = [
    // Two levels only: there is no /siti-web index page yet, and pointing a
    // breadcrumb item at a URL that 404s is worse than a shorter trail.
    // Promote to three levels once that hub exists.
    generateStructuredDataBreadcrumbList([
      { name: 'Home', url: `${siteConfig.url}/it` },
      { name: 'Siti web per l\'edilizia', url: pageUrl },
    ]),
    generateStructuredDataService(
      'Realizzazione siti web per imprese edili e studi tecnici',
      'Progettazione e sviluppo di siti web per imprese di costruzioni, studi di ingegneria, geometri, architetti e imprese specializzate del settore edile.',
      pageUrl,
      'it',
    ),
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="edilizia-pillar" />

      <div className="bg-background text-foreground">
        {/* Hero */}
        <section className="container px-4 sm:px-6 md:px-8 pt-28 pb-10 sm:pt-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5 inline-flex items-center gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HardHat className="h-3.5 w-3.5" />
              Edilizia e costruzioni
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Siti web per l&apos;edilizia{' '}
              <span className="text-primary">e le costruzioni.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Imprese di costruzioni, studi tecnici, artigiani specializzati e servizi di
              cantiere. Costruiamo siti che reggono la verifica di un committente,
              mostrano i cantieri conclusi e aiutano a trovare personale — non brochure
              digitali.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Parliamo del tuo progetto
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/quanto-costa-un-sito-web', 'it')}>
                  Quanto costa un sito web
                </Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Studio a Padova — lavoriamo in tutto il Veneto, in Italia e in Canton Ticino.
            </p>
          </div>
        </section>

        {/* Why */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Perché a un&apos;impresa edile serve davvero
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {WHY.map(({ Icon, title, body }) => (
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

        {/* Case studies — real, delivered work */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Lavori nel settore</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {CASE_STUDIES.map((c) => (
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

        {/* Audiences */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Con chi lavoriamo</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Quattro tipi di committente molto diversi fra loro: chi valuta un&apos;impresa di
            costruzioni non cerca le stesse cose di chi sceglie uno studio tecnico.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </div>

          {TRADE_PAGES.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground">Pagine per settore</h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {TRADE_PAGES.map((t) => (
                  <li key={t.path}>
                    <Link
                      href={getLocalizedPath(t.path, 'it')}
                      className="group flex h-full flex-col rounded-2xl border border-primary/20 bg-primary/5 p-5 transition-colors hover:border-primary/40"
                    >
                      <span className="font-semibold text-foreground">{t.name}</span>
                      <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {t.blurb}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Approfondisci
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Cosa mettiamo in un sito per l&apos;edilizia
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-2.5 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sectors + adjacent specialisms — content, deliberately not URLs */}
        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Settori di intervento</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Lo stesso sito cambia taglio a seconda del tipo di opera che l&apos;impresa
                realizza abitualmente.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {PROJECT_SECTORS.map((s) => (
                  <li key={s} className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Lavoriamo anche con</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Specializzazioni che incontriamo spesso nei progetti del settore.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {ALSO_SERVED.map((s) => (
                  <li key={s} className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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

        {/* CTA + entry-level offer */}
        <section className="container px-4 sm:px-6 md:px-8 pb-24 pt-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Parliamo della tua impresa</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Raccontaci che lavori fai e chi devi convincere. Ti diciamo cosa serve davvero
              e cosa no, con un preventivo dettagliato e gratuito.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Richiedi un preventivo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/pagine-aziendali', 'it')}>
                  Non sei pronto per un sito completo?
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
