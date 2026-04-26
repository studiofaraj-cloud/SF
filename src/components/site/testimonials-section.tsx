'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Quote, Star as StarIcon, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlaceSummary, GoogleReview } from '@/lib/google-reviews';

// Characters shown before the "Leggi tutto" button appears
const TRUNCATE_AT = 160;

interface TestimonialsSectionProps {
  place: PlaceSummary;
}

// ---------------------------------------------------------------------------
// Avatar: real Google photo or coloured initials circle
// ---------------------------------------------------------------------------
function ReviewerAvatar({ review }: { review: GoogleReview }) {
  const [imgError, setImgError] = useState(false);

  // Build initials: first letter of first name + first letter of last name
  const words = review.authorDisplayName.trim().split(/\s+/);
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : (words[0]?.[0] ?? '?').toUpperCase();

  if (review.authorPhotoUri && !imgError) {
    return (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
        <Image
          src={review.authorPhotoUri}
          alt={review.authorDisplayName}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Deterministic colour from name (so each person always gets the same colour)
  const hue = (review.authorDisplayName.charCodeAt(0) * 37 + (review.authorDisplayName.charCodeAt(1) ?? 0) * 17) % 360;

  return (
    <div
      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0 ring-2 ring-primary/30"
      style={{ background: `hsl(${hue},55%,45%)` }}
      aria-label={review.authorDisplayName}
    >
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single review card with expand / collapse
// ---------------------------------------------------------------------------
function ReviewCard({ review }: { review: GoogleReview }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = review.text.length > TRUNCATE_AT;
  const displayText =
    needsTruncation && !expanded
      ? review.text.slice(0, TRUNCATE_AT).trimEnd() + '…'
      : review.text;

  return (
    <Card className="flex flex-col justify-between relative overflow-hidden holographic-card neon-border group transition-all duration-500 hover:shadow-xl hover:shadow-primary/20">
      {/* Decorative quote icon */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 text-primary/15 group-hover:text-primary/35 transition-colors duration-300 pointer-events-none">
        <Quote className="w-8 h-8 md:w-10 md:h-10" />
      </div>

      <CardContent className="relative z-10 p-4 md:p-6 flex flex-col gap-3 flex-grow">
        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: review.rating }).map((_, i) => (
            <StarIcon
              key={i}
              className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
            />
          ))}
        </div>

        {/* Review text — Lora italic for an elegant, trustworthy feel */}
        <p className="font-quote text-sm md:text-[0.95rem] text-muted-foreground leading-relaxed italic flex-grow tracking-normal">
          &ldquo;{displayText}&rdquo;
        </p>

        {/* Read-more toggle */}
        {needsTruncation && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-expanded={expanded}
          >
            {expanded
              ? (<>Mostra meno <ChevronUp className="w-3 h-3" /></>)
              : (<>Leggi tutto <ChevronDown className="w-3 h-3" /></>)}
          </button>
        )}
      </CardContent>

      {/* Footer: author + Google logo */}
      <CardHeader className="relative z-10 pt-0 border-t border-primary/20 p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          {/* Avatar + name + time */}
          <div className="flex items-center gap-3 min-w-0">
            <ReviewerAvatar review={review} />
            <div className="min-w-0">
              <CardTitle className="text-sm md:text-base leading-tight">
                {review.authorUri ? (
                  <a
                    href={review.authorUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {review.authorDisplayName}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <span className="text-primary">{review.authorDisplayName}</span>
                )}
              </CardTitle>
              {review.relativeTime && (
                <p className="text-xs text-muted-foreground mt-0.5">{review.relativeTime}</p>
              )}
            </div>
          </div>

          {/* Google "G" logo — TOS required attribution per card */}
          <svg
            viewBox="0 0 24 24"
            aria-label="Google Review"
            className="w-5 h-5 flex-shrink-0 opacity-70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
      </CardHeader>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
export default function TestimonialsSection({ place }: TestimonialsSectionProps) {
  const t = useTranslations('home.testimonials');
  // Show at most 6 reviews (2 rows × 3 columns), newest first
  const reviews = place.reviews.slice(0, 6);

  return (
    <section className="relative w-full pt-16 sm:pt-24 md:pt-32 lg:pt-40 pb-24 sm:pb-32 md:pb-40 lg:pb-48">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      <div className="absolute inset-0 bg-constellation" />

      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape absolute top-[15%] left-[5%] w-20 h-20 border-2 border-primary/20 rotate-45" style={{ animationDelay: '0s' }} />
        <div className="floating-shape absolute top-[60%] right-[8%] w-16 h-16 border-2 border-primary/15 rounded-full" style={{ animationDelay: '2s' }} />
        <div className="floating-shape absolute bottom-[25%] left-[12%] w-12 h-12 bg-primary/5 rotate-12" style={{ animationDelay: '4s' }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{ left: `${20 + i * 20}%`, top: `${25 + (i % 2) * 40}%`, animationDelay: `${i * 2}s` }}
          />
        ))}
      </div>

      <div className="container relative z-10 px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <Badge className="badge-futuristic mb-4 md:mb-6">
            <Quote className="w-3 h-3 mr-2" />
            {t('badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
            <span className="text-foreground">{t('title')}</span>
            <span className="block text-primary mt-1 md:mt-2">{t('titleHighlight')}</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
            {t('subtitle')}
          </p>

          {/* Aggregate rating badge */}
          {place.isLive && place.totalRatings > 0 && (
            <div className="inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-full bg-amber-400/10 border border-amber-400/30">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{place.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({place.totalRatings} recensioni su Google)
              </span>
            </div>
          )}
        </div>

        {/* Reviews grid — all cards visible, no carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={`${review.authorDisplayName}-${index}`} review={review} />
          ))}
        </div>

        {/* Google attribution footer — TOS requirement */}
        {place.isLive && (
          <div className="flex justify-center mt-8">
            <a
              href={`https://www.google.com/maps/place/?q=place_id:ChIJV_YxeITzBAERefznEKaDrkc`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Vedi tutte le recensioni su Google Maps"
            >
              <span>Vedi tutte le recensioni su</span>
              <svg viewBox="0 0 74 24" aria-hidden="true" className="h-4 w-auto" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.24 8.19c0-.46-.04-.92-.1-1.36H4.8v2.58h2.5a2.14 2.14 0 0 1-.93 1.4v1.16h1.5c.88-.81 1.38-2 1.38-3.44v-.34z" fill="#4285F4"/>
                <path d="M4.8 12.8c1.24 0 2.29-.41 3.05-1.12L6.35 10.5c-.41.28-.94.44-1.55.44-1.19 0-2.2-.8-2.56-1.88H.66v1.2A4.59 4.59 0 0 0 4.8 12.8z" fill="#34A853"/>
                <path d="M2.24 9.07a2.76 2.76 0 0 1 0-1.76V6.1H.66a4.6 4.6 0 0 0 0 4.17l1.58-1.2z" fill="#FBBC05"/>
                <path d="M4.8 5.43c.67 0 1.27.23 1.74.68l1.3-1.3A4.6 4.6 0 0 0 4.8 3.6a4.59 4.59 0 0 0-4.14 2.5l1.58 1.2c.36-1.08 1.37-1.88 2.56-1.88z" fill="#EA4335"/>
                <text x="12" y="16" fontFamily="Arial,sans-serif" fontSize="12" fill="currentColor">Google</text>
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
