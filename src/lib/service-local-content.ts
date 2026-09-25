/**
 * Long-form, locally-targeted copy for the /servizi/* pages (Italian only).
 *
 * The service pages were thin (~350–500 words of feature cards). This adds the
 * explanatory text, FAQ and internal links that search engines need to rank a
 * page for "<servizio> Padova" / "<servizio> Veneto" queries.
 *
 * Keep it factual: only processes and claims that are already stated
 * elsewhere on the site. No prices or plan names — the service pages no
 * longer list offers — and no invented statistics or client names.
 */

export type ServiceLocalKey =
  | 'ecommerce'
  | 'seoMarketing'
  | 'designUIUX'
  | 'aiAutomation'
  | 'consulting'
  | 'maintenance'
  | 'hostingCloud';

export interface ServiceLocalContent {
  /** H2, rendered as `heading` + `headingHighlight` (the second part in the service colour). */
  heading: string;
  headingHighlight: string;
  paragraphs: string[];
  points: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
  related: { href: string; label: string }[];
}

/** Shared "where we work" copy, rendered on every service page. */
export const SERVICE_AREA = {
  heading: 'Dove lavoriamo',
  body:
    'Lo studio è a Padova. Seguiamo aziende e professionisti in città e in provincia — Abano Terme, Selvazzano Dentro, Rubano, Vigonza, Cadoneghe, Albignasego, Piove di Sacco, Cittadella, Este e Monselice — e nel resto del Veneto, da Venezia e Mestre a Treviso, Vicenza, Verona e Rovigo. Il lavoro si svolge in gran parte da remoto, con call e incontri quando servono.',
};

