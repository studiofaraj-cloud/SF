import Link from 'next/link';
import { Bell, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAggregateRating } from '@/lib/google-reviews';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import { HeroPointer } from './hero-pointer';

/**
 * HOMEPAGE HERO — "interfacce". Server component.
 *
 * Left: the static, keyword-bearing <h1> ("agenzia web a Padova", the term the
 * homepage owns in src/lib/seo-keywords.ts, and the page's only h1), the
 * pitch, the calls to action and the real Google rating.
 *
 * Right: fragments of the kind of business software the studio builds — a job
 * tracker, a payment received, a new quote request, a performance score. They
 * are illustrative, so the group is one described image for assistive tech
 * (role="img") and data-nosnippet keeps Google from quoting them.
 *
 * Motion: one CSS entrance (cards rise in, bars and the score fill) whose end
 * state is the default, so reduced motion, no-JS and crawlers get the finished
 * frame; no text in the left column animates (LCP is the first paint). The
 * only JS is HeroPointer, which adds a little depth on mouse move.
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
    ui: {
      label: 'Esempi di software su misura: gestione commesse, pagamenti online e richieste di preventivo.',
      jobs: 'Commesse',
      active: '12 attive',
      search: 'Cerca commessa',
      cols: ['Commessa', 'Stato', 'Avanzamento'],
      rows: [
        ['Cantiere Via Roma 14', 'In corso'],
        ['Catalogo showroom', 'In revisione'],
        ['Portale clienti', 'Consegnato'],
        ['Manutenzione annuale', 'Nuovo'],
      ],
      request: 'Nuova richiesta di preventivo',
      requestMeta: 'Sito web aziendale, 2 minuti fa',
      paid: 'Pagamento ricevuto',
      amount: '€ 1.240,00',
      paidMeta: 'Acconto, carta •••• 4242',
      score: 'Prestazioni',
    },
  },
  en: {
    h1a: 'Web agency',
    h1b: 'in Padova, Italy.',
    lead: 'Websites, e-commerce and platforms written line by line. No templates, no WordPress: the code stays yours.',
    ctaStart: 'Start your project',
    ctaWork: 'See the work',
    available: 'Available for new projects',
    rating: (value: string, count: number) => `${value} on Google, ${count} reviews`,
    ui: {
      label: 'Examples of custom software: job tracking, online payments and quote requests.',
      jobs: 'Jobs',
      active: '12 active',
      search: 'Search jobs',
      cols: ['Job', 'Status', 'Progress'],
      rows: [
        ['Via Roma 14 renovation', 'In progress'],
        ['Showroom catalogue', 'In review'],
        ['Client portal', 'Delivered'],
        ['Annual maintenance', 'New'],
      ],
      request: 'New quote request',
      requestMeta: 'Company website, 2 minutes ago',
      paid: 'Payment received',
      amount: '€1,240.00',
      paidMeta: 'Deposit, card •••• 4242',
      score: 'Performance',
    },
  },
} as const;

// Progress and status colour per job row (same order as COPY.ui.rows).
const ROW_STYLE = [
  { pct: 72, pill: 'bg-blue-50 text-blue-600', bar: 'bg-blue-600' },
  { pct: 48, pill: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
  { pct: 100, pill: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  { pct: 12, pill: 'bg-slate-100 text-slate-500', bar: 'bg-slate-400' },
] as const;

const CARD_SHADOW = 'shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]';

function InterfaceStage({ ui }: { ui: (typeof COPY)[Locale]['ui'] }) {
  return (
    <div
      role="img"
      aria-label={ui.label}
      data-nosnippet
      className="relative mx-auto h-[440px] w-full max-w-[600px] sm:h-[540px] lg:mr-0"
    >
      {/* Job tracker */}
      <div
        className={`ui-card absolute left-0 top-16 w-[94%] rounded-2xl bg-white p-4 text-slate-900 sm:top-[70px] sm:w-[78%] sm:p-5 ${CARD_SHADOW}`}
        style={{ '--z': 0.35, '--d': '0.15s' } as React.CSSProperties}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <b className="font-display text-lg font-bold tracking-[-0.01em]">{ui.jobs}</b>
          <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">{ui.active}</span>
          <span className="ml-auto hidden w-36 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-400 sm:block lg:hidden xl:block">
            {ui.search}
          </span>
        </div>
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr] gap-2.5 border-b border-slate-100 py-1.5 text-[11px] text-slate-400 sm:grid-cols-[1.6fr_1fr_1.1fr_2.25rem] lg:grid-cols-[1.5fr_1fr_0.8fr] xl:grid-cols-[1.6fr_1fr_1.1fr_2.25rem]">
          <span>{ui.cols[0]}</span>
          <span>{ui.cols[1]}</span>
          <span className="sm:col-span-2 lg:col-span-1 xl:col-span-2">{ui.cols[2]}</span>
        </div>
        {ui.rows.map(([name, status], i) => (
          <div
            key={name}
            className="grid grid-cols-[1.5fr_1fr_0.8fr] items-center gap-2.5 border-b border-slate-100 py-2.5 text-[12.5px] last:border-0 sm:grid-cols-[1.6fr_1fr_1.1fr_2.25rem] sm:text-[13px] lg:grid-cols-[1.5fr_1fr_0.8fr] xl:grid-cols-[1.6fr_1fr_1.1fr_2.25rem]"
          >
            <span className="truncate font-medium">{name}</span>
            <span className={`justify-self-start whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROW_STYLE[i].pill}`}>
              {status}
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <span className={`ui-bar block h-full rounded-full ${ROW_STYLE[i].bar}`} style={{ width: `${ROW_STYLE[i].pct}%` }} />
            </span>
            <span className="hidden text-right text-xs text-slate-500 sm:block lg:hidden xl:block">{ROW_STYLE[i].pct}%</span>
          </div>
        ))}
      </div>

      {/* New quote request */}
      <div
        className={`ui-card absolute right-0 top-0 flex w-[84%] items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-slate-900 sm:w-[54%] lg:w-[68%] xl:w-[54%] ${CARD_SHADOW}`}
        style={{ '--z': 1, '--d': '0.45s' } as React.CSSProperties}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
          <Bell className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0">
          <b className="block truncate text-[13.5px] font-semibold">{ui.request}</b>
          <small className="block truncate text-xs text-slate-500">{ui.requestMeta}</small>
        </span>
      </div>

      {/* Payment received */}
      <div
        className={`ui-card absolute bottom-0 right-0 w-[58%] rounded-2xl bg-white p-4 text-slate-900 sm:bottom-auto sm:right-[2%] sm:top-[300px] sm:w-[46%] sm:p-5 ${CARD_SHADOW}`}
        style={{ '--z': 0.8, '--d': '0.65s' } as React.CSSProperties}
      >
        <span className="mb-2.5 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white sm:h-8 sm:w-8">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <small className="block text-xs text-slate-500 sm:text-[12.5px]">{ui.paid}</small>
        <strong className="my-0.5 block font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-[1.85rem]">
          {ui.amount}
        </strong>
        <small className="block text-[11.5px] text-slate-500 sm:text-xs">{ui.paidMeta}</small>
      </div>

      {/* Performance score */}
      <div
        className="ui-card absolute bottom-5 left-0 flex w-[44%] items-center gap-3 rounded-2xl bg-[#0E1F3B] p-3.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)] sm:bottom-auto sm:left-[7%] sm:top-[390px] sm:w-[37%] sm:p-4"
        style={{ '--z': 0.6, '--d': '0.85s' } as React.CSSProperties}
      >
        <svg viewBox="0 0 80 80" className="h-12 w-12 shrink-0 sm:h-16 sm:w-16" aria-hidden>
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
          <circle
            className="ui-arc"
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="#34D399"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="201"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span>
          <strong className="block font-display text-2xl font-extrabold">100</strong>
          <small className="text-xs text-white/60 sm:text-[12.5px]">{ui.score}</small>
        </span>
      </div>
    </div>
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

        {/* ── What we build ─────────────────────────────────────────────── */}
        <div className="min-w-0 lg:col-span-6">
          <InterfaceStage ui={copy.ui} />
        </div>
      </div>
    </section>
  );
}
