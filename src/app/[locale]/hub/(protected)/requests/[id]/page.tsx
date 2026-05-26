'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMyRequestAction } from '@/lib/service-request-actions';
import type { ServiceRequest } from '@/lib/firestore-data';
import {
  statusLabel,
  statusBadgeClass,
  SERVICE_REQUEST_STATUS_ORDER,
} from '@/lib/service-request-status';
import { contactServices } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequestConversation } from '@/components/request-conversation';
import { QuoteList } from '@/components/hub/quote-list';

function serviceLabel(value: string): string {
  return contactServices.find((s) => s.value === value)?.label ?? value;
}

export default function RequestDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const id = params?.id as string;
  const en = locale === 'en';

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMyRequestAction(id)
      .then(setRequest)
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">
          {en ? 'Request not found.' : 'Richiesta non trovata.'}
        </p>
        <Link href={`/${locale}/hub/requests`} className="mt-4 inline-block text-sm text-primary hover:underline">
          {en ? 'Back to my requests' : 'Torna alle mie richieste'}
        </Link>
      </div>
    );
  }

  const isCancelled = request.status === 'cancelled';
  const currentIndex = SERVICE_REQUEST_STATUS_ORDER.indexOf(request.status);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href={`/${locale}/hub/requests`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {en ? 'My Requests' : 'Le mie richieste'}
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{serviceLabel(request.type)}</p>
        </div>
        <Badge className={statusBadgeClass(request.status)}>
          {statusLabel(request.status, locale)}
        </Badge>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Progress' : 'Avanzamento'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {SERVICE_REQUEST_STATUS_ORDER.map((s, i) => {
                const done = i <= currentIndex;
                const current = i === currentIndex;
                return (
                  <li key={s} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border text-xs',
                        done
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={cn('text-sm', current ? 'font-semibold' : 'text-muted-foreground')}>
                      {statusLabel(s, locale)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{en ? 'Details' : 'Dettagli'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{en ? 'Brief' : 'Descrizione'}</p>
            <p className="mt-1 whitespace-pre-wrap">{request.brief}</p>
          </div>
          {request.budget && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Budget</p>
              <p className="mt-1">{request.budget}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground">{en ? 'Submitted' : 'Inviata il'}</p>
            <p className="mt-1">
              {new Date(request.createdAt as unknown as string).toLocaleString(
                en ? 'en-GB' : 'it-IT'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <QuoteList requestId={request.id!} locale={locale} />
      </div>

      <div className="mt-6">
        <RequestConversation requestId={request.id!} locale={locale} />
      </div>
    </div>
  );
}
