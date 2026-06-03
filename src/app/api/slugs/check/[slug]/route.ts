/**
 * Per-slug existence check used by the edge middleware as a fast, accurate
 * fallback to the cached bulk index. Returns `{ exists: boolean }` with one
 * Firestore read per slug. Cached at the CDN for 60s so repeat lookups for
 * the same slug don't hit Firestore again.
 */
import { NextResponse } from 'next/server';
import { getProfileIdBySlug } from '@/lib/firestore-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profileId = await getProfileIdBySlug(slug);
  return NextResponse.json(
    { exists: !!profileId },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
