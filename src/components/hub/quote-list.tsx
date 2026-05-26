'use client';

import { useEffect, useState } from 'react';
import { getQuotesForRequestAction, createQuoteCheckoutAction } from '@/lib/quote-actions';
import type { Quote } from '@/lib/firestore-data';
import { formatMoney } from '@/lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Receipt, CheckCircle2 } from 'lucide-react';

export function QuoteList({ requestId, locale = 'it' }: { requestId: string; locale?: string }) {
  const en = locale === 'en';
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuotesForRequestAction(requestId)
      .then(setQuotes)
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handlePay = async (quoteId: string) => {
    setPayingId(quoteId);
    setError(null);
    const res = await createQuoteCheckoutAction(quoteId, window.location.origin, locale);
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setError(res.error ?? (en ? 'Could not start payment.' : 'Impossibile avviare il pagamento.'));
      setPayingId(null);
    }
  };

  // Hide entirely until there is something to show.
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  if (quotes.length === 0) return null;

  const fmtLocale = en ? 'en-IE' : 'it-IT';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-5 w-5 text-primary" />
          {en ? 'Quotes & Invoices' : 'Preventivi e fatture'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <ul className="space-y-2">
          {quotes.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{q.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(q.total, q.currency, fmtLocale)}
                  {q.taxAmount > 0 && ` · ${en ? 'incl. VAT' : 'IVA incl.'} ${q.taxRate}%`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {q.status === 'paid' ? (
                  <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    {en ? 'Paid' : 'Pagato'}
                  </Badge>
                ) : q.status === 'cancelled' ? (
                  <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                    {en ? 'Cancelled' : 'Annullato'}
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => handlePay(q.id!)} disabled={payingId === q.id} className="gap-1">
                    {payingId === q.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Receipt className="h-4 w-4" />
                    )}
                    {en ? 'Pay' : 'Paga'}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
