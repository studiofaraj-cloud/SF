'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from 'lucide-react';
import { createServiceRequestAction } from '@/lib/service-request-actions';
import { contactServices } from '@/lib/definitions';
import { useServiceOptions, SectionLabel } from '@/components/site/form-fields';
import { cn } from '@/lib/utils';

const T = {
  it: {
    back: 'Le mie richieste',
    title: 'Nuova richiesta',
    lead: 'Raccontaci il progetto: ti rispondiamo di solito entro 24 ore lavorative, con le domande che servono o direttamente con il preventivo.',
    welcome: 'Account creato. Ora raccontaci il progetto.',
    service: 'Di cosa hai bisogno',
    other: 'Altro',
    project: 'Il progetto',
    name: 'Titolo',
    namePh: 'es. Sito per la mia impresa edile',
    brief: 'Descrizione',
    briefPh: 'Cosa fa la tua attività, cosa vuoi ottenere, esempi che ti piacciono, contenuti che hai già…',
    guide: 'Usa una traccia',
    guideText: 'La mia attività: \nCosa vorrei ottenere: \nSiti o app che mi piacciono: \nContenuti che ho già (logo, testi, foto): \n',
    chars: (n: number) => `${n} caratteri`,
    details: 'Tempi e budget',
    optional: 'facoltativo',
    timeline: 'Quando ti servirebbe',
    timelines: ['Prima possibile', 'Entro 1–2 mesi', 'Entro 3–6 mesi', 'Nessuna fretta'],
    budget: 'Budget indicativo',
    budgets: ['Fino a 2.000 €', '2.000–5.000 €', '5.000–10.000 €', 'Oltre 10.000 €', 'Non lo so ancora'],
    submit: 'Invia la richiesta',
    after: 'Dopo l’invio trovi la richiesta in “Le mie richieste” e ti arriva un’email di conferma.',
    error: 'Qualcosa è andato storto. Riprova.',
  },
  en: {
    back: 'My requests',
    title: 'New request',
    lead: 'Tell us about the project: we usually reply within 24 working hours, with any questions we have or straight with the quote.',
    welcome: 'Account created. Now tell us about the project.',
    service: 'What do you need',
    other: 'Other',
    project: 'The project',
    name: 'Title',
    namePh: 'e.g. Website for my building company',
    brief: 'Description',
    briefPh: 'What your business does, what you want to achieve, examples you like, content you already have…',
    guide: 'Use a template',
    guideText: 'My business: \nWhat I want to achieve: \nWebsites or apps I like: \nContent I already have (logo, copy, photos): \n',
    chars: (n: number) => `${n} characters`,
    details: 'Timing and budget',
    optional: 'optional',
    timeline: 'When you’d need it',
    timelines: ['As soon as possible', 'Within 1–2 months', 'Within 3–6 months', 'No rush'],
    budget: 'Rough budget',
    budgets: ['Up to €2,000', '€2,000–5,000', '€5,000–10,000', 'Over €10,000', 'Not sure yet'],
    submit: 'Send the request',
    after: 'Once sent, you’ll find it under “My requests” and get a confirmation email.',
    error: 'Something went wrong. Please try again.',
  },
} as const;

const FIELD =
  'w-full rounded-xl border border-input bg-background px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-primary focus:ring-[3px] focus:ring-primary/15 disabled:opacity-60 aria-[invalid=true]:border-destructive';
const CHIP =
  'inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring';

export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequestForm />
    </Suspense>
  );
}

