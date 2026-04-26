/**
 * Server component — fetches Google reviews at build / ISR time (24h cache)
 * and passes them down to the client carousel.
 */
import { getLocale } from 'next-intl/server';
import { fetchGoogleReviews } from '@/lib/google-reviews';
import TestimonialsSection from './testimonials-section';

export async function TestimonialsServer() {
  const locale = await getLocale();
  const place = await fetchGoogleReviews(locale);
  return <TestimonialsSection place={place} />;
}
