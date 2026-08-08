import { notFound } from 'next/navigation';

/**
 * Catch-all that renders the branded 404 from [locale]/not-found.tsx INSIDE the
 * locale root layout — so it keeps the correct <html lang>, the site fonts and
 * the intl provider.
 *
 * Why it's needed: unmatched URLs are normally served by a root `app/not-found.tsx`.
 * After the move to multiple root layouts there is no `app/` root layout for such a
 * file to render into, so unmatched paths fell through to Next's built-in bare 404
 * (no branding, no lang attribute). A catch-all segment is the lowest-priority
 * match in the router, so every real route still wins; only genuinely unmatched
 * paths land here.
 *
 * Bare paths like /foo are redirected to /it/foo by the intl middleware first, so
 * they end up here too.
 */
export default function CatchAllNotFound() {
  notFound();
}
