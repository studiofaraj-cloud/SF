'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Shield, Award, Zap, Settings } from 'lucide-react';
import { useContext } from 'react';
import { CookieContext } from '@/contexts/cookie-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useActionState } from 'react';
import { createSubscriber } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

function NewsletterForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const t = useTranslations('footer');
    const [state, formAction] = useActionState(createSubscriber, { message: null, success: false });

    useEffect(() => {
        if(state?.message) {
            toast({
                title: state.success ? t('newsletter.success') : t('newsletter.error'),
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                formRef.current?.reset();
            }
        }
    }, [state, toast, t]);

    return (
        <form ref={formRef} action={formAction} className="flex max-w-md gap-2">
            <Input 
                type="email" 
                name="email" 
                placeholder={t('newsletter.placeholder')} 
                className="flex-1 bg-background border-border/50 focus:border-primary focus:ring-primary/20 h-11 min-h-[44px]" 
                required 
            />
            <Button type="submit" size="icon" className="h-11 w-11 min-w-[44px] min-h-[44px] shrink-0" aria-label={t('newsletter.subscribe')}>
                <Mail className="w-5 h-5" />
            </Button>
        </form>
    )
}


export function SiteFooter() {
  // Safely get cookie preferences, fallback if provider is not available
  const cookieContext = useContext(CookieContext);
  const openPreferences = cookieContext?.openPreferences || (() => {});
  
  const locale = useLocale();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services');
  
  return (
    <footer className="relative bg-gradient-to-b from-background via-secondary/50 to-secondary border-t border-border/50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-12 md:py-16 px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-y-10 gap-x-6 md:gap-8 mb-12">
          
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 lg:col-span-3 space-y-4 md:space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image 
                  src="/assets/logo.png" 
                  alt="Studio Faraj Logo" 
                  width={40} 
                  height={40} 
                  className="transition-transform group-hover:scale-110 duration-300"
                  unoptimized
                />
              </div>
              <span className="font-brand text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors">
                Studio Faraj
              </span>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
              {t('description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                <Link href="mailto:info@studiofaraj.it" className="text-muted-foreground hover:text-primary transition-colors">
                  info@studiofaraj.it
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="w-4 h-4" />
                </div>
                <Link href="tel:+393202223322" className="text-muted-foreground hover:text-primary transition-colors">
                  +39 320 222 3322
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-muted-foreground">Sciacca, Italia</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 pt-2">
              <Link 
                href="https://www.facebook.com/share/18JVysxoGo/?mibextid=wwXIfr" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300" 
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://instagram.com/studiofaraj.it"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/studio-faraj-47923b389/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300" 
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="font-bold text-foreground mb-4 md:mb-6 text-sm md:text-base">{t('navigation')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={getLocalizedPath('/chi-siamo', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/projects', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tNav('projects')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/blog', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tNav('blog')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/contatti', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tNav('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="font-bold text-foreground mb-4 md:mb-6 text-sm md:text-base">{t('services')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={getLocalizedPath('/servizi/sviluppo-web', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('webDevelopment.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/servizi/e-commerce', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('ecommerce.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/servizi/design-ui-ux', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('designUIUX.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/servizi/seo-marketing', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('seoMarketing.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/servizi/ai-automazione', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('aiAutomation.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/servizi/manutenzione', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('maintenance.label')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h4 className="font-bold text-foreground mb-4 md:mb-6 text-sm md:text-base">{t('support')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={getLocalizedPath('/servizi/hosting-cloud', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('hostingCloud.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/servizi/consulenza', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {tServices('consulting.label')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/faq', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/legal', locale as any)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground text-base">{t('newsletter.title')}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {t('newsletter.description')}
              </p>
              <NewsletterForm />
            </div>

            {/* Professional Badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                <Shield className="w-3 h-3 mr-2" />
                {t('badges.gdpr')}
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                <Award className="w-3 h-3 mr-2" />
                {t('badges.certified')}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            &copy; 2026 <span className="font-semibold text-foreground">Studio Faraj</span>. {t('copyright')}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href={getLocalizedPath('/legal', locale as any)} className="text-muted-foreground hover:text-primary transition-colors">
              {t('privacy')}
            </Link>
            <Link href={getLocalizedPath('/legal', locale as any)} className="text-muted-foreground hover:text-primary transition-colors">
              {t('cookiePolicy')}
            </Link>
            <button
              onClick={openPreferences}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              aria-label={t('cookieSettings')}
            >
              <Settings className="w-4 h-4" />
              {t('cookie')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
