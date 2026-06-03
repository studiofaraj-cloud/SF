'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CreditCard, ExternalLink, CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getMyCompanyProfileAction,
  manageBillingAction,
  syncMySubscriptionAction,
  changeBillingCycleAction,
} from '@/lib/company-profile-actions';

function formatDate(iso: string | undefined, locale: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-IE' : 'it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function statusBadge(status?: string) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const map: Record<string, { label: string; cls: string }> = {
    trialing: { label: 'Periodo di prova', cls: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
    active: { label: 'Attivo', cls: 'bg-green-500/15 text-green-600 border-green-500/30' },
    past_due: { label: 'Pagamento in ritardo', cls: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
    canceled: { label: 'Cancellato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    unpaid: { label: 'Non pagato', cls: 'bg-red-500/15 text-red-600 border-red-500/30' },
    incomplete: { label: 'Incompleto', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const v = map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' };
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

export default function HubSubscriptionStatusPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [opening, setOpening] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // If we just returned from Stripe Checkout (?status=success), sync the
      // subscription state from Stripe BEFORE rendering — the webhook may not
      // have fired yet (e.g. local dev without stripe listen).
      if (status === 'success') {
        await syncMySubscriptionAction().catch(() => {});
      }
      const p = await getMyCompanyProfileAction();
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openPortal = async () => {
    setOpening(true);
    try {
      const res = await manageBillingAction(window.location.origin, locale);
      if (res.success && res.url) {
        window.location.href = res.url;
      } else if (!res.success) {
        toast({ variant: 'destructive', title: 'Errore', description: res.error });
      }
    } finally {
      setOpening(false);
    }
  };

  const switchPlan = async (newCycle: 'monthly' | 'annual') => {
    const goingAnnual = newCycle === 'annual';
    const confirmMsg = goingAnnual
      ? (en
          ? 'Switch to the Annual plan? You will be charged the prorated difference now, and renew once a year.'
          : 'Passare al piano Annuale? Verrà addebitata la differenza prorata adesso, e rinnoverai una volta all\'anno.')
      : (en
          ? 'Switch to the Monthly plan? A prorated credit will apply to your next invoice.'
          : 'Passare al piano Mensile? Riceverai un credito prorata sulla prossima fattura.');
    if (!window.confirm(confirmMsg)) return;
    setSwitching(true);
    try {
      const res = await changeBillingCycleAction(newCycle);
      if (res.success) {
        toast({
          title: en ? 'Plan changed' : 'Piano cambiato',
          description: res.message,
        });
        // Refetch local state.
        const p = await getMyCompanyProfileAction();
        setProfile(p);
      } else {
        toast({ variant: 'destructive', title: 'Errore', description: res.error });
      }
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const sub = profile?.subscription;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href={`/${locale}/hub/company-profile`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {en ? 'Back' : 'Indietro'}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">
        {en ? 'Subscription' : 'Abbonamento'}
      </h1>

      {status === 'success' && (
        <Card className="mb-6 border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm">
              {en
                ? 'Subscription started — your 30-day free trial is active. Edit your profile to publish the page.'
                : 'Abbonamento avviato — il tuo periodo di prova di 30 giorni è attivo. Modifica il profilo per pubblicare la pagina.'}
            </p>
          </CardContent>
        </Card>
      )}
      {status === 'cancel' && (
        <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <p className="text-sm">
              {en
                ? 'Checkout cancelled. You can start again anytime.'
                : 'Checkout annullato. Puoi riprovare quando vuoi.'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            {en ? 'Status' : 'Stato'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{en ? 'Plan' : 'Piano'}</span>
            <span className="font-medium">
              {sub?.billingCycle === 'annual'
                ? `€49,99/${en ? 'year' : 'anno'}`
                : sub?.billingCycle === 'monthly'
                ? `€4,99/${en ? 'month' : 'mese'}`
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{en ? 'Status' : 'Stato'}</span>
            {statusBadge(sub?.status)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{en ? 'Trial ends' : 'Fine periodo di prova'}</span>
            <span>{formatDate(sub?.trialEndsAt, locale)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{en ? 'Next renewal' : 'Prossimo rinnovo'}</span>
            <span>{formatDate(sub?.currentPeriodEnd, locale)}</span>
          </div>
          {sub?.canceledAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{en ? 'Cancelled on' : 'Cancellato il'}</span>
              <span>{formatDate(sub.canceledAt, locale)}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {profile?.slug && sub?.stripeSubscriptionId && (
              <Button asChild size="sm">
                <Link href={`/${profile.slug}?preview=1`} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  {en ? 'View my page' : 'Vedi la mia pagina'}
                </Link>
              </Button>
            )}
            {sub?.stripeSubscriptionId && (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/${locale}/hub/company-profile/billing`}>
                  {en ? 'Invoices' : 'Fatture'}
                </Link>
              </Button>
            )}
            {sub?.stripeSubscriptionId ? (
              <Button onClick={openPortal} disabled={opening} className="gap-2" size="sm" variant="outline">
                {opening && <Loader2 className="h-4 w-4 animate-spin" />}
                <ExternalLink className="h-4 w-4" />
                {en ? 'Manage in Stripe' : 'Gestisci in Stripe'}
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href={`/${locale}/hub/company-profile/subscription/start`}>
                  {en ? 'Start subscription' : 'Avvia abbonamento'}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan switch — only when sub is active and not canceled */}
      {sub?.stripeSubscriptionId &&
        ['trialing', 'active', 'past_due'].includes(sub?.status ?? '') && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                {en ? 'Change plan' : 'Cambia piano'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sub?.billingCycle === 'annual' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {en
                      ? 'You are on the Annual plan (€49,99/year). Switching to Monthly will apply a prorated credit to your next invoice.'
                      : 'Sei sul piano Annuale (€49,99/anno). Passando al Mensile riceverai un credito prorata sulla prossima fattura.'}
                  </p>
                  <Button
                    onClick={() => switchPlan('monthly')}
                    disabled={switching}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    {switching && <Loader2 className="h-4 w-4 animate-spin" />}
                    {en ? 'Switch to Monthly' : 'Passa a Mensile'} · €4,99/{en ? 'mo' : 'mese'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm">
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      {en ? 'Save 2 months with annual billing' : 'Risparmia 2 mesi con il piano annuale'}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {en
                        ? 'Pay €49,99/year instead of €59,88. Same features, just billed yearly. The prorated difference is charged immediately.'
                        : 'Paga €49,99/anno invece di €59,88. Stesse funzionalità, fatturato una volta all\'anno. La differenza prorata viene addebitata subito.'}
                    </p>
                  </div>
                  <Button
                    onClick={() => switchPlan('annual')}
                    disabled={switching}
                    size="sm"
                    className="gap-2"
                  >
                    {switching && <Loader2 className="h-4 w-4 animate-spin" />}
                    {en ? 'Switch to Annual' : 'Passa ad Annuale'} · €49,99/{en ? 'yr' : 'anno'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
