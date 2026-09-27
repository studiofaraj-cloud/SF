'use client';

import { useActionState, useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowRight, ArrowUpRight, Loader2, Mail, MapPin, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMessage } from '@/lib/message-actions';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';
import { FIELD, FieldError, FieldMark, SectionLabel, SentMark, useServiceOptions } from './form-fields';

export type QuoteDialogPrefill = {
  service?: string;
  budget?: string;
  message?: string;
};

type QuoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: QuoteDialogPrefill;
  /** Opened from outside a DialogTrigger? Use this to send focus back on close. */
  onCloseAutoFocus?: (event: Event) => void;
};

type Draft = Required<QuoteDialogPrefill>;

type ActionState = {
  message: string | null;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

const STEPS = ['analysis', 'proposal', 'build'] as const;

const EMPTY_DRAFT: Draft = { service: '', budget: '', message: '' };

/**
 * Quote request dialog: a navy side with what happens next, and the form.
 *
 * The project fields (service, budget, message) live here, so a long message
 * survives an accidental close. The form itself (QuoteForm) remounts on every
 * open, which gives each visit a fresh submission state and success screen.
 * The homepage hero shows an excerpt of this file; keep the two in step.
 */
export default function QuoteDialog({ open, onOpenChange, prefill, onCloseAutoFocus }: QuoteDialogProps) {
  const t = useTranslations('quoteDialog');
  const [draft, setDraft] = useState<Draft>({ ...EMPTY_DRAFT, ...prefill });
  const updateDraft = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const clearDraft = useCallback(() => setDraft(EMPTY_DRAFT), []);

  useEffect(() => {
    if (open && prefill) {
      setDraft((d) => ({
        service: prefill.service ?? d.service,
        budget: prefill.budget ?? d.budget,
        message: prefill.message ?? d.message,
      }));
    }
  }, [open, prefill]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy/70 backdrop-blur-md duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            'fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-background text-foreground outline-none',
            'duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-6',
            // From lg: a floating two-column sheet, centred without transforms
            // so the entrance animation is free to use them.
            'lg:m-auto lg:grid lg:h-fit lg:grid-rows-[minmax(0,1fr)] lg:max-h-[calc(100dvh-4rem)] lg:w-[min(1120px,calc(100vw-4rem))] lg:grid-cols-[5fr_7fr] lg:overflow-hidden lg:rounded-[28px] lg:shadow-[0_50px_120px_-30px_rgba(2,8,23,0.8)] lg:ring-1 lg:ring-white/10 lg:data-[state=closed]:zoom-out-[0.98] lg:data-[state=open]:zoom-in-[0.97] lg:data-[state=open]:slide-in-from-bottom-3',
          )}
        >
          <Aside />

          <div className="relative min-h-0 lg:flex lg:flex-col lg:overflow-y-auto">
            <div className="px-5 pb-10 pt-8 sm:px-10 lg:my-auto lg:px-12 lg:py-12">
              <QuoteForm
                draft={draft}
                onDraftChange={updateDraft}
                onSent={clearDraft}
              />
            </div>
          </div>

          <DialogPrimitive.Close className="fixed right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:absolute lg:right-5 lg:top-5">
            <X className="h-5 w-5" />
            <span className="sr-only">{t('close')}</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** The navy side: title, what happens next, where to find us. */
function Aside() {
  const t = useTranslations('quoteDialog');

  return (
    <aside className="relative isolate overflow-hidden bg-navy px-5 pb-9 pt-16 text-white sm:px-10 lg:flex lg:flex-col lg:px-12 lg:py-12">
      <div aria-hidden className="tech-grid absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -bottom-48 -left-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/35 blur-[120px]" />

      <p className="qd-rise flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:hidden" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        {t('available')}
      </p>

      <DialogTitle
        className="qd-rise mt-6 max-w-[12ch] font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]"
        style={{ '--d': '60ms' } as React.CSSProperties}
      >
        {t('title')}
      </DialogTitle>
      <DialogDescription
        className="qd-rise mt-5 max-w-md leading-relaxed text-white/70 lg:text-[17px]"
        style={{ '--d': '120ms' } as React.CSSProperties}
      >
        {t('description')}
      </DialogDescription>

      <div className="lg:mt-auto">
        <div className="hidden lg:block lg:pt-10 [@media(max-height:880px)]:!hidden">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{t('next.title')}</p>
          <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-white/15">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className="qd-rise relative grid grid-cols-[1.75rem_1fr]"
                style={{ '--d': `${200 + i * 70}ms` } as React.CSSProperties}
              >
                <span aria-hidden className="mt-1.5 h-[11px] w-[11px] rounded-full border-2 border-sky-400 bg-navy" />
                <span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs text-sky-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-semibold">{t(`next.${step}.title`)}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/60">{t(`next.${step}.text`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 hidden flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/65 lg:flex">
          <a href="mailto:info@studiofaraj.it" className="inline-flex items-center gap-2 transition-colors hover:text-white">
            <Mail className="h-4 w-4 text-sky-300" />
            info@studiofaraj.it
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-300" />
            Padova (PD) · {t('operatesIn')}
          </span>
        </div>
      </div>
    </aside>
  );
}

function QuoteForm({
  draft,
  onDraftChange,
  onSent,
}: {
  draft: Draft;
  onDraftChange: (patch: Partial<Draft>) => void;
  onSent: () => void;
}) {
  const t = useTranslations('quoteDialog');
  const tServer = useTranslations('serverActions');
  const serviceOptions = useServiceOptions();
  const locale = useLocale() as Locale;
  const [state, dispatch] = useActionState<ActionState, FormData>(createMessage, {
    message: null,
    success: false,
    errors: {},
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) onSent();
  }, [state, onSent]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  };

  if (state.success) {
    return (
      <div role="status" className="flex min-h-[26rem] flex-col items-start justify-center py-6 lg:min-h-[34rem]">
        <SentMark />
        <h3 className="mt-7 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{t('success.title')}</h3>
        <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{t('success.description')}</p>
        <DialogPrimitive.Close asChild>
          <Button autoFocus className="mt-8 h-12 rounded-xl px-7 text-base font-semibold">
            {t('close')}
          </Button>
        </DialogPrimitive.Close>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const failed = state.message && !state.success;

  return (
    <form id="quote-dialog-form" onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="source" value="quote-dialog" />
      <input type="hidden" name="locale" value={locale} />

      {failed && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {tServer(state.message!)}
        </p>
      )}

      <div role="group" aria-labelledby="qd-you" className="qd-rise" style={{ '--d': '120ms' } as React.CSSProperties}>
        <SectionLabel index="01" id="qd-you">{t('sections.you')}</SectionLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Label htmlFor="name-dialog" className="sr-only">{t('form.name')}</Label>
            <Input
              id="name-dialog"
              name="name"
              autoComplete="name"
              placeholder={t('form.name')}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-dialog-error' : undefined}
              className={cn(FIELD, 'pr-9')}
            />
            <FieldMark />
            <FieldError id="name-dialog-error" field="name" errors={errors.name} />
          </div>
          <div className="relative">
            <Label htmlFor="email-dialog" className="sr-only">{t('form.email')}</Label>
            <Input
              id="email-dialog"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('form.email')}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-dialog-error' : undefined}
              className={cn(FIELD, 'pr-9')}
            />
            <FieldMark />
            <FieldError id="email-dialog-error" field="email" errors={errors.email} />
          </div>
        </div>
      </div>

      <div role="group" aria-labelledby="qd-project" className="qd-rise" style={{ '--d': '190ms' } as React.CSSProperties}>
        <SectionLabel index="02" id="qd-project">{t('sections.project')}</SectionLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="service-dialog" className="sr-only">
              {t('form.service')} ({t('form.optional')})
            </Label>
            <Select name="service" value={draft.service} onValueChange={(service) => onDraftChange({ service })}>
              <SelectTrigger
                id="service-dialog"
                className={cn(FIELD, 'text-left focus:border-primary focus:ring-4 focus:ring-primary/15 focus:ring-offset-0 data-[placeholder]:text-muted-foreground')}
                suppressHydrationWarning
              >
                <SelectValue placeholder={t('form.service')} />
                <span aria-hidden className="ml-auto mr-2 shrink-0 pl-2 text-xs text-muted-foreground">
                  {t('form.optional')}
                </span>
              </SelectTrigger>
              <SelectContent className="z-[80] max-h-[280px] rounded-xl p-1 shadow-xl">
                {serviceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="min-h-[44px] cursor-pointer rounded-lg py-2.5 text-[15px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Label htmlFor="budget-dialog" className="sr-only">
              {t('form.budget')} ({t('form.optional')})
            </Label>
            <Input
              id="budget-dialog"
              name="budget"
              placeholder={t('form.budget')}
              value={draft.budget}
              onChange={(e) => onDraftChange({ budget: e.target.value })}
              className={cn(FIELD, 'pr-[5.5rem]')}
            />
            <FieldMark optional />
          </div>
        </div>
        <div className="relative mt-3">
          <Label htmlFor="message-dialog" className="sr-only">{t('form.message')}</Label>
          <Textarea
            id="message-dialog"
            name="message"
            placeholder={t('form.message')}
            value={draft.message}
            onChange={(e) => onDraftChange({ message: e.target.value })}
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-dialog-error' : undefined}
            className={cn(FIELD, 'h-auto min-h-[136px] resize-none py-3 pr-9 leading-relaxed')}
          />
          <FieldMark />
          <FieldError id="message-dialog-error" field="message" errors={errors.message} />
        </div>
        <p className="mt-2.5 text-right text-xs text-muted-foreground">
          <span aria-hidden className="font-semibold text-primary">*</span> {t('form.requiredNote')}
        </p>
      </div>

      <div className="qd-rise space-y-5" style={{ '--d': '260ms' } as React.CSSProperties}>
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms-dialog"
            required
            className="mt-0.5 h-5 w-5 rounded-md border-input data-[state=checked]:border-primary"
          />
          <Label htmlFor="terms-dialog" className="cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground">
            {t.rich('form.privacy', {
              link: (chunks) => (
                <Link
                  href={getLocalizedPath('/legal', locale)}
                  target="_blank"
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {chunks}
                </Link>
              ),
            })}
            <span aria-hidden className="ml-1 font-semibold text-primary">*</span>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="group h-14 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-[box-shadow,background-color] hover:shadow-xl hover:shadow-primary/30"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('form.sending')}
            </>
          ) : (
            <>
              {t('form.submit')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <div className="rounded-xl border border-dashed border-border px-4 py-3.5 text-sm">
          <p className="text-muted-foreground">
            <span className="sr-only">{t('hub.or')}: </span>
            {t('hub.note')}
          </p>
          <Link
            href={`/${locale}/hub/login?mode=register&next=${encodeURIComponent(`/${locale}/hub/requests/new`)}`}
            className="mt-1.5 inline-flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-primary"
          >
            {t('hub.cta')}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* On phones the navy side is short, so the contacts close the form. */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground lg:hidden">
          <a href="mailto:info@studiofaraj.it" className="inline-flex items-center gap-2 hover:text-foreground">
            <Mail className="h-4 w-4 text-primary" />
            info@studiofaraj.it
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Padova (PD) · {t('operatesIn')}
          </span>
        </div>
      </div>
    </form>
  );
}
