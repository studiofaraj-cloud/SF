'use client';

import React, { useState, useEffect, useActionState, useTransition } from 'react';
import { Calendar, Clock, Mail, Phone, User, MessageSquare, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { createBooking } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

interface BookingFormProps {
  onSuccess?: () => void;
  className?: string;
  source?: string;
}

export function BookingForm({ onSuccess, className, source = 'booking-form' }: BookingFormProps) {
  const { toast } = useToast();
  const locale = useLocale();
  const t = useTranslations('bookingDialog');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialState = { message: '', errors: {}, success: false };
  const [state, dispatch] = useActionState(createBooking, initialState);

  const dateLocale = locale === 'it' ? it : undefined;

  const timeSlots = [
    { value: 'anytime', label: t('form.anytime') },
    { value: '09:00', label: '09:00 - 10:00' },
    { value: '10:00', label: '10:00 - 11:00' },
    { value: '11:00', label: '11:00 - 12:00' },
    { value: '14:00', label: '14:00 - 15:00' },
    { value: '15:00', label: '15:00 - 16:00' },
    { value: '16:00', label: '16:00 - 17:00' },
    { value: '17:00', label: '17:00 - 18:00' },
  ];
  const specificTimeSlots = timeSlots.filter((slot) => slot.value !== 'anytime');

  useEffect(() => {
    if (state.success) {
      toast({
        title: t('success.title'),
        description: t('success.description'),
      });
      setDate(undefined);
      setSelectedTimes([]);
      const form = document.getElementById('booking-form-element') as HTMLFormElement;
      if (form) {
        form.reset();
      }
      if (onSuccess) {
        onSuccess();
      }
    }
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: t('errors.dateRequired'),
        description: state.message,
      });
    }
  }, [state, toast, onSuccess, t]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date) {
      toast({
        variant: 'destructive',
        title: t('errors.dateRequired'),
        description: t('errors.dateRequiredDesc'),
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append('selectedDate', format(date, 'yyyy-MM-dd'));
    if (selectedTimes.length > 0) {
      selectedTimes.forEach((time) => {
        formData.append('selectedTime', time);
      });
    }
    formData.append('source', source);

    startTransition(() => {
      dispatch(formData);
    });
  };

  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {state.success ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center shadow-lg shadow-green-500/20">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">{t('success.title')}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('success.description')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <form id="booking-form-element" onSubmit={handleSubmit} className="space-y-5">
            {/* Date Selection — Inline Calendar */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                {t('form.date')}
              </Label>
              <div className="rounded-2xl border-2 border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/30">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDates}
                  locale={dateLocale}
                  className="mx-auto"
                />
              </div>
              {date && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-primary">
                    {format(date, "EEEE, d MMMM yyyy", { locale: dateLocale })}
                  </span>
                </div>
              )}
              {state.errors?.selectedDate && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span>&#x2022;</span> {state.errors.selectedDate[0]}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div className="space-y-2.5">
              <Label htmlFor="time" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {t('form.time')}
              </Label>
              <div className="rounded-2xl border border-primary/20 bg-background/70 backdrop-blur-sm p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedTimes.length === 0
                      ? t('form.selectedAnytime')
                      : selectedTimes.includes('anytime')
                        ? t('form.selectedAnytime')
                        : t('form.selectedTimes', { count: selectedTimes.length })}
                  </p>
                  {selectedTimes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTimes([])}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/20 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {timeSlots
                    .filter((slot) => slot.value === 'anytime')
                    .map((slot) => {
                      const isChecked = selectedTimes.includes(slot.value);
                      const handleAnytimeToggle = () => {
                        setSelectedTimes(isChecked ? [] : ['anytime']);
                      };

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={handleAnytimeToggle}
                          aria-pressed={isChecked}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px] sm:min-h-[46px] active:scale-[0.98] select-none border",
                            isChecked
                              ? "bg-primary/95 text-primary-foreground shadow-md shadow-primary/20 border-primary ring-1 ring-primary/30"
                              : "bg-background border-primary/20 hover:border-primary/40 text-foreground"
                          )}
                        >
                          {isChecked && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                          {slot.label}
                        </button>
                      );
                    })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {specificTimeSlots.map((slot) => {
                  const isChecked = selectedTimes.includes(slot.value);
                  const handleTimeToggle = () => {
                    setSelectedTimes((prev) => {
                      const filtered = prev.filter(t => t !== 'anytime');
                      if (isChecked) {
                        return filtered.filter(t => t !== slot.value);
                      }
                      return [...filtered, slot.value];
                    });
                  };

                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={handleTimeToggle}
                      aria-pressed={isChecked}
                      className={cn(
                        "flex items-center justify-center gap-2 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-[46px] active:scale-[0.98] select-none border",
                        isChecked
                          ? "bg-primary/10 text-primary border-primary shadow-sm shadow-primary/10 ring-1 ring-primary/20"
                          : "bg-background border-primary/20 hover:border-primary/40 text-foreground"
                      )}
                    >
                      {isChecked && (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      )}
                      {slot.label}
                    </button>
                  );
                })}
                </div>
              </div>
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  {t('form.name')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Mario Rossi"
                  required
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "h-12 min-h-[48px] bg-background/80 backdrop-blur-sm border-2 rounded-xl transition-all text-base",
                    focusedField === 'name'
                      ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/10'
                      : 'border-primary/20 hover:border-primary/40'
                  )}
                />
                {state.errors?.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span>&#x2022;</span> {state.errors.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  {t('form.email')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@esempio.com"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    "h-12 min-h-[48px] bg-background/80 backdrop-blur-sm border-2 rounded-xl transition-all text-base",
                    focusedField === 'email'
                      ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/10'
                      : 'border-primary/20 hover:border-primary/40'
                  )}
                />
                {state.errors?.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span>&#x2022;</span> {state.errors.email[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-primary" />
                {t('form.phone')}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+39 320 222 3322"
                required
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "h-12 min-h-[48px] bg-background/80 backdrop-blur-sm border-2 rounded-xl transition-all text-base",
                  focusedField === 'phone'
                    ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/10'
                    : 'border-primary/20 hover:border-primary/40'
                )}
              />
              {state.errors?.phone && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span>&#x2022;</span> {state.errors.phone[0]}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                {t('form.message')}
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Descrivi brevemente l'argomento della chiamata..."
                rows={3}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "bg-background/80 backdrop-blur-sm border-2 rounded-xl transition-all resize-none text-base min-h-[80px]",
                  focusedField === 'message'
                    ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/10'
                    : 'border-primary/20 hover:border-primary/40'
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 min-h-[48px] text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-[0.98]"
              size="lg"
            >
              {isPending ? `${t('form.submit')}...` : t('form.submit')}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
