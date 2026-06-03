'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Shield, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useActionState } from 'react';
import { createSubscriber } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';

function NewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const t = useTranslations('footer');
  const locale = useLocale();
  const [state, formAction] = useActionState(createSubscriber, { message: null, success: false });

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? t('newsletter.success') : t('newsletter.error'),
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) formRef.current?.reset();
    }
  }, [state, toast, t]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2 w-full">
      <input type="hidden" name="locale" value={locale} />
      <Input
        type="email"
        name="email"
        placeholder={t('newsletter.placeholder')}
        className="flex-1 bg-background/60 border-border/50 focus:border-primary h-11"
        required
      />
      <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label={t('newsletter.subscribe')}>
        <Mail className="w-4 h-4" />
      </Button>
    </form>
  );
}

function FooterLink({ href, children, highlight }: { href: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 text-sm py-1 transition-colors group ${
        highlight
          ? 'font-medium text-primary hover:text-primary/80'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <span className={`w-1 h-1 rounded-full shrink-0 transition-colors ${
        highlight ? 'bg-primary' : 'bg-muted-foreground/40 group-hover:bg-primary'
      }`} />
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services');

  return (
    <footer className="relative bg-gradient-to-b from-background via-secondary/40 to-secondary border-t border-border/50 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-10">

        {/* ── BRAND ROW ── full width on mobile */}
        <div className="mb-10 md:mb-0 md:hidden">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Image src="/assets/logo.png" alt="Studio Faraj Logo" width={36} height={36} unoptimized />
            <span className="font-brand font-semibold text-xl brand-wordmark">Studio Faraj</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {t('description')}
          </p>

          {/* Contact — compact row on mobile */}
          <div className="space-y-2.5 mb-5">
            <a href="mailto:info@studiofaraj.it" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-primary" />
              </span>
              info@studiofaraj.it
            </a>
            <a href="tel:+393202223322" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-primary" />
              </span>
              +39 320 222 3322
            </a>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </span>
              Padova, Italia
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              { href: 'https://www.facebook.com/share/18JVysxoGo/?mibextid=wwXIfr', icon: <Facebook className="h-4 w-4" />, label: 'Facebook' },
              { href: 'https://instagram.com/studiofaraj.it', icon: <Instagram className="h-4 w-4" />, label: 'Instagram' },
              { href: 'https://www.linkedin.com/in/studio-faraj-47923b389/', icon: <Linkedin className="h-4 w-4" />, label: 'LinkedIn' },
            ].map(s => (
              <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-10 h-10 rounded-xl bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
                {s.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-y-8 gap-x-4 md:gap-8 mb-10 md:mb-12">

          {/* Company info — desktop only (hidden on mobile, shown above) */}
          <div className="hidden md:block lg:col-span-3 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image src="/assets/logo.png" alt="Studio Faraj Logo" width={40} height={40}
                className="transition-transform group-hover:scale-110 duration-300" unoptimized />
              <span className="font-brand font-semibold text-2xl brand-wordmark">Studio Faraj</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('description')}
            </p>
            <div className="space-y-3">
              <a href="mailto:info@studiofaraj.it" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </span>
                info@studiofaraj.it
              </a>
              <a href="tel:+393202223322" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </span>
                +39 320 222 3322
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </span>
                Padova, Italia
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              {[
                { href: 'https://www.facebook.com/share/18JVysxoGo/?mibextid=wwXIfr', icon: <Facebook className="h-5 w-5" />, label: 'Facebook' },
                { href: 'https://instagram.com/studiofaraj.it', icon: <Instagram className="h-5 w-5" />, label: 'Instagram' },
                { href: 'https://www.linkedin.com/in/studio-faraj-47923b389/', icon: <Linkedin className="h-5 w-5" />, label: 'LinkedIn' },
              ].map(s => (
                <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-10 h-10 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300">
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1 lg:col-span-2">
            <p className="font-semibold text-foreground text-sm mb-4 pb-2 border-b border-border/40">
              {t('navigation')}
            </p>
            <ul className="space-y-1">
              <li><FooterLink href={getLocalizedPath('/chi-siamo', locale as any)}>{tNav('about')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/pagine-aziendali', locale as any)}>{tNav('companyPages')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/projects', locale as any)}>{tNav('projects')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/blog', locale as any)}>{tNav('blog')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/contatti', locale as any)}>{tNav('contact')}</FooterLink></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1 lg:col-span-2">
            <p className="font-semibold text-foreground text-sm mb-4 pb-2 border-b border-border/40">
              {t('services')}
            </p>
            <ul className="space-y-1">
              <li><FooterLink href={getLocalizedPath('/servizi/sviluppo-web', locale as any)}>{tServices('webDevelopment.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/e-commerce', locale as any)}>{tServices('ecommerce.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/design-ui-ux', locale as any)}>{tServices('designUIUX.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/seo-marketing', locale as any)}>{tServices('seoMarketing.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/ai-automazione', locale as any)}>{tServices('aiAutomation.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/manutenzione', locale as any)}>{tServices('maintenance.label')}</FooterLink></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <p className="font-semibold text-foreground text-sm mb-4 pb-2 border-b border-border/40">
              {t('support')}
            </p>
            <ul className="space-y-1">
              <li><FooterLink href={`/${locale}/inizia`} highlight>{locale === 'it' ? 'Inizia il progetto' : 'Start your project'}</FooterLink></li>
              <li><FooterLink href={`/${locale}/hub/login`}>{locale === 'it' ? 'Area Clienti' : 'Client Area'}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/hosting-cloud', locale as any)}>{tServices('hostingCloud.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/servizi/consulenza', locale as any)}>{tServices('consulting.label')}</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/faq', locale as any)}>FAQ</FooterLink></li>
              <li><FooterLink href={getLocalizedPath('/legal', locale as any)}>{t('privacy')}</FooterLink></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-3">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground text-sm">{t('newsletter.title')}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {t('newsletter.description')}
              </p>
              <NewsletterForm />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs">
                <Shield className="w-3 h-3 mr-1.5" />
                {t('badges.gdpr')}
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs">
                <Award className="w-3 h-3 mr-1.5" />
                {t('badges.certified')}
              </Badge>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="border-t border-border/40 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Copyright */}
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              &copy; 2026{' '}
              <span className="font-semibold text-foreground">Studio Faraj</span>.{' '}
              {t('copyright')}
              <span className="mx-2 text-border/80">·</span>
              P.IVA 05783550287
            </p>

            {/* Legal links */}
            <div className="flex items-center justify-center sm:justify-end gap-4 text-xs">
              <Link href={getLocalizedPath('/legal', locale as any)}
                className="text-muted-foreground hover:text-primary transition-colors">
                {t('privacy')}
              </Link>
              <span className="w-px h-3 bg-border/60" />
              <Link href={getLocalizedPath('/legal', locale as any)}
                className="text-muted-foreground hover:text-primary transition-colors">
                {t('cookiePolicy')}
              </Link>
              <span className="w-px h-3 bg-border/60" />
              <Link href={getLocalizedPath('/terms', locale as any)}
                className="text-muted-foreground hover:text-primary transition-colors">
                {t('terms')}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
