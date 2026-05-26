import { NextResponse, type NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { getSession } from '@/lib/auth';
import {
  getQuoteById,
  getPaymentsByQuote,
  getUserProfile,
} from '@/lib/firestore-data';
import { InvoicePdf } from '@/components/pdf/invoice-pdf';

// PDF generation needs the Node.js runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) return new NextResponse('Missing id', { status: 400 });

  // Auth — owning client or admin only.
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const quote = await getQuoteById(id);
  if (!quote) return new NextResponse('Not found', { status: 404 });

  const isAdmin = session.user.role === 'admin';
  if (!isAdmin && quote.clientId !== session.user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const [payments, client] = await Promise.all([
    getPaymentsByQuote(id),
    getUserProfile(quote.clientId),
  ]);

  // Locale preference: ?lang=en or client's locale or 'it'.
  const urlLang = req.nextUrl.searchParams.get('lang');
  const locale: 'it' | 'en' =
    urlLang === 'en' || (urlLang !== 'it' && client?.locale === 'en') ? 'en' : 'it';

  try {
    const buf = await renderToBuffer(
      InvoicePdf({ quote, payments, client, locale }) as any
    );

    const isPaid = quote.status === 'paid';
    const filename = `${isPaid ? 'Fattura' : 'Preventivo'}-${id.slice(0, 8).toUpperCase()}.pdf`;

    return new NextResponse(buf as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[invoice pdf] render failed:', err);
    return new NextResponse('Failed to render PDF', { status: 500 });
  }
}
