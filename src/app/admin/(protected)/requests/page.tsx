'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  listServiceRequestsAction,
  updateServiceRequestStatusAction,
} from '@/lib/service-request-actions';
import type { ServiceRequest, ServiceRequestStatus } from '@/lib/firestore-data';
import {
  statusLabel,
  statusBadgeClass,
  ALL_STATUSES,
} from '@/lib/service-request-status';
import { contactServices } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Search, Mail, Loader2, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function serviceLabel(value: string): string {
  return contactServices.find((s) => s.value === value)?.label ?? value;
}

type FilterType = 'all' | ServiceRequestStatus;

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listServiceRequestsAction();
      setRequests(data);
    } catch {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile caricare le richieste.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id: string, status: ServiceRequestStatus) => {
    const prev = requests;
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await updateServiceRequestStatusAction(id, status);
    if (!res.success) {
      setRequests(prev);
      toast({ variant: 'destructive', title: 'Errore', description: res.message });
    } else {
      toast({ title: 'Aggiornato', description: 'Stato richiesta aggiornato.' });
    }
  };

  const filtered = useMemo(() => {
    let list = requests;
    if (filter !== 'all') list = list.filter((r) => r.status === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.clientName ?? '').toLowerCase().includes(q) ||
          (r.clientEmail ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, filter, searchQuery]);

  const timeAgo = (iso: any) => {
    const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso);
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true, locale: it }) : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          Richieste di servizio
        </h1>
        <p className="text-muted-foreground mt-1">Gestisci le richieste inviate dai clienti</p>
      </div>

      <Card className="holographic-card neon-border">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per titolo, cliente o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                Tutte
              </Button>
              {ALL_STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={filter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(s)}
                >
                  {statusLabel(s, 'it')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="holographic-card neon-border">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all'
                ? 'Nessuna richiesta trovata con i filtri selezionati.'
                : 'Nessuna richiesta ancora.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((r) => (
            <Card key={r.id} className="holographic-card neon-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/requests/${r.id}`} className="group inline-flex items-center gap-1">
                      <CardTitle className="text-lg mb-1 truncate group-hover:text-primary">{r.title}</CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </Link>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      {serviceLabel(r.type)}
                    </CardDescription>
                  </div>
                  <Badge className={statusBadgeClass(r.status)}>{statusLabel(r.status, 'it')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{r.brief}</p>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {r.clientName && <p className="font-medium text-foreground">{r.clientName}</p>}
                  {r.clientEmail && (
                    <a href={`mailto:${r.clientEmail}`} className="flex items-center gap-2 hover:text-primary">
                      <Mail className="h-4 w-4" />
                      {r.clientEmail}
                    </a>
                  )}
                  {r.budget && <p>Budget: {r.budget}</p>}
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  {timeAgo(r.createdAt)}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Stato:</span>
                  <Select
                    value={r.status}
                    onValueChange={(v) => handleStatusChange(r.id!, v as ServiceRequestStatus)}
                  >
                    <SelectTrigger className="h-8 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel(s, 'it')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
