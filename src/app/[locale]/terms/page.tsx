import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Scale,
  Shield,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Info,
  Banknote,
  Lock,
  Handshake,
  Pencil,
  XCircle,
} from 'lucide-react';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Termini e Condizioni | Studio Faraj',
  description:
    'Termini e condizioni generali di utilizzo dei servizi di Studio Faraj. Leggi le condizioni che regolano il rapporto tra Studio Faraj e i propri clienti.',
  keywords: [
    'termini e condizioni',
    'terms and conditions',
    'condizioni generali',
    'contratto servizi web',
    'Studio Faraj',
    'Padova',
  ],
  url: `${siteConfig.url}/it/terms`,
  noindex: false,
});

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-background text-foreground min-h-screen">

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Termini e Condizioni
              </h1>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              I presenti Termini e Condizioni regolano l'utilizzo dei servizi offerti da Studio Faraj
              e il rapporto contrattuale tra Studio Faraj e i propri clienti. Leggere attentamente
              prima di utilizzare i nostri servizi.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                Diritto Italiano
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Trasparenza
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Handshake className="w-4 h-4 mr-2 text-primary" />
                Rapporto Professionale
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* 1. Informazioni Generali */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                1. Informazioni Generali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                I presenti Termini e Condizioni (di seguito "Termini") disciplinano l'uso del sito
                web <strong className="text-foreground">studiofaraj.it</strong> e l'accesso ai
                servizi forniti da:
              </p>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <p className="text-lg font-semibold text-foreground">Studio Faraj</p>
                  <p className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    Padova, Italia
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href="mailto:info@studiofaraj.it" className="text-primary hover:underline font-medium">
                      info@studiofaraj.it
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">P.IVA:</strong> 05783550287
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Accedendo al sito o utilizzando i nostri servizi, l'utente dichiara di aver
                      letto, compreso e accettato integralmente i presenti Termini e Condizioni.
                      Se non si accettano questi Termini, si prega di non utilizzare il sito o i
                      servizi offerti.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* 2. Descrizione dei Servizi */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Handshake className="w-6 h-6 text-primary" />
                </div>
                2. Descrizione dei Servizi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Studio Faraj fornisce servizi professionali nel settore digitale e tecnologico, tra cui:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: 'Sviluppo Web', desc: 'Progettazione e sviluppo di siti web e applicazioni web personalizzate.' },
                  { title: 'E-commerce', desc: 'Realizzazione di piattaforme di vendita online integrate e ottimizzate.' },
                  { title: 'Design UI/UX', desc: 'Progettazione di interfacce utente moderne, accessibili e ad alta conversione.' },
                  { title: 'SEO & Web Marketing', desc: 'Ottimizzazione per i motori di ricerca e strategie di marketing digitale.' },
                  { title: 'AI & Automazione', desc: 'Integrazione di soluzioni di intelligenza artificiale e automazione dei processi.' },
                  { title: 'Manutenzione e Supporto', desc: 'Assistenza tecnica continua, aggiornamenti e monitoraggio delle performance.' },
                  { title: 'Hosting & Cloud', desc: 'Configurazione e gestione di infrastrutture cloud e servizi di hosting.' },
                  { title: 'Consulenza Strategica', desc: 'Analisi e consulenza per la trasformazione digitale dell\'attività.' },
                ].map((s) => (
                  <div key={s.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-foreground">{s.title}</strong>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      I dettagli specifici di ogni progetto, compresi scope, tempistiche, costi e
                      deliverable, sono definiti in un preventivo scritto e/o contratto separato
                      concordato con il cliente prima dell'avvio dei lavori.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* 3. Accettazione e Utilizzo */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                3. Utilizzo del Sito e Obblighi dell'Utente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  3.1 Uso Consentito
                </h3>
                <p className="text-muted-foreground mb-4">L'utente si impegna a utilizzare il sito e i servizi esclusivamente per finalità lecite e nel rispetto dei presenti Termini. In particolare, l'utente:</p>
                <div className="space-y-2">
                  {[
                    'Fornirà informazioni veritiere, accurate e aggiornate in fase di contatto o registrazione.',
                    'Non utilizzerà il sito per trasmettere contenuti illeciti, offensivi, diffamatori o lesivi di diritti di terzi.',
                    'Non tenterà di accedere in modo non autorizzato a sistemi, reti o dati di Studio Faraj.',
                    'Non utilizzerà strumenti automatizzati (bot, scraper, ecc.) senza previa autorizzazione scritta.',
                    'Rispetterà tutte le leggi e normative applicabili nell\'utilizzo del sito e dei servizi.',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-primary" />
                  3.2 Uso Vietato
                </h3>
                <p className="text-muted-foreground mb-4">È espressamente vietato:</p>
                <div className="space-y-2">
                  {[
                    'Riprodurre, distribuire o modificare i contenuti del sito senza autorizzazione scritta.',
                    'Usare il sito per inviare comunicazioni non sollecitate (spam).',
                    'Violare i diritti di proprietà intellettuale di Studio Faraj o di terzi.',
                    'Aggirare eventuali misure di sicurezza implementate sul sito.',
                    'Raccogliere dati personali di altri utenti senza consenso.',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Proprietà Intellettuale */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                4. Proprietà Intellettuale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">4.1 Contenuti del Sito</h3>
                <p className="text-muted-foreground mb-4">
                  Tutti i contenuti presenti sul sito studiofaraj.it — inclusi testi, grafica, loghi,
                  icone, immagini, clip audio, download digitali e software — sono di proprietà di
                  Studio Faraj o dei suoi fornitori di contenuti e sono protetti dalle leggi italiane
                  e internazionali sul diritto d'autore e sulla proprietà intellettuale.
                </p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        È vietata qualsiasi riproduzione, distribuzione, modifica o utilizzo dei
                        contenuti del sito senza previa autorizzazione scritta di Studio Faraj.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4.2 Lavori Realizzati per il Cliente</h3>
                <p className="text-muted-foreground mb-4">
                  Salvo diversi accordi scritti nel contratto specifico, una volta saldato
                  integralmente il corrispettivo pattuito:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-foreground">Trasferimento dei diritti</strong>
                      <p className="text-xs text-muted-foreground mt-1">
                        I diritti di utilizzo del prodotto finito (sito web, grafica, ecc.) vengono
                        trasferiti al cliente nei termini definiti nel contratto di progetto.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-foreground">Diritti di Studio Faraj</strong>
                      <p className="text-xs text-muted-foreground mt-1">
                        Studio Faraj si riserva il diritto di citare il progetto nel proprio
                        portfolio e come riferimento commerciale, salvo esplicita richiesta di
                        riservatezza da parte del cliente.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-foreground">Componenti di terze parti</strong>
                      <p className="text-xs text-muted-foreground mt-1">
                        Il software open source, le librerie o i plugin di terze parti utilizzati
                        nel progetto rimangono soggetti alle rispettive licenze originali.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Pagamenti e Preventivi */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Banknote className="w-6 h-6 text-primary" />
                </div>
                5. Preventivi e Pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Preventivi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> La prima consulenza è gratuita e senza impegno.</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> I preventivi sono validi per 30 giorni dalla data di emissione.</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Il preventivo accettato costituisce la base del contratto di progetto.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      Modalità di Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Tipicamente: acconto del 30–50% all'avvio, saldo alla consegna.</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Pagamenti tramite bonifico bancario o altri metodi concordati.</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Le fatture hanno scadenza a 15 giorni dalla data di emissione.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      In caso di mancato pagamento entro i termini stabiliti, Studio Faraj si
                      riserva il diritto di sospendere i lavori e/o i servizi attivi fino alla
                      regolarizzazione del pagamento, nonché di applicare interessi di mora ai
                      sensi del D.Lgs. 231/2002.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* 6. Limitazione di Responsabilità */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                6. Limitazione di Responsabilità
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Studio Faraj si impegna a fornire servizi di alta qualità con la massima cura e
                professionalità. Tuttavia:
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: 'Disponibilità del sito',
                    desc: 'Il sito è fornito "così com\'è". Studio Faraj non garantisce che il sito sia privo di errori o interruzioni, e non si assume responsabilità per eventuali danni derivanti da indisponibilità temporanea del servizio.',
                  },
                  {
                    title: 'Contenuti di terze parti',
                    desc: 'Studio Faraj non è responsabile per i contenuti di siti web di terze parti ai quali il sito potrebbe rimandare tramite link.',
                  },
                  {
                    title: 'Danni indiretti',
                    desc: 'In nessun caso Studio Faraj sarà responsabile per danni indiretti, incidentali, speciali o consequenziali derivanti dall\'uso o dall\'impossibilità di utilizzare i servizi.',
                  },
                  {
                    title: 'Forza maggiore',
                    desc: 'Studio Faraj non è responsabile per ritardi o inadempimenti causati da eventi al di fuori del ragionevole controllo (es. calamità naturali, interruzioni di servizi internet, normative emergenziali).',
                  },
                ].map((item, i) => (
                  <Card key={i} className="bg-muted/30 border-border/50">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-sm text-foreground block mb-1">{item.title}</strong>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 7. Riservatezza */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                7. Riservatezza e Protezione dei Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Studio Faraj tratta i dati personali degli utenti e dei clienti nel rispetto del
                Regolamento (UE) 2016/679 (GDPR) e della normativa italiana vigente.
              </p>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Per informazioni complete sul trattamento dei dati personali, si invita a
                      consultare la nostra{' '}
                      <Link href="/it/legal" className="text-primary hover:underline font-medium">
                        Privacy Policy e Cookie Policy
                      </Link>
                      , che costituisce parte integrante dei presenti Termini.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <p className="text-muted-foreground text-sm">
                Entrambe le parti si impegnano a mantenere riservate le informazioni confidenziali
                ottenute nell'ambito del rapporto contrattuale e a non divulgarle a terzi senza
                previa autorizzazione scritta, salvo obblighi di legge.
              </p>
            </CardContent>
          </Card>

          {/* 8. Modifiche ai Termini */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Pencil className="w-6 h-6 text-primary" />
                </div>
                8. Modifiche ai Termini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Studio Faraj si riserva il diritto di modificare i presenti Termini in qualsiasi
                momento. Le modifiche entrano in vigore dalla data di pubblicazione sul sito.
              </p>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      L'uso continuato del sito o dei servizi successivamente alla pubblicazione
                      delle modifiche costituisce accettazione dei nuovi Termini. Si consiglia di
                      consultare periodicamente questa pagina.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* 9. Legge Applicabile e Foro Competente */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                9. Legge Applicabile e Foro Competente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-foreground block mb-1">Legge Applicabile</strong>
                        <p className="text-sm text-muted-foreground">
                          I presenti Termini sono regolati dalla legge italiana. Per quanto non
                          espressamente previsto, si applicano le norme del Codice Civile italiano
                          e le normative di settore vigenti.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm text-foreground block mb-1">Foro Competente</strong>
                        <p className="text-sm text-muted-foreground">
                          Per qualsiasi controversia relativa ai presenti Termini o ai servizi
                          forniti, salvo diverso accordo scritto, è competente in via esclusiva il
                          Tribunale di Padova.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Per i consumatori (persone fisiche che agiscono per scopi estranei all'attività
                      professionale), si applicano le disposizioni del Codice del Consumo (D.Lgs.
                      206/2005) e le norme cogenti a tutela del consumatore. La risoluzione
                      alternativa delle controversie (ODR) è disponibile tramite la piattaforma
                      europea:{' '}
                      <a
                        href="https://ec.europa.eu/consumers/odr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        ec.europa.eu/consumers/odr
                      </a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* 10. Contatti */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-primary" />
                  10. Contatti
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Per qualsiasi domanda relativa ai presenti Termini e Condizioni, è possibile
                  contattarci:
                </p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6 space-y-3">
                    <p className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <strong>Email:</strong>{' '}
                      <a href="mailto:info@studiofaraj.it" className="text-primary hover:underline font-medium">
                        info@studiofaraj.it
                      </a>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                      <strong>Indirizzo:</strong> Studio Faraj, Padova, Italia
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Footer metadata */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Ultimo aggiornamento:</strong> {currentDate}</p>
                <p>
                  Questi Termini e Condizioni sono redatti in conformità alla normativa italiana
                  vigente, inclusi il Codice Civile, il Codice del Consumo (D.Lgs. 206/2005)
                  e il Regolamento (UE) 2016/679 (GDPR).
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
