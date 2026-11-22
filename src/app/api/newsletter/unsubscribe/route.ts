import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { unsubscribe } from '@/lib/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One-click unsubscribe (RFC 8058), called by mail apps — Gmail, Yahoo, Apple
 * Mail — when someone presses "Unsubscribe" next to the sender. Newsletter
 * emails point here with:
 *
 *   List-Unsubscribe: <https://studiofaraj.it/api/newsletter/unsubscribe?t=…>
 *   List-Unsubscribe-Post: List-Unsubscribe=One-Click
 *
 * (see newsletterHeaders in src/lib/newsletter.ts). Only POST unsubscribes;
 * people clicking the link in the email body get the page with a button.
 */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get('t');
  const ok = await unsubscribe(token ?? '');
  if (ok) revalidatePath('/admin/subscribers');
  return new NextResponse(null, { status: ok ? 200 : 400 });
}
