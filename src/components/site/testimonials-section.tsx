'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PlaceSummary, GoogleReview } from '@/lib/google-reviews';

// ─── Avatar ───────────────────────────────────────────────────────────────────
function ReviewerAvatar({ review }: { review: GoogleReview }) {
  const [imgError, setImgError] = useState(false);

  const words = review.authorDisplayName.trim().split(/\s+/);
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : (words[0]?.[0] ?? '?').toUpperCase();

  const hue = (
    review.authorDisplayName.charCodeAt(0) * 37 +
    (review.authorDisplayName.charCodeAt(1) ?? 0) * 17
  ) % 360;

  if (review.authorPhotoUri && !imgError) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-border flex-shrink-0">
        <Image
          src={review.authorPhotoUri}
          alt={review.authorDisplayName}
          width={40}
          height={40}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-border"
      style={{ background: `hsl(${hue},55%,45%)` }}
      aria-label={review.authorDisplayName}
    >
      {initials}
    </div>
  );
}

// Google "G" logo (TOS required per-card attribution)
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" aria-label="Google Review" className="w-4 h-4 flex-shrink-0 opacity-60" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Single card ──────────────────────────────────────────────────────────────
function ReviewCard({ review, compact = false }: { review: GoogleReview; compact?: boolean }) {
  return (
    <div
      className={`
        flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5
        ${compact ? 'w-[300px] flex-shrink-0' : 'w-full'}
        hover:border-primary/25 hover:shadow-md hover:shadow-primary/5 transition-all duration-300
      `}
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: review.rating }).map((_, i) => (
          <span key={i} aria-hidden="true" className="text-amber-400 text-sm leading-none select-none">★</span>
        ))}
      </div>

      {/* Review text */}
      <p className="font-quote italic text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-4">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Footer: avatar + name + time + Google G */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <ReviewerAvatar review={review} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {review.authorUri ? (
                <a
                  href={review.authorUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary inline-flex items-center gap-1"
                >
                  {review.authorDisplayName}
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              ) : (
                review.authorDisplayName
              )}
            </p>
            {review.relativeTime && (
              <p className="text-[10px] text-muted-foreground/70">{review.relativeTime}</p>
            )}
          </div>
        </div>
        <GoogleG />
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function TestimonialsSection({ place }: { place: PlaceSummary }) {
  const t = useTranslations('home.testimonials');
  const reviews = place.reviews;

  // Duplicate for seamless infinite loop
  const marqueeItems = [...reviews, ...reviews];

  // Speed: ~100px per second regardless of how many cards there are
  // Each card is ~316px (300 + 16 gap). Total track = reviews.length * 316px.
  const totalPx = reviews.length * 316;
  const durationSeconds = Math.max(20, Math.round(totalPx / 90));

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="container px-4 md:px-8 text-center mb-10 md:mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
            {t('badge')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-foreground">{t('title')} </span>
            <span className="text-primary">{t('titleHighlight')}</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Aggregate rating */}
          {place.isLive && place.totalRatings > 0 && (
            <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/25">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} aria-hidden="true" className="text-amber-400 text-sm leading-none select-none">★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{place.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({place.totalRatings} recensioni su Google)
              </span>
            </div>
          )}
        </div>

        {/* ── Desktop: infinite marquee ─────────────────────────────────── */}
        <div className="hidden md:block">
          {/* Fade edges */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />

            {/* Marquee track */}
            <div className="overflow-hidden">
              <div
                className="marquee-track flex gap-4 w-max py-2"
                style={{ '--marquee-duration': `${durationSeconds}s` } as React.CSSProperties}
              >
                {marqueeItems.map((review, i) => (
                  <ReviewCard key={`${review.authorDisplayName}-${i}`} review={review} compact />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical stack ────────────────────────────────────── */}
        <div className="md:hidden container px-4 flex flex-col gap-4">
          {reviews.map((review, i) => (
            <ReviewCard key={`${review.authorDisplayName}-${i}`} review={review} />
          ))}
        </div>

        {/* Google attribution footer */}
        {place.isLive && (
          <div className="container px-4 md:px-8 flex justify-center mt-8">
            <a
              href="https://www.google.com/maps/place/?q=place_id:ChIJV_YxeITzBAERefznEKaDrkc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Vedi tutte le recensioni su Google</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
