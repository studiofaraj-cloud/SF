'use client';

import { useActionState, useRef, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBooking } from '@/lib/actions';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';
import { FIELD, FieldMark, SectionLabel, SentMark } from './form-fields';

type ActionState = {
  message: string | null;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

// The studio's hours: Mon–Fri 9–18 with a lunch break, Saturday 10–14.
const WEEKDAY_SLOTS = { morning: ['09:00', '10:00', '11:00'], afternoon: ['14:00', '15:00', '16:00', '17:00'] };
const SATURDAY_SLOTS = { morning: ['10:00', '11:00', '12:00', '13:00'], afternoon: [] as string[] };
const DAYS_PER_PAGE = 6;
const PAGES = 3;

const slotsFor = (day?: Date) => (day?.getUTCDay() === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS);
const slotLabel = (value: string) => `${Number(value.slice(0, 2))}–${Number(value.slice(0, 2)) + 1}`;
const iso = (day: Date) => day.toISOString().slice(0, 10);

/** The days a call can be booked for: from tomorrow in Italian time, without Sundays. */
function bookableDays(count: number): Date[] {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date())
    .split('-')
    .map(Number);
  const days: Date[] = [];
  let time = Date.UTC(y, m - 1, d);
  while (days.length < count) {
    time += 86_400_000;
    const day = new Date(time);
    if (day.getUTCDay() !== 0) days.push(day);
  }
  return days;
}

/**
 * Booking a call, on /call-booking and in the booking dialog: a strip of the
 * next working days, optional time slots, and the contact details. Saved by
 * createBooking; the studio then confirms the time.
 */
export function BookingForm({ source, successAction }: { source: string; successAction?: ReactNode }) {
  // A new key after a booking gives a fresh, empty form.
  const [round, setRound] = useState(0);
  return <Form key={round} source={source} successAction={successAction} onAnother={() => setRound((r) => r + 1)} />;
}

