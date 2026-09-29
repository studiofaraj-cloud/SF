import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookCallButton } from '@/components/site/book-call-button';
import { BrandMark } from '@/components/site/brand-mark';
import { CookiePreferencesLink, FooterNewsletter } from '@/components/site/footer-islands';
import { ServiceQuoteButton } from '@/components/site/service-quote-button';
import { WhatsAppIcon } from '@/components/site/whatsapp-icon';
import { CONTACT, OPEN_IN_MAPS_URL, whatsappUrl } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { SERVICES, serviceGroupsFor } from '@/lib/services-catalog';
import type { Locale } from '@/i18n/config';

const MONO = 'font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-white/50';
const LINK = 'text-left text-[15px] text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm';

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/studiofaraj.it' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/18JVysxoGo/?mibextid=wwXIfr' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/studio-faraj-47923b389/' },
];

const COPY = {
  it: {
    home: 'Studio Faraj, torna alla home',
    description: 'Siti, e-commerce e piattaforme scritti su misura a Padova, per aziende in Italia e all’estero. Il codice resta tuo.',
    newsletter: {
      title: 'Newsletter',
      lead: 'Le nuove guide del blog, via email. Ti disiscrivi quando vuoi.',
      label: 'La tua email',
      placeholder: 'La tua email',
      subscribe: 'Iscriviti',
      done: 'Iscrizione completata: grazie!',
      failed: 'Iscrizione non riuscita. Controlla l’indirizzo e riprova.',
    },
    services: 'Servizi',
    studio: 'Studio',
    clients: 'Clienti',
    contacts: 'Contatti',
    studioLinks: [
      ['/projects', 'Progetti'],
      ['/chi-siamo', 'Chi siamo'],
      ['/blog', 'Blog'],
      ['/pagine-aziendali', 'Pagine aziendali'],
      ['/faq', 'FAQ'],
      ['/contatti', 'Contatti'],
    ],
    quote: 'Richiedi un preventivo',
    call: 'Prenota una chiamata',
    hub: 'Area clienti',
    whatsapp: 'WhatsApp',
    whatsappGreeting: 'Ciao Studio Faraj! Vi scrivo dal sito: vorrei informazioni per un progetto.',
    social: 'Social',
    legal: 'Documenti legali',
    privacy: 'Privacy',
    cookie: 'Cookie policy',
    cookiePrefs: 'Preferenze cookie',
    terms: 'Termini e condizioni',
  },
  en: {
    home: 'Studio Faraj, back to the homepage',
    description: 'Websites, e-commerce and platforms written to measure in Padova, for businesses in Italy and abroad. The code stays yours.',
    newsletter: {
      title: 'Newsletter',
      lead: 'New guides from the blog, by email. Unsubscribe whenever you like.',
      label: 'Your email',
      placeholder: 'Your email',
      subscribe: 'Subscribe',
      done: 'You’re subscribed: thank you!',
      failed: 'The subscription didn’t go through. Check the address and try again.',
    },
    services: 'Services',
    studio: 'Studio',
    clients: 'Clients',
    contacts: 'Contacts',
    studioLinks: [
      ['/projects', 'Projects'],
      ['/chi-siamo', 'About'],
      ['/blog', 'Blog'],
      ['/pagine-aziendali', 'Business pages'],
      ['/faq', 'FAQ'],
      ['/contatti', 'Contact'],
    ],
    quote: 'Request a quote',
    call: 'Book a call',
    hub: 'Client area',
    whatsapp: 'WhatsApp',
    whatsappGreeting: "Hi Studio Faraj! I'm writing from your website: I'd like some information about a project.",
    social: 'Social',
    legal: 'Legal documents',
    privacy: 'Privacy',
    cookie: 'Cookie policy',
    cookiePrefs: 'Cookie preferences',
    terms: 'Terms and conditions',
  },
} as const;

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className={MONO}>{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

/**
 * Site footer — server component, navy, so on most pages it continues the
 * closing call to action above it. Brand and newsletter, then services,
 * studio, client links and contacts, social links, the legal bar, and a
 * large faint wordmark at the foot. Only the newsletter form, the cookie
 * preferences button and the quote / booking buttons run in the browser.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const href = (path: string) => getLocalizedPath(path, locale);
  const services = serviceGroupsFor(locale).flatMap((g) => g.services);

  return (
    <footer className="relative overflow-clip bg-navy text-white dark:border-t dark:border-white/10">
      <div className="container relative mx-auto px-5 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href={href('/')} aria-label={copy.home} className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              <BrandMark id="footer-mark" className="h-9 w-9 text-white" />
              <span className="text-xl font-semibold tracking-[-0.01em]">Studio Faraj</span>
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65">{copy.description}</p>

            <h2 className={`${MONO} mt-10`}>{copy.newsletter.title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{copy.newsletter.lead}</p>
            <FooterNewsletter locale={locale} copy={copy.newsletter} />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4 lg:col-span-8 lg:gap-x-8">
            <Column title={copy.services}>
              {services.map((slug) => (
                <li key={slug}>
                  <Link href={href(`/servizi/${slug}`)} className={LINK}>
                    {SERVICES[slug].name[locale]}
                  </Link>
                </li>
              ))}
            </Column>
            <Column title={copy.studio}>
              {copy.studioLinks.map(([path, label]) => (
                <li key={path}>
                  <Link href={href(path)} className={LINK}>
                    {label}
                  </Link>
                </li>
              ))}
            </Column>
            <Column title={copy.clients}>
              <li>
                <ServiceQuoteButton label={copy.quote} variant="plain" className={LINK} />
              </li>
              <li>
                <BookCallButton className={LINK}>{copy.call}</BookCallButton>
              </li>
              <li>
                {/* prefetch={false}: prefetching the client area pulls in the Firebase SDK. */}
                <Link href={href('/hub/login')} prefetch={false} className={LINK}>
                  {copy.hub}
                </Link>
              </li>
            </Column>
            <Column title={copy.contacts}>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={LINK}>
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone}`} className={LINK}>
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={whatsappUrl(copy.whatsappGreeting)} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex items-center gap-2`}>
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  {copy.whatsapp}
                </a>
              </li>
              <li>
                <a href={OPEN_IN_MAPS_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  Via Ludovico Ariosto{'\u00a0'}42
                  <br />
                  35128 Padova
                </a>
              </li>
            </Column>
          </div>
        </div>

        <ul aria-label={copy.social} className="mt-12 flex flex-wrap gap-2.5">
          {SOCIAL.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-full px-4 text-[13px] text-white/80 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.12] py-6 text-[13px] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Studio Faraj · P.IVA 05783550287</p>
          <ul aria-label={copy.legal} className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href={href('/privacy')} className="transition-colors hover:text-white">{copy.privacy}</Link>
            </li>
            <li>
              <Link href={href('/cookie')} className="transition-colors hover:text-white">{copy.cookie}</Link>
            </li>
            <li>
              <CookiePreferencesLink label={copy.cookiePrefs} className="transition-colors hover:text-white" />
            </li>
            <li>
              <Link href={href('/terms')} className="transition-colors hover:text-white">{copy.terms}</Link>
            </li>
          </ul>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none -mb-[2.4vw] select-none whitespace-nowrap px-4 font-display text-[15.5vw] font-extrabold leading-[0.8] tracking-[-0.05em] text-white/[0.06] md:px-6"
      >
        Studio Faraj
      </p>
    </footer>
  );
}
