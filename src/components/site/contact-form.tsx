'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createMessage } from '@/lib/message-actions';
import { whatsappUrl } from '@/lib/contact-info';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';
import { FIELD, FieldError, FieldMark, SectionLabel, SentMark, useServiceOptions } from './form-fields';
import { WhatsAppIcon } from './whatsapp-icon';

type ActionState = {
  message: string | null;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

/**
 * The /contatti form, in the quote dialog's look. It saves the message like
 * the old contact form did (source "contact-form"); or, from the same fields,
 * it opens WhatsApp with the message already written.
 */
export function ContactForm() {
  // A new key after a sent message gives a fresh, empty form.
  const [round, setRound] = useState(0);
  return <Form key={round} onAnother={() => setRound((r) => r + 1)} />;
}

function Form({ onAnother }: { onAnother: () => void }) {
  const t = useTranslations('quoteDialog');
  const c = useTranslations('contactPage.v2.form');
  const tServer = useTranslations('serverActions');
  const locale = useLocale() as Locale;
  const serviceOptions = useServiceOptions();
  const [service, setService] = useState('');
  const form = useRef<HTMLFormElement>(null);
  const [state, dispatch] = useActionState<ActionState, FormData>(createMessage, {
    message: null,
    success: false,
    errors: {},
  });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  };

  // Whatever the visitor has typed becomes the WhatsApp message; nothing is
  // saved on our side, WhatsApp only opens with the text ready to send.
  const openWhatsApp = () => {
    const data = new FormData(form.current ?? undefined);
    const name = String(data.get('name') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const serviceLabel = serviceOptions.find((o) => o.value === service)?.label;
    const lines = [name ? c('waHelloNamed', { name }) : c('waHello')];
    if (serviceLabel) lines.push(c('waService', { service: serviceLabel }));
    lines.push('', message || c('waDefault'));
    window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener,noreferrer');
  };

  if (state.success) {
    return (
      <div role="status" className="flex min-h-[30rem] flex-col items-start justify-center">
        <SentMark />
        <h2 className="mt-7 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{t('success.title')}</h2>
        <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{t('success.description')}</p>
        <Button onClick={onAnother} variant="outline" className="mt-8 h-12 rounded-xl px-7 text-base font-semibold">
          {c('another')}
        </Button>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const failed = state.message && !state.success;

  return (
    <form ref={form} id="contact-form" onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="source" value="contact-form" />
      <input type="hidden" name="locale" value={locale} />

      {failed && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {tServer(state.message!)}
        </p>
      )}

      <div role="group" aria-labelledby="cf-you">
        <SectionLabel index="01" id="cf-you">{c('you')}</SectionLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Label htmlFor="cf-name" className="sr-only">{t('form.name')}</Label>
            <Input
              id="cf-name"
              name="name"
              autoComplete="name"
              placeholder={t('form.name')}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'cf-name-error' : undefined}
              className={cn(FIELD, 'pr-9')}
            />
            <FieldMark />
            <FieldError id="cf-name-error" field="name" errors={errors.name} />
          </div>
          <div className="relative">
            <Label htmlFor="cf-email" className="sr-only">{t('form.email')}</Label>
            <Input
              id="cf-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('form.email')}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'cf-email-error' : undefined}
              className={cn(FIELD, 'pr-9')}
            />
            <FieldMark />
            <FieldError id="cf-email-error" field="email" errors={errors.email} />
          </div>
          <div className="relative sm:col-span-2">
            <Label htmlFor="cf-phone" className="sr-only">
              {c('phone')} ({t('form.optional')})
            </Label>
            <Input
              id="cf-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={c('phone')}
              className={cn(FIELD, 'pr-[5.5rem]')}
            />
            <FieldMark optional />
          </div>
        </div>
      </div>

      <div role="group" aria-labelledby="cf-message-label">
        <SectionLabel index="02" id="cf-message-label">{c('message')}</SectionLabel>
        <div className="mt-4">
          <Label htmlFor="cf-service" className="sr-only">
            {t('form.service')} ({t('form.optional')})
          </Label>
          <Select name="service" value={service} onValueChange={setService}>
            <SelectTrigger
              id="cf-service"
              className={cn(FIELD, 'text-left focus:border-primary focus:ring-4 focus:ring-primary/15 focus:ring-offset-0 data-[placeholder]:text-muted-foreground')}
              suppressHydrationWarning
            >
              <SelectValue placeholder={t('form.service')} />
              <span aria-hidden className="ml-auto mr-2 shrink-0 pl-2 text-xs text-muted-foreground">
                {t('form.optional')}
              </span>
            </SelectTrigger>
            <SelectContent className="max-h-[280px] rounded-xl p-1 shadow-xl">
              {serviceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="min-h-[44px] cursor-pointer rounded-lg py-2.5 text-[15px]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative mt-3">
          <Label htmlFor="cf-message" className="sr-only">{c('messagePlaceholder')}</Label>
          <Textarea
            id="cf-message"
            name="message"
            placeholder={c('messagePlaceholder')}
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'cf-message-error' : undefined}
            className={cn(FIELD, 'h-auto min-h-[136px] resize-none py-3 pr-9 leading-relaxed')}
          />
          <FieldMark />
          <FieldError id="cf-message-error" field="message" errors={errors.message} />
        </div>
        <p className="mt-2.5 text-right text-xs text-muted-foreground">
          <span aria-hidden className="font-semibold text-primary">*</span> {t('form.requiredNote')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 pb-2">
          <Checkbox id="cf-terms" required className="mt-0.5 h-5 w-5 rounded-md border-input data-[state=checked]:border-primary" />
          <Label htmlFor="cf-terms" className="cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground">
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
              {c('submit')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={openWhatsApp}
          className="flex min-h-[52px] w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 rounded-xl px-4 py-2 text-[15px] font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <WhatsAppIcon />
          {c('whatsapp')}
          <span className="text-[13px] font-normal text-muted-foreground">· {c('whatsappNote')}</span>
        </button>
      </div>
    </form>
  );
}
