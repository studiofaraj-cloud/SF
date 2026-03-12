'use client';

import React, { useState, useEffect, useActionState, useTransition } from 'react';
import { Calendar, Clock, Mail, Phone, User, MessageSquare, X, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createBooking } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const { toast } = useToast();
  const locale = useLocale();
  const t = useTranslations('bookingDialog');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialState = { message: '', errors: {}, success: false };
  const [state, dispatch] = useActionState(createBooking, initialState);

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

  useEffect(() => {
    if (state.success) {
      toast({
        title: t('success.title'),
        description: t('success.description'),
      });
      setDate(undefined);
      setSelectedTimes([]);
      const form = document.getElementById('booking-form') as HTMLFormElement;
      if (form) {
        form.reset();
      }
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: t('errors.dateRequired'),
        description: state.message,
      });
    }
  }, [state, toast, onOpenChange, t]);

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
    formData.append('source', 'booking-dialog');

    startTransition(() => {
      dispatch(formData);
    });
  };

  // Disable past dates
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Mobile: fullscreen sheet
          "!fixed !inset-0 !translate-x-0 !translate-y-0 !left-0 !top-0",
          "p-0 border-0 gap-0 w-full h-[100dvh] max-w-full max-h-[100dvh] rounded-none",
          // Desktop: centered modal
          "sm:!inset-auto sm:!left-[50%] sm:!top-[50%] sm:!-translate-x-1/2 sm:!-translate-y-1/2",
          "sm:w-full sm:max-w-[600px] sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl",
          // Shared
          "bg-card backdrop-blur-xl sm:border-2 sm:border-primary/20",
          "shadow-none sm:shadow-2xl sm:shadow-primary/10",
          "overflow-hidden flex flex-col",
          // Hide the default Radix close button (we render our own)
          "[&>button.absolute]:hidden"
        )}
      >
        {/* Decorative gradient border effect */}
        <div className="absolute inset-0 sm:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-50 pointer-events-none" />

        {/* Sticky header with close button */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-primary/10 px-5 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-4">
          {/* Close button — large touch target */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground/70" />
          </button>

          <DialogHeader className="pr-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {t('title')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-5 sm:p-6 md:p-8 pb-8 sm:pb-8">

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
              <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    {t('form.date')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 min-h-[48px] bg-background/80 backdrop-blur-sm border-2 rounded-xl transition-all text-base",
                          !date && "text-muted-foreground",
                          focusedField === 'date' ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/10' : 'border-primary/20 hover:border-primary/40'
                        )}
                        onClick={() => setFocusedField('date')}
                      >
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        {date ? format(date, "PPP", { locale: it }) : t('form.datePlaceholder')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl border-primary/20 shadow-xl z-[9999]" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={disabledDates}
                        initialFocus
                        locale={it}
                      />
                    </PopoverContent>
                  </Popover>
                  {state.errors?.selectedDate && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>&#x2022;</span> {state.errors.selectedDate[0]}
                    </p>
                  )}
                </div>

                {/* Time Selection — compact grid on mobile */}
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {t('form.time')}
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => {
                      const isChecked = selectedTimes.includes(slot.value);
                      const isAnytime = slot.value === 'anytime';

                      const handleTimeToggle = () => {
                        if (isAnytime) {
                          setSelectedTimes(isChecked ? [] : ['anytime']);
                        } else {
                          setSelectedTimes((prev) => {
                            const filtered = prev.filter(t => t !== 'anytime');
                            if (isChecked) {
                              return filtered.filter(t => t !== slot.value);
                            } else {
                              return [...filtered, slot.value];
                            }
                          });
                        }
                      };

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={handleTimeToggle}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px] active:scale-[0.96] select-none",
                            isAnytime && "col-span-2 sm:col-span-4",
                            isChecked
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-2 border-primary"
                              : "bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 text-foreground"
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
                  {selectedTimes.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedTimes.length === 1 && selectedTimes[0] === 'anytime'
                        ? t('form.selectedAnytime')
                        : t('form.selectedTimes', { count: selectedTimes.length })
                      }
                    </p>
                  )}
                </div>

                {/* Name + Email side by side on larger screens */}
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

                {/* Spacer for sticky button on mobile */}
                <div className="h-4 sm:hidden" />
              </form>
            )}

          </div>
        </div>

        {/* Sticky submit button at bottom on mobile, inline on desktop */}
        {!state.success && (
          <div className="sticky bottom-0 z-20 bg-card/95 backdrop-blur-md border-t border-primary/10 p-4 sm:p-6 safe-area-bottom">
            <Button
              type="submit"
              form="booking-form"
              disabled={isPending}
              className="w-full h-12 min-h-[48px] text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-[0.98]"
              size="lg"
            >
              {isPending ? `${t('form.submit')}...` : t('form.submit')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
