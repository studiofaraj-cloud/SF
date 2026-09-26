import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientMessages } from '@/components/i18n/client-messages';
import { getAggregateRating } from '@/lib/google-reviews';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import { HeroPointer } from './hero-pointer';
import { HeroQuotePreview } from './hero-quote-preview';
import { SectionEdge } from './section-edge';

/**
 * HOMEPAGE HERO — "codice → prodotto". Server component.
 *
 * Left: the static, keyword-bearing <h1> ("agenzia web a Padova", the term the
 * homepage owns in src/lib/seo-keywords.ts, and the page's only h1), the
 * pitch, the calls to action and the real Google rating.
 *
 * Right: a simplified excerpt of the site's own quote form (quote-dialog.tsx)
 * beside what it renders. Nothing is invented: the strings are read from the
 * same `quoteDialog` messages the real form uses, and clicking the rendered
 * form opens the real form (HeroQuotePreview, the hero's one client island).
 * Phones get a four-line excerpt. data-nosnippet keeps the code out of Google
 * snippets.
 *
 * Motion: the preview is drawn in behind a scan line, once. The end state is
 * the default, so reduced motion, no-JS and crawlers get the finished frame;
 * no text in the left column animates (LCP is the first paint). HeroPointer
 * adds a little depth to the window on mouse move.
 */

const COPY = {
  it: {
    h1a: 'Agenzia web',
    h1b: 'a Padova.',
    lead: 'Siti, e-commerce e piattaforme scritti riga per riga. Niente template, niente WordPress: il codice resta tuo.',
    ctaStart: 'Inizia il tuo progetto',
    ctaWork: 'Guarda i lavori',
    available: 'Disponibili per nuovi progetti',
    rating: (value: string, count: number) => `${value} su Google, ${count} recensioni`,
    code: 'Estratto del codice del nostro modulo di richiesta preventivo.',
    preview: 'Anteprima',
    open: 'Prova il modulo di richiesta preventivo',
    capCode: 'codice',
    capProduct: 'prodotto: provalo',
  },
  en: {
    h1a: 'Web agency',
    h1b: 'in Padova, Italy.',
    lead: 'Websites, e-commerce and platforms written line by line. No templates, no WordPress: the code stays yours.',
    ctaStart: 'Start your project',
    ctaWork: 'See the work',
    available: 'Available for new projects',
    rating: (value: string, count: number) => `${value} on Google, ${count} reviews`,
    code: 'Code excerpt from our quote request form.',
    preview: 'Preview',
    open: 'Try the quote request form',
    capCode: 'code',
    capProduct: 'product: try it',
  },
} as const;

type Line = { indent: number; text: string; short?: boolean };

// JSX tag names and brackets, attribute names, strings and {expressions};
// everything else is plain text (children, "=", spaces).
const TOKEN = /(<\/?[A-Za-z]+|\/?>|[A-Za-z]+(?==)|"[^"]*"|\{[^}]*\})/;

function tokenClass(token: string, next?: string) {
  if (token.startsWith('<') || /^\/?>$/.test(token)) return 'text-sky-400';
  if (token.startsWith('"')) return 'text-amber-300';
  if (token.startsWith('{')) return 'text-white/60';
  if (next?.startsWith('=')) return 'text-indigo-300';
  return token.trim() === '=' ? 'text-white/60' : 'text-white';
}

function CodeLine({ line }: { line: Line }) {
  const tokens = line.text.split(TOKEN).filter(Boolean);
  return (
    <span className={line.short ? 'block' : 'hidden md:block'}>
      {/* Phones show the short excerpt one level shallower. */}
      {line.indent > 0 && <span className={line.short ? 'max-md:hidden' : undefined}>{'  '}</span>}
      {'  '.repeat(Math.max(0, line.indent - 1))}
      {tokens.map((token, i) => (
        <span key={i} className={tokenClass(token, tokens[i + 1])}>
          {token}
        </span>
      ))}
    </span>
  );
}

// Code and preview side by side from xl; stacked (code above) below that.
const SPLIT = 'xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]';

