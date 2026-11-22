import type { Metadata } from 'next';
import Link from 'next/link';
import { readLink } from '@/lib/newsletter';
import { confirmNewsletter } from '@/lib/newsletter-actions';
import { NewsletterNotice } from '@/components/site/newsletter-notice';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string; stato?: string }>;
};

const COPY = {
  it: {
    title: 'Conferma l’iscrizione alla newsletter',
    ask: { heading: 'Confermi l’iscrizione?', body: 'Riceverai le nuove guide del blog di Studio Faraj. Ti puoi disiscrivere quando vuoi, con un clic da ogni email.', button: 'Conferma l’iscrizione' },
    ok: { heading: 'Iscrizione confermata', body: 'Grazie: da ora ricevi la newsletter di Studio Faraj. Ogni email contiene il link per disiscriverti.' },
    expired: { heading: 'Il link non è più valido', body: 'Il link di conferma vale 7 giorni e solo l’ultimo ricevuto funziona. Iscriviti di nuovo dal fondo di qualsiasi pagina: ti mandiamo un nuovo link.' },
    back: 'Vai al blog',
  },
  en: {
    title: 'Confirm your newsletter subscription',
    ask: { heading: 'Confirm your subscription?', body: 'You’ll receive new guides from the Studio Faraj blog. You can unsubscribe any time, in one click from every email.', button: 'Confirm subscription' },
    ok: { heading: 'Subscription confirmed', body: 'Thank you: you now receive the Studio Faraj newsletter. Every email has a link to unsubscribe.' },
    expired: { heading: 'This link no longer works', body: 'Confirmation links work for 7 days and only the latest one is valid. Sign up again at the bottom of any page and we’ll send a new link.' },
    back: 'Go to the blog',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${COPY[locale === 'en' ? 'en' : 'it'].title} | Studio Faraj`, robots: { index: false, follow: false } };
}

/**
 * Where the confirmation email leads. It asks for a click rather than
 * confirming on arrival: mail scanners open links in emails by themselves,
 * and that must not subscribe anyone.
 */
export default async function ConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'it';
  const { t, stato } = await searchParams;
  const c = COPY[lang];
  const back = (
    <Link href={`/${lang}/blog`} className="font-medium underline decoration-border decoration-2 underline-offset-[6px] hover:decoration-primary">
      {c.back}
    </Link>
  );

  if (stato === 'ok') return <NewsletterNotice tone="done" heading={c.ok.heading} body={c.ok.body}>{back}</NewsletterNotice>;
  if (stato === 'scaduto' || !readLink(t, 'confirm')) {
    return <NewsletterNotice tone="error" heading={c.expired.heading} body={c.expired.body}>{back}</NewsletterNotice>;
  }
  return (
    <NewsletterNotice tone="ask" heading={c.ask.heading} body={c.ask.body}>
      <form action={confirmNewsletter}>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="locale" value={lang} />
        <button
          type="submit"
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {c.ask.button}
        </button>
      </form>
    </NewsletterNotice>
  );
}