function Form({ source, successAction, onAnother }: { source: string; successAction?: ReactNode; onAnother: () => void }) {
  const t = useTranslations('bookingDialog.v2.form');
  const tq = useTranslations('quoteDialog');
  const locale = useLocale() as Locale;
  const intl = locale === 'en' ? 'en-GB' : 'it-IT';
  const [days] = useState(() => bookableDays(DAYS_PER_PAGE * PAGES));
  const [page, setPage] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [times, setTimes] = useState<string[]>([]);
  const [dayMissing, setDayMissing] = useState(false);
  const dayGroup = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useActionState<ActionState, FormData>(createBooking, { message: null, success: false });
  const [isPending, startTransition] = useTransition();

  const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intl, { ...options, timeZone: 'UTC' });
  const selected = days.find((d) => iso(d) === day);
  const slots = slotsFor(selected);
  const saturday = selected?.getUTCDay() === 6;
  const longDate = selected ? fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(selected) : '';
  const specific = times.filter((x) => x !== 'anytime');
  const timesLabel = specific.length ? specific.map(slotLabel).join(', ') : t('summaryAnytime');

  const pickDay = (d: Date) => {
    const valid = new Set(['anytime', ...slotsFor(d).morning, ...slotsFor(d).afternoon]);
    setDay(iso(d));
    setTimes((ts) => ts.filter((x) => valid.has(x)));
    setDayMissing(false);
  };

  const toggleTime = (value: string) =>
    setTimes((ts) => {
      if (value === 'anytime') return ts.includes('anytime') ? [] : ['anytime'];
      const rest = ts.filter((x) => x !== 'anytime');
      return rest.includes(value) ? rest.filter((x) => x !== value) : [...rest, value].sort();
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!day) {
      setDayMissing(true);
      dayGroup.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      dayGroup.current?.focus({ preventScroll: true });
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.append('selectedDate', day);
    times.forEach((x) => formData.append('selectedTime', x));
    formData.append('source', source);
    formData.append('locale', locale);
    startTransition(() => {
      dispatch(formData);
    });
  };

  if (state.success) {
    return (
      <div role="status" className="flex min-h-[30rem] flex-col items-start justify-center">
        <SentMark />
        <h2 className="mt-7 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">{t('success.title')}</h2>
        <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
          {t('success.text', { when: specific.length ? `${longDate}, ${timesLabel}` : longDate })}
        </p>
        <div className="mt-8">
          {successAction ?? (
            <Button onClick={onAnother} variant="outline" className="h-12 rounded-xl px-7 text-base font-semibold">
              {t('success.another')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const failed = state.message && !state.success && !state.errors;
  const chip = (on: boolean) =>
    cn(
      'min-h-[44px] rounded-xl px-2 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      on ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-primary' : 'bg-background ring-input hover:ring-foreground/30',
    );
  const fieldError = (field: 'name' | 'phone' | 'email') =>
    errors[field]?.length ? (
      <p id={`bf-${field}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
        {t(`errors.${field}`)}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {failed && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {t('errors.generic')}
        </p>
      )}

      <div ref={dayGroup} tabIndex={-1} role="group" aria-labelledby="bf-day" className="outline-none">
        <SectionLabel index="01" id="bf-day">{t('day')}</SectionLabel>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {days.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE).map((d) => {
            const on = iso(d) === day;
            return (
              <button
                key={iso(d)}
                type="button"
                aria-pressed={on}
                aria-label={fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(d)}
                onClick={() => pickDay(d)}
                className={cn(
                  'rounded-2xl px-1 py-3 text-center ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  on ? 'bg-navy text-white ring-navy dark:bg-primary dark:ring-primary' : 'bg-background ring-input hover:ring-foreground/30',
                )}
              >
                <span className={cn('block font-mono text-[10px] uppercase tracking-[0.14em]', on ? 'text-sky-300 dark:text-white/80' : 'text-muted-foreground')}>
                  {fmt({ weekday: 'short' }).format(d).replace('.', '')}
                </span>
                <span className="mt-1 block font-display text-2xl font-bold tracking-[-0.02em]">{d.getUTCDate()}</span>
                <span className={cn('block text-[11px]', on ? 'text-sky-300 dark:text-white/80' : 'text-muted-foreground')}>
                  {fmt({ month: 'short' }).format(d).replace('.', '')}
                  {d.getUTCDay() === 6 && ' · 10–14'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="inline-flex min-h-[40px] items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('earlier')}
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === PAGES - 1}
            className="inline-flex min-h-[40px] items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground disabled:invisible"
          >
            {t('later')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {dayMissing && (
          <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {t('errors.day')}
          </p>
        )}
      </div>

      <div role="group" aria-labelledby="bf-time">
        <SectionLabel index="02" id="bf-time">
          {t('time')} <span className="text-muted-foreground/70">· {t('timeNote')}</span>
        </SectionLabel>
        <button type="button" aria-pressed={times.includes('anytime')} onClick={() => toggleTime('anytime')} className={cn(chip(times.includes('anytime')), 'mt-4 w-full')}>
          {t('anytime')} · {saturday ? '10–14' : '9–18'}
        </button>
        {(['morning', 'afternoon'] as const).map((part) =>
          slots[part].length ? (
            <div key={part}>
              <p className="mt-4 text-[13px] font-semibold text-muted-foreground">{t(part)}</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {slots[part].map((value) => (
                  <button key={value} type="button" aria-pressed={times.includes(value)} onClick={() => toggleTime(value)} className={chip(times.includes(value))}>
                    {slotLabel(value)}
                  </button>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>

      <div role="group" aria-labelledby="bf-you">
        <SectionLabel index="03" id="bf-you">{t('you')}</SectionLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Label htmlFor="bf-name" className="sr-only">{t('name')}</Label>
            <Input
              id="bf-name"
              name="name"
              autoComplete="name"
              placeholder={t('name')}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'bf-name-error' : undefined}
              className={cn(FIELD, 'pr-9')}
            />
            <FieldMark />
            {fieldError('name')}
          </div>
          <div className="relative">
            <Label htmlFor="bf-phone" className="sr-only">{t('phone')}</Label>
            <Input
              id="bf-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t('phone')}
              required
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'bf-phone-error' : undefined}
              className={cn(FIELD, 'pr-9')}
            />
            <FieldMark />
            {fieldError('phone')}
          </div>
          <div className="relative sm:col-span-2">
            <Label htmlFor="bf-email" className="sr-only">
              {t('email')} ({tq('form.optional')})
            </Label>
            <Input
              id="bf-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'bf-email-error' : undefined}
              className={cn(FIELD, 'pr-[5.5rem]')}
            />
            <FieldMark optional />
            {fieldError('email')}
          </div>
          <div className="relative sm:col-span-2">
            <Label htmlFor="bf-message" className="sr-only">
              {t('message')} ({tq('form.optional')})
            </Label>
            <Textarea
              id="bf-message"
              name="message"
              placeholder={t('message')}
              className={cn(FIELD, 'h-auto min-h-[96px] resize-none py-3 pr-[5.5rem] leading-relaxed')}
            />
            <FieldMark optional />
          </div>
        </div>
        <p className="mt-2.5 text-right text-xs text-muted-foreground">
          <span aria-hidden className="font-semibold text-primary">*</span> {tq('form.requiredNote')}
        </p>
      </div>

      <div className="space-y-5">
        {selected && (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-primary/[0.07] px-4 py-3 text-[15px]">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{t('summary')}</span>
            <span className="font-semibold first-letter:uppercase">{longDate}</span>
            <span className="text-muted-foreground">· {timesLabel}</span>
          </p>
        )}

        <div className="flex items-start gap-3">
          <Checkbox id="bf-terms" required className="mt-0.5 h-5 w-5 rounded-md border-input data-[state=checked]:border-primary" />
          <Label htmlFor="bf-terms" className="cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground">
            {tq.rich('form.privacy', {
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
              {t('sending')}
            </>
          ) : (
            <>
              {t('submit')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
