export type Locale = 'it' | 'en';
export type Scenario =
  | 'contact'
  | 'quote'
  | 'newsletter'
  | 'booking'
  | 'plan-request'
  | 'service-request'
  | 'payment-receipt';

interface ClientCopy {
  subject: string;
  heading: string;
  intro: string;
  body: string;
  signOff: string;
  ctaLabel: string;
}

interface AdminCopy {
  subject: (name?: string) => string;
  heading: string;
  intro: string;
}

const clientCopy: Record<Locale, Record<Scenario, ClientCopy>> = {
  it: {
    contact: {
      subject: 'Grazie per averci contattato — Studio Faraj',
      heading: 'Grazie per il tuo messaggio!',
      intro: 'Abbiamo ricevuto la tua richiesta e ti risponderemo entro 24 ore lavorative.',
      body: 'Nel frattempo, puoi esplorare i nostri servizi e i progetti realizzati per altri clienti sul nostro sito.',
      signOff: 'A presto,<br/>Il team di Studio Faraj',
      ctaLabel: 'Visita il sito',
    },
    quote: {
      subject: 'Richiesta di preventivo ricevuta — Studio Faraj',
      heading: 'Abbiamo ricevuto la tua richiesta di preventivo',
      intro: 'Grazie per aver scelto Studio Faraj. Analizzeremo i tuoi requisiti e ti invieremo un preventivo personalizzato entro 48 ore lavorative.',
      body: 'Se hai dettagli aggiuntivi da condividere, rispondi pure a questa email.',
      signOff: 'Grazie,<br/>Il team di Studio Faraj',
      ctaLabel: 'Scopri i nostri servizi',
    },
    newsletter: {
      subject: 'Benvenuto nella newsletter di Studio Faraj',
      heading: 'Benvenuto a bordo!',
      intro: 'Grazie per esserti iscritto alla newsletter di Studio Faraj.',
      body: 'Riceverai aggiornamenti su nuovi progetti, articoli del blog e offerte esclusive. Niente spam — promesso.',
      signOff: 'A presto,<br/>Il team di Studio Faraj',
      ctaLabel: 'Leggi il blog',
    },
    booking: {
      subject: 'Prenotazione ricevuta — Studio Faraj',
      heading: 'Prenotazione ricevuta!',
      intro: 'Abbiamo ricevuto la tua richiesta di chiamata. Ti contatteremo a breve per confermare data e orario.',
      body: 'Se necessiti di modificare la prenotazione, rispondi a questa email.',
      signOff: 'A presto,<br/>Il team di Studio Faraj',
      ctaLabel: 'Visita il sito',
    },
    'plan-request': {
      subject: 'Richiesta piano ricevuta — Studio Faraj',
      heading: 'Grazie per il tuo interesse!',
      intro: 'Abbiamo ricevuto la tua richiesta. A breve ti invieremo il link per procedere con il pagamento e attivare il piano.',
      body: 'Per qualsiasi domanda, rispondi pure a questa email.',
      signOff: 'A presto,<br/>Il team di Studio Faraj',
      ctaLabel: 'Visita il sito',
    },
    'service-request': {
      subject: 'Richiesta ricevuta — Studio Faraj',
      heading: 'Abbiamo ricevuto la tua richiesta',
      intro: 'Grazie! La tua richiesta è stata registrata nella tua area cliente. La esamineremo e ti aggiorneremo a breve.',
      body: 'Puoi seguire lo stato di avanzamento, scambiare messaggi e condividere file direttamente dalla tua dashboard.',
      signOff: 'A presto,<br/>Il team di Studio Faraj',
      ctaLabel: 'Vai alla dashboard',
    },
    'payment-receipt': {
      subject: 'Pagamento ricevuto — Studio Faraj',
      heading: 'Grazie per il pagamento!',
      intro: 'Abbiamo ricevuto correttamente il tuo pagamento. Trovi il riepilogo nella tua area cliente.',
      body: 'Procederemo con i prossimi passi del tuo progetto. Per qualsiasi domanda, rispondi pure a questa email.',
      signOff: 'Grazie,<br/>Il team di Studio Faraj',
      ctaLabel: 'Vai alla dashboard',
    },
  },
  en: {
    contact: {
      subject: 'Thanks for reaching out — Studio Faraj',
      heading: 'Thanks for your message!',
      intro: "We've received your message and we'll get back to you within 24 business hours.",
      body: 'In the meantime, feel free to explore our services and past projects on the website.',
      signOff: 'Talk soon,<br/>The Studio Faraj team',
      ctaLabel: 'Visit the website',
    },
    quote: {
      subject: 'Quote request received — Studio Faraj',
      heading: "We've received your quote request",
      intro: 'Thanks for choosing Studio Faraj. We will review your requirements and send a tailored quote within 48 business hours.',
      body: 'If you have any extra details to share, just reply to this email.',
      signOff: 'Thank you,<br/>The Studio Faraj team',
      ctaLabel: 'Explore our services',
    },
    newsletter: {
      subject: 'Welcome to the Studio Faraj newsletter',
      heading: 'Welcome aboard!',
      intro: "Thanks for subscribing to the Studio Faraj newsletter.",
      body: "You'll receive updates about new projects, blog posts, and exclusive offers. No spam — promise.",
      signOff: 'Talk soon,<br/>The Studio Faraj team',
      ctaLabel: 'Read the blog',
    },
    booking: {
      subject: 'Booking received — Studio Faraj',
      heading: 'Your booking is in!',
      intro: "We've received your call request. We'll reach out shortly to confirm the date and time.",
      body: 'Need to change anything? Just reply to this email.',
      signOff: 'Talk soon,<br/>The Studio Faraj team',
      ctaLabel: 'Visit the website',
    },
    'plan-request': {
      subject: 'Plan request received — Studio Faraj',
      heading: 'Thanks for your interest!',
      intro: "We've received your request. We'll send you the payment link shortly so you can activate your plan.",
      body: 'For any questions, just reply to this email.',
      signOff: 'Talk soon,<br/>The Studio Faraj team',
      ctaLabel: 'Visit the website',
    },
    'service-request': {
      subject: 'Request received — Studio Faraj',
      heading: "We've received your request",
      intro: 'Thank you! Your request has been logged in your client area. We will review it and update you shortly.',
      body: 'You can track progress, exchange messages, and share files right from your dashboard.',
      signOff: 'Talk soon,<br/>The Studio Faraj team',
      ctaLabel: 'Go to dashboard',
    },
    'payment-receipt': {
      subject: 'Payment received — Studio Faraj',
      heading: 'Thanks for your payment!',
      intro: 'We have successfully received your payment. You can find the summary in your client area.',
      body: "We'll proceed with the next steps of your project. For any questions, just reply to this email.",
      signOff: 'Thank you,<br/>The Studio Faraj team',
      ctaLabel: 'Go to dashboard',
    },
  },
};

