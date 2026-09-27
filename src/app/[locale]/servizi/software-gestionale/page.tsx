import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Check, Minus } from 'lucide-react';
import { ClientMessages } from '@/components/i18n/client-messages';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import { FaqSection } from '@/components/site/service-faq';
import { ServicePage, type ServicePageContent } from '@/components/site/service-page';
import { RevealWords } from '@/components/site/reveal-words';
import { getServiceProof } from '@/lib/service-content';
import {
  generateMetadata as buildSEOMetadata,
  generateStructuredDataBreadcrumbList,
  generateStructuredDataService,
  siteConfig,
} from '@/lib/seo';

/**
 * Custom business software — the highest-ticket page on the site, and the one
 * that sits at the intersection of both priorities: construction AND bespoke
 * software. "software gestione cantieri" is a real B2B query with budget behind
 * it, and the portfolio already shows the studio ships admin systems.
 *
 * Italian only: the queries are Italian ("gestionale su misura", "software
 * gestione cantieri") and the slug is Italian. Lives under /servizi so it
 * inherits that cluster's internal links; /dall-idea-al-progetto is its
 * narrative parent. Same template as the other service pages.
 */

type Props = { params: Promise<{ locale: string }> };

// Refreshed hourly, like the portfolio project it shows.
export const revalidate = 3600;

const PATH = '/servizi/software-gestionale';

