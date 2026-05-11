/**
 * Server component — fetches Google reviews and passes them to the client carousel.
 */
import { getLocale } from 'next-intl/server';
import { fetchGoogleReviews } from '@/lib/google-reviews';
import TestimonialsSection from './testimonials-section';

export async function TestimonialsServer() {
  const locale = await getLocale();
  const place = await fetchGoogleReviews(locale);
  return <TestimonialsSection place={place} />;
}
