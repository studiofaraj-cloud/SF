/**
 * Centralised IT + EN copy for all Company Profile subscription lifecycle
 * emails. The webhook handler reads from here so the bodies are consistent
 * and easy to update without touching code.
 *
 * Each scenario takes a `vars` bag with the placeholders it needs filled.
 * The functions are pure — no I/O — so they're safe to call from anywhere.
 */

import type { Locale } from './copy';

export type SubscriptionEmailScenario =
  | 'subscription-payment-receipt'
  | 'subscription-trial-ending'
  | 'subscription-payment-failed'
  | 'subscription-canceled'
  | 'subscription-renewal-reminder';

export interface SubscriptionEmailVars {
  /** Display name of the company (used in subject + body). */
  companyName?: string;
  /** Slug — used to build links to the public page. */
  slug?: string;
  /** Formatted amount string, e.g. "€4,99" or "€49,99". */
  amount?: string;
  /** Formatted period start (e.g. "1 giugno 2026"). */
  periodStart?: string;
  /** Formatted period end (e.g. "30 giugno 2026"). */
  periodEnd?: string;
  /** Formatted next-renewal date. */
  renewalDate?: string;
  /** Stripe-hosted PDF URL of the invoice. */
  invoicePdfUrl?: string;
  /** Locale for link construction. */
  locale: Locale;
  /** Full origin for CTA URLs, e.g. https://studiofaraj.it. */
  siteUrl: string;
}

export interface SubscriptionEmailCopy {
  subject: string;
  heading: string;
  intro: string;
  body?: string;
  ctaLabel: string;
  ctaUrl: string;
}

const company = (v: SubscriptionEmailVars) => v.companyName ?? 'la tua pagina';
const companyEn = (v: SubscriptionEmailVars) => v.companyName ?? 'your page';