function NewRequestForm() {
  const params = useParams();
  const locale = params?.locale === 'en' ? 'en' : 'it';
  const t = T[locale];
  const router = useRouter();
  const search = useSearchParams();
  const services = useServiceOptions().map((s) => (s.value === 'altro' ? { ...s, label: t.other } : s));

  // ?service=e-commerce (from a service page or the quote dialog) preselects it.
  const preset = search.get('service');
  const [type, setType] = useState(contactServices.some((s) => s.value === preset) ? (preset as string) : '');
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [loading, setLoading] = useState(false);
  const briefRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const welcome = search.get('welcome') === '1';

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const insertGuide = () => {
    setBrief((b) => (b.trim() ? `${b.trimEnd()}\n\n${t.guideText}` : t.guideText));
    setTimeout(() => {
      const el = briefRef.current;
      if (!el) return;
      el.focus();
      // Cursor after the template's first prompt, ready to type (the
      // template is always the end of the text).
      const at = el.value.length - t.guideText.length + t.guideText.indexOf(': ') + 2;
      el.setSelectionRange(at, at);
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    try {
      const result = await createServiceRequestAction({ type, title, brief, budget, timeline, locale });
      if (!result.success) {
        setErrors(result.errors ?? {});
        setError(result.message ?? t.error);
        setLoading(false);
        return;
      }
      router.replace(result.id ? `/${locale}/hub/requests/${result.id}` : `/${locale}/hub/requests`);
    } catch {
      setError(t.error);
      setLoading(false);
    }
  };

  const fieldError = (name: string) =>
    errors[name]?.[0] ? (
      <p id={`${name}-error`} className="mt-1.5 text-[13px] text-destructive">
        {errors[name]![0]}
      </p>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 md:pt-10">
      <Link
        href={`/${locale}/hub/requests`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" /> {t.back}
      </Link>

      {welcome && (
        <p role="status" className="mt-5 flex items-center gap-2.5 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <PartyPopper aria-hidden className="h-4 w-4 shrink-0" />
          {t.welcome}
        </p>
      )}

      <h1 className="mt-5 font-display text-[2.2rem] font-extrabold leading-none tracking-[-0.03em] md:text-[2.6rem]">{t.title}</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{t.lead}</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-9 rounded-[24px] p-0 sm:rounded-[28px] sm:p-8 sm:ring-1 sm:ring-border">
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive outline-none"
          >
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div role="radiogroup" aria-labelledby="service-label" aria-describedby={errors.type ? 'type-error' : undefined}>
          <SectionLabel index="01" id="service-label">{t.service}</SectionLabel>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {services.map((s) => {
              const on = type === s.value;
              return (
                <label
                  key={s.value}
                  className={cn(
                    CHIP,
                    'cursor-pointer justify-between gap-2 py-2.5 pr-3 leading-tight',
                    on ? 'border-primary bg-primary/5 text-foreground' : 'border-input hover:border-foreground/30',
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={s.value}
                    checked={on}
                    onChange={() => setType(s.value)}
                    disabled={loading}
                    className="sr-only"
                  />
                  {s.label}
                  <span
                    aria-hidden
                    className={cn(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors',
                      on ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                    )}
                  >
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldError('type')}
        </div>

        <div role="group" aria-labelledby="project-label" className="space-y-5">
          <SectionLabel index="02" id="project-label">{t.project}</SectionLabel>
          <div>
            <label htmlFor="title" className="mb-1.5 block text-[13px] font-medium">{t.name}</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.namePh}
              maxLength={140}
              disabled={loading}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={cn(FIELD, 'h-[50px]')}
            />
            {fieldError('title')}
          </div>
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label htmlFor="brief" className="text-[13px] font-medium">{t.brief}</label>
              <button
                type="button"
                onClick={insertGuide}
                disabled={loading}
                className="min-h-0 min-w-0 text-[13px] font-medium text-primary hover:underline"
              >
                {t.guide}
              </button>
            </div>
            <textarea
              id="brief"
              ref={briefRef}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={8}
              placeholder={t.briefPh}
              disabled={loading}
              aria-invalid={!!errors.brief}
              aria-describedby={errors.brief ? 'brief-error' : 'brief-count'}
              className={cn(FIELD, 'min-h-[180px] resize-y py-3 leading-relaxed')}
            />
            <div className="mt-1.5 flex justify-between gap-3">
              {fieldError('brief') ?? <span />}
              <p id="brief-count" className="shrink-0 text-xs text-muted-foreground">{t.chars(brief.trim().length)}</p>
            </div>
          </div>
        </div>

        <div role="group" aria-labelledby="details-label" className="space-y-5">
          <SectionLabel index="03" id="details-label">
            {t.details} <span className="normal-case tracking-normal text-muted-foreground/70">· {t.optional}</span>
          </SectionLabel>
          <ChoiceGroup label={t.timeline} name="timeline" options={t.timelines} value={timeline} onChange={setTimeline} disabled={loading} />
          <ChoiceGroup label={t.budget} name="budget" options={t.budgets} value={budget} onChange={setBudget} disabled={loading} />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-[0_10px_24px_-10px_hsl(var(--primary)/0.7)] transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t.submit}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[13px] text-muted-foreground">{t.after}</p>
        </div>
      </form>
    </div>
  );
}

/** One-tap answers: pressing one picks it, pressing it again clears it. */
function ChoiceGroup({
  label,
  name,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div role="group" aria-labelledby={`${name}-label`}>
      <p id={`${name}-label`} className="mb-2 text-[13px] font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onChange(on ? '' : o)}
              className={cn(CHIP, on ? 'border-primary bg-primary/5 text-foreground' : 'border-input text-muted-foreground hover:border-foreground/30 hover:text-foreground')}
            >
              {on && <Check aria-hidden className="h-3.5 w-3.5 text-primary" strokeWidth={3} />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
