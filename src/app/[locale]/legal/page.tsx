import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Cookie, FileText, Lock, Mail, Globe, Eye, Settings, BarChart3, Target, Zap, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy e Cookie Policy | Studio Faraj',
  description: 'Privacy policy completa conforme al GDPR, cookie policy e note legali di Studio Faraj. Informazioni dettagliate sul trattamento dei dati personali e sulla gestione dei cookie.',
  keywords: [
    'privacy policy',
    'cookie policy',
    'note legali',
    'protezione dati',
    'GDPR',
    'regolamento europeo',
    'diritti privacy',
  ],
  url: 'https://www.studiofaraj.it/legal',
  noindex: true,
});

export default function LegalPage() {
  const currentDate = new Date().toLocaleDateString('it-IT', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Privacy Policy e Cookie Policy
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              La presente informativa descrive le modalità di gestione del sito web in riferimento al trattamento dei dati personali degli utenti che lo consultano, 
              in conformità al Regolamento (UE) 2016/679 (GDPR) e al D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018 (Codice Privacy italiano).
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Lock className="w-4 h-4 mr-2 text-primary" />
                Dati Protetti
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Eye className="w-4 h-4 mr-2 text-primary" />
                Trasparenza Totale
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* PRIVACY POLICY */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                1. Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Titolare del Trattamento */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1.1 Titolare del Trattamento
                </h3>
                <p className="mb-4">
                  Il titolare del trattamento dei dati personali è:
                </p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <p className="text-lg font-semibold">Studio Faraj</p>
                      <p className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        Sciacca, Italia
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <strong>Email privacy:</strong>{' '}
                        <a href="mailto:privacy@studiofaraj.it" className="text-primary hover:underline font-medium">
                          privacy@studiofaraj.it
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <strong>Email contatti:</strong>{' '}
                        <a href="mailto:info@studiofaraj.it" className="text-primary hover:underline font-medium">
                          info@studiofaraj.it
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dati Personali Raccolti */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1.2 Dati Personali Raccolti
                </h3>
                <p className="mb-6">Il sito raccoglie le seguenti categorie di dati personali:</p>
                
                <div className="grid md:grid-cols-1 gap-4 mb-6">
                  <Card className="bg-muted/30 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Dati forniti volontariamente dall'utente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span><strong>Form di contatto:</strong> nome, cognome, email, telefono, messaggio, servizio di interesse</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span><strong>Sistema di prenotazione:</strong> nome, cognome, email, telefono, data e orari selezionati, messaggio opzionale</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span><strong>Newsletter (se presente):</strong> indirizzo email</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Dati di navigazione
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">
                        I sistemi informatici acquisiscono automaticamente alcuni dati personali durante la navigazione:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Indirizzo IP</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Tipo di browser e sistema operativo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Pagine visitate e tempo di permanenza</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Data e ora di accesso</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>URL di provenienza (referrer)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Dati tecnici e di sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Cookie e tecnologie simili (vedi sezione Cookie Policy)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Log di sistema e di sicurezza</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Dati di autenticazione per l'area amministrativa</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Finalità del Trattamento */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  1.3 Finalità del Trattamento
                </h3>
                <p className="mb-4">I dati personali sono trattati per le seguenti finalità:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Risposta a richieste di contatto</strong>
                      <p className="text-xs text-muted-foreground mt-1">Rispondere alle richieste inviate tramite form di contatto</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Gestione prenotazioni</strong>
                      <p className="text-xs text-muted-foreground mt-1">Gestire e confermare le prenotazioni di chiamate o appuntamenti</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Erogazione servizi</strong>
                      <p className="text-xs text-muted-foreground mt-1">Fornire i servizi richiesti dall'utente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Analisi statistica</strong>
                      <p className="text-xs text-muted-foreground mt-1">Analizzare il traffico del sito in forma aggregata e anonima</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Miglioramento del sito</strong>
                      <p className="text-xs text-muted-foreground mt-1">Migliorare l'esperienza utente e le funzionalità del sito</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Adempimenti di legge</strong>
                      <p className="text-xs text-muted-foreground mt-1">Adempiere agli obblighi previsti dalla legge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Gestione area amministrativa</strong>
                      <p className="text-xs text-muted-foreground mt-1">Gestione dell'area riservata e delle funzionalità amministrative</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm">Sicurezza</strong>
                      <p className="text-xs text-muted-foreground mt-1">Garantire la sicurezza del sito e prevenire abusi o frodi</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Base Giuridica */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1.4 Base Giuridica del Trattamento (Art. 6 GDPR)
                </h3>
                <p className="mb-4">Il trattamento dei dati personali si basa sulle seguenti basi giuridiche:</p>
                <div className="space-y-3">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 6 a</Badge>
                        <div>
                          <strong className="block mb-1">Consenso dell'interessato (Art. 6, comma 1, lett. a GDPR)</strong>
                          <p className="text-sm text-muted-foreground">Per cookie non essenziali, newsletter, comunicazioni di marketing, cookie analitici e funzionali</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 6 b</Badge>
                        <div>
                          <strong className="block mb-1">Esecuzione di un contratto o di misure precontrattuali (Art. 6, comma 1, lett. b GDPR)</strong>
                          <p className="text-sm text-muted-foreground">Per la fornitura dei servizi richiesti dall'utente</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 6 f</Badge>
                        <div>
                          <strong className="block mb-1">Interesse legittimo del titolare (Art. 6, comma 1, lett. f GDPR)</strong>
                          <p className="text-sm text-muted-foreground">Per sicurezza del sito, prevenzione di frodi, miglioramento dei servizi, analisi statistiche anonime</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 6 c</Badge>
                        <div>
                          <strong className="block mb-1">Adempimento di un obbligo di legge (Art. 6, comma 1, lett. c GDPR)</strong>
                          <p className="text-sm text-muted-foreground">Per conservazione di documenti contabili e fiscali</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Modalità di Trattamento */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  1.5 Modalità di Trattamento
                </h3>
                <p className="mb-4">
                  Il trattamento dei dati personali viene effettuato mediante strumenti informatici e telematici, con logiche strettamente correlate alle finalità 
                  indicate e, comunque, in modo da garantire la sicurezza, l'integrità e la riservatezza dei dati stessi.
                </p>
                <p className="mb-4">Le misure di sicurezza adottate includono:</p>
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Crittografia dei dati sensibili in transito e a riposo</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Accesso limitato e controllato ai dati personali</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Backup regolari dei dati</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Monitoraggio continuo della sicurezza</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Autenticazione sicura per l'area amministrativa</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Periodo di Conservazione */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  1.6 Periodo di Conservazione dei Dati
                </h3>
                <p className="mb-4">I dati personali sono conservati per i seguenti periodi:</p>
                <div className="space-y-3 mb-4">
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">2 anni</Badge>
                        <div>
                          <strong className="block mb-1">Dati di contatto e richieste</strong>
                          <p className="text-sm text-muted-foreground">Fino alla revoca del consenso o per un massimo di 2 anni dall'ultimo contatto, salvo obblighi di legge che richiedano una conservazione più lunga</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">10 anni</Badge>
                        <div>
                          <strong className="block mb-1">Dati di prenotazione</strong>
                          <p className="text-sm text-muted-foreground">10 anni dalla data della prenotazione, in conformità agli obblighi contabili e fiscali</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">12/6 mesi</Badge>
                        <div>
                          <strong className="block mb-1">Dati di navigazione e log</strong>
                          <p className="text-sm text-muted-foreground">12 mesi per i dati di navigazione, 6 mesi per i log di sistema</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">10+ anni</Badge>
                        <div>
                          <strong className="block mb-1">Dati di autenticazione area admin</strong>
                          <p className="text-sm text-muted-foreground">Per tutta la durata del rapporto e per ulteriori 10 anni per obblighi di legge</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Variabile</Badge>
                        <div>
                          <strong className="block mb-1">Cookie</strong>
                          <p className="text-sm text-muted-foreground">Secondo le durate specificate nella Cookie Policy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        Trascorsi i termini indicati, i dati saranno cancellati o anonimizzati, salvo che la loro conservazione ulteriore non sia richiesta 
                        per adempiere obblighi di legge o per accertare, esercitare o difendere un diritto in sede giudiziaria.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comunicazione e Diffusione */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  1.7 Comunicazione e Diffusione dei Dati
                </h3>
                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        I dati personali non sono diffusi pubblicamente né comunicati a terzi per finalità di marketing, salvo esplicito consenso dell'interessato.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <p className="mb-4">I dati possono essere comunicati a:</p>
                <div className="space-y-3">
                  <Card className="bg-muted/30 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Fornitori di servizi tecnologici
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Google LLC (Firebase) per servizi di hosting, database, autenticazione e storage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Fornitori di servizi di hosting e infrastruttura cloud</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Autorità competenti
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Quando richiesto dalla legge o da un'autorità giudiziaria</p>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-muted/30 border-border/50 mt-4">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      Tali soggetti operano in qualità di responsabili del trattamento o come titolari autonomi, secondo i casi, e sono tenuti al rispetto 
                      della normativa sulla protezione dei dati personali.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Trasferimento Dati Extra-UE */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  1.8 Trasferimento Dati Extra-UE
                </h3>
                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardContent className="pt-6">
                    <p className="text-sm mb-3">
                      Alcuni servizi utilizzati dal sito (in particolare Firebase/Google) comportano il trasferimento di dati personali verso paesi extra-UE, 
                      in particolare gli Stati Uniti d'America.
                    </p>
                    <p className="text-sm">
                      Tali trasferimenti sono effettuati nel rispetto del GDPR e con le garanzie appropriate, tra cui:
                    </p>
                  </CardContent>
                </Card>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Standard Contractual Clauses (Clausole Contrattuali Standard) approvate dalla Commissione Europea</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Certificazioni e codici di condotta riconosciuti</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Meccanismi di garanzia adeguati previsti dal GDPR</span>
                  </div>
                </div>
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      Per maggiori informazioni sul trattamento dei dati da parte di Google, è possibile consultare la{' '}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        Privacy Policy di Google
                      </a>{' '}
                      e le{' '}
                      <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        informazioni sulla privacy di Firebase
                      </a>.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Diritti dell'Interessato */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  1.9 Diritti dell'Interessato (Art. 15-22 GDPR)
                </h3>
                <p className="mb-4">
                  Ai sensi del GDPR, l'interessato ha diritto di esercitare i seguenti diritti nei confronti del titolare del trattamento:
                </p>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 15</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto di accesso</strong>
                          <p className="text-xs text-muted-foreground">Ottenere conferma dell'esistenza o meno di dati personali che lo riguardano e l'accesso a tali dati, nonché informazioni sul trattamento</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 16</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto di rettifica</strong>
                          <p className="text-xs text-muted-foreground">Ottenere la rettifica dei dati personali inesatti o l'integrazione dei dati personali incompleti</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 17</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto alla cancellazione / Diritto all'oblio</strong>
                          <p className="text-xs text-muted-foreground">Ottenere la cancellazione dei dati personali quando non sono più necessari o quando il consenso è stato revocato</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 18</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto di limitazione del trattamento</strong>
                          <p className="text-xs text-muted-foreground">Ottenere la limitazione del trattamento in casi specifici</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 20</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto alla portabilità dei dati</strong>
                          <p className="text-xs text-muted-foreground">Ricevere i dati personali in un formato strutturato, di uso comune e leggibile da dispositivo automatico</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Art. 21</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto di opposizione</strong>
                          <p className="text-xs text-muted-foreground">Opporsi al trattamento dei dati personali per finalità di marketing diretto o per motivi legati alla situazione particolare</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Revoca</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto di revoca del consenso</strong>
                          <p className="text-xs text-muted-foreground">Revocare il consenso al trattamento in qualsiasi momento, senza pregiudicare la liceità del trattamento basato sul consenso prima della revoca</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary flex-shrink-0">Reclamo</Badge>
                        <div>
                          <strong className="block mb-1 text-sm">Diritto di proporre reclamo</strong>
                          <p className="text-xs text-muted-foreground">Proporre reclamo all'Autorità Garante per la protezione dei dati personali (Garante Privacy) se ritiene che il trattamento violi la normativa sulla protezione dei dati</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardContent className="pt-6">
                    <p className="text-sm mb-3">
                      Per esercitare i propri diritti, l'interessato può rivolgersi al titolare del trattamento all'indirizzo email{' '}
                      <a href="mailto:privacy@studiofaraj.it" className="text-primary hover:underline font-medium">
                        privacy@studiofaraj.it
                      </a>
                      , indicando nell'oggetto "Esercizio diritti GDPR" e specificando il diritto che intende esercitare.
                    </p>
                    <p className="text-sm mb-3">
                      Il titolare risponderà entro 30 giorni dalla ricezione della richiesta, salvo casi di particolare complessità, 
                      per i quali il termine può essere prorogato di ulteriori 2 mesi, previa comunicazione all'interessato.
                    </p>
                    <p className="text-sm">
                      Per maggiori informazioni sui diritti dell'interessato, è possibile consultare il sito del{' '}
                      <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        Garante per la protezione dei dati personali
                      </a>.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sicurezza dei Dati */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  1.10 Sicurezza dei Dati
                </h3>
                <p className="mb-4">
                  Il titolare adotta misure tecniche e organizzative adeguate per garantire un livello di sicurezza appropriato al rischio, 
                  al fine di proteggere i dati personali da accesso non autorizzato, alterazione, divulgazione o distruzione.
                </p>
                <p className="mb-4">Le misure di sicurezza includono:</p>
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Crittografia dei dati in transito (HTTPS/TLS)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Crittografia dei dati sensibili a riposo</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Controlli di accesso basati su autenticazione e autorizzazione</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Backup regolari e procedure di disaster recovery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Monitoraggio continuo della sicurezza e rilevamento di anomalie</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Aggiornamenti regolari dei sistemi e delle applicazioni</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Formazione del personale autorizzato al trattamento</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* COOKIE POLICY */}
          <Card className="holographic-card neon-border bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                2. Cookie Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Cosa sono i Cookie */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  2.1 Cosa sono i Cookie
                </h3>
                <p className="mb-4">
                  I cookie sono piccoli file di testo che i siti web visitati dagli utenti inviano ai loro terminali (computer, tablet, smartphone), 
                  dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita.
                </p>
                <p className="mb-4">I cookie possono essere classificati in base a diversi criteri:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-1 text-sm">Cookie di sessione</strong>
                          <p className="text-xs text-muted-foreground">Temporanei, vengono eliminati alla chiusura del browser</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-1 text-sm">Cookie persistenti</strong>
                          <p className="text-xs text-muted-foreground">Rimangono memorizzati sul dispositivo per un periodo determinato o fino alla loro eliminazione manuale</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-1 text-sm">Cookie di prima parte (first-party)</strong>
                          <p className="text-xs text-muted-foreground">Impostati direttamente dal sito visitato</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-1 text-sm">Cookie di terze parti (third-party)</strong>
                          <p className="text-xs text-muted-foreground">Impostati da domini diversi da quello visitato</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Categorie di Cookie */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  2.2 Categorie di Cookie Utilizzate
                </h3>
                
                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">Essenziali</Badge>
                      Cookie Essenziali (Tecnici)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Questi cookie sono strettamente necessari per il funzionamento del sito e non possono essere disattivati. 
                      Non richiedono il consenso dell'utente ai sensi della normativa vigente.
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-semibold">Finalità:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="list-disc">Autenticazione e gestione delle sessioni utente</li>
                        <li className="list-disc">Sicurezza e prevenzione di abusi</li>
                        <li className="list-disc">Funzionamento delle funzionalità base del sito</li>
                        <li className="list-disc">Memorizzazione delle preferenze essenziali</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Durata: sessione o fino a 1 anno</Badge>
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Consenso: Non richiesto</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Esempi:</strong> cookie di sessione, cookie di autenticazione Firebase, cookie di sicurezza
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">Analitici</Badge>
                      Cookie Analitici
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Questi cookie permettono di raccogliere informazioni in forma aggregata e anonima sul numero degli utenti e su come questi visitano il sito, 
                      al fine di migliorare le prestazioni e l'esperienza utente.
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-semibold">Finalità:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="list-disc">Analisi statistica del traffico del sito</li>
                        <li className="list-disc">Comprensione del comportamento degli utenti</li>
                        <li className="list-disc">Miglioramento delle funzionalità e delle prestazioni</li>
                      </ul>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-semibold">Servizi utilizzati:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="list-disc">Firebase Analytics (se attivato con consenso)</li>
                        <li className="list-disc">Analisi interne del traffico</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Durata: fino a 2 anni</Badge>
                      <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">Consenso: Richiesto</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400">Funzionali</Badge>
                      Cookie Funzionali
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Questi cookie permettono al sito di ricordare le scelte dell'utente per fornire funzionalità migliorate e personalizzate.
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-semibold">Finalità:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="list-disc">Memorizzazione delle preferenze sui cookie</li>
                        <li className="list-disc">Memorizzazione delle preferenze di lingua (se applicabile)</li>
                        <li className="list-disc">Memorizzazione delle preferenze di tema/visualizzazione</li>
                        <li className="list-disc">Personalizzazione dell'esperienza utente</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Durata: fino a 1 anno</Badge>
                      <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">Consenso: Richiesto</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Dati memorizzati:</strong> preferenze cookie (localStorage), consenso cookie
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">Marketing</Badge>
                      Cookie di Marketing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Questi cookie vengono utilizzati per tracciare i visitatori attraverso i siti web al fine di mostrare pubblicità rilevante e personalizzata.
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-semibold">Finalità:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li className="list-disc">Tracciamento del comportamento di navigazione</li>
                        <li className="list-disc">Profilazione dell'utente per pubblicità mirata</li>
                        <li className="list-disc">Misurazione dell'efficacia delle campagne pubblicitarie</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Durata: fino a 2 anni</Badge>
                      <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">Consenso: Richiesto</Badge>
                    </div>
                    <Card className="bg-muted/30 border-border/50">
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">
                          <strong>Servizi utilizzati:</strong> Attualmente non utilizziamo cookie di marketing. Se in futuro verranno implementati, questa sezione verrà aggiornata.
                        </p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>

              {/* Cookie di Terze Parti */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  2.3 Cookie di Terze Parti
                </h3>
                <p className="mb-4">
                  Il sito utilizza servizi di terze parti che possono impostare cookie sul dispositivo dell'utente. 
                  Di seguito sono elencati i principali servizi utilizzati:
                </p>
                <Card className="bg-muted/30 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Firebase / Google Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">Utilizziamo i servizi di Firebase (Google) per:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4 ml-4">
                      <li className="list-disc"><strong>Firebase Authentication:</strong> gestione dell'autenticazione utente</li>
                      <li className="list-disc"><strong>Cloud Firestore:</strong> database per la memorizzazione dei dati</li>
                      <li className="list-disc"><strong>Cloud Storage:</strong> archiviazione di file e immagini</li>
                      <li className="list-disc"><strong>Firebase Analytics:</strong> analisi del traffico (solo con consenso)</li>
                    </ul>
                    <div className="space-y-2 text-sm">
                      <p>
                        Per maggiori informazioni sul trattamento dei dati da parte di Google, consultare la{' '}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                          Privacy Policy di Google
                        </a>{' '}
                        e le{' '}
                        <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                          informazioni sulla privacy di Firebase
                        </a>.
                      </p>
                      <p>
                        Per disabilitare i cookie di Google Analytics, è possibile utilizzare il{' '}
                        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                          componente aggiuntivo del browser per la disattivazione di Google Analytics
                        </a>.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* LocalStorage e SessionStorage */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  2.4 LocalStorage e SessionStorage
                </h3>
                <p className="mb-4">
                  Oltre ai cookie, il sito utilizza le tecnologie LocalStorage e SessionStorage del browser per memorizzare informazioni localmente sul dispositivo dell'utente.
                </p>
                <Card className="bg-muted/30 border-border/50 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Differenza rispetto ai cookie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li className="list-disc">I cookie vengono inviati automaticamente al server con ogni richiesta HTTP</li>
                      <li className="list-disc">LocalStorage e SessionStorage rimangono solo sul dispositivo dell'utente</li>
                      <li className="list-disc">LocalStorage persiste anche dopo la chiusura del browser</li>
                      <li className="list-disc">SessionStorage viene eliminato alla chiusura della scheda/browser</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border/50 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dati memorizzati</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li className="list-disc"><strong>Preferenze cookie:</strong> scelte dell'utente riguardo alle categorie di cookie</li>
                      <li className="list-disc"><strong>Consenso cookie:</strong> stato del consenso (accettato, rifiutato, personalizzato)</li>
                      <li className="list-disc"><strong>Preferenze interfaccia:</strong> impostazioni di visualizzazione (se applicabili)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        Questi dati sono utilizzati esclusivamente per migliorare l'esperienza dell'utente e non vengono condivisi con terze parti. 
                        L'utente può eliminare questi dati in qualsiasi momento attraverso le impostazioni del browser.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gestione dei Cookie */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  2.5 Gestione dei Cookie
                </h3>
                <p className="mb-4">
                  L'utente può gestire le preferenze relative ai cookie in diversi modi:
                </p>
                
                <Card className="bg-muted/30 border-border/50 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Gestione tramite il sito</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      È possibile gestire le preferenze sui cookie direttamente tramite il banner di consenso cookie che appare alla prima visita del sito. 
                      Le preferenze possono essere modificate in qualsiasi momento cliccando sul link "Cookie" presente nel footer del sito.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/50 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Gestione tramite il browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      La maggior parte dei browser consente di gestire le preferenze relative ai cookie. Di seguito le istruzioni per i browser principali:
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <strong className="text-sm block mb-1">Google Chrome</strong>
                        <p className="text-xs text-muted-foreground">
                          Menu → Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti. 
                          È possibile bloccare tutti i cookie o solo quelli di terze parti.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <strong className="text-sm block mb-1">Mozilla Firefox</strong>
                        <p className="text-xs text-muted-foreground">
                          Menu → Opzioni → Privacy e sicurezza → Cookie e dati dei siti. 
                          È possibile scegliere di bloccare i cookie di terze parti o tutti i cookie.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <strong className="text-sm block mb-1">Safari</strong>
                        <p className="text-xs text-muted-foreground">
                          Preferenze → Privacy → Gestisci dati sito web. 
                          È possibile bloccare tutti i cookie o solo quelli di terze parti.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <strong className="text-sm block mb-1">Microsoft Edge</strong>
                        <p className="text-xs text-muted-foreground">
                          Menu → Impostazioni → Cookie e autorizzazioni sito → Cookie e dati dei siti. 
                          È possibile bloccare i cookie di terze parti o tutti i cookie.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      Conseguenze della disabilitazione dei cookie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        La disabilitazione dei cookie essenziali può compromettere il corretto funzionamento del sito e impedire l'accesso ad alcune funzionalità, 
                        come l'autenticazione o la gestione delle sessioni.
                      </p>
                      <p>
                        La disabilitazione dei cookie analitici, funzionali o di marketing non compromette il funzionamento base del sito, 
                        ma può limitare alcune funzionalità personalizzate e l'analisi del traffico.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Modifiche e Contatti */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  3. Modifiche alla Privacy Policy
                </h2>
                <p className="text-sm text-muted-foreground">
                  Il titolare si riserva il diritto di modificare la presente informativa in qualsiasi momento, 
                  anche in relazione a modifiche della normativa applicabile. Le modifiche saranno pubblicate su questa pagina 
                  con indicazione della data di ultimo aggiornamento.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Si consiglia di consultare periodicamente questa pagina per essere informati su eventuali modifiche.
                </p>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-primary" />
                  4. Contatti
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Per qualsiasi domanda, richiesta o per esercitare i propri diritti in materia di protezione dei dati personali, 
                  è possibile contattare il titolare del trattamento:
                </p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <strong>Email privacy:</strong>{' '}
                        <a href="mailto:privacy@studiofaraj.it" className="text-primary hover:underline font-medium">
                          privacy@studiofaraj.it
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <strong>Email contatti generali:</strong>{' '}
                        <a href="mailto:info@studiofaraj.it" className="text-primary hover:underline font-medium">
                          info@studiofaraj.it
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <strong>Indirizzo:</strong> Studio Faraj, Sciacca, Italia
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Ultimo aggiornamento:</strong> {currentDate}
                </p>
                <p>
                  Questa informativa è conforme al Regolamento (UE) 2016/679 (GDPR) e al D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
