/**
 * Internal endpoint used by the edge middleware to know which bare paths
 * should be served as company-profile pages (rather than redirected to the
 * locale-prefixed `[locale]` tree).
 *
 * Returns the slug index doc maintained by `refreshSlugIndex()` in
 * `src/lib/firestore-data.ts`. Cached for 60 seconds at the CDN layer so
 * propagation is bounded by that window.
 */
import { NextResponse } from 'next/server';
import { getSlugIndex } from '@/lib/firestore-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const index = await getSlugIndex();
  const slugs = index?.slugs ?? [];
  return NextResponse.json(
    { slugs, updatedAt: index?.updatedAt ?? null },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
