import Image from 'next/image';
import { CreditCard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERVICE_REQUEST_STATUS_ORDER, statusLabel } from '@/lib/service-request-status';

const MONO = 'font-mono text-[11px] uppercase tracking-[0.16em]';

const COPY = {
  it: {
    label: 'Anteprima dell’area clienti: una richiesta con il preventivo inviato, un messaggio dello studio e il preventivo da pagare.',
    eyebrow: 'La tua richiesta',
    title: 'Nuovo sito aziendale',
    meta: 'Sviluppo web · aggiornata oggi',
    message: 'Ti ho caricato il preventivo e una prima struttura delle pagine. Dimmi pure se vuoi cambiare qualcosa.',
    quote: 'Preventivo',
    quoteState: 'da pagare',
    pay: 'Paga',
  },
  en: {
    label: 'Preview of the client area: a request with the quote sent, a message from the studio and the quote to pay.',
    eyebrow: 'Your request',
    title: 'New company website',
    meta: 'Web development · updated today',
    message: 'I’ve uploaded the quote and a first outline of the pages. Let me know if you’d like to change anything.',
    quote: 'Quote',
    quoteState: 'to pay',
    pay: 'Pay',
  },
} as const;

// The request moves through the statuses the hub really uses; the preview
// shows it right after the quote has been sent.
const STEPS = SERVICE_REQUEST_STATUS_ORDER.filter((s) => s !== 'closed');
const CURRENT = STEPS.indexOf('quoted');

/**
 * A still picture of the client area — what a request looks like once the
 * studio has replied. Drawn in HTML (sharp at any size, no image to load) and
 * exposed to assistive tech as one image with a description.
 */
export function RequestPreview({ locale, className }: { locale: 'it' | 'en'; className?: string }) {
  const c = COPY[locale];
  return (
    <div
      role="img"
      aria-label={c.label}
      className={cn('rounded-[18px] bg-white p-5 text-slate-900 shadow-[0_30px_60px_-30px_rgba(2,8,23,0.55)] sm:px-6', className)}
    >
      <div className="flex items-center justify-between gap-3 text-slate-500">
        <span className={MONO}>{c.eyebrow}</span>
        <span className="rounded-full bg-violet-600/10 px-2.5 py-1 text-xs font-medium text-violet-700">{statusLabel('quoted', locale)}</span>
      </div>
      <p className="mt-2.5 font-display text-xl font-bold tracking-[-0.01em]">{c.title}</p>
      <p className="mt-0.5 text-[13px] text-slate-500">{c.meta}</p>

      <ol className="mt-5 grid grid-cols-5 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} className={cn('text-[11px] leading-tight text-slate-500', i === CURRENT && 'font-semibold text-slate-900')}>
            <span
              aria-hidden
              className={cn(
                'mb-2 block h-1 rounded-full',
                i < CURRENT ? 'bg-primary' : i === CURRENT ? 'bg-[linear-gradient(90deg,hsl(var(--primary))_55%,#e2e8f0_55%)]' : 'bg-slate-200',
              )}
            />
            {statusLabel(s, locale)}
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-start gap-2.5 border-t border-slate-200 pt-4">
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-navy">
          <Image src="/assets/logo-white.webp" alt="" width={18} height={18} />
        </span>
        <p className="rounded-[4px_14px_14px_14px] bg-mist px-3 py-2 text-[13px] leading-snug">{c.message}</p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
        <span className="flex items-center gap-1.5">
          <FileText aria-hidden className="h-[15px] w-[15px]" />
          <b className="font-semibold">{c.quote}</b> · {c.quoteState}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-slate-900 px-3 py-[7px] text-[12.5px] font-semibold text-white">
          <CreditCard aria-hidden className="h-[15px] w-[15px]" />
          {c.pay}
        </span>
      </div>
    </div>
  );
}
