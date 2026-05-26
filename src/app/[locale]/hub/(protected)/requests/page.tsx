'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMyRequestsAction } from '@/lib/service-request-actions';
import type { ServiceRequest } from '@/lib/firestore-data';
import { statusLabel, statusBadgeClass } from '@/lib/service-request-status';
import { contactServices } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, FileText, ArrowLeft } from 'lucide-react';

function serviceLabel(value: string): string {
  return contactServices.find((s) => s.value === value)?.label ?? value;
}

export default function MyRequestsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRequestsAction()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/hub`}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{locale === 'en' ? 'My Requests' : 'Le mie richieste'}</h1>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/${locale}/hub/requests/new`}>
            <Plus className="h-4 w-4" />
            {locale === 'en' ? 'New request' : 'Nuova richiesta'}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {locale === 'en'
                ? "You haven't made any requests yet."
                : 'Non hai ancora effettuato richieste.'}
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/${locale}/hub/requests/new`}>
                <Plus className="h-4 w-4" />
                {locale === 'en' ? 'Create your first request' : 'Crea la tua prima richiesta'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link key={r.id} href={`/${locale}/hub/requests/${r.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {serviceLabel(r.type)}
                      {' · '}
                      {new Date(r.createdAt as unknown as string).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'it-IT'
                      )}
                    </p>
                  </div>
                  <Badge className={statusBadgeClass(r.status)}>
                    {statusLabel(r.status, locale)}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
