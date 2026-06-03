'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Users,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/admin/stat-card';
import {
  adminBillingMetricsAction,
  type BillingMetrics,
} from '@/lib/company-profile-actions';

function eur(cents: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    trialing: { label: 'Trial', cls: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
    active: { label: 'Attivo', cls: 'bg-green-500/15 text-green-600 border-green-500/30' },
    past_due: { label: 'Past due', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
    canceled: { label: 'Cancellato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    unpaid: { label: 'Non pagato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    incomplete: { label: 'Incompleto', cls: 'bg-muted text-muted-foreground border-border' },
    none: { label: '—', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const v = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminBillingPage() {
  const [data, setData] = useState<BillingMetrics | null>(null);

  useEffect(() => {
    adminBillingMetricsAction()
      .then((m) => setData(m))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Banknote className="h-6 w-6 text-primary" />
          Fatturazione & Metriche
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stato abbonamenti Pagine Aziendali in tempo reale. MRR, churn,
          tasso di conversione del trial.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="MRR"
          value={eur(data.mrrCents)}
          icon={<Banknote className="h-5 w-5" />}
          description="Monthly Recurring Revenue (active + past_due)"
        />
        <StatCard
          title="Abbonati attivi"
          value={data.activeCount + data.trialingCount + data.pastDueCount}
          icon={<Users className="h-5 w-5" />}
          description={`${data.activeCount} attivi · ${data.trialingCount} trial · ${data.pastDueCount} in grazia`}
        />
        <StatCard
          title="Tasso conversione trial"
          value={pct(data.trialConversionRate)}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Trial → abbonamento attivo"
        />
        <StatCard
          title="Churn 30gg"
          value={pct(data.churnRate30d)}
          icon={<XCircle className="h-5 w-5" />}
          description={`${data.canceledCount} totali cancellati`}
        />
      </div>

      {/* Past-due alert */}
      {data.pastDueCount > 0 && (
        <Card className="mt-6 border-orange-500/40 bg-orange-500/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <p className="text-sm">
              <strong>{data.pastDueCount} abbonamento{data.pastDueCount === 1 ? '' : 'i'} in past_due.</strong>{' '}
              Pagamenti falliti in attesa di retry. Se non si risolvono entro 5 giorni
              (configurato in Stripe Dashboard), verranno cancellati automaticamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Subscribers table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Abbonati ({data.subscribers.length})</CardTitle>
          <Button asChild size="sm" variant="outline">
            <a
              href="https://dashboard.stripe.com/subscriptions"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-1 h-3.5 w-3.5" />
              Stripe Dashboard
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {data.subscribers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nessun abbonato ancora.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {data.subscribers.map((s) => (
                <div
                  key={s.profileId}
                  className="grid gap-2 py-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{s.companyName}</p>
                      {s.adminManaged && (
                        <Badge
                          variant="outline"
                          className="border-purple-500/30 bg-purple-500/15 text-purple-600 text-[10px]"
                        >
                          Admin
                        </Badge>
                      )}
                      {statusBadge(s.status)}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {s.slug ? `studiofaraj.it/${s.slug}` : '(no slug)'} · {s.ownerEmail ?? '—'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.status === 'trialing' && s.trialEndsAt ? (
                      <>Trial scade: <span className="text-foreground">{formatDate(s.trialEndsAt)}</span></>
                    ) : s.canceledAt ? (
                      <>Cancellato: <span className="text-foreground">{formatDate(s.canceledAt)}</span></>
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.currentPeriodEnd ? (
                      <>Rinnovo: <span className="text-foreground">{formatDate(s.currentPeriodEnd)}</span></>
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {s.slug && (
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/${s.slug}?preview=1`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/clients/${s.ownerUid}`} title="Vedi cliente">
                        <Users className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/company-profiles/${s.profileId}/edit`}>Modifica</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        MRR include solo gli abbonamenti che attualmente generano reddito (active + past_due in grazia).
        I clienti trialing non sono inclusi nell&apos;MRR finch&eacute; non vengono addebitati alla fine del periodo gratuito.
      </p>
    </div>
  );
}
