'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getQuoteAction, markQuotePaidAction } from '@/lib/quote-actions';
import {
  getPaymentsForQuoteAction,
  addQuotePaymentAction,
  generatePaymentPlanAction,
  markPaymentPaidAction,
  cancelPaymentAction,
} from '@/lib/payment-actions';
import { adminGetUserProfileAction } from '@/lib/auth-actions';
import type { Quote, QuotePayment, UserProfile } from '@/lib/firestore-data';
import { formatMoney, eurosToCents } from '@/lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Plus, CheckCircle2, X, Wand2, Mail, Building2, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function payBadge(status: QuotePayment['status']) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Pagato</Badge>;
    case 'cancelled':
      return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Annullato</Badge>;
    default:
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">In attesa</Badge>;
  }
}

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [payments, setPayments] = useState<QuotePayment[]>([]);
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Add-payment form
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [adding, setAdding] = useState(false);

  // Generate-plan form
  const [advance, setAdvance] = useState('');
  const [installments, setInstallments] = useState('3');
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [q, p] = await Promise.all([getQuoteAction(id), getPaymentsForQuoteAction(id)]);
      setQuote(q);
      setPayments(p);
      if (q?.clientId) {
        adminGetUserProfileAction(q.clientId).then(setClientProfile).catch(() => {});
      }
    } catch {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare il preventivo.' });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const paidSum = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const plannedSum = payments.filter((p) => p.status !== 'cancelled').reduce((s, p) => s + p.amount, 0);
  const total = quote?.total ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((paidSum / total) * 100)) : 0;

  const handleAdd = async () => {
    const cents = eurosToCents(amount);
    if (!label.trim() || cents <= 0) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Inserisci etichetta e importo.' });
      return;
    }
    setAdding(true);
    const res = await addQuotePaymentAction(id, {
      label: label.trim(),
      amount: cents,
      dueDate: dueDate || undefined,
    });
    setAdding(false);
    if (res.success) {
      toast({ title: 'Pagamento aggiunto', description: 'Il cliente è stato avvisato via email.' });
      setLabel('');
      setAmount('');
      setDueDate('');
      load();
    } else {
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await generatePaymentPlanAction(id, {
      advance: eurosToCents(advance),
      installments: parseInt(installments || '1', 10) || 1,
    });
    setGenerating(false);
    if (res.success) {
      toast({ title: 'Piano creato', description: 'Acconto e rate generati; cliente avvisato.' });
      setAdvance('');
      load();
    } else {
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  const handleMarkQuotePaid = async () => {
    if (!confirm("Segnare l'intero preventivo come pagato?")) return;
    const res = await markQuotePaidAction(id);
    if (res.success) {
      toast({ title: 'Aggiornato', description: 'Preventivo segnato come pagato.' });
      load();
    } else {
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  const handleMarkPaid = async (pid: string) => {
    const prev = payments;
    setPayments((ps) => ps.map((p) => (p.id === pid ? { ...p, status: 'paid' } : p)));
    const res = await markPaymentPaidAction(pid);
    if (!res.success) {
      setPayments(prev);
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    } else {
      load();
    }
  };

  const handleCancel = async (pid: string) => {
    if (!confirm('Annullare questo pagamento?')) return;
    const prev = payments;
    setPayments((ps) => ps.map((p) => (p.id === pid ? { ...p, status: 'cancelled' } : p)));
    const res = await cancelPaymentAction(pid);
    if (!res.success) {
      setPayments(prev);
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!quote) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Preventivo non trovato.</p>
        <Link href="/admin/invoices" className="mt-4 inline-block text-sm text-primary hover:underline">
          Torna a Preventivi
        </Link>
      </div>
    );
  }

  const hasPlan = payments.length > 0;

  return (
    <div className="space-y-6">
      <Link href="/admin/invoices" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Preventivi
      </Link>

      {/* Summary */}
      <Card className="holographic-card neon-border">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{quote.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {quote.clientName || quote.clientEmail} · Totale {formatMoney(total, quote.currency)} · IVA {quote.taxRate}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <a href={`/api/quotes/${id}/pdf`} target="_blank" rel="noopener noreferrer">
                  <FileDown className="h-4 w-4" />
                  PDF
                </a>
              </Button>
              <Badge className={quote.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}>
                {quote.status === 'paid' ? 'Pagato' : quote.status === 'cancelled' ? 'Annullato' : 'Inviato'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={pct} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pagato: {formatMoney(paidSum, quote.currency)} / {formatMoney(total, quote.currency)}</span>
            <span>{pct}%</span>
          </div>
          {plannedSum !== total && hasPlan && (
            <p className="text-xs text-muted-foreground">
              Pianificato: {formatMoney(plannedSum, quote.currency)}
              {plannedSum < total ? ' (inferiore al totale)' : ' (superiore al totale)'}
            </p>
          )}
          {quote.status === 'sent' && !hasPlan && (
            <div className="pt-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleMarkQuotePaid}>
                <CheckCircle2 className="h-4 w-4" />
                Segna l’intero preventivo come pagato
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client billing details (for the fattura) */}
      <Card className="holographic-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Dati di fatturazione cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {clientProfile && (clientProfile.company || clientProfile.vatNumber || clientProfile.taxCode || clientProfile.addressLine) ? (
            <div className="space-y-1">
              {clientProfile.company && <p className="font-medium">{clientProfile.company}</p>}
              {clientProfile.vatNumber && <p className="text-muted-foreground">P.IVA: {clientProfile.vatNumber}</p>}
              {clientProfile.taxCode && <p className="text-muted-foreground">C.F.: {clientProfile.taxCode}</p>}
              {(clientProfile.addressLine || clientProfile.city || clientProfile.zip) && (
                <p className="text-muted-foreground">
                  {[clientProfile.addressLine, [clientProfile.zip, clientProfile.city].filter(Boolean).join(' '), clientProfile.province, clientProfile.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {clientProfile.sdiPec && <p className="text-muted-foreground">SDI/PEC: {clientProfile.sdiPec}</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Cliente privato — nessun dato aziendale. {clientProfile?.displayName || quote.clientName || ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generate plan (only when no payments yet) */}
      {!hasPlan && (
        <Card className="holographic-card neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-5 w-5 text-primary" />
              Genera piano (acconto + rate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="advance">Acconto (€)</Label>
                <Input id="advance" placeholder="es. 500" value={advance} onChange={(e) => setAdvance(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="installments">Numero rate</Label>
                <Input id="installments" type="number" min="1" value={installments} onChange={(e) => setInstallments(e.target.value)} />
              </div>
              <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Genera
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              L’acconto + le rate copriranno il totale di {formatMoney(total, quote.currency)}.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add single payment */}
      <Card className="holographic-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 text-primary" />
            Aggiungi pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_160px_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="label">Etichetta</Label>
              <Input id="label" placeholder="es. Acconto, Saldo, Extra" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Importo (€)</Label>
              <Input id="amount" placeholder="es. 300" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due">Scadenza (opz.)</Label>
              <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <Button onClick={handleAdd} disabled={adding} className="gap-2">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Aggiungi e avvisa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments list */}
      <Card className="holographic-card neon-border">
        <CardHeader>
          <CardTitle className="text-base">Pagamenti</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nessun pagamento ancora. Genera un piano o aggiungine uno.</p>
          ) : (
            <ul className="space-y-2">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(p.amount, 'eur')}
                      {p.dueDate && ` · scad. ${new Date(p.dueDate as unknown as string).toLocaleDateString('it-IT')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {payBadge(p.status)}
                    {p.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleMarkPaid(p.id!)}>
                          <CheckCircle2 className="h-4 w-4" />
                          Pagato
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleCancel(p.id!)} title="Annulla">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
