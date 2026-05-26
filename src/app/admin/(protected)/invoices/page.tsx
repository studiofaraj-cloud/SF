'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  listAllQuotesAction,
  adminCreateQuoteForClientAction,
  cancelQuoteAction,
  markQuotePaidAction,
} from '@/lib/quote-actions';
import { listUsersAction } from '@/lib/auth-actions';
import type { Quote } from '@/lib/firestore-data';
import type { UserProfile } from '@/lib/firestore-data';
import { formatMoney, eurosToCents } from '@/lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Receipt, Plus, Trash2, X, Loader2, Search, CheckCircle2, Mail } from 'lucide-react';
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

export default function AdminInvoicesPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Creator state
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [taxRate, setTaxRate] = useState('22');
  const [rows, setRows] = useState<Row[]>([{ description: '', quantity: '1', unitPrice: '' }]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [q, u] = await Promise.all([listAllQuotesAction(), listUsersAction()]);
      setQuotes(q);
      setClients(u);
    } catch {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare i dati.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

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

  const resetForm = () => {
    setClientId('');
    setTitle('');
    setTaxRate('22');
    setRows([{ description: '', quantity: '1', unitPrice: '' }]);
  };

  const handleCreate = async () => {
    const lineItems = rows
      .map((r) => ({
        description: r.description.trim(),
        quantity: parseInt(r.quantity || '0', 10) || 0,
        unitAmount: eurosToCents(r.unitPrice),
      }))
      .filter((li) => li.description && li.quantity > 0);

    if (!clientId || !title.trim() || lineItems.length === 0) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Cliente, titolo e almeno una voce sono richiesti.' });
      return;
    }

    setSaving(true);
    const res = await adminCreateQuoteForClientAction(clientId, {
      title: title.trim(),
      taxRate: parseFloat(taxRate) || 0,
      lineItems,
    });
    setSaving(false);

    if (res.success) {
      toast({ title: 'Preventivo creato', description: 'Il cliente è stato avvisato via email.' });
      setOpen(false);
      resetForm();
      load();
    } else {
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    }
  };

  const handleMarkPaid = async (id: string) => {
    const prev = quotes;
    setQuotes((qs) => qs.map((q) => (q.id === id ? { ...q, status: 'paid' } : q)));
    const res = await markQuotePaidAction(id);
    if (!res.success) {
      setQuotes(prev);
      toast({ variant: 'destructive', title: 'Errore', description: res.error });
    } else {
      toast({ title: 'Aggiornato', description: 'Segnato come pagato.' });
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

  const filtered = useMemo(() => {
    if (!search) return quotes;
    const s = search.toLowerCase();
    return quotes.filter(
      (q) =>
        q.title.toLowerCase().includes(s) ||
        (q.clientName ?? '').toLowerCase().includes(s) ||
        (q.clientEmail ?? '').toLowerCase().includes(s)
    );
  }, [quotes, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" />
            Preventivi e Fatture
          </h1>
          <p className="text-muted-foreground mt-1">Crea e gestisci preventivi e fatture dei clienti</p>
        </div>
        <Button onClick={() => setOpen((o) => !o)} className="gap-1.5">
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? 'Chiudi' : 'Nuovo preventivo'}
        </Button>
      </div>

      {/* Creator */}
      {open && (
        <Card className="holographic-card neon-border">
          <CardHeader>
            <CardTitle className="text-base">Nuovo preventivo / fattura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.uid} value={c.uid}>
                        {c.displayName || c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-title">Titolo</Label>
                <Input id="inv-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="es. Sito web vetrina" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-tax">IVA (%)</Label>
                <Input id="inv-tax" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Voci</Label>
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_64px_110px_32px] items-center gap-2">
                  <Input placeholder="Descrizione" value={r.description} onChange={(e) => updateRow(i, { description: e.target.value })} />
                  <Input type="number" min="1" value={r.quantity} onChange={(e) => updateRow(i, { quantity: e.target.value })} />
                  <Input placeholder="€ unità" value={r.unitPrice} onChange={(e) => updateRow(i, { unitPrice: e.target.value })} />
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
              Crea e invia al cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="holographic-card neon-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cerca per titolo, cliente o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="holographic-card neon-border">
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{search ? 'Nessun risultato.' : 'Nessun preventivo ancora.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((q) => (
            <Card key={q.id} className="holographic-card neon-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/invoices/${q.id}`} className="font-medium hover:text-primary hover:underline">
                      <span className="block truncate">{q.title}</span>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {q.clientName || q.clientEmail || 'Cliente'} · {formatMoney(q.total, q.currency)} · IVA {q.taxRate}%
                    </p>
                  </div>
                  {quoteBadge(q.status)}
                </div>
                {q.clientEmail && (
                  <a href={`mailto:${q.clientEmail}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                    <Mail className="h-3 w-3" />
                    {q.clientEmail}
                  </a>
                )}
                {q.status === 'sent' && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleMarkPaid(q.id!)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Segna pagato
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => handleCancel(q.id!)}>
                      <X className="h-4 w-4" />
                      Annulla
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
