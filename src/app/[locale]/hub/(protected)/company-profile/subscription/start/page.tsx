'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  recordConsentAction,
  startCompanyProfileSubscriptionAction,
  syncMySubscriptionAction,
  getMyCompanyProfileAction,
} from '@/lib/company-profile-actions';
import { TOS_VERSION } from '@/lib/legal';

export default function HubSubscriptionStartPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const { toast } = useToast();

  const [tosAccepted, setTosAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Sync from Stripe first so we have the freshest subscription state
      // even if the webhook hasn't fired locally.
      await syncMySubscriptionAction().catch(() => {});
      const p = await getMyCompanyProfileAction();
      if (cancelled) return;

      // If the user ALREADY has an active subscription, this "start" page is
      // not relevant for them — bounce them to the status page where they can
      // manage / view their existing subscription.
      const status = p?.subscription?.status;
      const hasActiveSub =
        !!p?.subscription?.stripeSubscriptionId ||
        status === 'trialing' ||
        status === 'active' ||
        status === 'past_due';
      if (hasActiveSub) {
        router.replace(`/${locale}/hub/company-profile/subscription`);
        return;
      }

      if (p?.consent?.tosVersion === TOS_VERSION) {
        setHasConsent(true);
        setTosAccepted(true);
        setMarketingConsent(!!p.consent.marketingConsent);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      if (!hasConsent) {
        const c = await recordConsentAction({ tosAccepted, marketingConsent });
        if (!c.success) {
          toast({ variant: 'destructive', title: 'Errore', description: c.error });
          setSubmitting(false);
          return;
        }
      }
      const origin = window.location.origin;
      const res = await startCompanyProfileSubscriptionAction(origin, locale, billingCycle);
      if (res.success && res.url) {
        window.location.href = res.url;
      } else if (!res.success) {
        toast({ variant: 'destructive', title: 'Errore', description: res.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href={`/${locale}/hub/company-profile`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {en ? 'Back' : 'Indietro'}
      </Link>
      <h1 className="mb-2 text-2xl font-bold">
        {en ? 'Start your subscription' : 'Avvia il tuo abbonamento'}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {en
          ? 'The first 30 days are free — you can cancel anytime during the trial without being charged.'
          : 'I primi 30 giorni sono gratuiti — puoi disdire in qualsiasi momento durante la prova senza alcun addebito.'}
      </p>

      {/* Plan picker — Monthly vs Annual */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setBillingCycle('monthly')}
          className={`rounded-xl border-2 p-5 text-left transition-all ${
            billingCycle === 'monthly'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border bg-card hover:border-primary/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {en ? 'Monthly' : 'Mensile'}
              </p>
              <p className="mt-2 text-2xl font-bold">
                €4,99<span className="text-sm font-normal text-muted-foreground">/{en ? 'month' : 'mese'}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {en ? 'Flexible, cancel anytime' : 'Flessibile, disdici quando vuoi'}
              </p>
            </div>
            {billingCycle === 'monthly' && (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setBillingCycle('annual')}
          className={`relative rounded-xl border-2 p-5 text-left transition-all ${
            billingCycle === 'annual'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border bg-card hover:border-primary/40'
          }`}
        >
          <span className="absolute -top-2 right-4 rounded-full border border-green-500/30 bg-green-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
            {en ? '2 months free' : '2 mesi gratis'}
          </span>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {en ? 'Annual' : 'Annuale'}
              </p>
              <p className="mt-2 text-2xl font-bold">
                €49,99<span className="text-sm font-normal text-muted-foreground">/{en ? 'year' : 'anno'}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {en
                  ? '~€4,17/month · save €9,89/year'
                  : '~€4,17/mese · risparmi €9,89/anno'}
              </p>
            </div>
            {billingCycle === 'annual' && (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            )}
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{en ? "What's included" : 'Cosa include'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            en ? 'A public page at studiofaraj.it/<your-slug>' : 'Una pagina pubblica su studiofaraj.it/<tuo-slug>',
            en ? 'Auto-added to our sitemap.xml for SEO' : 'Aggiunta automatica alla nostra sitemap.xml per la SEO',
            en ? 'Edit anytime — services, stats, social, contacts' : 'Modifica in qualsiasi momento — servizi, statistiche, social, contatti',
            en ? 'Cancel anytime from the Stripe Customer Portal' : 'Disdici in qualsiasi momento dal Customer Portal di Stripe',
          ].map((t) => (
            <p key={t} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      {!hasConsent && (
        <Card className="mt-6 border-orange-500/30 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-base">{en ? 'Consent' : 'Consenso'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={tosAccepted}
                onCheckedChange={(v) => setTosAccepted(v === true)}
                className="mt-0.5"
              />
              <span>
                {en ? 'I accept the ' : 'Accetto i '}
                <Link href={`/${locale}/terms`} target="_blank" className="text-primary underline">
                  {en ? 'Terms of Service' : 'Termini di Servizio'}
                </Link>
                {en ? ' and ' : ' e la '}
                <Link href={`/${locale}/legal`} target="_blank" className="text-primary underline">
                  {en ? 'Privacy Policy' : 'Privacy Policy'}
                </Link>
                . *
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={marketingConsent}
                onCheckedChange={(v) => setMarketingConsent(v === true)}
                className="mt-0.5"
              />
              <span>
                {en
                  ? "I agree to receive marketing communications from Studio Faraj (optional)."
                  : "Acconsento a ricevere comunicazioni di marketing da Studio Faraj (opzionale)."}
              </span>
            </label>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleStart}
          disabled={submitting || (!hasConsent && !tosAccepted)}
          className="gap-2"
          size="lg"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {en ? 'Continue to checkout' : 'Continua al checkout'}
        </Button>
      </div>
    </div>
  );
}
