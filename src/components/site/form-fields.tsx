'use client';

import { useTranslations } from 'next-intl';
import { contactServices } from '@/lib/definitions';
import { cn } from '@/lib/utils';

/*
 * The field look and helpers shared by the quote dialog and the /contatti
 * form. Labels and errors come from the quoteDialog messages.
 */

// One look for every field: tall, soft-cornered, a clear focus ring.
export const FIELD =
  'h-12 rounded-xl border-input bg-background px-4 text-[15px] shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-0 md:text-[15px] aria-[invalid=true]:border-red-500/70';

// Map service values to translation keys
const serviceValueToKey: Record<string, string> = {
  'sviluppo-web': 'webDevelopment',
  'e-commerce': 'ecommerce',
  'design-ui-ux': 'designUIUX',
  'manutenzione': 'maintenance',
  'ai-automazione': 'aiAutomation',
  'seo-marketing': 'seoMarketing',
  'hosting-cloud': 'hostingCloud',
  'consulenza': 'consulting',
  'altro': 'other',
};

/** The services a visitor can pick, labelled in the current locale. */
export function useServiceOptions() {
  const t = useTranslations('quoteDialog');
  const tServices = useTranslations('services');
  return contactServices.map((service) => {
    const serviceKey = serviceValueToKey[service.value];
    // Clients ask for "a website", so this option says so here
    // (the nav and footer keep the service's own name).
    const label =
      service.value === 'sviluppo-web'
        ? t('form.serviceWebsite')
        : serviceKey
          ? tServices(`${serviceKey}.label`)
          : service.label;
    return { value: service.value, label };
  });
}

export function SectionLabel({ index, children, id }: { index: string; children: React.ReactNode; id: string }) {
  return (
    <p id={id} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      <span className="text-primary">{index}</span>
      {children}
      <span aria-hidden className="h-px flex-1 bg-border" />
    </p>
  );
}

/** In-field marker that stays visible while typing: * or "optional". */
export function FieldMark({ optional }: { optional?: boolean }) {
  const t = useTranslations('quoteDialog');
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute right-4 top-6 -translate-y-1/2',
        optional ? 'text-xs text-muted-foreground' : 'text-base font-semibold text-primary',
      )}
    >
      {optional ? t('form.optional') : '*'}
    </span>
  );
}

// The action's validation messages are English, so show our own per field.
export function FieldError({ id, field, errors }: { id: string; field: 'name' | 'email' | 'message'; errors?: string[] }) {
  const t = useTranslations('quoteDialog');
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
      {t(`errors.${field}`)}
    </p>
  );
}

/** The success mark: a circle and a tick that draw themselves (.qd-draw). */
export function SentMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-16 w-16 text-primary">
      <circle className="qd-draw" cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="3" pathLength={1} />
      <path
        className="qd-draw"
        style={{ '--d': '0.45s' } as React.CSSProperties}
        d="M20 33.5l8 8 16-18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}
