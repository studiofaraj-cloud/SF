'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getMyCompanyProfileAction,
  manageBillingAction,
} from '@/lib/company-profile-actions';

/**
 * Fixed banner shown at the top of every hub page when the current user's
 * subscription is in `past_due` state. Informs them their page is still
 * online but will go offline if payment isn't fixed within Stripe's grace
 * period (5 days as configured in Dashboard).
 *
 * Self-fetches via getMyCompanyProfileAction so it can be mounted globally
 * without prop drilling.
 */
export function PastDueBanner() {
  const params = useParams();
  const locale = (params?.locale as string) === 'en' ? 'en' : 'it';
  const en = locale === 'en';
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyCompanyProfileAction()
      .then((p) => {
        if (cancelled) return;
        const status = p?.subscription?.status;
        setShow(status === 'past_due');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const openPortal = async () => {
    setBusy(true);
    try {
      const res = await manageBillingAction(window.location.origin, locale);
      if (res.success && res.url) window.location.href = res.url;
      else if (!res.success) toast({ variant: 'destructive', title: 'Errore', description: res.error });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b border-orange-500/40 bg-orange-500/10 backdrop-blur-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="text-sm">
            <p className="font-semibold text-orange-700 dark:text-orange-400">
              {en ? 'Payment failed' : 'Pagamento non riuscito'}
            </p>
            <p className="text-orange-700/80 dark:text-orange-400/80">
              {en
                ? 'Your page is still online during a 5-day grace period. Update your payment to keep it online.'
                : 'La tua pagina è ancora online (periodo di grazia 5 giorni). Aggiorna il pagamento per non andare offline.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={openPortal} disabled={busy} className="bg-orange-600 text-white hover:bg-orange-700">
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            {en ? 'Update payment' : 'Aggiorna pagamento'}
          </Button>
          <Button asChild size="sm" variant="outline" className="border-orange-500/40 text-orange-700 hover:bg-orange-500/10">
            <Link href={`/${locale}/hub/company-profile/subscription`}>
              {en ? 'Subscription page' : 'Vai all\'abbonamento'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
