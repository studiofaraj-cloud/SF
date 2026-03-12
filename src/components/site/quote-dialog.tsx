
'use client';

import { useActionState, useState, useTransition } from 'react';
import { Mail, MapPin } from 'lucide-react';
import RippleGrid from '@/components/RippleGrid';
import GradientText from '@/components/GradientText';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect } from 'react';
import { createMessage } from '@/lib/message-actions';
import { useToast } from '@/hooks/use-toast';
import { contactServices } from '@/lib/definitions';
import { useTranslations } from 'next-intl';

type QuoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

export function QuoteDialog({ open, onOpenChange }: QuoteDialogProps) {
  const { toast } = useToast();
  const t = useTranslations('quoteDialog');
  const tServices = useTranslations('services');
  const initialState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(createMessage, initialState);
  const [isPending, startTransition] = useTransition();
  const [serviceValue, setServiceValue] = useState<string>('');
  const [budgetValue, setBudgetValue] = useState<string>('');

  useEffect(() => {
    if(state.success) {
      toast({ title: t('success.title'), description: t('success.description') });
      const form = document.getElementById('quote-dialog-form') as HTMLFormElement;
      if (form) {
        form.reset();
        setServiceValue('');
        setBudgetValue('');
      }
      onOpenChange(false);
    }
    if (state.message && state.errors) {
      toast({ variant: 'destructive', title: t('form.submit'), description: state.message });
    }
    if (state.message && !state.success && !state.errors) {
      toast({ variant: 'destructive', title: t('form.submit'), description: state.message });
    }
  }, [state, toast, onOpenChange, t]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
        dispatch(formData);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 border-0 bg-transparent w-full max-w-full h-[100dvh] max-h-[100dvh] rounded-none overflow-hidden left-0 top-0 translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full duration-700 ease-out"
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative w-full h-full overflow-hidden">
            {/* RippleGrid WebGL Background */}
            <div className="absolute inset-0 z-0">
              <RippleGrid
                gridColor="#3b82f6"
                rippleIntensity={0.06}
                gridSize={12}
                mouseInteraction={true}
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-10" />

            {/* Floating Geometric Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              <div className="floating-shape absolute top-[15%] left-[8%] w-20 h-20 md:w-32 md:h-32 border-2 border-primary/30 rotate-45 hidden sm:block" style={{ animationDelay: '0s' }} />
              <div className="floating-shape absolute top-[60%] right-[10%] w-16 h-16 md:w-24 md:h-24 border-2 border-primary/20 rounded-full" style={{ animationDelay: '2s' }} />
              <div className="floating-shape absolute bottom-[20%] left-[15%] w-12 h-12 md:w-16 md:h-16 bg-primary/5 rotate-12 hidden sm:block" style={{ animationDelay: '4s' }} />
              <div className="floating-shape absolute top-[40%] right-[25%] w-14 h-14 md:w-20 md:h-20 border border-primary/20 clip-hexagon hidden md:block" style={{ animationDelay: '6s' }} />
              <div className="floating-shape absolute bottom-[35%] right-[15%] w-18 h-18 md:w-28 md:h-28 border-2 border-primary/25 rotate-45 hidden lg:block" style={{ animationDelay: '3s' }} />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl hidden md:block" />
              <div className="absolute bottom-[25%] right-[15%] w-48 h-48 bg-primary/15 rounded-full blur-2xl hidden lg:block" />
              <div className="absolute top-[50%] left-[50%] w-32 h-32 bg-primary/5 rounded-full blur-xl hidden md:block" />
            </div>

            {/* Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`particle ${i > 3 ? 'hidden sm:block' : ''}`}
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${15 + (i % 4) * 25}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 h-10 w-10 min-h-[44px] min-w-[44px] text-foreground hover:text-primary hover:bg-primary/10 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68687 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className="sr-only">Close</span>
                </Button>
            </DialogClose>

            {/* Scrollable content wrapper — this is what actually scrolls on mobile */}
            <div className="relative z-20 w-full h-full overflow-y-auto overscroll-contain scroll-smooth -webkit-overflow-scrolling-touch">
              <div className="w-full min-h-full flex flex-col items-center justify-start md:justify-center pt-14 sm:pt-16 md:pt-12 pb-8 sm:pb-10 px-4 sm:px-5">

                {/* Mobile-only header (hidden on md+) */}
                <div className="md:hidden w-full max-w-lg mb-5 text-left">
                  <GradientText
                    colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                    animationSpeed={4}
                    className="text-2xl sm:text-3xl font-bold leading-tight"
                  >
                    {t('title')}
                  </GradientText>
                  <p className="text-foreground/70 text-sm mt-2 leading-relaxed">
                    {t('description')}
                  </p>
                </div>

                {/* Two-column grid (stacks to 1 col on mobile) */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">

                  {/* Left column — desktop only */}
                  <div className="hidden md:flex flex-col justify-center space-y-6 text-left">
                    <GradientText
                      colors={['#3b82f6', '#8b5cf6', '#3b82f6']}
                      animationSpeed={4}
                      className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                    >
                      {t('title')}
                    </GradientText>
                    <p className="text-foreground/80 text-base md:text-lg leading-relaxed max-w-xl">
                      {t('description')}
                    </p>
                    <div className="holographic-card neon-border rounded-xl p-6 lg:p-8 bg-card/60 backdrop-blur-md border-primary/30 space-y-5 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
                      <h3 className="font-semibold text-foreground text-lg">{t('infoTitle')}</h3>
                      <p className="text-foreground/80 text-sm leading-relaxed">{t('infoText')}</p>
                      <div className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 group-hover:from-primary group-hover:to-primary/80 transition-all duration-300 flex-shrink-0">
                          <Mail className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <a href="mailto:info@studiofaraj.it" className="text-foreground hover:text-primary transition-colors font-medium text-sm break-all">info@studiofaraj.it</a>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30 group-hover:from-primary group-hover:to-primary/80 transition-all duration-300 flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <div className="text-foreground">
                          <p className="font-medium text-sm">{t('operationalHQ')}</p>
                          <p className="text-xs text-foreground/60">Sciacca (AG), Sicilia</p>
                          <p className="text-xs text-foreground/60">{t('operatesIn')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column — form (full width on mobile) */}
                  <div className="holographic-card neon-border rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 bg-card/80 backdrop-blur-md border-primary/30">
                    <form id="quote-dialog-form" onSubmit={handleSubmit} className="space-y-4">
                      <input type="hidden" name="source" value="quote-dialog" />

                      {/* Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="name-dialog" className="sr-only">{t('form.name')}</Label>
                        <div className="holographic-card rounded-lg px-3 py-1 bg-card/40 backdrop-blur-sm border border-primary/20 focus-within:border-primary/50 transition-all duration-300">
                          <Input id="name-dialog" name="name" placeholder={t('form.name')} required className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/50 text-base h-12 min-h-[48px]" />
                        </div>
                        {state.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email-dialog" className="sr-only">{t('form.email')}</Label>
                        <div className="holographic-card rounded-lg px-3 py-1 bg-card/40 backdrop-blur-sm border border-primary/20 focus-within:border-primary/50 transition-all duration-300">
                          <Input id="email-dialog" name="email" type="email" placeholder={t('form.email')} required className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/50 text-base h-12 min-h-[48px]" />
                        </div>
                        {state.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
                      </div>

                      {/* Service + Budget side by side on larger screens */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="service-dialog" className="sr-only">{t('form.service')}</Label>
                          <div className="holographic-card rounded-lg px-3 py-1 bg-card/40 backdrop-blur-sm border border-primary/20 focus-within:border-primary/50 transition-all duration-300">
                            <Select name="service" value={serviceValue} onValueChange={setServiceValue}>
                              <SelectTrigger id="service-dialog" className="bg-transparent border-0 focus:ring-0 focus:ring-offset-0 text-foreground w-full justify-start h-12 min-h-[48px] p-0 text-base" suppressHydrationWarning>
                                <SelectValue placeholder={t('form.service')} />
                              </SelectTrigger>
                              <SelectContent className="holographic-card neon-border backdrop-blur-md bg-card/95 border-primary/30 shadow-xl shadow-primary/20 max-h-[250px] overflow-y-auto z-[9999]">
                                {contactServices.map((service) => {
                                  const serviceKey = serviceValueToKey[service.value];
                                  return (
                                    <SelectItem
                                      key={service.value}
                                      value={service.value}
                                      className="text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-all duration-200 cursor-pointer text-base py-3 min-h-[44px]"
                                    >
                                      {serviceKey ? tServices(`${serviceKey}.label`) : service.label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <input type="hidden" name="service" value={serviceValue} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="budget-dialog" className="sr-only">{t('form.budget')}</Label>
                          <div className="holographic-card rounded-lg px-3 py-1 bg-card/40 backdrop-blur-sm border border-primary/20 focus-within:border-primary/50 transition-all duration-300">
                            <Input id="budget-dialog" name="budget" placeholder={t('form.budget')} className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/50 text-base h-12 min-h-[48px]" />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <Label htmlFor="message-dialog" className="sr-only">{t('form.message')}</Label>
                        <div className="holographic-card rounded-lg px-3 py-2 bg-card/40 backdrop-blur-sm border border-primary/20 focus-within:border-primary/50 transition-all duration-300">
                          <Textarea id="message-dialog" name="message" placeholder={t('form.message')} required className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-foreground/50 min-h-[100px] sm:min-h-[110px] md:min-h-[130px] resize-none text-base leading-relaxed" />
                        </div>
                        {state.errors?.message && <p className="text-xs text-destructive">{state.errors.message[0]}</p>}
                      </div>

                      {/* Privacy + submit */}
                      <div className="space-y-4 pt-1">
                        <label htmlFor="terms-dialog" className="flex items-start gap-3 cursor-pointer active:opacity-80 min-h-[44px] py-1">
                          <Checkbox id="terms-dialog" required className="mt-0.5 h-5 w-5 min-h-[20px] min-w-[20px] border-2 border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0 rounded" />
                          <span className="text-sm font-normal text-foreground/80 leading-relaxed select-none">
                            {t('form.privacy')}
                          </span>
                        </label>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 font-semibold h-12 md:h-14 text-base min-h-[48px] rounded-xl active:scale-[0.98]" disabled={isPending}>
                          {isPending ? t('form.submit') + '...' : t('form.submit')}
                        </Button>
                      </div>

                      {/* Mobile-only contact quick-links */}
                      <div className="md:hidden flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-primary/10">
                        <a href="mailto:info@studiofaraj.it" className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-primary transition-colors min-h-[44px]">
                          <Mail className="w-3.5 h-3.5" />
                          info@studiofaraj.it
                        </a>
                        <span className="flex items-center gap-1.5 text-xs text-foreground/60 min-h-[44px]">
                          <MapPin className="w-3.5 h-3.5" />
                          Sciacca, Sicilia
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
