import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { Timestamp } from 'firebase/firestore';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getQuoteById,
  updateQuote,
  getServiceRequestById,
  updateServiceRequest,
  getQuotePaymentById,
  updateQuotePayment,
  getPaymentsByQuote,
} from '@/lib/firestore-data';
import { sendTransactionalEmails } from '@/lib/email/send';
import { formatMoney } from '@/lib/money';

/** Mark a quote paid + advance its request once paid payments cover the total. */
async function reconcileQuotePaid(quoteId: string) {
  const quote = await getQuoteById(quoteId);
  if (!quote || quote.status === 'paid') return;
  const payments = await getPaymentsByQuote(quoteId);
  const paidSum = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  if (quote.total > 0 && paidSum >= quote.total) {
    await updateQuote(quoteId, { status: 'paid', paidAt: Timestamp.now() });
    if (quote.requestId) {
      const request = await getServiceRequestById(quote.requestId);
      if (request && (request.status === 'quoted' || request.status === 'new')) {
        await updateServiceRequest(quote.requestId, { status: 'accepted' });
      }
    }
  }
}

// Stripe needs the Node.js runtime (raw body + crypto), not the Edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Raw body is required for signature verification.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const quoteId = session.metadata?.quoteId;
      const paymentId = session.metadata?.paymentId;
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : undefined;

      // ── Single installment / advance payment ──
      if (paymentId) {
        const payment = await getQuotePaymentById(paymentId);
        if (payment && payment.status !== 'paid') {
          await updateQuotePayment(paymentId, {
            status: 'paid',
            stripePaymentIntentId: paymentIntentId,
            paidAt: Timestamp.now(),
          });
          await reconcileQuotePaid(payment.quoteId);

          sendTransactionalEmails({
            scenario: 'payment-receipt',
            locale: 'it',
            client: { name: payment.clientName, email: payment.clientEmail },
            adminFields: [
              { label: 'Pagamento', value: payment.label },
              { label: 'Importo', value: formatMoney(payment.amount, 'eur') },
            ],
          }).catch(() => {});
        }
      } else if (quoteId) {
        const quote = await getQuoteById(quoteId);
        if (quote && quote.status !== 'paid') {
          await updateQuote(quoteId, {
            status: 'paid',
            stripePaymentIntentId:
              typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            paidAt: Timestamp.now(),
          });

          // Advance the underlying request once payment lands (if linked).
          let request = null;
          if (quote.requestId) {
            request = await getServiceRequestById(quote.requestId);
            if (request && (request.status === 'quoted' || request.status === 'new')) {
              await updateServiceRequest(quote.requestId, { status: 'accepted' });
            }
          }

          // Receipt to the client + notification to admins (fire-and-forget).
          sendTransactionalEmails({
            scenario: 'payment-receipt',
            locale: 'it',
            client: { name: request?.clientName ?? quote.clientName, email: quote.clientEmail },
            adminFields: [
              { label: 'Progetto', value: request?.title ?? quote.title },
              { label: 'Preventivo', value: quote.title },
              { label: 'Importo', value: formatMoney(quote.total, quote.currency) },
            ],
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    // Log but acknowledge — returning non-2xx makes Stripe retry indefinitely.
    console.error('[stripe webhook] handler error:', err);
  }

  return NextResponse.json({ received: true });
}
