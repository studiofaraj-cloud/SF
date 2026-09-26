import { Star } from 'lucide-react';
import type { PlaceSummary, GoogleReview } from '@/lib/google-reviews';
import type { Locale } from '@/i18n/config';
import { ReviewAvatar } from './review-avatar';

const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJV_YxeITzBAERefznEKaDrkc';
// Longest review that still reads well as the large pull-quote.
const FEATURED_MAX_CHARS = 460;

const COPY = {
  it: {
    title: 'Cosa dicono i clienti',
    rating: (value: string, count: number) => `${value} su Google, da ${count} recensioni`,
    all: 'Leggi tutte le recensioni su Google',
    more: 'Altre recensioni',
    google: 'Recensione Google',
  },
  en: {
    title: 'What clients say',
    rating: (value: string, count: number) => `${value} on Google, from ${count} reviews`,
    all: 'Read all reviews on Google',
    more: 'More reviews',
    google: 'Google review',
  },
} as const;

// Google "G" — per-review attribution for Google-sourced reviews.
function GoogleG({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label} className="h-4 w-4 shrink-0" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Stars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < Math.round(rating) ? `${size} fill-amber-400 text-amber-400` : `${size} text-muted-foreground/30`}
        />
      ))}
    </span>
  );
}

function Reviewer({ review, googleLabel }: { review: GoogleReview; googleLabel: string }) {
  const name = review.authorUri ? (
    <a href={review.authorUri} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {review.authorDisplayName}
    </a>
  ) : (
    review.authorDisplayName
  );
  return (
    <figcaption className="flex items-center gap-3">
      <ReviewAvatar name={review.authorDisplayName} photo={review.authorPhotoUri} />
      <span className="min-w-0 flex-1 text-sm">
        <span className="block truncate font-semibold text-foreground">{name}</span>
        {review.relativeTime && <span className="block text-muted-foreground">{review.relativeTime}</span>}
      </span>
      <GoogleG label={googleLabel} />
    </figcaption>
  );
}

/**
 * Reviews — server component. The most substantial review is set large; the
 * rest sit in a row the visitor scrolls themselves (no auto-moving marquee).
 */
export default function TestimonialsSection({ place, locale }: { place: PlaceSummary; locale: Locale }) {
  const copy = COPY[locale];
  const reviews = place.reviews;
  // Feature the most substantial review that still reads well set large.
  const readable = reviews.filter((r) => r.text.length <= FEATURED_MAX_CHARS);
  const featured = (readable.length ? readable : reviews).reduce((a, b) =>
    b.text.length > a.text.length ? b : a,
  );
  const others = reviews.filter((r) => r !== featured);
  const ratingValue = place.rating.toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section className="bg-secondary/50 py-20 md:py-28 lg:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <header className="grid gap-5 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:col-span-7 md:text-[3.4rem]">
            {copy.title}
          </h2>
          {place.isLive && place.totalRatings > 0 && (
            <p className="flex items-center gap-3 text-muted-foreground md:col-span-5 md:justify-end">
              <Stars rating={place.rating} />
              {copy.rating(ratingValue, place.totalRatings)}
            </p>
          )}
        </header>

        <figure className="mt-12 grid gap-8 border-t border-border pt-10 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <blockquote className="font-display text-[1.45rem] font-medium leading-snug tracking-[-0.015em] text-foreground md:text-[2rem] lg:col-span-9">
            “{featured.text}”
          </blockquote>
          <div className="lg:col-span-3 lg:self-end">
            <Reviewer review={featured} googleLabel={copy.google} />
          </div>
        </figure>

        {others.length > 0 && (
          <div
            role="region"
            aria-label={copy.more}
            tabIndex={0}
            className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:-mx-8 md:mt-20 md:px-8"
          >
            {others.map((r, i) => (
              <figure
                key={`${r.authorDisplayName}-${i}`}
                className="flex w-[82%] shrink-0 snap-start flex-col justify-between gap-6 rounded-xl border border-border bg-background p-6 sm:w-[21rem]"
              >
                <div>
                  <Stars rating={r.rating} size="h-3.5 w-3.5" />
                  <blockquote className="mt-3 line-clamp-6 leading-relaxed text-foreground/85">“{r.text}”</blockquote>
                </div>
                <Reviewer review={r} googleLabel={copy.google} />
              </figure>
            ))}
          </div>
        )}

        {place.isLive && (
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block font-medium text-foreground underline decoration-border decoration-2 underline-offset-[6px] transition-colors hover:decoration-primary"
          >
            {copy.all}
          </a>
        )}
      </div>
    </section>
  );
}