export const SERVICE_LOCAL_CONTENT: Record<ServiceLocalKey, ServiceLocalContent> = {
  ecommerce: {
    heading: 'Realizzazione e-commerce a Padova:',
    headingHighlight: 'un negozio online costruito sul tuo modo di vendere',
    paragraphs: [
      'Un e-commerce non è solo un catalogo con un carrello. Deve gestire i tuoi prodotti e le loro varianti, i pagamenti, le spedizioni e le email ai clienti senza costringerti a lavorare attorno ai limiti di una piattaforma. Per questo a Padova sviluppiamo negozi online su misura: il codice è scritto da zero per il tuo catalogo e il tuo processo, e alla consegna è tuo.',
      'Rispetto a un tema pronto su una piattaforma in abbonamento, un e-commerce su misura ti dà pieno controllo su velocità, struttura delle pagine e SEO. Le schede prodotto sono pensate per posizionarsi su Google, il checkout ha solo i passaggi necessari e il sito resta veloce anche da smartphone, dove arriva la maggior parte degli acquisti.',
      'Integriamo i pagamenti con Stripe e PayPal, il calcolo delle spedizioni e il tracking degli ordini, e colleghiamo il negozio ai sistemi che usi già, come gestionale, magazzino o CRM. Lavoriamo con negozi e aziende di Padova e del Veneto che vendono ai privati, ad altre aziende o a entrambi.',
    ],
    points: [
      { title: 'Il catalogo prima di tutto', body: 'Partiamo da come sono organizzati i tuoi prodotti — varianti, listini, disponibilità — e costruiamo il negozio attorno a quello, non il contrario.' },
      { title: 'Nessuna piattaforma a noleggio', body: 'Il codice è tuo: puoi cambiare fornitore o hosting quando vuoi, senza migrare il negozio.' },
      { title: 'Pronto per Google', body: 'URL puliti, schede prodotto con dati strutturati e pagine veloci fanno parte del progetto fin dall’inizio.' },
    ],
    faqs: [
      { question: 'Quanto costa realizzare un e-commerce a Padova?', answer: 'Dipende dal numero di prodotti, dalle integrazioni (gestionale, spedizioni, fatturazione) e dalle funzioni richieste. Dopo una prima call gratuita ti mandiamo un preventivo dettagliato con le voci separate, così sai cosa stai pagando.' },
      { question: 'Posso gestire prodotti e ordini da solo?', answer: 'Sì. Ogni negozio ha un pannello di gestione per prodotti, ordini e clienti, pensato per chi non è tecnico. Alla consegna ti mostriamo come usarlo.' },
      { question: 'Potete collegare l’e-commerce al mio gestionale?', answer: 'Nella maggior parte dei casi sì, tramite API o esportazioni periodiche. Lo verifichiamo nella fase di analisi, prima del preventivo.' },
      { question: 'Seguite anche aziende fuori Padova?', answer: 'Sì, lavoriamo con clienti in tutto il Veneto e nel resto d’Italia. Il progetto si segue bene anche da remoto.' },
    ],
    related: [
      { href: '/servizi/seo-marketing', label: 'SEO e Web Marketing a Padova' },
      { href: '/servizi/design-ui-ux', label: 'Web Design e UI/UX' },
      { href: '/servizi/hosting-cloud', label: 'Hosting e Cloud' },
      { href: '/quanto-costa-un-sito-web', label: 'Quanto costa un sito web?' },
    ],
  },

  seoMarketing: {
    heading: 'SEO a Padova:',
    headingHighlight: 'farsi trovare dai clienti che cercano quello che fai',
    paragraphs: [
      'Quando qualcuno a Padova cerca un servizio su Google, sceglie quasi sempre tra i primi risultati e le attività nella mappa. La SEO serve a portarti lì per le ricerche che contano davvero per il tuo lavoro, non per parole chiave generiche che portano visite ma nessun cliente.',
      'Partiamo da un audit del sito: velocità, struttura delle pagine, contenuti, errori tecnici e come Google lo vede oggi. Poi individuiamo le ricerche che fanno i tuoi clienti — "idraulico Padova", "commercialista Abano Terme", "impresa edile Vicenza" — e ottimizziamo le pagine esistenti o ne creiamo di nuove per rispondere a ognuna.',
      'Per le attività con una sede sul territorio curiamo anche la SEO locale: la scheda Google Business Profile, la coerenza di nome, indirizzo e telefono sulle directory, le recensioni e le pagine dedicate alle zone servite. Ogni mese ricevi un report con posizionamenti, traffico e contatti generati.',
    ],
    points: [
      { title: 'SEO tecnica', body: 'Velocità, indicizzazione, dati strutturati e struttura degli URL: la base senza la quale i contenuti non si posizionano.' },
      { title: 'SEO locale', body: 'Google Business Profile, citazioni locali e pagine per città e quartieri, per comparire nella mappa e nelle ricerche "vicino a me".' },
      { title: 'Contenuti e campagne', body: 'Articoli e pagine che rispondono alle domande dei clienti, e campagne Google Ads quando servono risultati subito.' },
    ],
    faqs: [
      { question: 'Quanto costa la SEO per un’attività di Padova?', answer: 'Dipende dal numero di pagine da ottimizzare, dai contenuti da produrre e dalle eventuali campagne. L’audit iniziale è gratuito: partendo da quello ti mandiamo un preventivo con le attività e i costi, voce per voce.' },
      { question: 'In quanto tempo si vedono i risultati?', answer: 'I primi miglioramenti su ricerche locali e poco competitive arrivano di solito in qualche settimana; per le ricerche più contese servono diversi mesi di lavoro costante. Nessuno può garantire onestamente una posizione precisa su Google.' },
      { question: 'Gestite anche la scheda Google Business Profile?', answer: 'Sì: curiamo categorie, descrizione, orari, foto e la gestione delle recensioni.' },
      { question: 'Serve rifare il sito per fare SEO?', answer: 'Non sempre. Spesso basta intervenire sulle pagine esistenti. Se il sito ha limiti tecnici che bloccano il posizionamento, te lo diciamo nell’audit.' },
    ],
    related: [
      { href: '/servizi/sviluppo-web', label: 'Sviluppo siti web a Padova' },
      { href: '/servizi/e-commerce', label: 'Realizzazione e-commerce' },
      { href: '/servizi/manutenzione', label: 'Manutenzione siti web' },
      { href: '/blog', label: 'Guide SEO sul nostro blog' },
    ],
  },

  designUIUX: {
    heading: 'Web design a Padova:',
    headingHighlight: 'siti chiari, che portano contatti',
    paragraphs: [
      'Un buon web design non si misura da quanto è bello il sito, ma da quanto è facile per un visitatore capire cosa fai e contattarti. Progettiamo interfacce per siti e applicazioni partendo da chi le userà: cosa cerca, da quale dispositivo arriva, cosa lo convince a scriverti o a comprare.',
      'Il lavoro parte da un’analisi del tuo brand, dei concorrenti e del pubblico, passa per wireframe e prototipi interattivi e arriva al design definitivo, con tutte le specifiche per lo sviluppo. Vedi e provi il sito prima che venga scritta una riga di codice, quando le modifiche costano poco.',
      'Seguiamo aziende e professionisti di Padova e del Veneto sia per siti vetrina e landing page sia per web app, gestionali ed e-commerce più complessi. Ogni progetto è responsive e attento all’accessibilità, perché una parte crescente dei tuoi clienti arriva da smartphone.',
    ],
    points: [
      { title: 'Prima il prototipo', body: 'Provi la navigazione su un prototipo cliccabile e decidi con noi prima dello sviluppo.' },
      { title: 'Pensato per il mobile', body: 'Ogni schermata è progettata anche per smartphone, non adattata alla fine.' },
      { title: 'Design e codice insieme', body: 'Chi progetta lavora con chi sviluppa: quello che approvi è quello che va online.' },
    ],
    faqs: [
      { question: 'Quanto tempo serve per il design di un sito?', answer: 'Per un sito vetrina o una landing page 1–2 settimane; per una web app o un e-commerce completo 3–5 settimane, in base al numero di schermate.' },
      { question: 'Posso fare solo il design e far sviluppare il sito a qualcun altro?', answer: 'Sì. Consegniamo file e specifiche pronte per qualsiasi sviluppatore. Se preferisci, sviluppiamo noi anche il sito.' },
      { question: 'Quante revisioni sono incluse?', answer: 'Il numero di revisioni è indicato nel preventivo, in base alla dimensione del progetto. Lavorando su wireframe e prototipi, la maggior parte delle modifiche si fa prima dello sviluppo, quando costa poco.' },
    ],
    related: [
      { href: '/servizi/sviluppo-web', label: 'Sviluppo siti web a Padova' },
      { href: '/servizi/e-commerce', label: 'Realizzazione e-commerce' },
      { href: '/projects', label: 'I nostri lavori' },
    ],
  },

  aiAutomation: {
    heading: 'AI e automazione',
    headingHighlight: 'per le aziende di Padova e del Veneto',
    paragraphs: [
      'In molte aziende una parte del tempo se ne va in lavoro ripetitivo: copiare dati da un file all’altro, rispondere alle stesse domande dei clienti, compilare report a mano. Con l’intelligenza artificiale e le automazioni si può eliminare buona parte di questo lavoro, senza stravolgere i software che usi già.',
      'Partiamo da un processo concreto, non dalla tecnologia. Guardiamo come lavorate oggi, individuiamo i passaggi che si possono automatizzare e costruiamo la soluzione più semplice che funziona: un chatbot che risponde alle domande frequenti sul sito, un flusso che smista le email in arrivo, un sistema che estrae dati da documenti e li inserisce nel gestionale.',
      'Lavoriamo con PMI di Padova e del Veneto che vogliono usare l’AI in modo pratico. Ogni integrazione è sviluppata su misura, collegata ai tuoi sistemi e documentata, così resta sotto il tuo controllo.',
    ],
    points: [
      { title: 'Chatbot per il sito', body: 'Assistenti basati su modelli linguistici che rispondono ai clienti a qualsiasi ora, usando le informazioni della tua azienda.' },
      { title: 'Automazione dei processi', body: 'Flussi che collegano email, fogli di calcolo, CRM e gestionale ed eliminano l’inserimento manuale dei dati.' },
      { title: 'Analisi di documenti e dati', body: 'Estrazione automatica di informazioni da PDF, preventivi e fatture, e report generati senza lavoro manuale.' },
    ],
    faqs: [
      { question: 'L’AI è utile anche per una piccola azienda?', answer: 'Sì, spesso è lì che si nota di più: bastano poche automazioni ben scelte per recuperare ore di lavoro ogni settimana.' },
      { question: 'I dati della mia azienda restano riservati?', answer: 'Scegliamo servizi e configurazioni in base al tipo di dati trattati, e ti spieghiamo prima dove vengono elaborati e conservati.' },
      { question: 'Serve cambiare i software che uso?', answer: 'Di solito no. Le automazioni si collegano ai sistemi esistenti tramite API o integrazioni.' },
    ],
    related: [
      { href: '/servizi/software-gestionale', label: 'Software gestionale su misura' },
      { href: '/servizi/consulenza', label: 'Consulenza informatica' },
      { href: '/servizi/sviluppo-web', label: 'Sviluppo web su misura' },
    ],
  },

  consulting: {
    heading: 'Consulenza informatica a Padova:',
    headingHighlight: 'decisioni tecniche prese con i dati giusti',
    paragraphs: [
      'Scegliere il software sbagliato, o il fornitore sbagliato, costa caro e si scopre tardi. La consulenza serve a prendere queste decisioni prima di spendere: che tipo di sito o applicazione ti serve davvero, quali tecnologie usare, cosa conviene sviluppare su misura e cosa invece acquistare.',
      'Partiamo da una call per capire il tuo business e i tuoi obiettivi. Poi analizziamo la situazione attuale — sito, strumenti, processi, concorrenti — e ti consegniamo una roadmap con priorità, stime di costo e tempi. Se vuoi, ti affianchiamo anche durante la realizzazione, con noi o con altri fornitori.',
      'Siamo a Padova e seguiamo aziende, professionisti e startup in tutto il Veneto: da chi deve digitalizzare un processo interno a chi sta valutando preventivi di altri fornitori e vuole un parere indipendente.',
    ],
    points: [
      { title: 'Audit tecnologico', body: 'Una fotografia chiara di cosa usi oggi, cosa funziona e cosa ti sta costando più del necessario.' },
      { title: 'Scelta delle tecnologie', body: 'Ti aiutiamo a scegliere tra soluzioni su misura, software esistenti e piattaforme, in base a budget e obiettivi.' },
      { title: 'Revisione di preventivi', body: 'Leggiamo con te i preventivi ricevuti e ti diciamo cosa manca, cosa è superfluo e cosa chiedere.' },
    ],
    faqs: [
      { question: 'La prima consulenza è gratuita?', answer: 'Sì, la prima call conoscitiva è gratuita e senza impegno. Serve a capire se e come possiamo aiutarti.' },
      { question: 'Fate consulenza anche se poi il progetto lo sviluppa un altro fornitore?', answer: 'Sì. La consulenza è un servizio a sé: le nostre indicazioni restano valide chiunque realizzi il progetto.' },
      { question: 'La consulenza si può fare da remoto?', answer: 'Sì. Per le aziende fuori Padova lavoriamo soprattutto in videochiamata, con incontri in presenza quando servono.' },
    ],
    related: [
      { href: '/servizi/software-gestionale', label: 'Software gestionale su misura' },
      { href: '/servizi/ai-automazione', label: 'AI e automazione' },
      { href: '/dall-idea-al-progetto', label: 'Dall’idea al progetto' },
    ],
  },

  maintenance: {
    heading: 'Manutenzione siti web a Padova:',
    headingHighlight: 'un sito sempre aggiornato, sicuro e veloce',
    paragraphs: [
      'Un sito web non si pubblica e si dimentica. Librerie, plugin e server vanno aggiornati, i backup vanno verificati e le vulnerabilità vanno chiuse prima che qualcuno le sfrutti. Un sito trascurato rallenta, perde posizioni su Google e prima o poi si rompe, di solito nel momento peggiore.',
      'Con la manutenzione ci occupiamo noi di tutto questo: aggiornamenti periodici, backup, monitoraggio della sicurezza e delle prestazioni, correzione dei problemi e piccole modifiche ai contenuti. Seguiamo siti sviluppati da noi e anche siti realizzati da altri, dopo una verifica iniziale del codice.',
      'Puoi chiederci interventi singoli quando ti servono, senza vincoli, oppure affidarci la manutenzione continuativa del sito, con aggiornamenti, backup e monitoraggio della sicurezza programmati. Lavoriamo con aziende di Padova, della provincia e del resto del Veneto.',
    ],
    points: [
      { title: 'Aggiornamenti e sicurezza', body: 'Teniamo aggiornati codice, dipendenze e server, e controlliamo che il sito non sia esposto a vulnerabilità note.' },
      { title: 'Backup verificati', body: 'Backup regolari e, cosa altrettanto importante, verificati: se qualcosa va storto il sito si ripristina.' },
      { title: 'Prestazioni', body: 'Controlliamo velocità e Core Web Vitals, che incidono sia sull’esperienza dei visitatori sia sul posizionamento.' },
    ],
    faqs: [
      { question: 'Fate manutenzione anche su siti che non avete realizzato voi?', answer: 'Sì. Prima facciamo una verifica del sito per capire com’è costruito e in che stato è, poi ti proponiamo la soluzione adatta.' },
      { question: 'C’è un vincolo di durata?', answer: 'Per gli interventi singoli no, nessun vincolo. Per la manutenzione continuativa ti indichiamo durata e condizioni nel preventivo, prima di iniziare.' },
      { question: 'Quanto velocemente intervenite se il sito ha un problema?', answer: 'Gli interventi sono gestiti in base alla gravità del problema. Per i siti che seguiamo con la manutenzione continuativa i tempi di intervento sono concordati nel preventivo.' },
    ],
    related: [
      { href: '/servizi/hosting-cloud', label: 'Hosting e Cloud' },
      { href: '/servizi/seo-marketing', label: 'SEO e Web Marketing' },
      { href: '/servizi/sviluppo-web', label: 'Sviluppo siti web a Padova' },
    ],
  },

  hostingCloud: {
    heading: 'Hosting a Padova:',
    headingHighlight: 'il tuo sito su un’infrastruttura veloce, con un referente vero',
    paragraphs: [
      'La velocità e la stabilità di un sito dipendono molto da dove è ospitato. Un hosting condiviso economico rallenta nei momenti di traffico, e quando qualcosa non va ti ritrovi ad aprire ticket con un call center. Con il nostro hosting il sito gira su un’infrastruttura cloud configurata per le prestazioni, e se c’è un problema parli direttamente con chi lo gestisce.',
      'Dimensioniamo l’hosting sul traffico reale del sito, con certificato SSL e backup sempre inclusi. Ci occupiamo anche di dominio, DNS e caselle email, e della migrazione dal tuo hosting attuale.',
      'Un errore comune è pubblicare il sito su un sottodominio gratuito: Google fatica a indicizzarlo e il sito non si posiziona. Ti aiutiamo a registrare un dominio tuo e a configurarlo correttamente. Seguiamo aziende e professionisti di Padova e di tutto il Veneto.',
    ],
    points: [
      { title: 'Prestazioni', body: 'Server SSD NVMe e CDN quando il traffico lo richiede: pagine che si caricano in fretta, anche da smartphone.' },
      { title: 'Migrazione gratuita', body: 'Spostiamo noi il sito dal fornitore attuale, pianificando il passaggio per evitare interruzioni.' },
      { title: 'Supporto diretto', body: 'Nessun call center: ti risponde lo stesso team che gestisce il server.' },
    ],
    faqs: [
      { question: 'Potete trasferire il mio sito dal fornitore attuale?', answer: 'Sì, la migrazione è gratuita e la gestiamo noi, pianificandola per evitare interruzioni. Ti aiutiamo anche a spostare dominio ed email.' },
      { question: 'L’hosting include il dominio e le email?', answer: 'Possiamo registrare e gestire il dominio e configurare le caselle email aziendali; ti indichiamo i costi nel preventivo.' },
      { question: 'Cosa succede se il traffico cresce?', answer: 'Adeguiamo le risorse del server senza cambiare infrastruttura né migrare di nuovo il sito.' },
    ],
    related: [
      { href: '/servizi/manutenzione', label: 'Manutenzione siti web' },
      { href: '/servizi/sviluppo-web', label: 'Sviluppo siti web a Padova' },
      { href: '/servizi/e-commerce', label: 'Realizzazione e-commerce' },
    ],
  },
};
