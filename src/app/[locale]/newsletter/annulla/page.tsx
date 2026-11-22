import type { Metadata } from 'next';
import Link from 'next/link';
import { readLink } from '@/lib/newsletter';
import { unsubscribeFromNewsletter } from '@/lib/newsletter-actions';
import { NewsletterNotice } from '@/components/site/newsletter-notice';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string; stato?: string }>;
};

const COPY = {
  it: {
    title: 'Annulla l’iscrizione alla newsletter',
    ask: { heading: 'Vuoi annullare l’iscrizione?', body: 'Non riceverai più la newsletter di Studio Faraj a questo indirizzo.', button: 'Annulla l’iscrizione' },
    ok: { heading: 'Iscrizione annullata', body: 'Fatto: non ti scriveremo più. Se cambi idea, puoi iscriverti di nuovo dal fondo di qualsiasi pagina.' },
    error: { heading: 'Il link non è valido', body: 'Usa il link dell’email più recente, oppure scrivici a info@studiofaraj.it e ti disiscriviamo noi.' },
    back: 'Torna al sito',
  },
  en: {
    title: 'Unsubscribe from the newsletter',
    ask: { heading: 'Unsubscribe?', body: 'You won’t receive the Studio Faraj newsletter at this address any more.', button: 'Unsubscribe' },
    ok: { heading: 'You’re unsubscribed', body: 'Done: we won’t write again. If you change your mind, you can sign up again at the bottom of any page.' },
    error: { heading: 'This link isn’t valid', body: 'Use the link in the latest email, or write to info@studiofaraj.it and we’ll unsubscribe you.' },
    back: 'Back to the site',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${COPY[locale === 'en' ? 'en' : 'it'].title} | Studio Faraj`, robots: { index: false, follow: false } };
}

/**
 * The unsubscribe link in every newsletter. One button, so a mail scanner
 * opening the link doesn't unsubscribe anyone; mail apps' own one-click
 * unsubscribe uses /api/newsletter/unsubscribe instead.
 */
export default async function UnsubscribePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'it';
  const { t, stato } = await searchParams;
  const c = COPY[lang];
  const back = (
    <Link href={`/${lang}`} className="font-medium underline decoration-border decoration-2 underline-offset-[6px] hover:decoration-primary">
      {c.back}
    </Link>
  );

  if (stato === 'ok') return <NewsletterNotice tone="done" heading={c.ok.heading} body={c.ok.body}>{back}</NewsletterNotice>;
  if (stato === 'errore' || !readLink(t, 'unsubscribe')) {
    return <NewsletterNotice tone="error" heading={c.error.heading} body={c.error.body}>{back}</NewsletterNotice>;
  }
  return (
    <NewsletterNotice tone="ask" heading={c.ask.heading} body={c.ask.body}>
      <form action={unsubscribeFromNewsletter}>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="locale" value={lang} />
        <button
          type="submit"
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-7 text-base font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {c.ask.button}
        </button>
      </form>
    </NewsletterNotice>
  );
}
