import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { LegalDoc, LegalTable, type LegalSection } from '@/components/site/legal-doc';
import { CONTACT } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

/** Date of the last change to this text: update it with every edit. */
const UPDATED = '2026-09-29';

type Props = { params: Promise<{ locale: string }> };

const META = {
  it: {
    title: 'Informativa privacy',
    description: 'Come Studio Faraj tratta i dati personali di chi visita studiofaraj.it, compila un modulo o usa l’area clienti: quali dati, perché, per quanto tempo e come esercitare i tuoi diritti.',
  },
  en: {
    title: 'Privacy policy',
    description: 'How Studio Faraj handles the personal data of people who visit studiofaraj.it, fill in a form or use the client area: what data, why, for how long and how to exercise your rights.',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  return generateSEOMetadata({
    ...META[lang],
    url: `${siteConfig.url}/${lang}/privacy`,
    locale: lang,
    alternateUrls: { it: `${siteConfig.url}/it/privacy`, en: `${siteConfig.url}/en/privacy` },
  });
}

const mail = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

function content(lang: Locale): { lead: string; brief: React.ReactNode[]; sections: LegalSection[] } {
  const cookie = getLocalizedPath('/cookie', lang);
  const terms = getLocalizedPath('/terms', lang);

  if (lang === 'en') {
    return {
      lead: 'How Studio Faraj handles the personal data of people who visit the site, write to us or use the client area, under Regulation (EU) 2016/679 (GDPR) and the Italian Privacy Code (Legislative Decree 196/2003).',
      brief: [
        <><strong>Only for what you ask.</strong> We use your data to reply to you, provide our services and run the client area.</>,
        <><strong>No advertising.</strong> We don’t sell your data or pass it on to others for advertising.</>,
        <><strong>Statistics only with your yes.</strong> Google Analytics and the Google map load only if you accept them.</>,
        <><strong>One address.</strong> To see, correct or delete your data, write to {mail}.</>,
      ],
      sections: [
        {
          id: 'controller',
          title: 'Data controller',
          body: (
            <>
              <p>
                <strong>Studio Faraj</strong>, VAT no. 05783550287
                <br />
                Via Ludovico Ariosto 42, 35128 Padova (PD), Italy
                <br />
                Email {mail} · Phone <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>
              </p>
              <p>For any question about your data, write to this address.</p>
            </>
          ),
        },
        {
          id: 'data',
          title: 'What data we process and why',
          body: (
            <>
              <p>We only process the data you give us and the data the site needs to work. For each activity: what we collect, why, on what legal basis and for how long.</p>
              <LegalTable
                head={['Activity', 'Data', 'Why', 'Legal basis', 'How long']}
                rows={[
                  ['Contact and quote requests', 'Name, email, phone if you add it, service, budget, message', 'Reply to you and prepare a quote', 'Steps you ask for before a contract, art. 6(1)(b)', '2 years from the last contact'],
                  ['Booking a call', 'Name, email, phone, chosen day and time, optional message', 'Arrange and confirm the call', 'Steps you ask for before a contract, art. 6(1)(b)', '2 years from the last contact'],
                  ['Messages on WhatsApp', 'Number, profile name, messages', 'Reply to you', 'Steps you ask for before a contract, art. 6(1)(b)', '2 years from the last contact'],
                  ['Newsletter', 'Email', 'Send you articles and news', 'Consent, art. 6(1)(a)', 'Until you unsubscribe'],
                  ['Client area', 'Account (name, email, Google sign-in if you use it), requests, messages, files, quotes and invoices', 'Provide the services you buy and manage the relationship', 'Contract, art. 6(1)(b); tax obligations, art. 6(1)(c)', 'For the relationship; invoices and accounting records 10 years'],
                  ['Business pages', 'The company details you choose to publish (name, services, contacts, VAT no. if added) and billing details', 'Publish the page and manage the subscription', 'Contract, art. 6(1)(b); tax obligations, art. 6(1)(c)', 'While the subscription is active; invoices 10 years'],
                  ['Browsing and security', 'IP address, browser, requested pages, date and time, in the server logs', 'Run the site and protect it from abuse', 'Legitimate interest, art. 6(1)(f)', 'Up to 6 months'],
                  ['Visit statistics (only with consent)', 'Pages viewed, device, referrer, a pseudonymous identifier', 'Understand how the site is used', 'Consent, art. 6(1)(a)', 'Up to 14 months'],
                ]}
              />
              <p className="!mt-6">
                Giving us your data is up to you, but without the required fields we can’t reply to a request or provide a service. We don’t use your data for automated decisions or profiling. The data a company publishes on its business page is public by its own choice: see the <Link href={terms}>terms</Link>.
              </p>
            </>
          ),
        },
        {
          id: 'processors',
          title: 'Who we entrust it to',
          body: (
            <>
              <p>We don’t sell your data or disclose it. It is processed on our behalf, as data processors, by:</p>
              <ul>
                <li><strong>Google</strong> (Firebase and Google Cloud): hosting of the site, database, client-area sign-in and file storage; Google Analytics, only with your consent; reCAPTCHA, which protects the client-area and admin sign-ins from bots.</li>
                <li><strong>Brevo</strong> (Sendinblue SAS, France): sending confirmation and notification emails.</li>
                <li><strong>Stripe</strong> (Stripe Payments Europe Ltd, Ireland): subscription payments. We never see or store your card details.</li>
              </ul>
              <p>When you choose to use them, <strong>Google Maps</strong> (the map on the Contact page) and <strong>WhatsApp</strong> (Meta) process your data as independent controllers, under their own policies. We also disclose data to public authorities when the law requires it.</p>
            </>
          ),
        },
        {
          id: 'transfers',
          title: 'Transfers outside the EU',
          body: (
            <p>
              Google and Stripe may process data in the United States. These transfers rely on the EU adequacy decision for the EU-U.S. Data Privacy Framework, in which Google LLC and Stripe, Inc. participate, and on the European Commission’s standard contractual clauses. Brevo processes data in the European Union.
            </p>
          ),
        },
        {
          id: 'retention',
          title: 'How long we keep it',
          body: (
            <p>
              Each activity’s period is in the table above. When it ends, we delete the data or make it anonymous, unless we need it to establish, exercise or defend a legal claim. Cookie durations are in the <Link href={cookie}>cookie policy</Link>.
            </p>
          ),
        },
        {
          id: 'rights',
          title: 'Your rights',
          body: (
            <>
              <p>Under articles 15–22 of the GDPR you can at any time:</p>
              <ul>
                <li>know whether we process your data and get a copy;</li>
                <li>have it corrected or completed;</li>
                <li>have it deleted, or its processing restricted;</li>
                <li>receive it in a structured, machine-readable format;</li>
                <li>object to processing based on legitimate interest;</li>
                <li>withdraw your consent, without affecting what happened before.</li>
              </ul>
              <p>
                Write to {mail}. We reply within one month; for complex requests this can be extended by two more months, and we’ll tell you. You can change your cookie choices at any time from <strong>Cookie preferences</strong> at the bottom of every page.
              </p>
              <p>
                If you think we are processing your data unlawfully, you can lodge a complaint with the Italian Data Protection Authority, the <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.
              </p>
            </>
          ),
        },
        {
          id: 'security',
          title: 'Security',
          body: (
            <p>
              The site only uses encrypted connections (HTTPS). The data is stored on Google Cloud infrastructure, which also encrypts it at rest. The client area and the admin area require signing in.
            </p>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to this policy',
          body: <p>When we change this policy we update the date at the top of the page.</p>,
        },
      ],
    };
  }

  return {
    lead: 'Come Studio Faraj tratta i dati personali di chi visita il sito, ci scrive o usa l’area clienti, secondo il Regolamento (UE) 2016/679 (GDPR) e il Codice privacy (D.Lgs. 196/2003).',
    brief: [
      <><strong>Solo per ciò che chiedi.</strong> Usiamo i dati per risponderti, fornirti i servizi e gestire l’area clienti.</>,
      <><strong>Niente pubblicità.</strong> Non vendiamo né cediamo i tuoi dati a terzi per fini pubblicitari.</>,
      <><strong>Statistiche solo col tuo sì.</strong> Google Analytics e la mappa di Google partono solo se li accetti.</>,
      <><strong>Un solo indirizzo.</strong> Per vedere, correggere o cancellare i tuoi dati scrivi a {mail}.</>,
    ],
    sections: [
      {
        id: 'titolare',
        title: 'Titolare del trattamento',
        body: (
          <>
            <p>
              <strong>Studio Faraj</strong>, P.IVA 05783550287
              <br />
              Via Ludovico Ariosto 42, 35128 Padova (PD)
              <br />
              Email {mail} · Telefono <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>
            </p>
            <p>Per qualsiasi domanda sui tuoi dati scrivi a questo indirizzo.</p>
          </>
        ),
      },
      {
        id: 'dati',
        title: 'Dati che trattiamo e perché',
        body: (
          <>
            <p>Trattiamo solo i dati che ci dai tu e quelli che servono a far funzionare il sito. Per ogni attività: cosa raccogliamo, perché, su quale base giuridica e per quanto tempo.</p>
            <LegalTable
              head={['Attività', 'Dati', 'Perché', 'Base giuridica', 'Per quanto']}
              rows={[
                ['Richieste di contatto e preventivo', 'Nome, email, telefono se lo indichi, servizio, budget, messaggio', 'Risponderti e preparare il preventivo', 'Misure precontrattuali su tua richiesta, art. 6.1.b', '2 anni dall’ultimo contatto'],
                ['Prenotazione di una chiamata', 'Nome, email, telefono, giorno e orario scelti, messaggio facoltativo', 'Organizzare e confermare la chiamata', 'Misure precontrattuali su tua richiesta, art. 6.1.b', '2 anni dall’ultimo contatto'],
                ['Messaggi su WhatsApp', 'Numero, nome del profilo, messaggi', 'Risponderti', 'Misure precontrattuali su tua richiesta, art. 6.1.b', '2 anni dall’ultimo contatto'],
                ['Newsletter', 'Email', 'Inviarti articoli e novità', 'Consenso, art. 6.1.a', 'Fino alla disiscrizione'],
                ['Area clienti', 'Account (nome, email, accesso con Google se lo usi), richieste, messaggi, file, preventivi e fatture', 'Fornire i servizi acquistati e gestire il rapporto', 'Contratto, art. 6.1.b; obblighi fiscali, art. 6.1.c', 'Per la durata del rapporto; fatture e scritture contabili 10 anni'],
                ['Pagine aziendali', 'I dati dell’azienda che scegli di pubblicare (ragione sociale, servizi, contatti, P.IVA se la indichi) e i dati di fatturazione', 'Pubblicare la pagina e gestire l’abbonamento', 'Contratto, art. 6.1.b; obblighi fiscali, art. 6.1.c', 'Finché l’abbonamento è attivo; fatture 10 anni'],
                ['Navigazione e sicurezza', 'Indirizzo IP, browser, pagine richieste, data e ora, nei log del server', 'Far funzionare il sito e proteggerlo da abusi', 'Legittimo interesse, art. 6.1.f', 'Fino a 6 mesi'],
                ['Statistiche di visita (solo col consenso)', 'Pagine viste, dispositivo, provenienza, un identificativo pseudonimo', 'Capire come viene usato il sito', 'Consenso, art. 6.1.a', 'Fino a 14 mesi'],
              ]}
            />
            <p className="!mt-6">
              Darci i dati è una tua scelta, ma senza quelli obbligatori non possiamo rispondere a una richiesta o fornire un servizio. Non usiamo i tuoi dati per decisioni automatizzate né per profilazione. I dati che un’azienda pubblica sulla propria pagina aziendale sono pubblici per sua scelta: vedi i <Link href={terms}>termini</Link>.
            </p>
          </>
        ),
      },
      {
        id: 'responsabili',
        title: 'A chi li affidiamo',
        body: (
          <>
            <p>Non vendiamo i tuoi dati e non li diffondiamo. Li trattano per nostro conto, come responsabili del trattamento:</p>
            <ul>
              <li><strong>Google</strong> (Firebase e Google Cloud): hosting del sito, database, accesso all’area clienti e archiviazione dei file; Google Analytics, solo col tuo consenso; reCAPTCHA, che protegge dai bot gli accessi all’area clienti e all’area amministrativa.</li>
              <li><strong>Brevo</strong> (Sendinblue SAS, Francia): invio delle email di conferma e di notifica.</li>
              <li><strong>Stripe</strong> (Stripe Payments Europe Ltd, Irlanda): pagamento degli abbonamenti. Non vediamo né conserviamo i dati della tua carta.</li>
            </ul>
            <p>Quando scegli di usarli, <strong>Google Maps</strong> (la mappa nella pagina Contatti) e <strong>WhatsApp</strong> (Meta) trattano i tuoi dati come titolari autonomi, secondo le proprie informative. Comunichiamo i dati alle autorità solo quando la legge lo richiede.</p>
          </>
        ),
      },
      {
        id: 'trasferimenti',
        title: 'Trasferimenti fuori dall’UE',
        body: (
          <p>
            Google e Stripe possono trattare dati negli Stati Uniti. Questi trasferimenti si basano sulla decisione di adeguatezza UE per l’EU-U.S. Data Privacy Framework, a cui aderiscono Google LLC e Stripe, Inc., e sulle clausole contrattuali standard della Commissione europea. Brevo tratta i dati nell’Unione europea.
          </p>
        ),
      },
      {
        id: 'conservazione',
        title: 'Per quanto tempo',
        body: (
          <p>
            Il periodo di ogni attività è nella tabella qui sopra. Alla scadenza cancelliamo i dati o li rendiamo anonimi, salvo che servano per accertare, esercitare o difendere un diritto in giudizio. La durata dei cookie è nella <Link href={cookie}>cookie policy</Link>.
          </p>
        ),
      },
      {
        id: 'diritti',
        title: 'I tuoi diritti',
        body: (
          <>
            <p>Secondo gli articoli 15–22 del GDPR puoi in qualsiasi momento:</p>
            <ul>
              <li>sapere se trattiamo tuoi dati e averne una copia;</li>
              <li>farli correggere o completare;</li>
              <li>farli cancellare, o limitarne il trattamento;</li>
              <li>riceverli in un formato strutturato e leggibile da un computer;</li>
              <li>opporti al trattamento basato sul legittimo interesse;</li>
              <li>revocare il consenso, senza effetti su quanto avvenuto prima.</li>
            </ul>
            <p>
              Scrivi a {mail}. Rispondiamo entro un mese; per le richieste complesse il termine può allungarsi di altri due mesi, e te lo diciamo. Le scelte sui cookie si cambiano in ogni momento da <strong>Preferenze cookie</strong>, in fondo a ogni pagina.
            </p>
            <p>
              Se ritieni che il trattamento violi la legge, puoi presentare reclamo al <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.
            </p>
          </>
        ),
      },
      {
        id: 'sicurezza',
        title: 'Sicurezza',
        body: (
          <p>
            Il sito usa solo connessioni cifrate (HTTPS). I dati sono conservati sull’infrastruttura Google Cloud, che li cifra anche quando sono archiviati. L’area clienti e l’area amministrativa richiedono l’accesso con le proprie credenziali.
          </p>
        ),
      },
      {
        id: 'modifiche',
        title: 'Modifiche a questa informativa',
        body: <p>Quando cambiamo questa informativa aggiorniamo la data in cima alla pagina.</p>,
      },
    ],
  };
}

/** /privacy — the privacy policy, in Italian and English. Server component. */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const c = content(lang);
  return <LegalDoc locale={lang} doc="privacy" title={META[lang].title} lead={c.lead} updated={UPDATED} brief={c.brief} sections={c.sections} />;
}
