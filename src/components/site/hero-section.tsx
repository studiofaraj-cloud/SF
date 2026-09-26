import Link from 'next/link';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAggregateRating } from '@/lib/google-reviews';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';

/**
 * HOMEPAGE HERO — "editor tipografico". Server component, no client JavaScript.
 *
 * Set like a file open in a code editor: numbered lines in a gutter, the
 * headline as the code, and a cursor after it that blinks three times (the
 * studio writes its sites "riga per riga"). Rows are logical lines numbered
 * with editor soft-wrap: a paragraph that wraps keeps a single number. Blank
 * numbered lines are the vertical rhythm, not margins.
 *
 * Numbers stay on their lines without JS: each gutter cell uses the same
 * font-size/line-height as the content it labels and holds a box exactly one
 * line tall (h-[<leading>em]), with the small number centred inside it.
 *
 * The <h1> is static, keyword-bearing ("agenzia web a Padova", the term the
 * homepage owns in src/lib/seo-keywords.ts) and the page's only h1. Nothing
 * textual is animated, so the first paint is final (LCP); the caret is
 * aria-hidden and has no text, and blinks only when motion is allowed.
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
  },
  en: {
    h1a: 'Web agency',
    h1b: 'in Padova, Italy.',
    lead: 'Websites, e-commerce and platforms written line by line. No templates, no WordPress: the code stays yours.',
    ctaStart: 'Start your project',
    ctaWork: 'See the work',
    available: 'Available for new projects',
    rating: (value: string, count: number) => `${value} on Google, ${count} reviews`,
  },
} as const;

// Type settings shared by each line and its gutter cell (see the note above).
const H1_TYPE = 'text-[clamp(3rem,9vw,8.5rem)] leading-[0.93]';
const LEAD_TYPE = 'text-lg leading-relaxed sm:text-xl';
const BLANK_LINE = 'h-6 md:h-9';
const CONTENT = 'min-w-0 pl-4 md:pl-8';

/**
 * One editor line number. `box` sets the height of the line it labels, in the
 * gutter cell's own font-size, so the number sits on that line.
 */
function LineNumber({ n, box, active = false }: { n: number; box: string; active?: boolean }) {
  return (
    <span aria-hidden className={`flex items-center justify-end pr-3 md:pr-4 ${box}`}>
      <span
        className={`font-mono text-[11px] tabular-nums md:text-[13px] ${
          active ? 'text-foreground' : 'text-muted-foreground/60'
        }`}
      >
        {n}
      </span>
    </span>
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
    <section className="relative border-b border-border bg-background">
      <div className="container relative mx-auto px-5 md:px-8">
        {/* Gutter rule, full height of the hero (padding + gutter width). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[3.25rem] w-px bg-border md:left-[5rem] lg:left-[6rem]"
        />

        <div className="grid grid-cols-[2rem_minmax(0,1fr)] grid-rows-[repeat(9,auto)_1fr] pb-16 pt-28 md:grid-cols-[3rem_minmax(0,1fr)] md:pb-24 md:pt-36 lg:min-h-[86svh] lg:grid-cols-[4rem_minmax(0,1fr)]">
          {/* 1 */}
          <LineNumber n={1} box={BLANK_LINE} />
          <div className={BLANK_LINE} />

          {/* 2–3 — the headline; the cursor rests on line 3 */}
          <div className={H1_TYPE}>
            <LineNumber n={2} box="h-[0.93em]" />
            <LineNumber n={3} box="h-[0.93em]" active />
          </div>
          <h1 className={`${H1_TYPE} ${CONTENT} font-display font-extrabold tracking-[-0.04em] text-foreground`}>
            {copy.h1a}{' '}
            <span className="block">
              {copy.h1b}
              <span
                aria-hidden
                className="hero-caret ml-[0.05em] inline-block h-[0.74em] w-[0.075em] bg-primary"
              />
            </span>
          </h1>

          {/* 4 */}
          <LineNumber n={4} box={BLANK_LINE} />
          <div className={BLANK_LINE} />

          {/* 5 — lead (soft-wrapped: one number) */}
          <div className={LEAD_TYPE}>
            <LineNumber n={5} box="h-[1.625em]" />
          </div>
          <p className={`${LEAD_TYPE} ${CONTENT} max-w-[40rem] text-muted-foreground`}>{copy.lead}</p>

          {/* 6 */}
          <LineNumber n={6} box={BLANK_LINE} />
          <div className={BLANK_LINE} />

          {/* 7 — calls to action */}
          <LineNumber n={7} box="h-[52px]" />
          <div className={`${CONTENT} flex flex-col gap-3 sm:flex-row`}>
            <Button asChild size="lg" className="min-h-[52px] px-7 text-base font-semibold">
              <Link href={getLocalizedPath('/inizia', locale)}>{copy.ctaStart}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-[52px] px-7 text-base font-semibold">
              <Link href="#lavori">{copy.ctaWork}</Link>
            </Button>
          </div>

          {/* 8 */}
          <LineNumber n={8} box={BLANK_LINE} />
          <div className={BLANK_LINE} />

          {/* 9 — trust line: the rating is real or absent, never invented */}
          <div className="text-sm">
            <LineNumber n={9} box="h-5" />
          </div>
          <div className={`${CONTENT} flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-muted-foreground`}>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                          : 'h-3.5 w-3.5 text-muted-foreground/30'
                      }
                    />
                  ))}
                </span>
                {ratingText}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