const SIGNS = [
  {
    title: 'Il processo gira su Excel e WhatsApp',
    description:
      'Funziona finché siete in tre. Poi qualcuno lavora sulla versione sbagliata del file, un messaggio si perde in una chat e nessuno sa più quale sia il dato buono. Non è un problema di disciplina: è che lo strumento non è fatto per quello.',
  },
  {
    title: 'Il gestionale copre quasi tutto, il resto lo pagate in ore',
    description:
      'Ogni software commerciale ha una parte che non si adatta al vostro modo di lavorare. Quella parte diventa lavoro manuale, ripetuto ogni settimana, che nessuno conta perché è sempre stato così.',
  },
  {
    title: 'Gli stessi dati vengono inseriti tre volte',
    description:
      'Dal preventivo alla commessa, dalla commessa alla fattura. Ogni reinserimento è tempo perso e un\'occasione di errore. Sistemi che non si parlano costano più della licenza che state pagando.',
  },
  {
    title: 'Il cantiere e l\'ufficio non sono allineati',
    description:
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
  { title: 'Guardiamo come lavorate ora', description: 'Prima di parlare di software passiamo del tempo sul processo reale, compresi i passaggi che nessuno ha mai scritto da nessuna parte.' },
  { title: 'Tagliamo prima di costruire', description: 'Metà delle funzioni richieste all\'inizio non serve davvero. Individuarle prima è il modo più efficace per contenere i costi.' },
  { title: 'Partiamo dal nucleo', description: 'La prima versione copre il flusso principale e va in mano alle persone che lo useranno. Le correzioni arrivano da loro, non da una riunione.' },
  { title: 'Cresce con voi', description: 'Si aggiunge quello che l\'uso reale dimostra necessario. Il codice è vostro e non c\'è nessun canone di piattaforma da pagare per continuare a usarlo.' },
];

// Each row reads as an advantage, so a tick is always good news.
const VS = [
  { feature: 'Si adatta al vostro processo', custom: true, standard: false },
  { feature: 'Pronto subito', custom: false, standard: true },
  { feature: 'Costo iniziale contenuto', custom: false, standard: true },
  { feature: 'Nessun canone per utente', custom: true, standard: false },
  { feature: 'Integrabile con quello che già usate', custom: true, standard: false },
  { feature: 'Solo le funzioni che vi servono', custom: true, standard: false },
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

// Narrow value columns on phones, so the row labels keep most of the width.
const COL = 'w-[4.75rem] px-1 text-center font-mono text-[10px] font-normal uppercase tracking-[0.08em] sm:w-36 sm:px-3 sm:text-[11px] sm:tracking-[0.16em]';

function Mark({ yes }: { yes: boolean }) {
  return yes ? (
    <>
      <Check aria-hidden className="h-5 w-5 text-primary" strokeWidth={2.5} />
      <span className="sr-only">Sì</span>
    </>
  ) : (
    <>
      <Minus aria-hidden className="h-5 w-5 text-muted-foreground/50" />
      <span className="sr-only">No</span>
    </>
  );
}

/** Custom vs off-the-shelf, including where off-the-shelf wins. */
function Comparison() {
  return (
    <section className="container mx-auto px-5 md:px-8">
      <header className="grid gap-5 md:grid-cols-12 md:items-end">
        <h2 className="rv-title font-display text-[2.2rem] font-bold leading-[1.02] tracking-[-0.03em] md:col-span-7 md:text-[3rem]">
          <RevealWords text="Su misura o standard?" />
        </h2>
        <p className="rv text-lg leading-relaxed text-muted-foreground md:col-span-5">
          Non è sempre la risposta giusta. Ecco il confronto onesto.
        </p>
      </header>
      <table className="mt-12 w-full max-w-4xl border-collapse text-left md:mt-16">
        <caption className="sr-only">Gestionale su misura e gestionale standard a confronto</caption>
        <thead>
          <tr className="border-b-2 border-foreground">
            <td />
            <th scope="col" className={`${COL} rounded-t-xl bg-navy py-4 text-white`}>
              Su misura
            </th>
            <th scope="col" className={`${COL} py-4 text-muted-foreground`}>
              Standard
            </th>
          </tr>
        </thead>
        <tbody>
          {VS.map((r) => (
            <tr key={r.feature} className="rv border-b border-border">
              <th scope="row" className="py-5 pr-4 font-display text-base font-bold tracking-[-0.01em] sm:text-lg">
                {r.feature}
              </th>
              <td className="bg-primary/[0.07] px-1 py-5 sm:px-3">
                <span className="flex justify-center">
                  <Mark yes={r.custom} />
                </span>
              </td>
              <td className="px-1 py-5 sm:px-3">
                <span className="flex justify-center">
                  <Mark yes={r.standard} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Software Gestionale su Misura a Padova',
    description:
      'Software gestionale su misura a Padova: commesse, cantieri, rapportini, SAL e magazzino. Nessun canone per utente, codice di proprietà del cliente.',
    keywords: [
      'software gestionale su misura',
      'software gestionale Padova',
      'gestionale su misura Veneto',
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
  ];

  const content: ServicePageContent = {
    slug: 'software-gestionale',
    title: 'Software gestionale su misura a Padova, costruito sul vostro processo.',
    lead:
      'Quando nessun gestionale in commercio segue davvero il modo in cui lavorate, la differenza la pagate ogni settimana in ore di lavoro manuale. Costruiamo lo strumento attorno al processo, non il contrario.',
    notes: ['Il codice è vostro', 'Nessun canone per utente', 'Risposta in 24h'],
    quoteLabel: 'Parliamo del vostro processo',
    quoteMessage: 'Vorrei valutare un software gestionale su misura per la nostra azienda.',
    secondary: { label: 'Come lavoriamo su un\'idea', href: '/dall-idea-al-progetto' },
    featuresTitle: 'Quando serve davvero',
    features: SIGNS,
    sections: [
      {
        kind: 'checklist',
        title: 'Gestione cantieri e commesse',
        lead: 'È il caso che incontriamo più spesso, e quello in cui il ritorno si vede prima. Ogni modulo si aggiunge solo se serve.',
        items: CONSTRUCTION_MODULES,
        more: { label: 'Lavorate nel settore edile? Vedi cosa facciamo per l\'edilizia', href: '/siti-web/edilizia' },
      },
      { kind: 'node', node: <Comparison /> },
      { kind: 'steps', title: 'Come lo affrontiamo', items: APPROACH },
      { kind: 'node', node: <FaqSection title="Domande frequenti" faqs={FAQS} id="faq-software-gestionale" /> },
    ],
    closing: {
      title: ['Raccontateci', 'il processo peggiore.'],
      lead: 'Quello che tutti odiano fare e che ruba ore ogni settimana. Da lì si capisce in fretta se un gestionale su misura ha senso, o se non conviene.',
    },
  };

  const proof = await getServiceProof('software-gestionale');

  return (
    <>
      <StructuredDataServer data={jsonLd} id="software-gestionale" />
      {/* Server-rendered; only the quote form needs translations in the browser. */}
      <ClientMessages locale="it" namespaces={['quoteDialog', 'serverActions']}>
        <ServicePage content={content} proof={proof} locale="it" />
      </ClientMessages>
    </>
  );
}
