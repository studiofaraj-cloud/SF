'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMyQuotesAction, createQuoteCheckoutAction } from '@/lib/quote-actions';
import { getMyPaymentsAction, createPaymentCheckoutAction } from '@/lib/payment-actions';
import type { Quote, QuotePayment } from '@/lib/firestore-data';
import { formatMoney } from '@/lib/money';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Receipt, CheckCircle2, ArrowLeft, FileDown } from 'lucide-react';

export default function HubQuotesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const fmtLocale = en ? 'en-IE' : 'it-IT';

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<QuotePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyQuotesAction(), getMyPaymentsAction()])
      .then(([q, p]) => {
        setQuotes(q);
        setPayments(p);
      })
      .catch(() => {
        setQuotes([]);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const paymentsByQuote = useMemo(() => {
    const map: Record<string, QuotePayment[]> = {};
    for (const p of payments) {
      if (p.status === 'cancelled') continue;
      (map[p.quoteId] ??= []).push(p);
    }
    return map;
  }, [payments]);

  // Top-right summary: total invoiced, paid so far, outstanding.
  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    for (const q of quotes) {
      if (q.status === 'cancelled') continue;
      total += q.total;
      const plan = paymentsByQuote[q.id!] ?? [];
      if (plan.length > 0) {
        paid += plan.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
      } else if (q.status === 'paid') {
        paid += q.total;
      }
    }
    return { total, paid, outstanding: Math.max(0, total - paid) };
  }, [quotes, paymentsByQuote]);

  const payFull = async (quoteId: string) => {
    setPayingId(`q:${quoteId}`);
    setError(null);
    const res = await createQuoteCheckoutAction(quoteId, window.location.origin, locale);
    if (res.success && res.url) window.location.href = res.url;
    else {
      setError(res.error ?? (en ? 'Could not start payment.' : 'Impossibile avviare il pagamento.'));
      setPayingId(null);
    }
  };

  const payInstallment = async (paymentId: string) => {
    setPayingId(`p:${paymentId}`);
    setError(null);
    const res = await createPaymentCheckoutAction(paymentId, window.location.origin, locale);
    if (res.success && res.url) window.location.href = res.url;
    else {
      setError(res.error ?? (en ? 'Could not start payment.' : 'Impossibile avviare il pagamento.'));
      setPayingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href={`/${locale}/hub`} className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Receipt className="h-6 w-6 text-primary" />
          {en ? 'Quotes & Invoices' : 'Preventivi e fatture'}
        </h1>
        {!loading && quotes.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {en ? 'Total' : 'Totale'}
            </p>
            <p className="text-2xl font-bold leading-tight">{formatMoney(totals.total, 'eur', fmtLocale)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatMoney(totals.paid, 'eur', fmtLocale)} {en ? 'paid' : 'pagato'}
              {' · '}
              <span className={totals.outstanding > 0 ? 'text-amber-600 font-medium' : ''}>
                {formatMoney(totals.outstanding, 'eur', fmtLocale)} {en ? 'outstanding' : 'da pagare'}
              </span>
            </p>
          </div>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{en ? 'No quotes or invoices yet.' : 'Ancora nessun preventivo o fattura.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const plan = paymentsByQuote[q.id!] ?? [];
            const hasPlan = plan.length > 0;
            const paidSum = plan.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
            const pct = q.total > 0 ? Math.min(100, Math.round((paidSum / q.total) * 100)) : 0;

            return (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{q.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatMoney(q.total, q.currency, fmtLocale)}
                        {q.taxAmount > 0 && ` · ${en ? 'incl. VAT' : 'IVA incl.'} ${q.taxRate}%`}
                      </p>
                      <a
                        href={`/api/quotes/${q.id}/pdf?lang=${locale}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <FileDown className="h-3 w-3" />
                        {q.status === 'paid'
                          ? en ? 'Download invoice (PDF)' : 'Scarica fattura (PDF)'
                          : en ? 'Download quote (PDF)' : 'Scarica preventivo (PDF)'}
                      </a>
                    </div>
                    {q.status === 'paid' ? (
                      <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        {en ? 'Paid' : 'Pagato'}
                      </Badge>
                    ) : q.status === 'cancelled' ? (
                      <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">{en ? 'Cancelled' : 'Annullato'}</Badge>
                    ) : null}
                  </div>

                  {/* Payment plan (installments) */}
                  {hasPlan ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <Progress value={pct} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {en ? 'Paid' : 'Pagato'}: {formatMoney(paidSum, q.currency, fmtLocale)} / {formatMoney(q.total, q.currency, fmtLocale)} ({pct}%)
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {plan.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{p.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatMoney(p.amount, 'eur', fmtLocale)}
                                {p.dueDate && ` · ${en ? 'due' : 'scad.'} ${new Date(p.dueDate as unknown as string).toLocaleDateString(fmtLocale)}`}
                              </p>
                            </div>
                            {p.status === 'paid' ? (
                              <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                {en ? 'Paid' : 'Pagato'}
                              </Badge>
                            ) : (
                              <Button size="sm" onClick={() => payInstallment(p.id!)} disabled={payingId === `p:${p.id}`} className="gap-1">
                                {payingId === `p:${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                                {en ? 'Pay' : 'Paga'}
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    // No plan → single full payment for "sent" quotes
                    q.status === 'sent' && (
                      <div className="mt-4 flex justify-end">
                        <Button size="sm" onClick={() => payFull(q.id!)} disabled={payingId === `q:${q.id}`} className="gap-1">
                          {payingId === `q:${q.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                          {en ? 'Pay' : 'Paga'} {formatMoney(q.total, q.currency, fmtLocale)}
                        </Button>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
