
'use client';

import React, { useEffect, useActionState, useState, useTransition } from 'react';
import { Mail, Phone, Send, ArrowRight, Sparkles, MessageCircle, Zap, Heart, Rocket, Clock, Shield, CheckCircle, CheckCircle2, Calendar, Users, FileText, Gift } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { createMessage } from '@/lib/message-actions';
import { useToast } from '@/hooks/use-toast';
import { contactServices } from '@/lib/definitions';
import { BookingDialog } from './booking-dialog';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

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

export default function ContactSection() {
    const { toast } = useToast();
    const locale = useLocale();
    const t = useTranslations('contact');
    const tServices = useTranslations('services');
    const initialState = { message: '', errors: {}, success: false };
    const [state, dispatch] = useActionState(createMessage, initialState);
    const [isPending, startTransition] = useTransition();
    const [serviceValue, setServiceValue] = useState<string>('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

    useEffect(() => {
        if(state.success) {
            toast({ title: t('success.title'), description: t('success.description') });
            // Reset form after successful submission
            const form = document.getElementById('contact-section-form') as HTMLFormElement;
            if (form) {
                form.reset();
                setServiceValue(''); // Reset select value
                setFocusedField(null);
            }
        }
        if (state.message && state.errors) {
            toast({ variant: 'destructive', title: t('errors.validation'), description: state.message });
        }
        if (state.message && !state.success && !state.errors) {
            toast({ variant: 'destructive', title: t('errors.generic'), description: state.message });
        }
    }, [state, toast, t]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(() => {
            dispatch(formData);
        });
    };

    const contactMethods = [
        {
            icon: <Mail className="w-5 h-5" />,
            title: t('methods.email.title'),
            text: t('methods.email.text'),
            link: 'mailto:info@studiofaraj.it',
            linkLabel: 'info@studiofaraj.it',
            color: 'from-blue-500/20 to-cyan-500/20',
            metric: t('methods.email.metric'),
            metricLabel: t('methods.email.metricLabel'),
        },
        {
            icon: <Phone className="w-5 h-5" />,
            title: t('methods.phone.title'),
            text: t('methods.phone.text'),
            link: 'tel:+393202223322',
            linkLabel: '+39 320 222 3322',
            color: 'from-emerald-500/20 to-green-500/20',
            metric: t('methods.phone.metric'),
            metricLabel: t('methods.phone.metricLabel'),
        },
    ];

  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/3 to-secondary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 md:w-72 md:h-72 bg-primary/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <Badge className="badge-futuristic mb-4 md:mb-6 inline-flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  {t('badge')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                  <span className="text-foreground">{t('title')}</span>
                  <span className="block text-primary mt-1 md:mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('titleHighlight')}
                  </span>
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6 px-2">
                  {t('subtitle')}
                </p>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t('trust.response24h')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t('trust.freeConsultation')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t('trust.gdprCompliant')}</span>
                  </div>
                </div>
            </div>
            
            {/* Split Layout: Form + Contact Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-7xl mx-auto">
              
              {/* Left Side: Contact Form */}
              <div className="order-2 lg:order-1">
                <div className="relative p-6 md:p-8 lg:p-10 rounded-3xl bg-card/60 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/5">
                  {/* Animated border gradient */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 text-primary/10">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 md:mb-8">
                      <Badge className="badge-futuristic mb-3 md:mb-4 w-fit">
                        <Send className="w-3 h-3 mr-1.5 sm:mr-2" />
                        {t('badge')}
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                        {t('form.formTitle')}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {t('form.formSubtitle')}
                      </p>
                    </div>
                    
                    <form id="contact-section-form" onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                      <input type="hidden" name="source" value="contact-form" />
                      
                      {/* Name and Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-2 relative">
                          <Label htmlFor="name" className="text-sm font-medium text-foreground">
                            {t('form.name')}
                          </Label>
                          <Input 
                            id="name" 
                            name="name" 
                            placeholder={t('form.namePlaceholder')}
                            required
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className={`h-12 bg-background/80 backdrop-blur-sm border-2 transition-all duration-300 placeholder:text-muted-foreground/50 text-sm ${
                              focusedField === 'name' 
                                ? 'border-primary shadow-lg shadow-primary/20' 
                                : 'border-primary/20 hover:border-primary/40'
                            }`}
                          />
                          {state.errors?.name && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <span>•</span> {state.errors.name[0]}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2 relative">
                          <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            {t('form.email')}
                          </Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder={t('form.emailPlaceholder')}
                            required
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className={`h-12 bg-background/80 backdrop-blur-sm border-2 transition-all duration-300 placeholder:text-muted-foreground/50 text-sm ${
                              focusedField === 'email' 
                                ? 'border-primary shadow-lg shadow-primary/20' 
                                : 'border-primary/20 hover:border-primary/40'
                            }`}
                          />
                          {state.errors?.email && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <span>•</span> {state.errors.email[0]}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Service Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="service" className="text-sm font-medium text-foreground">
                          {t('form.service')}
                        </Label>
                        <Select name="service" value={serviceValue} onValueChange={setServiceValue}>
                          <SelectTrigger 
                            id="service"
                            onFocus={() => setFocusedField('service')}
                            onBlur={() => setFocusedField(null)}
                            className={`h-12 bg-background/80 backdrop-blur-sm border-2 transition-all duration-300 text-sm ${
                              focusedField === 'service' 
                                ? 'border-primary shadow-lg shadow-primary/20' 
                                : 'border-primary/20 hover:border-primary/40'
                            }`}
                            suppressHydrationWarning
                          >
                            <SelectValue placeholder={t('form.service')} />
                          </SelectTrigger>
                          <SelectContent className="backdrop-blur-xl bg-card/95 border-primary/30 shadow-xl">
                            {contactServices.map((service) => {
                              const serviceKey = serviceValueToKey[service.value];
                              return (
                                <SelectItem 
                                    key={service.value} 
                                    value={service.value}
                                    className="hover:bg-primary/10 focus:bg-primary/10"
                                >
                                  {serviceKey ? tServices(`${serviceKey}.label`) : service.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <input type="hidden" name="service" value={serviceValue} />
                      </div>
                      
                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium text-foreground">
                          {t('form.message')}
                        </Label>
                        <Textarea 
                          id="message" 
                          name="message" 
                          placeholder={t('form.messagePlaceholder')}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          className={`min-h-32 bg-background/80 backdrop-blur-sm border-2 transition-all duration-300 resize-none placeholder:text-muted-foreground/50 text-sm ${
                            focusedField === 'message' 
                              ? 'border-primary shadow-lg shadow-primary/20' 
                              : 'border-primary/20 hover:border-primary/40'
                          }`}
                          required
                        />
                        {state.errors?.message && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <span>•</span> {state.errors.message[0]}
                          </p>
                        )}
                      </div>
                      
                      {/* Privacy Checkbox */}
                      <div className="pt-2">
                        <Label 
                          htmlFor="terms" 
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          <Checkbox 
                            id="terms" 
                            required
                            className="mt-0.5 h-5 w-5 border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-sm text-muted-foreground leading-relaxed flex-1">
                            {t('form.privacy')}
                          </span>
                        </Label>
                      </div>
                      
                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full h-12 md:h-14 text-base font-semibold group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                        size="lg"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              <span>{t('form.submitLoading')}</span>
                            </>
                          ) : (
                            <>
                              <span>{t('form.submit')}</span>
                              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                            </>
                          )}
                        </span>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </Button>
                      
                      {/* Success/Status Indicators */}
                      {state.success && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <p className="text-sm text-green-700 dark:text-green-400">
                            {t('success.message')}
                          </p>
                        </div>
                      )}
                      
                      {/* Trust Indicators */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {t('trustIndicators.dataProtected')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-primary" />
                          {t('trustIndicators.gdprCompliant')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          {t('trustIndicators.quickResponse')}
                        </span>
                      </div>
                      
                      {/* Availability Status */}
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('availability.status')}
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Side: Contact Methods + Booking Card */}
              <div className="order-1 lg:order-2 flex flex-col">
                {/* Contact Methods Section */}
                <div className="mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">{t('methods.directContact')}</h3>
                  
                  {/* Contact Methods Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {contactMethods.map((method, index) => (
                      <Link
                        key={index}
                        href={method.link}
                        className="group relative block p-5 md:p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 h-full flex flex-col"
                      >
                        {/* Glassmorphism effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-300 flex-shrink-0 mb-3">
                            {method.icon}
                          </div>
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {method.title}
                              </h4>
                              <ArrowRight className="w-4 h-4 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{method.text}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-primary">{method.linkLabel}</span>
                              {method.metric && (
                                <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                                  {method.metric}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Quick Action Card - Booking - Full Height */}
                <div className="flex-1 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-4 flex-shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-xl md:text-2xl font-bold text-foreground mb-2">{t('bookCall')}</h4>
                      <p className="text-base text-muted-foreground mb-6 leading-relaxed">{t('bookCallCard.description')}</p>

                      {/* Benefits List */}
                      <div className="space-y-4 mb-6 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-foreground mb-1">{t('bookCallCard.benefit1.title')}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{t('bookCallCard.benefit1.description')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-foreground mb-1">{t('bookCallCard.benefit2.title')}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{t('bookCallCard.benefit2.description')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Gift className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-foreground mb-1">{t('bookCallCard.benefit3.title')}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{t('bookCallCard.benefit3.description')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="default"
                        className="w-full h-12 text-base font-semibold border-primary/30 hover:bg-primary hover:text-primary-foreground mt-auto shadow-md hover:shadow-lg transition-all"
                        onClick={() => setIsBookingDialogOpen(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {t('bookCall')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        
        {/* Booking Dialog */}
        <BookingDialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen} />
    </section>
  );
}
