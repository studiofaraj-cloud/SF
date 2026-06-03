'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Loader2,
  User,
  Building2,
  Receipt,
  CreditCard,
  Mail,
  ExternalLink,
  Download,
  Shield,
  Globe,
  Calendar,
  Pencil,
} from 'lucide-react';
import {
  adminGetClientDetailAction,
  type AdminClientDetail,
} from '@/lib/auth-actions';

function formatDate(iso: string | undefined | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: (currency || 'eur').toUpperCase(),
  }).format(cents / 100);
}

function subStatusBadge(status?: string) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const map: Record<string, { label: string; cls: string }> = {
    trialing: { label: 'Trial', cls: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
    active: { label: 'Attivo', cls: 'bg-green-500/15 text-green-600 border-green-500/30' },
    past_due: { label: 'Past due', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
    canceled: { label: 'Cancellato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    unpaid: { label: 'Non pagato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    incomplete: { label: 'Incompleto', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const v = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

function invoiceStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: 'Pagato', cls: 'bg-green-500/15 text-green-600 border-green-500/30' },
    open: { label: 'In sospeso', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
    draft: { label: 'Bozza', cls: 'bg-muted text-muted-foreground border-border' },
    void: { label: 'Annullato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    uncollectible: { label: 'Non riscuotibile', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
  };
  const v = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

export default function AdminClientDetailPage() {
  const params = useParams();
  const uid = params?.uid as string;
  const [data, setData] = useState<AdminClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetClientDetailAction(uid)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="mb-4">Cliente non trovato.</p>
        <Link href="/admin/clients" className="text-primary underline">
          Torna all&apos;elenco
        </Link>
      </div>
    );
  }

  const u = data.user;
  const primaryProfile = data.companyProfiles.find((p: any) => !p.adminManaged) ?? null;
  const adminProfiles = data.companyProfiles.filter((p: any) => p.adminManaged);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Link
        href="/admin/clients"
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Tutti i clienti
      </Link>
      <h1 className="mb-6 flex flex-wrap items-center gap-3 text-2xl font-bold">
        {u.displayName || u.email}
        {u.role === 'admin' && (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        )}
        {u.disabled && (
          <Badge variant="outline" className="border-red-500/30 bg-red-500/15 text-red-600">
            Disabilitato
          </Badge>
        )}
      </h1>

      {/* ── User card ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <a
              href={`mailto:${u.email}`}
              className="flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5" /> {u.email}
            </a>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="font-medium">{u.displayName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ruolo</p>
            <p className="font-medium capitalize">{u.role}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lingua</p>
            <p className="font-medium uppercase">{u.locale || 'it'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">UID</p>
            <p className="break-all font-mono text-xs">{u.uid}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stripe Customer</p>
            <p className="break-all font-mono text-xs">{u.stripeCustomerId || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Registrato</p>
            <p className="font-medium">{formatDate(u.createdAt as any)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ultimo accesso</p>
            <p className="font-medium">{formatDate(u.lastLoginAt as any)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Billing details card ─────────────────────────────────── */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Dati di fatturazione (per preventivi)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Ragione sociale</p>
            <p className="font-medium">{u.company || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Partita IVA</p>
            <p className="font-medium">{u.vatNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Codice Fiscale</p>
            <p className="font-medium">{u.taxCode || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SDI / PEC</p>
            <p className="font-medium">{u.sdiPec || '—'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Indirizzo</p>
            <p className="font-medium">
              {[u.addressLine, u.zip, u.city, u.province, u.country]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Telefono</p>
            <p className="font-medium">{u.phone || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Company profiles ──────────────────────────────────────── */}
      {(primaryProfile || adminProfiles.length > 0) && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5 text-primary" />
              Pagine aziendali ({data.companyProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.companyProfiles.map((p: any) => (
              <div
                key={p.id}
                className="rounded-lg border border-border/40 bg-card/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{p.companyName || '(senza nome)'}</p>
                      {p.adminManaged ? (
                        <Badge
                          variant="outline"
                          className="border-purple-500/30 bg-purple-500/15 text-purple-600"
                        >
                          Admin-managed
                        </Badge>
                      ) : (
                        <Badge variant="outline">Cliente</Badge>
                      )}
                      {p.isPublished ? (
                        <Badge variant="outline" className="border-green-500/30 bg-green-500/15 text-green-600">
                          Pubblicata
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Bozza</Badge>
                      )}
                      {!p.adminManaged && subStatusBadge(p.subscription?.status)}
                    </div>
                    {p.slug && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        studiofaraj.it/<strong className="text-foreground">{p.slug}</strong>
                      </p>
                    )}
                    {p.subscription?.billingCycle && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Piano: {p.subscription.billingCycle === 'annual' ? '€49,99/anno' : '€4,99/mese'}
                        {p.subscription.currentPeriodEnd && (
                          <> · Rinnovo: <span className="text-foreground">{formatDate(p.subscription.currentPeriodEnd as any)}</span></>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {p.slug && (
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/${p.slug}?preview=1`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/company-profiles/${p.id}/edit`}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Modifica
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!primaryProfile && adminProfiles.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            <Globe className="mx-auto mb-2 h-8 w-8 opacity-40" />
            Nessuna pagina aziendale collegata.
          </CardContent>
        </Card>
      )}

      {/* ── Stripe invoices ──────────────────────────────────────── */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Fatture Stripe ({data.invoices.length})
            </span>
            {u.stripeCustomerId && (
              <Button asChild size="sm" variant="ghost">
                <a
                  href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Stripe Dashboard
                </a>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.invoices.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {u.stripeCustomerId
                ? 'Nessuna fattura ancora.'
                : 'Cliente non ha mai pagato (no Stripe customer).'}
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {data.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs font-semibold">
                        {inv.number || inv.id.slice(0, 14)}
                      </p>
                      {invoiceStatusBadge(inv.status)}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      {new Date(inv.created * 1000).toLocaleDateString('it-IT')}
                      {' · '}
                      <strong className="text-foreground">
                        {formatAmount(inv.amountPaid, inv.currency)}
                      </strong>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {inv.invoicePdfUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={inv.invoicePdfUrl} target="_blank" rel="noreferrer">
                          <Download className="mr-1 h-3.5 w-3.5" />
                          PDF
                        </a>
                      </Button>
                    )}
                    {inv.hostedInvoiceUrl && (
                      <Button asChild size="sm" variant="ghost">
                        <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
