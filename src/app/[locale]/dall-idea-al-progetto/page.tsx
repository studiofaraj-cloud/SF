import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Check, Lock, Compass, Rocket, ShieldCheck } from 'lucide-react';
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
 * Narrative hub for the "your idea, made real" cluster.
 *
 * Different buyer from the construction pages: no existing business, just a
 * concept. Higher ticket, longer cycle, and a completely different objection —
 * fear of having the idea taken. The NDA / confidentiality and code-ownership
 * sections exist to remove that objection, which is the single most common
 * reason this buyer never sends the first message.
 *
 * Top-level rather than under /servizi because it is a story page, not a
 * service; the commercial children (software gestionale, MVP, app su misura)
 * live under /servizi and inherit that cluster's authority.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = '/dall-idea-al-progetto';

const FEARS = [
  {
    Icon: Lock,
    title: '«E se mi rubano l\'idea?»',
    body:
      'È la prima domanda, quasi sempre non detta. Firmiamo un accordo di riservatezza prima di entrare nel merito, se lo volete — e in ogni caso il nostro lavoro è costruire, non lanciare prodotti nostri. Un\'idea vale quanto la sua esecuzione: quella resta vostra.',
  },
  {
    Icon: Compass,
    title: '«Non so nemmeno da dove partire»',
    body:
      'Non serve arrivare con specifiche tecniche. Serve sapere quale problema risolvete, per chi e perché oggi lo si risolve male. Il resto — funzioni, tecnologie, priorità — lo mettiamo in ordine insieme nella prima fase.',
  },
  {
    Icon: ShieldCheck,
    title: '«E se poi resto legato a voi?»',
    body:
      'Il codice è vostro, il dominio è intestato a voi, l\'infrastruttura sta su account vostri. Non usiamo piattaforme proprietarie che vi obblighino a restare. Se un giorno volete portare tutto altrove, potete farlo senza chiedere permesso.',
  },
  {
    Icon: Rocket,
    title: '«Quanto ci vuole prima di vedere qualcosa?»',
    body:
      'Non mesi di silenzio. Si parte da una versione ridotta ma funzionante, quella che serve per metterla davanti a utenti veri: si scopre in poche settimane cosa serve davvero, invece che dopo un anno di sviluppo su ipotesi.',
  },
];

const PHASES = [
  { step: '01', title: 'Prima chiamata', body: 'Gratuita, senza impegno. Ci raccontate l\'idea, noi diciamo onestamente se ha senso costruirla, se conviene ridurla o se il problema si risolve già con qualcosa che esiste.' },
  { step: '02', title: 'Analisi', body: 'Mettiamo su carta utenti, flussi e funzioni. Alla fine avete un documento vostro, con priorità, tempi e costi — utilizzabile anche se decidete di non proseguire con noi.' },
  { step: '03', title: 'Prima versione', body: 'Costruiamo il nucleo: la parte senza la quale il prodotto non ha senso. Niente funzioni accessorie prima di aver visto la reazione di utenti reali.' },
  { step: '04', title: 'Crescita', body: 'Si aggiunge sulla base di quello che succede davvero, non del piano iniziale. Chi mantiene il prodotto siete voi, con noi accanto finché serve.' },
];

const WHAT_WE_BUILD = [
  { title: 'Gestionali su misura', body: 'Quando il processo interno non entra in nessun software commerciale: cantieri, commesse, rapportini, magazzino, flussi di approvazione.', href: '/servizi/software-gestionale' },
  { title: 'Piattaforme e marketplace', body: 'Prodotti con più tipi di utente, ruoli, permessi e pagamenti fra le parti.', href: null },
  { title: 'Applicazioni web e mobile', body: 'Strumenti usati ogni giorno, che devono funzionare anche con una connessione incerta in cantiere.', href: null },
  { title: 'Automazioni e integrazioni', body: 'Quando il lavoro esiste già ma passa da fogli Excel, email e copia-incolla fra sistemi che non si parlano.', href: null },
];

const SIGNALS = [
  'Avete un processo che oggi gira su Excel e WhatsApp',
  'Fate fare a mano qualcosa che una macchina farebbe meglio',
  'Un software commerciale copre il 70% di quello che vi serve e il resto lo pagate in ore',
  'Avete un\'idea di prodotto e nessuno con cui valutarla tecnicamente',
  'Un cliente vi ha chiesto qualcosa che nessuno sul mercato fa',
];