export function getSubscriptionEmailCopy(
  scenario: SubscriptionEmailScenario,
  v: SubscriptionEmailVars
): SubscriptionEmailCopy {
  const en = v.locale === 'en';
  const hubUrl = `${v.siteUrl}/${v.locale}/hub/company-profile`;
  const subUrl = `${v.siteUrl}/${v.locale}/hub/company-profile/subscription`;
  const billingUrl = `${v.siteUrl}/${v.locale}/hub/company-profile/billing`;
  const startUrl = `${v.siteUrl}/${v.locale}/hub/company-profile/subscription/start`;

  switch (scenario) {
    case 'subscription-payment-receipt': {
      const amount = v.amount ?? '€4,99';
      const period = v.periodStart && v.periodEnd
        ? (en ? `${v.periodStart} → ${v.periodEnd}` : `${v.periodStart} → ${v.periodEnd}`)
        : '';
      const next = v.renewalDate ?? '';
      return {
        subject: en
          ? `Receipt: ${amount} — Studio Faraj`
          : `Ricevuta: ${amount} — Studio Faraj`,
        heading: en ? 'Payment received' : 'Pagamento ricevuto',
        intro: en
          ? `Thanks — we received your payment of ${amount} for "${companyEn(v)}". ${period ? `Billing period: ${period}.` : ''} ${next ? `Next renewal: ${next}.` : ''}`
          : `Grazie — abbiamo ricevuto il tuo pagamento di ${amount} per "${company(v)}". ${period ? `Periodo: ${period}.` : ''} ${next ? `Prossimo rinnovo: ${next}.` : ''}`,
        body: v.invoicePdfUrl
          ? (en
              ? `You can <a href="${v.invoicePdfUrl}" style="color:#3b82f6;text-decoration:underline">download the PDF invoice</a> directly from Stripe. All past invoices are also available from your Hub.`
              : `Puoi <a href="${v.invoicePdfUrl}" style="color:#3b82f6;text-decoration:underline">scaricare la fattura PDF</a> direttamente da Stripe. Trovi tutte le fatture passate anche nella tua area Hub.`)
          : undefined,
        ctaLabel: en ? 'View all invoices' : 'Vedi tutte le fatture',
        ctaUrl: billingUrl,
      };
    }

    case 'subscription-trial-ending':
      return {
        subject: en
          ? `Your trial ends in 3 days — Studio Faraj`
          : `La tua prova gratuita finisce tra 3 giorni — Studio Faraj`,
        heading: en ? 'Your trial is ending soon' : 'Il tuo periodo di prova sta per finire',
        intro: en
          ? `Heads up: your 30-day free trial for "${companyEn(v)}" ends in 3 days. We'll charge ${v.amount ?? '€4,99'} to your saved payment method to keep the page online.`
          : `Promemoria: il tuo periodo di prova gratuito di 30 giorni per "${company(v)}" finisce tra 3 giorni. Addebiteremo ${v.amount ?? '€4,99'} sul tuo metodo di pagamento per mantenere la pagina online.`,
        body: en
          ? 'If you want to update your card or cancel before the charge, you can do so from the Subscription page.'
          : "Se vuoi aggiornare la tua carta o cancellare prima dell'addebito, puoi farlo dalla pagina Abbonamento.",
        ctaLabel: en ? 'Manage subscription' : 'Gestisci abbonamento',
        ctaUrl: subUrl,
      };

    case 'subscription-payment-failed':
      return {
        subject: en
          ? 'Payment failed — action needed in 5 days'
          : 'Pagamento non riuscito — azione richiesta entro 5 giorni',
        heading: en ? 'Payment failed' : 'Pagamento non riuscito',
        intro: en
          ? `We weren't able to charge your card for "${companyEn(v)}". The page stays online for 5 more days while we retry — please update your payment method to avoid suspension.`
          : `Non siamo riusciti ad addebitare la tua carta per "${company(v)}". La pagina resta online per altri 5 giorni mentre ritentiamo — aggiorna il metodo di pagamento per evitare la sospensione.`,
        body: en
          ? 'Click below to open Stripe Customer Portal and update your payment method.'
          : 'Clicca sotto per aprire Stripe Customer Portal e aggiornare il metodo di pagamento.',
        ctaLabel: en ? 'Update payment' : 'Aggiorna pagamento',
        ctaUrl: subUrl,
      };

    case 'subscription-canceled':
      return {
        subject: en
          ? `Subscription canceled — "${companyEn(v)}" is offline`
          : `Abbonamento cancellato — "${company(v)}" è offline`,
        heading: en ? 'Subscription canceled' : 'Abbonamento cancellato',
        intro: en
          ? `Your subscription has been canceled and "${companyEn(v)}" is now offline. We've kept your slug ${v.slug ? `studiofaraj.it/${v.slug}` : ''} reserved, so the page comes back online the moment you reactivate.`
          : `Il tuo abbonamento è stato cancellato e "${company(v)}" è ora offline. Lo slug ${v.slug ? `studiofaraj.it/${v.slug}` : ''} resta riservato a te: la pagina torna online appena riattivi.`,
        body: en
          ? 'Want to reactivate? It only takes a click — your content is preserved.'
          : 'Vuoi riattivare? Basta un click — i tuoi contenuti sono conservati.',
        ctaLabel: en ? 'Reactivate now' : 'Riattiva ora',
        ctaUrl: startUrl,
      };

    case 'subscription-renewal-reminder':
      return {
        subject: en
          ? `Annual renewal in 7 days — Studio Faraj`
          : `Rinnovo annuale tra 7 giorni — Studio Faraj`,
        heading: en ? 'Annual renewal coming up' : 'Rinnovo annuale in arrivo',
        intro: en
          ? `Your annual subscription for "${companyEn(v)}" renews in 7 days${v.renewalDate ? ` (${v.renewalDate})` : ''}. We'll charge ${v.amount ?? '€49,99'} to your saved card.`
          : `Il tuo abbonamento annuale per "${company(v)}" si rinnova tra 7 giorni${v.renewalDate ? ` (${v.renewalDate})` : ''}. Addebiteremo ${v.amount ?? '€49,99'} sulla carta salvata.`,
        body: en
          ? 'If you want to update your card or switch to monthly billing, you can do so from the Hub.'
          : 'Se vuoi aggiornare la carta o passare al piano mensile, puoi farlo dal Hub.',
        ctaLabel: en ? 'Manage subscription' : 'Gestisci abbonamento',
        ctaUrl: subUrl,
      };
  }
}
