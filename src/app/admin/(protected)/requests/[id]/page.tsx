'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getServiceRequestAction,
  updateServiceRequestStatusAction,
} from '@/lib/service-request-actions';
import type { ServiceRequest, ServiceRequestStatus } from '@/lib/firestore-data';
import { statusLabel, statusBadgeClass, ALL_STATUSES } from '@/lib/service-request-status';
import { contactServices } from '@/lib/definitions';
import { RequestConversation } from '@/components/request-conversation';
import { QuoteManager } from '@/components/admin/quote-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function serviceLabel(value: string): string {
  return contactServices.find((s) => s.value === value)?.label ?? value;
}

export default function AdminRequestDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getServiceRequestAction(id)
      .then(setRequest)
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: ServiceRequestStatus) => {
    if (!request) return;
    const prev = request;
    setRequest({ ...request, status });
    const res = await updateServiceRequestStatusAction(request.id!, status);
    if (!res.success) {
      setRequest(prev);
      toast({ variant: 'destructive', title: 'Errore', description: res.message });
    } else {
      toast({ title: 'Aggiornato', description: 'Stato richiesta aggiornato.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Richiesta non trovata.</p>
        <Link href="/admin/requests" className="mt-4 inline-block text-sm text-primary hover:underline">
          Torna alle richieste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Richieste
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{serviceLabel(request.type)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusBadgeClass(request.status)}>{statusLabel(request.status, 'it')}</Badge>
          <Select value={request.status} onValueChange={(v) => handleStatusChange(v as ServiceRequestStatus)}>
            <SelectTrigger className="h-9 w-44">
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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dettagli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Descrizione</p>
              <p className="mt-1 whitespace-pre-wrap">{request.brief}</p>
            </div>
            {request.budget && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Budget</p>
                <p className="mt-1">{request.budget}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {request.clientName && <p className="font-medium">{request.clientName}</p>}
            {request.clientEmail && (
              <a href={`mailto:${request.clientEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Mail className="h-4 w-4" />
                {request.clientEmail}
              </a>
            )}
            <p className="text-xs text-muted-foreground">
              Inviata il {new Date(request.createdAt as unknown as string).toLocaleString('it-IT')}
            </p>
          </CardContent>
        </Card>
      </div>

      <QuoteManager requestId={request.id!} />

      <RequestConversation requestId={request.id!} locale="it" />
    </div>
  );
}