const FAQS = [
  {
    question: 'Firmate un accordo di riservatezza?',
    answer:
      'Sì, su richiesta e prima di entrare nel dettaglio. È una domanda del tutto legittima e non ci offende: se avete un NDA vostro lo firmiamo, altrimenti ne mettiamo a disposizione uno standard. Nessuna delle informazioni che ci date viene condivisa o riutilizzata.',
  },
  {
    question: 'Ho solo un\'idea, niente di scritto. Posso comunque contattarvi?',
    answer:
      'Sì, ed è la situazione più frequente. Non serve un documento: bastano il problema che volete risolvere e per chi. La prima chiamata serve esattamente a capire se c\'è un prodotto sensato dietro, e a dirvelo con franchezza anche quando la risposta è no.',
  },
  {
    question: 'Quanto costa sviluppare un prodotto da zero?',
    answer:
      'Dipende quasi interamente da quanto è grande la prima versione, ed è proprio il motivo per cui la prima fase è l\'analisi. Alla fine di quella avete tempi e costi reali su cui decidere, prima di impegnarvi nello sviluppo. Se serve un riferimento su come ragioniamo sui preventivi, ne parliamo nella guida ai costi.',
  },
  {
    question: 'Il codice resta mio?',
    answer:
      'Sì. Codice, dominio e dati restano di proprietà del cliente, su account intestati a voi. Non c\'è nessun blocco tecnico o contrattuale che vi impedisca di cambiare fornitore.',
  },
  {
    question: 'Cosa succede se durante l\'analisi capiamo che non conviene farlo?',
    answer:
      'Ve lo diciamo. È capitato e ricapiterà: a volte esiste già uno strumento che risolve il problema a un decimo del costo, a volte il problema non è abbastanza sentito da giustificare un prodotto. Preferiamo perdere un progetto che costruire qualcosa che non verrà usato.',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'it') return {};

  return buildSEOMetadata({
    title: 'Hai un\'idea? La trasformiamo in un progetto reale',
    description:
      'Dall\'idea al prodotto funzionante: analisi, prima versione e crescita. Accordo di riservatezza, tempi e costi chiari prima di iniziare, codice di tua proprietà.',
    keywords: [
      'trasformare un\'idea in un\'app',
      'come realizzare la mia idea digitale',
      'ho un\'idea per un\'app cosa faccio',
      'come proteggere un\'idea prima di svilupparla',
      'come validare un\'idea digitale',
      'a chi rivolgersi per sviluppare un\'app',
    ],
    url: `${siteConfig.url}/it${PATH}`,
    locale: 'it',
    defaultLocaleOnly: true,
  });
}

export default async function IdeaHubPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'it') notFound();
  setRequestLocale('it');

  const jsonLd = [
    generateStructuredDataPageBreadcrumb('it', {
      name: 'Dall\'idea al progetto',
      path: PATH,
    }),
    generateStructuredDataFAQPage(FAQS),
  ];

  return (
    <>
      <StructuredDataServer data={jsonLd} id="idea-hub" />

      <div className="bg-background text-foreground">
        <section className="container px-4 sm:px-6 md:px-8 pt-28 pb-10 sm:pt-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Hai un&apos;idea.{' '}
              <span className="text-primary">La rendiamo reale.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Non serve arrivare con le specifiche pronte. Serve sapere che problema vuoi
              risolvere e per chi: il resto lo mettiamo in ordine insieme, con tempi e costi
              sul tavolo prima di scrivere una riga di codice.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={getLocalizedPath('/contatti', 'it')}>
                  Raccontaci l&apos;idea
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={getLocalizedPath('/servizi/software-gestionale', 'it')}>
                  Software gestionale su misura
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Le quattro cose che frenano prima di scrivere
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Le sentiamo tutte, ogni volta. Meglio rispondere qui che lasciarle senza risposta.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {FEARS.map(({ Icon, title, body }) => (
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Come si procede</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map((p) => (
              <div key={p.step} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <span className="text-sm font-bold text-primary">{p.step}</span>
                <h3 className="mt-2 font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Cosa costruiamo</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {WHAT_WE_BUILD.map((w) =>
              w.href ? (
                <Link
                  key={w.title}
                  href={getLocalizedPath(w.href, 'it')}
                  className="group flex flex-col rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-colors hover:border-primary/40"
                >
                  <h3 className="font-semibold text-foreground">{w.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Approfondisci
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ) : (
                <div key={w.title} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                  <h3 className="font-semibold text-foreground">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="container px-4 sm:px-6 md:px-8 py-12">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Segnali che è il momento di parlarne
            </h2>
            <ul className="mt-5 space-y-3">
              {SIGNALS.map((s) => (
                <li key={s} className="flex gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
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
            <h2 className="text-2xl sm:text-3xl font-bold">La prima chiamata è gratuita</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Trenta minuti per capire se l&apos;idea sta in piedi. Se pensiamo di no, ve lo
              diciamo — e vi risparmiamo mesi.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href={getLocalizedPath('/contatti', 'it')}>
                Prenota una chiamata
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
