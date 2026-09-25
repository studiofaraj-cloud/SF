import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  ArrowRight, Boxes, Check, CheckCircle, ChevronDown, Clock, Code, FileSpreadsheet,
  Globe, HardHat, HelpCircle, Plug, Scale, Sparkles, X, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import GradientText from '@/components/GradientText';
import { StructuredDataServer } from '@/components/seo/structured-data-server';
import {
  ServiceFaq,
  ServiceFeatureCard,
  ServiceRelated,
  ServiceSection,
  ServiceSectionHeader,
} from '@/components/site/service-theme';
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
 *
 * Same look as the other service pages (cyan, its colour on the /servizi hub),
 * but still a server component: no fade-in, so all the text is in the HTML.
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

const RELATED = [
  { href: '/servizi', label: 'Tutti i servizi' },
  { href: '/servizi/sviluppo-web', label: 'Sviluppo web su misura' },
  { href: '/servizi/ai-automazione', label: 'AI e automazione' },
  { href: '/servizi/consulenza', label: 'Consulenza informatica' },
];

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
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="software-gestionale" />

      <div className="bg-background text-foreground overflow-x-hidden">
        {/* Hero — same structure as the other service pages */}
        <section className="relative min-h-[80vh] min-h-[80svh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />

          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <div className="floating-shape absolute top-[20%] left-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-cyan-500/30 rotate-45 hidden sm:block" />
            <div className="floating-shape absolute top-[60%] right-[15%] w-16 h-16 md:w-24 md:h-24 border-2 border-sky-500/20 rounded-full" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-20 container px-4 sm:px-6 md:px-8 text-center">
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <GradientText
                as="span"
                colors={['#06b6d4', '#0ea5e9', '#06b6d4']}
                animationSpeed={4}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
              >
                Software gestionale su misura
              </GradientText>{' '}
              <span className="block text-foreground mt-1">
                a Padova, costruito sul vostro processo.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Quando nessun gestionale in commercio segue davvero il modo in cui lavorate,
              la differenza la pagate ogni settimana in ore di lavoro manuale. Costruiamo
              lo strumento attorno al processo, non il contrario.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group bg-cyan-600 hover:bg-cyan-700 px-8 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Parliamo del vostro processo
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-cyan-500/50 w-full sm:w-auto" asChild>
                <Link href={getLocalizedPath('/dall-idea-al-progetto', 'it')}>
                  Come lavoriamo su un&apos;idea
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex justify-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-cyan-500/50" />
            </div>
          </div>
        </section>

        <ServiceSection background="gradient">
          <ServiceSectionHeader accent="cyan" icon={Sparkles} badge="I segnali" title="Quando serve" highlight="davvero" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {SIGNS.map(({ Icon, title, body }) => (
              <ServiceFeatureCard key={title} accent="cyan" icon={Icon} title={title}>
                {body}
              </ServiceFeatureCard>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection background="band">
          <ServiceSectionHeader
            accent="cyan"
            icon={HardHat}
            badge="Edilizia"
            title="Gestione cantieri"
            highlight="e commesse"
            subtitle="È il caso che incontriamo più spesso, e quello in cui il ritorno si vede prima. Ogni modulo si aggiunge solo se serve."
          />
          <div className="max-w-4xl mx-auto">
            <Card className="holographic-card neon-border overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CONSTRUCTION_MODULES.map((m) => (
                    <li key={m} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <p className="mt-8 text-center text-muted-foreground">
              Lavorate nel settore edile?{' '}
              <Link href={getLocalizedPath('/siti-web/edilizia', 'it')} className="font-medium text-cyan-400 hover:underline">
                Vedi tutto quello che facciamo per l&apos;edilizia
              </Link>
              .
            </p>
          </div>
        </ServiceSection>

        <ServiceSection background="gradient">
          <ServiceSectionHeader
            accent="cyan"
            icon={Scale}
            badge="Confronto"
            title="Su misura"
            highlight="o standard?"
            subtitle="Non è sempre la risposta giusta. Ecco il confronto onesto."
          />
          <div className="max-w-3xl mx-auto overflow-x-auto rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-md shadow-xl shadow-primary/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-primary/20 text-left">
                  <th className="p-4 font-semibold text-muted-foreground">&nbsp;</th>
                  <th className="p-4 font-bold text-cyan-400 bg-cyan-500/5">Su misura</th>
                  <th className="p-4 font-medium text-muted-foreground">Standard</th>
                </tr>
              </thead>
              <tbody>
                {VS.map((r) => (
                  <tr key={r.feature} className="border-b border-primary/10 last:border-0">
                    <td className="p-4 font-medium text-foreground">{r.feature}</td>
                    <td className="p-4 bg-cyan-500/5">
                      {r.custom ? <Check className="h-5 w-5 text-cyan-400" /> : <X className="h-5 w-5 text-muted-foreground/50" />}
                    </td>
                    <td className="p-4">
                      {r.standard ? <Check className="h-5 w-5 text-cyan-400" /> : <X className="h-5 w-5 text-muted-foreground/50" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ServiceSection>

        <ServiceSection background="band">
          <ServiceSectionHeader accent="cyan" icon={Zap} badge="Metodo" title="Come lo" highlight="affrontiamo" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {APPROACH.map((p) => (
              <Card key={p.step} className="holographic-card neon-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-cyan-500/30 mb-2">{p.step}</div>
                  <h3 className="text-xl font-bold mb-2 text-cyan-400">{p.title}</h3>
                  <p className="text-muted-foreground text-sm">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ServiceSection>

        <ServiceSection background="gradient">
          <ServiceSectionHeader accent="cyan" icon={HelpCircle} badge="FAQ" title="Domande" highlight="frequenti" />
          <ServiceFaq accent="cyan" faqs={FAQS} />
          <ServiceRelated accent="cyan" links={RELATED} locale="it" />
        </ServiceSection>

        {/* CTA — same as the other service pages */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-background to-sky-500/10" />
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
          </div>

          <div className="container relative z-10 px-4 sm:px-6 md:px-8">
            <Card className="max-w-4xl mx-auto animated-gradient-border overflow-hidden">
              <div className="bg-card p-8 md:p-12 text-center">
                <Badge className="badge-futuristic mb-6 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  Contattaci
                </Badge>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Raccontateci</span>{' '}
                  <span className="block text-cyan-400">il processo peggiore</span>
                </h2>

                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Quello che tutti odiano fare e che ruba ore ogni settimana. Da lì si capisce
                  in fretta se un gestionale su misura ha senso — o se conviene di no.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="group bg-cyan-600 hover:bg-cyan-700 px-8 w-full sm:w-auto" asChild>
                    <Link href={getLocalizedPath('/contatti', 'it')}>
                      Parliamone
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Risposta in 24h
                  </span>
                  <span className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" />
                    Il codice è vostro
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
