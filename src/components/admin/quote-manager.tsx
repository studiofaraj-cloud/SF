'use client';

import { useEffect, useState } from 'react';
import {
  getQuotesForRequestAction,
  createQuoteAction,
  cancelQuoteAction,
} from '@/lib/quote-actions';
import type { Quote } from '@/lib/firestore-data';
import { formatMoney, eurosToCents } from '@/lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Receipt, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Row = { description: string; quantity: string; unitPrice: string };

function quoteBadge(status: Quote['status']) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Pagato</Badge>;
    case 'cancelled':
      return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Annullato</Badge>;
    default:
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Inviato</Badge>;
  }
}

export function QuoteManager({ requestId }: { requestId: string }) {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [taxRate, setTaxRate] = useState('22');
  const [rows, setRows] = useState<Row[]>([{ description: '', quantity: '1', unitPrice: '' }]);

  const load = () => {
    getQuotesForRequestAction(requestId)
      .then(setQuotes)
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [requestId]);

  const addRow = () => setRows((r) => [...r, { description: '', quantity: '1', unitPrice: '' }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const previewSubtotal = rows.reduce(
    (sum, r) => sum + (parseInt(r.quantity || '0', 10) || 0) * eurosToCents(r.unitPrice),
    0
  );
  const previewTax = Math.round((previewSubtotal * (parseFloat(taxRate) || 0)) / 100);
  const previewTotal = previewSubtotal + previewTax;

  const handleCreate = async () => {
    const lineItems = rows
      .map((r) => ({
        description: r.description.trim(),
        quantity: parseInt(r.quantity || '0', 10) || 0,
        unitAmount: eurosToCents(r.unitPrice),
      }))
      .filter((li) => li.description && li.quantity > 0);

    if (!title.trim() || lineItems.length === 0) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Titolo e almeno una voce sono richiesti.' });
      return;
    }

    setSaving(true);
    const res = await createQuoteAction(requestId, {
      title: title.trim(),
      taxRate: parseFloat(taxRate) || 0,
      lineItems,
    });
    setSaving(false);

    if (res.success) {
      toast({ title: 'Preventivo creato', description: 'Il cliente può ora pagarlo dalla sua dashboard.' });
      setOpen(false);
      setTitle('');
      setRows([{ description: '', quantity: '1', unitPrice: '' }]);
      setLoading(true);
      load();
    } else {
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Annullare questo preventivo?')) return;
    const prev = quotes;
    setQuotes((qs) => qs.map((q) => (q.id === id ? { ...q, status: 'cancelled' } : q)));
    const res = await cancelQuoteAction(id);
    if (!res.success) {
      setQuotes(prev);
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-5 w-5 text-primary" />
          Preventivi
        </CardTitle>
        <Button size="sm" variant={open ? 'ghost' : 'default'} onClick={() => setOpen((o) => !o)} className="gap-1">
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? 'Chiudi' : 'Nuovo'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {open && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div className="space-y-1.5">
                <Label htmlFor="q-title">Titolo</Label>
                <Input id="q-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="es. Sito web vetrina" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-tax">IVA (%)</Label>
                <Input id="q-tax" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Voci</Label>
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_64px_110px_32px] items-center gap-2">
                  <Input
                    placeholder="Descrizione"
                    value={r.description}
                    onChange={(e) => updateRow(i, { description: e.target.value })}
                  />
                  <Input
                    type="number"
                    min="1"
                    value={r.quantity}
                    onChange={(e) => updateRow(i, { quantity: e.target.value })}
                  />
                  <Input
                    placeholder="€ unità"
                    value={r.unitPrice}
                    onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={rows.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRow} className="gap-1">
                <Plus className="h-4 w-4" /> Aggiungi voce
              </Button>
            </div>

            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Imponibile</span>
                <span>{formatMoney(previewSubtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA</span>
                <span>{formatMoney(previewTax)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Totale</span>
                <span>{formatMoney(previewTotal)}</span>
              </div>
            </div>

            <Button onClick={handleCreate} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
              Crea e invia preventivo
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : quotes.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Nessun preventivo ancora.</p>
        ) : (
          <ul className="space-y-2">
            {quotes.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{q.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(q.total, q.currency)} · IVA {q.taxRate}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {quoteBadge(q.status)}
                  {q.status === 'sent' && (
                    <Button variant="ghost" size="icon" onClick={() => handleCancel(q.id!)} title="Annulla">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
