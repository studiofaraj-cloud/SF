'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Code, ShoppingCart, Palette, LineChart, Bot,
  Wrench, Server, Lightbulb, ChevronDown, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/i18n-helpers';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  '/servizi/sviluppo-web':   <Code className="w-5 h-5" />,
  '/servizi/e-commerce':     <ShoppingCart className="w-5 h-5" />,
  '/servizi/design-ui-ux':   <Palette className="w-5 h-5" />,
  '/servizi/seo-marketing':  <LineChart className="w-5 h-5" />,
  '/servizi/ai-automazione': <Bot className="w-5 h-5" />,
  '/servizi/manutenzione':   <Wrench className="w-5 h-5" />,
  '/servizi/hosting-cloud':  <Server className="w-5 h-5" />,
  '/servizi/consulenza':     <Lightbulb className="w-5 h-5" />,
};

const SERVICE_COLORS: Record<string, string> = {
  '/servizi/sviluppo-web':   'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
  '/servizi/e-commerce':     'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
  '/servizi/design-ui-ux':   'bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white',
  '/servizi/seo-marketing':  'bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white',
  '/servizi/ai-automazione': 'bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white',
  '/servizi/manutenzione':   'bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white',
  '/servizi/hosting-cloud':  'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white',
  '/servizi/consulenza':     'bg-fuchsia-500/10 text-fuchsia-500 group-hover:bg-fuchsia-500 group-hover:text-white',
};

function MegaMenuPortal({
  open,
  triggerRect,
  onMouseEnter,
  onMouseLeave,
  onClose,
  serviceItems,
  pathname,
  locale,
}: {
  open: boolean;
  triggerRect: DOMRect | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  serviceItems: { href: string; label: string; subtitle: string }[];
  pathname: string;
  locale: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !triggerRect) return null;

  const top = triggerRect.bottom + 12;
  const left = triggerRect.left + triggerRect.width / 2;

  const panel = (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top,
        left,
        transform: 'translateX(-50%)',
        zIndex: 99999,
      }}
      className={cn(
        'w-[580px] rounded-2xl border border-border/60 bg-background backdrop-blur-xl shadow-2xl shadow-black/15',
        'transition-all duration-200 origin-top',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border/40 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          I nostri servizi
        </p>
        <span className="text-xs text-muted-foreground/40">{serviceItems.length} servizi</span>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-0.5 p-3">
        {serviceItems.map((service) => {
          const localizedHref = getLocalizedPath(service.href, locale as any);
          const isActive = pathname.startsWith(localizedHref);
          const iconColorClass = SERVICE_COLORS[service.href] ?? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white';
          return (
            <Link
              key={service.href}
              href={localizedHref}
              onClick={onClose}
              className={cn(
                'group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-150',
                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/70 text-foreground'
              )}
            >
              <div className={cn(
                'mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
                iconColorClass
              )}>
                {SERVICE_ICONS[service.href]}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  'text-sm font-semibold leading-tight',
                  isActive ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'
                )}>
                  {service.label}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug line-clamp-2">
                  {service.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="px-4 py-3 border-t border-border/40">
        <Link
          href={getLocalizedPath('/contatti', locale as any)}
          onClick={onClose}
          className="group flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <span className="text-sm font-medium text-primary">Inizia un progetto con noi</span>
          <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

export function NavigationMenu() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tServices = useTranslations('services');

  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateRect = useCallback(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  const handleOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateRect();
    setOpen(true);
  };

  const handleClose = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handlePanelEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const navItems = [
    { href: '/',          label: t('home') },
    { href: '/chi-siamo', label: t('about') },
    { href: '/projects',  label: t('projects') },
    { href: '/blog',      label: t('blog') },
    { href: '/contatti',  label: t('contact') },
  ];

  const serviceItems = [
    { href: '/servizi/sviluppo-web',   label: tServices('webDevelopment.label'),  subtitle: tServices('webDevelopment.subtitle') },
    { href: '/servizi/e-commerce',     label: tServices('ecommerce.label'),        subtitle: tServices('ecommerce.subtitle') },
    { href: '/servizi/design-ui-ux',   label: tServices('designUIUX.label'),       subtitle: tServices('designUIUX.subtitle') },
    { href: '/servizi/seo-marketing',  label: tServices('seoMarketing.label'),     subtitle: tServices('seoMarketing.subtitle') },
    { href: '/servizi/ai-automazione', label: tServices('aiAutomation.label'),     subtitle: tServices('aiAutomation.subtitle') },
    { href: '/servizi/manutenzione',   label: tServices('maintenance.label'),      subtitle: tServices('maintenance.subtitle') },
    { href: '/servizi/hosting-cloud',  label: tServices('hostingCloud.label'),     subtitle: tServices('hostingCloud.subtitle') },
    { href: '/servizi/consulenza',     label: tServices('consulting.label'),       subtitle: tServices('consulting.subtitle') },
  ];

  const isServicesActive = pathname.includes('/servizi');

  return (
    <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium h-full">

      {/* Before Servizi */}
      {navItems.slice(0, 2).map((item, index) => {
        const localizedHref = getLocalizedPath(item.href, locale as any);
        const isActive = pathname === localizedHref || (item.href !== '/' && pathname.startsWith(localizedHref));
        return (
          <Link
            key={item.href}
            href={localizedHref}
            className={cn(
              'transition-colors animate-fade-in-down',
              isActive ? 'text-primary font-semibold' : 'text-foreground/60 hover:text-foreground/80'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            suppressHydrationWarning
          >
            {item.label}
          </Link>
        );
      })}

      {/* ── Servizi trigger ── */}
      <div
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className="relative"
      >
        <button
          ref={triggerRef}
          onClick={() => { updateRect(); setOpen(!open); }}
          className={cn(
            'flex items-center gap-1 transition-colors animate-fade-in-down',
            isServicesActive ? 'text-primary font-semibold' : 'text-foreground/60 hover:text-foreground/80'
          )}
          style={{ animationDelay: '200ms' }}
          suppressHydrationWarning
        >
          {t('services')}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>

      {/* After Servizi */}
      {navItems.slice(2).map((item, index) => {
        const localizedHref = getLocalizedPath(item.href, locale as any);
        const isActive = pathname === localizedHref || (item.href !== '/' && pathname.startsWith(localizedHref));
        return (
          <Link
            key={item.href}
            href={localizedHref}
            className={cn(
              'transition-colors animate-fade-in-down',
              isActive ? 'text-primary font-semibold' : 'text-foreground/60 hover:text-foreground/80'
            )}
            style={{ animationDelay: `${(index + 3) * 100}ms` }}
            suppressHydrationWarning
          >
            {item.label}
          </Link>
        );
      })}

      {/* ── Mega-menu (portaled to body) ── */}
      <MegaMenuPortal
        open={open}
        triggerRect={triggerRect}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handleClose}
        onClose={() => setOpen(false)}
        serviceItems={serviceItems}
        pathname={pathname}
        locale={locale}
      />
    </nav>
  );
}
