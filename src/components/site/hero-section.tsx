import Link from 'next/link';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { getProjectsAction } from '@/lib/actions';
import { getAggregateRating } from '@/lib/google-reviews';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

/**
 * HOMEPAGE HERO — server component, no client JavaScript.
 *
 * The <h1> is static, keyword-bearing ("agenzia web a Padova", the term the
 * homepage owns in src/lib/seo-keywords.ts) and the page's only h1.
 *
 * The right-hand side shows what the studio actually does: a real delivered
 * project "builds" in front of the visitor. The build log is generated from
 * that project's Firestore data (client, stack, measured results, live
 * domain), so it changes when the portfolio does and never invents a number.
 * The sequence is CSS-only and plays once (see .build-line / .build-render in
 * globals.css); without motion the visitor simply sees the finished frame.
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
    client: 'Cliente',
    stack: 'Stack',
    live: 'Online',
    caseStudy: 'Leggi il caso studio',
  },
  en: {
    h1a: 'Web agency',
    h1b: 'in Padova, Italy.',
    lead: 'Websites, e-commerce and platforms written line by line. No templates, no WordPress: the code stays yours.',
    ctaStart: 'Start your project',
    ctaWork: 'See the work',
    available: 'Available for new projects',
    rating: (value: string, count: number) => `${value} on Google, ${count} reviews`,
    client: 'Client',
    stack: 'Stack',
    live: 'Live',
    caseStudy: 'Read the case study',
  },
} as const;

/** "A-Infissi" → "a-infissi": a folder-style handle for the build log. */
function handle(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hostOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export async function HeroSection({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  // Shares the cached getProjectsAction/getAggregateRating results with the
  // sections further down the page rather than issuing fresh reads.
  let showcase: Project | null = null;
  try {
    const published = (await getProjectsAction()).filter(
      (p: Project) => p.published && p.featuredImage,
    );
    // Prefer the most recent project with measured results; fall back to the
    // most recent one.
    showcase = published.find((p: Project) => p.metrics?.length) ?? published[0] ?? null;
  } catch {
    showcase = null;
  }

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

  const host = hostOf(showcase?.projectUrl);
  const log = showcase
    ? [
        showcase.clientName && { k: copy.client, v: showcase.clientName },
        showcase.technologies?.length && {
          k: copy.stack,
          v: showcase.technologies.slice(0, 3).join(', '),
        },
        ...(showcase.metrics ?? []).slice(0, 2).map((m) => ({ k: m.label, v: m.value })),
        host && { k: copy.live, v: host },
      ].filter((l): l is { k: string; v: string } => Boolean(l))
    : [];
  // The render pass starts once the last log line has printed.
  const renderDelay = `${250 + (log.length + 1) * 120 + 200}ms`;

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />

      <div className="container relative mx-auto grid gap-14 px-5 pb-20 pt-32 md:px-8 lg:min-h-[92svh] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24 lg:pt-36">
        {/* ── Statement ─────────────────────────────────────────────────── */}
        <div className="min-w-0 lg:col-span-6">
          <h1 className="font-display text-[3.35rem] font-extrabold leading-[0.93] tracking-[-0.035em] sm:text-7xl lg:text-[4.6rem] xl:text-[5.6rem]">
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

        {/* ── The work, building ────────────────────────────────────────── */}
        {showcase && (
          <figure className="relative min-w-0 lg:col-span-6 lg:pl-4">
            {/* Build log */}
            <div className="w-[94%] max-w-[32rem] rounded-xl border border-white/10 bg-[#0e1f3b] font-mono text-[12.5px] leading-relaxed shadow-2xl sm:w-[84%] sm:text-[13px]">
              <div className="border-b border-white/10 px-4 py-2.5 text-white/40">
                progetti/{handle(showcase.clientName || showcase.slug)}
              </div>
              <div className="px-4 pb-10 pt-4 sm:pb-12">
                <p className="build-line text-white/45" style={{ '--i': 0 } as React.CSSProperties}>
                  $ npm run build
                </p>
                {/* Rows share the label column through subgrid, so labels size
                    to the longest one and only values truncate. Each row stays
                    its own box so it can animate on its own. */}
                <dl className="mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-5 gap-y-1.5">
                  {log.map((line, i) => (
                    <div
                      key={line.k}
                      className="build-line col-span-full grid grid-cols-subgrid"
                      style={{ '--i': i + 1 } as React.CSSProperties}
                    >
                      <dt className="text-white/45">
                        <span aria-hidden className="mr-1.5 text-sky-400">
                          ✓
                        </span>
                        {line.k}
                      </dt>
                      <dd className="min-w-0 truncate text-white">{line.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* The finished site */}
            <div
              className="build-render relative -mt-7 ml-auto w-[94%] overflow-hidden rounded-xl border border-white/15 bg-white shadow-[0_40px_90px_-25px_rgba(0,0,0,0.7)] sm:-mt-9 sm:w-[86%]"
              style={{ '--render-delay': renderDelay } as React.CSSProperties}
            >
              <div className="flex items-center border-b border-black/5 bg-[#eef1f6] px-3 py-2">
                <span className="truncate rounded-md bg-white px-3 py-1 font-mono text-[11.5px] text-slate-500">
                  {host ?? showcase.clientName}
                </span>
              </div>
              <div className="relative aspect-[16/10] bg-slate-100">
                <FirebaseImage
                  src={showcase.featuredImage}
                  alt={showcase.title}
                  fill
                  priority
                  sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 94vw"
                  className="object-cover object-top"
                />
              </div>
            </div>

            <figcaption className="ml-auto mt-5 flex w-[94%] flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm sm:w-[86%]">
              <span className="text-white/55">{showcase.title}</span>
              <Link
                href={getLocalizedPath(`/projects/${showcase.slug}`, locale)}
                className="font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                {copy.caseStudy}
              </Link>
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
