import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { HeroRotatingWord } from '@/components/site/hero-rotating-word';
import { HeroQuoteButton } from '@/components/site/hero-quote-button';
import { getProjectsAction } from '@/lib/actions';
import { getAggregateRating } from '@/lib/google-reviews';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

/**
 * HOMEPAGE HERO — server component.
 *
 * Replaces a hero that was rendered client-only (`dynamic(..., { ssr: false })`),
 * which meant none of the above-the-fold copy existed in the served HTML. The
 * workaround for that was a hidden keyword-stuffed <h1 class="sr-only">, which
 * is the pattern Google's spam policies describe. Both are gone: the real
 * headline is now the page's only <h1> and ships in the markup.
 *
 * Three deliberate changes from the old design:
 *
 *  1. The <h1> is static and leads on "agenzia web a Padova" — the term the
 *     homepage owns in src/lib/seo-keywords.ts. It previously read "Costruiamo
 *     siti che [crescono|convertono|scalano|ispirano]", which carried no keyword
 *     and changed every 2.4s. The rotation moved to the subhead.
 *     Note it does NOT say "realizzazione siti web": that term belongs to
 *     /servizi/sviluppo-web, and two pages chasing it would split the signal.
 *
 *  2. Real delivered work replaces stock photography. For a web agency the work
 *     is the pitch, and the portfolio has nameable clients. One optimised image
 *     also costs far less than four full-bleed crossfading ones.
 *
 *  3. Decoration cut from six simultaneous systems (crossfade, Ken Burns,
 *     constellation, bottom fade, three blur orbs, four floating shapes) to a
 *     single glow. The old stack competed with itself and was expensive to
 *     paint on mobile.
 */

const ROTATING_IT = ['crescono', 'convertono', 'scalano', 'durano'] as const;
const ROTATING_EN = ['grow', 'convert', 'scale', 'last'] as const;

const COPY = {
  it: {
    badge: 'Padova, IT',
    since: 'Studio di sviluppo web',
    h1a: 'Agenzia web',
    h1b: 'a Padova.',
    leadBefore: 'Siti, e-commerce e piattaforme che',
    leadAfter: 'Scritti riga per riga, senza template e senza WordPress — il codice resta tuo.',
    ctaStart: 'Inizia il tuo progetto',
    ctaProjects: 'Guarda i lavori',
    ctaQuote: 'Oppure richiedi un preventivo',
    available: 'Disponibili per nuovi progetti',
    worksTitle: 'Lavori recenti',
    allWorks: 'Tutti i progetti',
    reviews: (n: number) => `${n} recensioni Google`,
  },
  en: {
    badge: 'Padova, Italy',
    since: 'Web development studio',
    h1a: 'Web agency',
    h1b: 'in Padova, Italy.',
    leadBefore: 'Websites, e-commerce and platforms that',
    leadAfter: 'Written line by line — no templates, no WordPress, and the code stays yours.',
    ctaStart: 'Start your project',
    ctaProjects: 'See the work',
    ctaQuote: 'Or request a quote',
    available: 'Available for new projects',
    worksTitle: 'Recent work',
    allWorks: 'All projects',
    reviews: (n: number) => `${n} Google reviews`,
  },
} as const;

function formatCategory(c?: string) {
  if (!c) return '';
  return c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ');
}

export async function HeroSection({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const rotating = locale === 'en' ? ROTATING_EN : ROTATING_IT;

  // Both are cached (getProjectsAction via unstable_cache, reviews via React
  // cache), so this shares work with the sections further down the page rather
  // than issuing fresh reads.
  let featured: Project[] = [];
  try {
    const all = await getProjectsAction();
    featured = all.filter((p) => p.published && p.featuredImage).slice(0, 3);
  } catch {
    featured = [];
  }

  const rating = await getAggregateRating(locale).catch(() => null);

  return (
    <section className="relative overflow-hidden bg-[#0a1628] text-white">
      {/* Single accent glow. The previous hero stacked three of these plus a
          constellation texture and four floating shapes. */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1628]" />

      <div className="container relative z-10 mx-auto px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32 lg:min-h-[88svh] lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── Statement ─────────────────────────────────────────────── */}
          <div className="lg:col-span-6">
            <Badge className="badge-futuristic mb-6 gap-2 px-4 py-2 text-sm">
              <span>{copy.since}</span>
              <span className="opacity-50">·</span>
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{copy.badge}</span>
            </Badge>

            {/* The page's only <h1>. Static, keyword-bearing, in the HTML. */}
            <h1 className="text-5xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
              {copy.h1a}
              <span className="block text-primary">{copy.h1b}</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75">
              {copy.leadBefore} <HeroRotatingWord words={rotating} />.{' '}
              {copy.leadAfter}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="group neon-glow-intense min-h-[52px] px-8 font-semibold">
                <Link href={getLocalizedPath('/inizia', locale)}>
                  {copy.ctaStart}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-[52px] border-2 border-white/25 bg-white/5 px-8 font-semibold text-white backdrop-blur-md hover:border-primary hover:text-primary"
              >
                <Link href={getLocalizedPath('/projects', locale)}>{copy.ctaProjects}</Link>
              </Button>
            </div>

            <div className="mt-7">
              <HeroQuoteButton label={copy.ctaQuote} />
            </div>

            {/* Trust strip — the rating is real or absent, never invented. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {copy.available}
              </span>
              {rating && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-white">{rating.ratingValue}</span>
                    <span>{copy.reviews(rating.reviewCount)}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── The work ──────────────────────────────────────────────── */}
          {featured.length > 0 && (
            <div className="lg:col-span-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                  {copy.worksTitle}
                </h2>
                <Link
                  href={getLocalizedPath('/projects', locale)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {copy.allWorks}
                </Link>
              </div>

              <ul className="space-y-3">
                {featured.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      href={getLocalizedPath(`/projects/${p.slug}`, locale)}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-white/[0.07] sm:gap-5 sm:p-4"
                    >
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-24 sm:w-36">
                        {/* All three cards are above the fold, so none should be
                            lazy — next/image defaults to loading="lazy", which
                            defers images the visitor can already see. Only the
                            first gets `priority` (a preload): preloading all
                            three would have them compete with the LCP element. */}
                        <FirebaseImage
                          src={p.featuredImage}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 112px, 144px"
                          {...(i === 0 ? { priority: true } : { loading: 'eager' as const })}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium uppercase tracking-wide text-primary">
                          {p.clientName || formatCategory(p.category)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
                          {p.title}
                        </p>
                        {p.year && <p className="mt-1 text-xs text-white/45">{p.year}</p>}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
