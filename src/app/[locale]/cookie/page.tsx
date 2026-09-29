import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { CookiePreferencesButton } from '@/components/site/cookie-preferences-button';
import { LegalDoc, LegalTable, type LegalSection } from '@/components/site/legal-doc';
import { CONTACT } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { generateMetadata as generateSEOMetadata, siteConfig } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

/** Date of the last change to this text: update it with every edit. */
const UPDATED = '2026-09-29';

/**
 * The Google Analytics 4 property. Its session cookie is named after it
 * (_ga_<id without "G-">), so the table below follows the real setting.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_SESSION_COOKIE = GA_ID ? `_ga_${GA_ID.replace(/^G-/, '')}` : '_ga_<ID>';

type Props = { params: Promise<{ locale: string }> };

const META = {
  it: {
    title: 'Cookie policy',
    description: 'Quali cookie e strumenti simili usa studiofaraj.it, a cosa servono, quanto durano e come scegliere quali attivare.',
  },
  en: {
    title: 'Cookie policy',
    description: 'Which cookies and similar tools studiofaraj.it uses, what they are for, how long they last and how to choose which to allow.',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  return generateSEOMetadata({
    ...META[lang],
    url: `${siteConfig.url}/${lang}/cookie`,
    locale: lang,
    alternateUrls: { it: `${siteConfig.url}/it/cookie`, en: `${siteConfig.url}/en/cookie` },
  });
}

const code = (s: string) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{s}</code>;
const mail = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

function content(lang: Locale): { lead: string; brief: React.ReactNode[]; button: string; sections: LegalSection[] } {
  const privacy = getLocalizedPath('/privacy', lang);

  if (lang === 'en') {
    return {
      lead: 'Which cookies and similar tools studiofaraj.it uses, what they are for, how long they last and how to choose which to allow.',
      brief: [
        <>Without your consent the site only uses what it needs to work.</>,
        <>Statistics (Google Analytics) and the map (Google Maps) switch on only if you accept them.</>,
        <>No advertising cookies. You can change your choice at any time.</>,
      ],
      button: 'Manage preferences',
      sections: [
        {
          id: 'what',
          title: 'What cookies are',
          body: (
            <p>
              Cookies are small text files a site saves in your browser. The site also uses your browser’s local storage, which works in a similar way but is never sent to the server. This policy covers both.
            </p>
          ),
        },
        {
          id: 'technical',
          title: 'Technical: always on',
          body: (
            <>
              <p>They make the site work and remember your choices. Under Italian law (art. 122 of the Privacy Code) they don’t need consent.</p>
              <LegalTable
                head={['Name', 'Set by', 'What for', 'Duration']}
                rows={[
                  [<>{code('cookie_consent')}, {code('cookie_preferences')}</>, 'Studio Faraj, local storage', 'Remember your cookie choice', 'Until you change it or clear the site’s data'],
                  [code('theme'), 'Studio Faraj, local storage', 'Remember light or dark theme', 'Until you clear the site’s data'],
                  [code('session'), 'Studio Faraj, cookie', 'Keep you signed in to the restricted area', '1 day'],
                  ['Firebase Authentication', 'Google for Studio Faraj, browser storage', 'Keep you signed in to the client area', 'Until you sign out'],
                  [code('_GRECAPTCHA'), 'Google (reCAPTCHA)', 'Protect the client-area and admin sign-ins from bots', '6 months'],
                ]}
              />
              <p className="!mt-6">The last three are only set if you sign in to the client area or the admin area.</p>
            </>
          ),
        },
        {
          id: 'analytics',
          title: 'Statistics: only with consent',
          body: (
            <>
              <p>
                With the “Statistics” category allowed, Google Analytics 4 counts visits and pages viewed with a pseudonymous identifier. Google Analytics 4 doesn’t log or store IP addresses. The script isn’t even loaded until you give consent.
              </p>
              <LegalTable
                head={['Name', 'Set by', 'What for', 'Duration']}
                rows={[
                  [code('_ga'), 'Google Analytics', 'Tell visits apart with a pseudonymous identifier', '2 years'],
                  [code(GA_SESSION_COOKIE), 'Google Analytics', 'Keep the state of the visit', '2 years'],
                ]}
              />
            </>
          ),
        },
        {
          id: 'maps',
          title: 'Maps: only with consent',
          body: (
            <p>
              The Contact page shows a Google Maps map. It loads only if you allow the “Maps” category or click “Show the map”. Once loaded, Google receives your IP address and can set its own cookies, under <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">Google’s cookie policy</a>.
            </p>
          ),
        },
        {
          id: 'advertising',
          title: 'Advertising',
          body: <p>We don’t use advertising or profiling cookies.</p>,
        },
        {
          id: 'external',
          title: 'Other sites',
          body: (
            <p>
              Some links take you to other services: WhatsApp, Stripe for payments, Google. Once there, their own cookie policies apply.
            </p>
          ),
        },
        {
          id: 'manage',
          title: 'How to choose',
          body: (
            <>
              <p>
                On your first visit a banner asks for your choice: <strong>Accept</strong>, <strong>Reject</strong> or <strong>Customise</strong>. Closing it with the ✕ counts as rejecting. You can change your choice at any time with the button at the top of this page or from <strong>Cookie preferences</strong> at the bottom of every page.
              </p>
              <p>You can also delete cookies and site data from your browser settings. The site keeps working without the optional categories.</p>
              <p>
                How we use the data these tools collect is in the <Link href={privacy}>privacy policy</Link>. Questions: {mail}.
              </p>
            </>
          ),
        },
      ],
    };
  }

  return {
    lead: 'Quali cookie e strumenti simili usa studiofaraj.it, a cosa servono, quanto durano e come scegliere quali attivare.',
    brief: [
      <>Senza il tuo consenso il sito usa solo ciò che serve a farlo funzionare.</>,
      <>Statistiche (Google Analytics) e mappa (Google Maps) si attivano solo se le accetti.</>,
      <>Nessun cookie pubblicitario. Puoi cambiare idea in qualsiasi momento.</>,
    ],
    button: 'Gestisci le preferenze',
    sections: [
      {
        id: 'cosa-sono',
        title: 'Cosa sono i cookie',
        body: (
          <p>
            I cookie sono piccoli file di testo che un sito salva nel tuo browser. Il sito usa anche l’archiviazione locale del browser, che funziona in modo simile ma non viene mai inviata al server. Questa policy le descrive entrambe.
          </p>
        ),
      },
      {
        id: 'tecnici',
        title: 'Tecnici: sempre attivi',
        body: (
          <>
            <p>Fanno funzionare il sito e ricordano le tue scelte. Secondo l’art. 122 del Codice privacy non richiedono il consenso.</p>
            <LegalTable
              head={['Nome', 'Di chi', 'A cosa serve', 'Durata']}
              rows={[
                [<>{code('cookie_consent')}, {code('cookie_preferences')}</>, 'Studio Faraj, archiviazione locale', 'Ricordare la tua scelta sui cookie', 'Finché non la cambi o cancelli i dati del sito'],
                [code('theme'), 'Studio Faraj, archiviazione locale', 'Ricordare il tema chiaro o scuro', 'Finché non cancelli i dati del sito'],
                [code('session'), 'Studio Faraj, cookie', 'Mantenere l’accesso all’area riservata', '1 giorno'],
                ['Firebase Authentication', 'Google per Studio Faraj, archiviazione del browser', 'Mantenere l’accesso all’area clienti', 'Fino all’uscita'],
                [code('_GRECAPTCHA'), 'Google (reCAPTCHA)', 'Proteggere dai bot gli accessi all’area clienti e amministrativa', '6 mesi'],
              ]}
            />
            <p className="!mt-6">Gli ultimi tre si attivano solo se accedi all’area clienti o all’area amministrativa.</p>
          </>
        ),
      },
      {
        id: 'statistiche',
        title: 'Statistiche: solo col consenso',
        body: (
          <>
            <p>
              Se autorizzi la categoria “Statistiche”, Google Analytics 4 conta visite e pagine viste con un identificativo pseudonimo. Google Analytics 4 non registra né conserva gli indirizzi IP. Lo script non viene nemmeno caricato finché non dai il consenso.
            </p>
            <LegalTable
              head={['Nome', 'Di chi', 'A cosa serve', 'Durata']}
              rows={[
                [code('_ga'), 'Google Analytics', 'Distinguere le visite con un identificativo pseudonimo', '2 anni'],
                [code(GA_SESSION_COOKIE), 'Google Analytics', 'Mantenere lo stato della visita', '2 anni'],
              ]}
            />
          </>
        ),
      },
      {
        id: 'mappe',
        title: 'Mappe: solo col consenso',
        body: (
          <p>
            La pagina Contatti mostra una mappa di Google Maps. Si carica solo se autorizzi la categoria “Mappe” o fai clic su “Mostra la mappa”. Una volta caricata, Google riceve il tuo indirizzo IP e può impostare i propri cookie, secondo la <a href="https://policies.google.com/technologies/cookies?hl=it" target="_blank" rel="noopener noreferrer">cookie policy di Google</a>.
          </p>
        ),
      },
      {
        id: 'pubblicitari',
        title: 'Pubblicitari',
        body: <p>Non usiamo cookie pubblicitari né di profilazione.</p>,
      },
      {
        id: 'siti-esterni',
        title: 'Altri siti',
        body: (
          <p>
            Alcuni link portano ad altri servizi: WhatsApp, Stripe per i pagamenti, Google. Una volta lì valgono le loro cookie policy.
          </p>
        ),
      },
      {
        id: 'come-scegliere',
        title: 'Come scegliere',
        body: (
          <>
            <p>
              Alla prima visita un banner ti chiede cosa preferisci: <strong>Accetta</strong>, <strong>Rifiuta</strong> o <strong>Personalizza</strong>. Chiuderlo con la ✕ equivale a rifiutare. Puoi cambiare scelta in qualsiasi momento con il pulsante in cima a questa pagina o da <strong>Preferenze cookie</strong>, in fondo a ogni pagina.
            </p>
            <p>Puoi anche cancellare cookie e dati del sito dalle impostazioni del browser. Il sito funziona anche senza le categorie facoltative.</p>
            <p>
              Come usiamo i dati raccolti da questi strumenti è nell’<Link href={privacy}>informativa privacy</Link>. Domande: {mail}.
            </p>
          </>
        ),
      },
    ],
  };
}

/** /cookie — the cookie policy, in Italian and English. Server component; only the preferences button runs in the browser. */
export default async function CookiePage({ params }: Props) {
  const { locale } = await params;
  const lang: Locale = locale === 'en' ? 'en' : 'it';
  setRequestLocale(lang);
  const c = content(lang);
  return (
    <LegalDoc
      locale={lang}
      doc="cookie"
      title={META[lang].title}
      lead={c.lead}
      updated={UPDATED}
      brief={c.brief}
      actions={<CookiePreferencesButton label={c.button} />}
      sections={c.sections}
    />
  );
}
