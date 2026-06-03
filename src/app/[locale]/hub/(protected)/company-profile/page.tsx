'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  ArrowLeft,
  Building2,
  Pencil,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Receipt,
  PlusCircle,
} from 'lucide-react';
import {
  getMyCompanyProfileAction,
  syncMySubscriptionAction,
} from '@/lib/company-profile-actions';
import type { CompanyProfileDoc } from '@/lib/firestore-data';
import { profileCompleteness, QUALITY_GATE_PCT } from '@/lib/company-profile-utils';

function statusBadge(status?: string) {
  if (!status) return null;
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

export default function HubCompanyProfilePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'it';
  const en = locale === 'en';
  const [profile, setProfile] = useState<CompanyProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Always sync from Stripe first so the dashboard reflects reality even if
      // the webhook hasn't fired locally (or the user paid in another tab).
      await syncMySubscriptionAction().catch(() => {});
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Recognize "user has a subscription" via ANY of: status, stripeSubscriptionId,
  // or the fact that they have a slug claimed (means they completed onboarding).
  const sub = profile?.subscription;
  const status = sub?.status;
  const hasPaidSignal =
    !!sub?.stripeSubscriptionId ||
    status === 'trialing' ||
    status === 'active' ||
    status === 'past_due';

  // Has the user ever started building? (consent recorded OR companyName saved)
  const hasStarted = !!profile?.consent?.tosAcceptedAt || !!profile?.companyName;

  const slug = profile?.slug;
  const isPublished = !!profile?.isPublished;
  const completeness = profileCompleteness(profile);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link
        href={`/${locale}/hub`}
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <h1 className="mb-2 text-2xl font-bold">
        {en ? 'Company page' : 'Pagina aziendale'}
      </h1>

      {/* ── Case 1: nuovo utente, nessuna sub e nessun profilo → CTA inizia ── */}
      {!hasPaidSignal && !hasStarted && (
        <>
          <p className="mb-8 text-sm text-muted-foreground">
            {en
              ? 'Publish a public landing page at studiofaraj.it/<your-slug>. €4.99 / month, first month free.'
              : 'Pubblica una pagina pubblica su studiofaraj.it/<tuo-slug>. 4,99 €/mese, primo mese gratis.'}
          </p>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-6 w-6 text-primary" />
                {en ? 'Start your company page' : 'Avvia la tua pagina'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{en ? 'A clean public page at your own URL.' : 'Una pagina pubblica con il tuo URL personalizzato.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{en ? 'SEO-friendly, included in sitemap.' : 'Ottimizzata per SEO, inclusa nella sitemap.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{en ? '30-day free trial. Cancel anytime.' : '30 giorni di prova gratuita. Disdici quando vuoi.'}</span>
                </li>
              </ul>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/${locale}/hub/company-profile/subscription/start`}>
                  {en ? 'Get started' : 'Inizia ora'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Case 2: hai un abbonamento attivo → riconoscimento + edit prominente ── */}
      {hasPaidSignal && (
        <>
          <Card className="mb-6 border-green-500/40 bg-green-500/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    {en
                      ? 'Your subscription is active'
                      : 'Il tuo abbonamento è attivo'}
                    {' · '}
                    {statusBadge(status ?? 'active')}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {en
                      ? `You can edit your page any time, add more content, or preview how it looks online.`
                      : `Puoi modificare la tua pagina in qualsiasi momento, aggiungere contenuti, o vedere l'anteprima online.`}
                  </p>
                </div>
              </div>
              {slug && (
                <Button asChild size="sm" variant="outline" className="border-green-500/40 text-green-700">
                  <Link href={`/${slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    studiofaraj.it/{slug}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Completeness + Edit CTA */}
          <Card className="mb-4 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {en ? 'Your page' : 'La tua pagina'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {completeness}% {en ? 'complete' : 'completa'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={completeness} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {completeness < 100
                  ? en
                    ? `Add more content to improve how you appear on Google. Each filled section helps your SEO.`
                    : `Aggiungi contenuti per migliorare la presenza su Google. Ogni sezione compilata aiuta il tuo SEO.`
                  : en
                    ? `Your page is fully detailed — well done!`
                    : `La tua pagina è completa al 100% — ottimo lavoro!`}
              </p>
              {completeness < QUALITY_GATE_PCT && (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 text-xs text-orange-700 dark:text-orange-400">
                  <strong>{en ? 'SEO note:' : 'Nota SEO:'}</strong>{' '}
                  {en
                    ? `Below ${QUALITY_GATE_PCT}% completeness Google won't index your page (we set noindex automatically to protect the quality of studiofaraj.it). It becomes searchable as soon as you cross ${QUALITY_GATE_PCT}%.`
                    : `Sotto il ${QUALITY_GATE_PCT}% di completezza Google non indicizza la tua pagina (impostiamo automaticamente noindex per proteggere la qualità di studiofaraj.it). Diventa indicizzabile non appena superi il ${QUALITY_GATE_PCT}%.`}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link href={`/${locale}/hub/company-profile/edit`}>
                    <Pencil className="mr-1 h-4 w-4" />
                    {en ? 'Edit / Add content' : 'Modifica / Aggiungi contenuti'}
                  </Link>
                </Button>
                {slug && (
                  <Button asChild size="lg" variant="outline">
                    <Link href={`/${slug}?preview=1`} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      {en ? 'Preview page' : 'Vedi pagina'}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Secondary cards: subscription + invoices */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {en ? 'Subscription' : 'Abbonamento'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  <span className="text-muted-foreground">{en ? 'Status:' : 'Stato:'}</span>{' '}
                  {statusBadge(status ?? 'active')}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link href={`/${locale}/hub/company-profile/subscription`}>
                    {en ? 'Manage subscription' : 'Gestisci abbonamento'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-5 w-5 text-primary" />
                  {en ? 'Invoices' : 'Fatture'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {en
                    ? 'Download Stripe receipts for any past payment.'
                    : 'Scarica le ricevute Stripe dei pagamenti passati.'}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link href={`/${locale}/hub/company-profile/billing`}>
                    {en ? 'View invoices' : 'Vedi fatture'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {!isPublished && (
            <Card className="mt-4 border-orange-500/30 bg-orange-500/5">
              <CardContent className="flex items-start gap-3 pt-6">
                <PlusCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-700 dark:text-orange-400">
                    {en ? 'Page not yet published' : 'Pagina non ancora pubblicata'}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {en
                      ? 'Your subscription is active but the page is not live yet. Open the Edit page and save once to publish.'
                      : "L'abbonamento è attivo ma la pagina non è ancora online. Apri Modifica e salva una volta per pubblicare."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Case 3: hai compilato il profilo ma non hai ancora pagato ── */}
      {!hasPaidSignal && hasStarted && (
        <>
          <p className="mb-8 text-sm text-muted-foreground">
            {en
              ? 'You started filling in your page — last step is to activate the subscription to publish it.'
              : 'Hai iniziato a compilare la tua pagina — ultimo passaggio: attiva l\'abbonamento per pubblicarla.'}
          </p>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                {profile?.companyName || (en ? 'Your draft' : 'La tua bozza')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {completeness}% {en ? 'complete' : 'completa'}
                </p>
                <Progress value={completeness} className="h-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/${locale}/hub/company-profile/subscription/start`}>
                    {en ? 'Activate & publish' : 'Attiva e pubblica'}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/${locale}/hub/company-profile/edit`}>
                    <Pencil className="mr-1 h-4 w-4" />
                    {en ? 'Continue editing' : 'Continua a compilare'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
