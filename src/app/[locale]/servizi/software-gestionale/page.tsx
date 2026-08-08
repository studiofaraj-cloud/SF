import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, Boxes, FileSpreadsheet, HardHat, Plug, X } from 'lucide-react';
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
 * Custom business software — the highest-ticket page on the site, and the one
 * that sits at the intersection of both priorities: construction AND bespoke
 * software. "software gestione cantieri" is a real B2B query with budget behind
 * it, and Novametris already proves the studio ships admin systems.
 *
 * Italian only: the queries are Italian ("gestionale su misura", "software
 * gestione cantieri") and the slug is Italian. Lives under /servizi so it
 * inherits that cluster's internal links; /dall-idea-al-progetto is its
 * narrative parent.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/servizi/software-gestionale';

const SIGNS = [
  {
    Icon: FileSpreadsheet,
    title: 'Il processo gira su Excel e WhatsApp',
    body:
      'Funziona finché siete in tre. Poi qualcuno lavora sulla versione sbagliata del file, un messaggio si perde in una chat e nessuno sa più quale sia il dato buono. Non è un problema di disciplina: è che lo strumento non è fatto per quello.',
  },
  {
    Icon: Plug,
    title: 'Il gestionale copre il 70% e il resto lo pagate in ore',
    body:
      'Ogni software commerciale ha una parte che non si adatta al vostro modo di lavorare. Quella parte diventa lavoro manuale, ripetuto ogni settimana, che nessuno conta perché è sempre stato così.',
  },
  {
    Icon: Boxes,
    title: 'Gli stessi dati vengono inseriti tre volte',
    body:
      'Dal preventivo alla commessa, dalla commessa alla fattura. Ogni reinserimento è tempo perso e un\'occasione di errore. Sistemi che non si parlano costano più della licenza che state pagando.',
  },
  {
    Icon: HardHat,
    title: 'Il cantiere e l\'ufficio non sono allineati',
    body:
      'Rapportini su carta, ore comunicate a voce, stato avanzamento aggiornato il lunedì per la settimana prima. Chi deve decidere lavora sempre su dati vecchi di giorni.',
  },
];

const CONSTRUCTION_MODULES = [
  'Gestione commesse e cantieri',
  'Rapportini giornalieri compilabili da telefono',
  'Ore lavorate per operaio e per commessa',
  'Stato avanzamento lavori (SAL) e contabilità',
  'DDT, materiali e magazzino di cantiere',
  'Documenti di cantiere: POS, PSC, verbali',
  'Preventivi e computi collegati alla commessa',
  'Scadenze: DURC, assicurazioni, certificazioni, visite mediche',
];

const APPROACH = [
  { step: '01', title: 'Guardiamo come lavorate ora', body: 'Prima di parlare di software passiamo del tempo sul processo reale, compresi i passaggi che nessuno ha mai scritto da nessuna parte.' },
  { step: '02', title: 'Tagliamo prima di costruire', body: 'Metà delle funzioni richieste all\'inizio non serve davvero. Individuarle prima è il modo più efficace per contenere i costi.' },
  { step: '03', title: 'Partiamo dal nucleo', body: 'La prima versione copre il flusso principale e va in mano alle persone che lo useranno. Le correzioni arrivano da loro, non da una riunione.' },
  { step: '04', title: 'Cresce con voi', body: 'Si aggiunge quello che l\'uso reale dimostra necessario. Il codice è vostro e non c\'è nessun canone di piattaforma da pagare per continuare a usarlo.' },
];

const VS = [
  { feature: 'Si adatta al vostro processo', custom: true, standard: false },
  { feature: 'Pronto subito', custom: false, standard: true },
  { feature: 'Costo iniziale contenuto', custom: false, standard: true },
  { feature: 'Nessun canone per utente', custom: true, standard: false },
  { feature: 'Integrabile con quello che già usate', custom: true, standard: false },
  { feature: 'Funzioni che non userete mai', custom: false, standard: true },
  { feature: 'Il codice è vostro', custom: true, standard: false },
];

const FAQS = [
  {
    question: 'Conviene un gestionale su misura o uno standard?',
    answer:
      'Se il vostro processo è simile a quello di tutti gli altri nel settore, uno standard è quasi sempre la scelta giusta: costa meno ed è pronto subito. Il su misura conviene quando il modo in cui lavorate è parte del vostro vantaggio, oppure quando state già pagando ogni mese in ore di lavoro manuale ciò che il software non copre. Ve lo diciamo in analisi, anche quando la risposta è «tenete quello che avete».',
  },
  {
    question: 'Possiamo partire in piccolo?',
    answer:
      'È il modo che consigliamo. Si sceglie il processo che fa più male — spesso i rapportini o le commesse — e si costruisce solo quello. Va in uso in poche settimane, e il resto si aggiunge dopo con l\'esperienza reale di chi lo usa, invece che sulle ipotesi iniziali.',
  },
  {
    question: 'Si integra con il nostro software di contabilità?',
    answer:
      'Nella maggior parte dei casi sì, tramite API o scambio di file, e comprese le fatture elettroniche. È una delle prime cose che verifichiamo in analisi, perché un\'integrazione impossibile cambia radicalmente il progetto e va scoperta subito, non a metà.',
  },
  {
    question: 'Funziona in cantiere, dove la connessione va e viene?',
    answer:
      'Sì, ed è un requisito che teniamo presente fin dall\'inizio quando serve. I dati inseriti restano sul dispositivo e si sincronizzano appena la rete torna, così un rapportino compilato in una zona senza campo non va perso.',
  },
  {
    question: 'Chi lo mantiene dopo?',
    answer:
      'Potete farlo voi, noi, o entrambe le cose. Il codice e i dati sono vostri, su infrastruttura intestata a voi. Offriamo un servizio di manutenzione, ma non è una condizione per continuare a usare il software: non ci sono blocchi tecnici se decidete di cambiare fornitore.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Software gestionale su misura',
    description:
      'Gestionali sviluppati sul vostro processo: commesse, cantieri, rapportini, SAL e magazzino. Nessun canone per utente, codice di proprietà del cliente.',
    keywords: [
      'software gestionale su misura',
      'gestionale personalizzato per aziende',
      'software gestione cantieri',
      'gestionale per imprese edili',
      'software gestione commesse',
      'app per rapportini di cantiere',
      'digitalizzare la gestione dei cantieri',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function GestionalePage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const pageUrl = `${siteConfig.url}/it${PATH}`;

  const jsonLd = [
    generateStructuredDataBreadcrumbList([
      { name: 'Home', url: `${siteConfig.url}/it` },
      { name: 'Servizi', url: `${siteConfig.url}/it/servizi` },
      { name: 'Software gestionale su misura', url: pageUrl },
    ]),
    generateStructuredDataService(
      'Sviluppo software gestionale su misura',
      'Gestionali e applicazioni aziendali sviluppati sul processo del cliente: commesse, cantieri, rapportini, avanzamento lavori e integrazioni.',
      pageUrl,
      'it',
    ),
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="software-gestionale" />

      <div className="bg-background text-foreground">
        <section className="container px-4 sm:px-6 md:px-8 pt-28 pb-10 sm:pt-32">
          <div className="max-w-3xl">
            <Link
              href={getLocalizedPath('/servizi', 'it')}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Tutti i servizi
            </Link>
            <Badge variant="secondary" className="mt-4 mb-5 flex w-fit items-center gap-1.5 border-primary/20 bg-primary/10 text-primary">
              <Boxes className="h-3.5 w-3.5" />
              Software su misura
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Software gestionale{' '}
              <span className="text-primary">costruito sul vostro processo.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Quando nessun gestionale in commercio segue davvero il modo in cui lavorate,
              la differenza la pagate ogni settimana in ore di lavoro manuale. Costruiamo
              lo strumento attorno al processo, non il contrario.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Parliamo del vostro processo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/dall-idea-al-progetto', 'it')}>
                  Come lavoriamo su un&apos;idea
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quando serve davvero
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {SIGNS.map(({ Icon, title, body }) => (
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Gestione cantieri e commesse
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            È il caso che incontriamo più spesso, e quello in cui il ritorno si vede prima.
            Ogni modulo si aggiunge solo se serve.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {CONSTRUCTION_MODULES.map((m) => (
              <li key={m} className="flex gap-2.5 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Lavorate nel settore edile?{' '}
            <Link href={getLocalizedPath('/siti-web/edilizia', 'it')} className="font-medium text-primary hover:underline">
              Vedi tutto quello che facciamo per l&apos;edilizia
            </Link>
            .
          </p>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Su misura o standard?
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Non è sempre la risposta giusta. Ecco il confronto onesto.
          </p>
          <div className="mt-8 max-w-3xl overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="py-3 pr-4 font-semibold text-foreground">&nbsp;</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Su misura</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Standard</th>
                </tr>
              </thead>
              <tbody>
                {VS.map((r) => (
                  <tr key={r.feature} className="border-b border-border/40">
                    <td className="py-3 pr-4 text-muted-foreground">{r.feature}</td>
                    <td className="px-4 py-3">
                      {r.custom ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/50" />}
                    </td>
                    <td className="px-4 py-3">
                      {r.standard ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/50" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Come lo affrontiamo</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((p) => (
              <div key={p.step} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <span className="text-sm font-bold text-primary">{p.step}</span>
                <h3 className="mt-2 font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
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
            <h2 className="text-2xl sm:text-3xl font-bold">Raccontateci il processo peggiore</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Quello che tutti odiano fare e che ruba ore ogni settimana. Da lì si capisce
              in fretta se un gestionale su misura ha senso — o se conviene di no.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href={getLocalizedPath('/contatti', 'it')}>
                Parliamone
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