async function CodeWindow({ locale, copy }: { locale: Locale; copy: (typeof COPY)[Locale] }) {
  const t = await getTranslations({ locale, namespace: 'quoteDialog' });
  const title = t('title');
  const service = t('form.service');
  const budget = t('form.budget');
  const submit = t('form.submit');

  const lines: Line[] = [
    { indent: 0, text: '<DialogTitle>' },
    { indent: 1, text: title },
    { indent: 0, text: '</DialogTitle>' },
    { indent: 0, text: '<form onSubmit={handleSubmit}>' },
    { indent: 1, text: '<Select name="service"', short: true },
    { indent: 2, text: `placeholder="${service}" />`, short: true },
    { indent: 1, text: '<Input name="budget"', short: true },
    { indent: 2, text: `placeholder="${budget}" />`, short: true },
    { indent: 1, text: '<Button type="submit">' },
    { indent: 2, text: submit },
    { indent: 1, text: '</Button>' },
    { indent: 0, text: '</form>' },
  ];

  return (
    <figure data-nosnippet className="hero-window w-full max-w-[640px] lg:ml-auto">
      <div className="overflow-hidden rounded-2xl bg-[#0E1F3B] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div aria-hidden className={`grid border-b border-white/[0.08] font-mono text-xs text-white/55 ${SPLIT}`}>
          <span className="px-4 py-3 sm:px-5 xl:px-4 2xl:px-5">quote-dialog.tsx</span>
          <span className="hidden px-4 py-3 text-right xl:block">{copy.preview}</span>
        </div>

        <div className={`grid ${SPLIT}`}>
          <div role="img" aria-label={copy.code} className="min-w-0">
            <pre className="overflow-hidden whitespace-pre px-4 py-5 font-mono text-[12px] leading-[1.75] text-white/75 sm:px-5 sm:text-[12.5px] xl:px-4 xl:py-6 xl:text-[12px] 2xl:px-5 2xl:text-[13px]">
              <code>
                {lines.map((line, i) => (
                  <CodeLine key={i} line={line} />
                ))}
              </code>
            </pre>
          </div>

          <ClientMessages locale={locale} namespaces={['quoteDialog', 'serverActions']}>
            <HeroQuotePreview
              label={copy.open}
              className="group relative block w-full min-w-0 overflow-hidden bg-white text-left text-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-400"
            >
              <span aria-hidden className="hero-render block px-5 py-6 sm:px-6 xl:py-7">
                <span className="block font-display text-xl font-extrabold leading-tight tracking-[-0.03em]">
                  {title}
                </span>
                <span className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <span className="flex h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 text-[13.5px] text-slate-400 shadow-sm transition-colors group-hover:border-slate-300">
                    <span className="truncate">{service}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                  </span>
                  <span className="flex h-11 items-center rounded-xl border border-slate-200 px-3.5 text-[13.5px] text-slate-400 shadow-sm transition-colors group-hover:border-slate-300">
                    <span className="truncate">{budget}</span>
                  </span>
                </span>
                <span className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors group-hover:bg-primary/90">
                  {submit}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
              <span aria-hidden className="hero-scan" />
            </HeroQuotePreview>
          </ClientMessages>
        </div>
      </div>

      <figcaption aria-hidden className={`mt-3 grid px-1 font-mono text-xs text-white/50 ${SPLIT}`}>
        <span className="hidden xl:block">{copy.capCode}</span>
        <span className="text-right xl:pl-3 xl:text-left">{copy.capProduct}</span>
      </figcaption>
    </figure>
  );
}

export async function HeroSection({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  const rating = await getAggregateRating(locale).catch(() => null);
  const ratingText = rating
    ? copy.rating(
        rating.ratingValue.toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
        rating.reviewCount,
      )
    : null;

  return (
    <section id="hero" className="relative overflow-hidden bg-navy text-white">
      <HeroPointer targetId="hero" />
      <div className="container relative mx-auto grid gap-14 px-5 pb-20 pt-32 md:px-8 lg:min-h-[92svh] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24 lg:pt-36">
        {/* ── Statement ─────────────────────────────────────────────────── */}
        <div className="min-w-0 lg:col-span-6">
          <h1 className="font-display text-[3.25rem] font-extrabold leading-[0.93] tracking-[-0.035em] sm:text-7xl lg:text-[4.6rem] xl:text-[5.6rem]">
            {copy.h1a} <span className="block">{copy.h1b}</span>
          </h1>

          <p className="mt-8 max-w-[33rem] text-lg leading-relaxed text-white/70 sm:text-xl sm:leading-relaxed">
            {copy.lead}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-[52px] px-7 text-base font-semibold">
              <Link href={getLocalizedPath('/inizia', locale)}>{copy.ctaStart}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-[52px] border-white/25 bg-transparent px-7 text-base font-semibold text-white hover:border-white hover:bg-white hover:text-navy"
            >
              <Link href="#lavori">{copy.ctaWork}</Link>
            </Button>
          </div>

          {/* Trust line — the rating is real or absent, never invented. */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {copy.available}
            </span>
            {rating && ratingText && (
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(rating.ratingValue)
                          ? 'h-3.5 w-3.5 fill-amber-400 text-amber-400'
                          : 'h-3.5 w-3.5 text-white/25'
                      }
                    />
                  ))}
                </span>
                {ratingText}
              </span>
            )}
          </div>
        </div>

        {/* ── Code → product ────────────────────────────────────────────── */}
        <div className="min-w-0 lg:col-span-6">
          <CodeWindow locale={locale} copy={copy} />
        </div>
      </div>
      <SectionEdge shape="arc" edge="bottom" />
    </section>
  );
}