const adminCopy: Record<Scenario, AdminCopy> = {
  contact: {
    subject: (name) => `Nuovo messaggio di contatto${name ? ` da ${name}` : ''}`,
    heading: 'Nuovo messaggio dal sito',
    intro: 'Hai ricevuto un nuovo messaggio dal form di contatto.',
  },
  quote: {
    subject: (name) => `Nuova richiesta preventivo${name ? ` da ${name}` : ''}`,
    heading: 'Nuova richiesta di preventivo',
    intro: 'Hai ricevuto una nuova richiesta di preventivo.',
  },
  newsletter: {
    subject: () => 'Nuova iscrizione alla newsletter',
    heading: 'Nuovo iscritto newsletter',
    intro: 'Una nuova persona si è iscritta alla newsletter.',
  },
  booking: {
    subject: (name) => `Nuova prenotazione chiamata${name ? ` da ${name}` : ''}`,
    heading: 'Nuova prenotazione chiamata',
    intro: 'Hai ricevuto una nuova richiesta di prenotazione.',
  },
  'plan-request': {
    subject: (name) => `Richiesta pagamento piano${name ? ` da ${name}` : ''}`,
    heading: 'Richiesta pagamento piano',
    intro: 'Un utente ha richiesto il link di pagamento per un piano.',
  },
  'service-request': {
    subject: (name) => `Nuova richiesta di servizio${name ? ` da ${name}` : ''}`,
    heading: 'Nuova richiesta di servizio',
    intro: 'Un cliente ha inviato una nuova richiesta dalla client hub.',
  },
  'payment-receipt': {
    subject: (name) => `Pagamento ricevuto${name ? ` da ${name}` : ''}`,
    heading: 'Pagamento ricevuto',
    intro: 'Un cliente ha completato un pagamento online.',
  },
};

export function getClientCopy(scenario: Scenario, locale: Locale): ClientCopy {
  return clientCopy[locale]?.[scenario] ?? clientCopy.it[scenario];
}

export function getAdminCopy(scenario: Scenario): AdminCopy {
  return adminCopy[scenario];
}
