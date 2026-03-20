'use client';

import Link from 'next/link';
import { Search, Menu, Home, Users, Sparkles, FolderOpen, BookOpen, Mail, Code, ShoppingCart, Palette, TrendingUp, Bot, Wrench, Server, MessageSquare, ChevronDown, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SearchDialog } from './search-dialog';
import { NavigationMenu } from './navigation-menu';
import { navItems } from '@/lib/definitions';
import Image from 'next/image';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';

// Icon mapping for navigation items
const navIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '/': Home,
  '/chi-siamo': Users,
  '/#services': Sparkles,
  '/projects': FolderOpen,
  '/blog': BookOpen,
  '/contatti': Mail,
};

// Service items with icons and accent colors
const serviceItems = [
  { href: '/servizi/sviluppo-web',   label: 'Sviluppo Web',     icon: Code,           color: 'text-blue-400' },
  { href: '/servizi/e-commerce',     label: 'E-commerce',       icon: ShoppingCart,   color: 'text-emerald-400' },
  { href: '/servizi/design-ui-ux',   label: 'Design UI/UX',     icon: Palette,        color: 'text-violet-400' },
  { href: '/servizi/seo-marketing',  label: 'SEO & Marketing',  icon: TrendingUp,     color: 'text-teal-400' },
  { href: '/servizi/ai-automazione', label: 'AI & Automazione', icon: Bot,            color: 'text-pink-400' },
  { href: '/servizi/manutenzione',   label: 'Manutenzione',     icon: Wrench,         color: 'text-orange-400' },
  { href: '/servizi/hosting-cloud',  label: 'Hosting & Cloud',  icon: Server,         color: 'text-indigo-400' },
  { href: '/servizi/consulenza',     label: 'Consulenza',       icon: MessageSquare,  color: 'text-fuchsia-400' },
];

function MobileNav({ onSearchOpen }: { onSearchOpen: () => void }) {
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isServicesOpen, setServicesOpen] = useState(false);
    const pathname = usePathname();
    const locale = useLocale();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isServicePage = mounted && pathname?.startsWith('/servizi/');

    useEffect(() => {
        if (isServicePage && isSheetOpen) {
            setServicesOpen(true);
        }
    }, [isServicePage, isSheetOpen]);

    return (
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 text-foreground" aria-label="Open mobile menu">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 border-r border-primary/15 gap-0 bg-gradient-to-b from-background/85 to-secondary/40 backdrop-blur-xl">
                <VisuallyHidden><SheetTitle>Navigation</SheetTitle></VisuallyHidden>

                {/* ═══ HEADER ═══ */}
                <div className="relative px-5 pt-6 pb-5">
                    <Link href="/" className="flex items-center gap-3 group" onClick={() => setSheetOpen(false)}>
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 bg-primary/25 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Image src="/assets/logo.png" alt="Studio Faraj" width={40} height={40}
                                className="relative transition-transform duration-300 group-hover:scale-110" unoptimized />
                        </div>
                        <div>
                            <p className="font-brand text-lg font-bold text-foreground group-hover:text-primary transition-colors">Studio Faraj</p>
                            <p className="text-[9px] font-semibold tracking-[0.2em] text-primary/50 uppercase">Web Development Agency</p>
                        </div>
                    </Link>
                    {/* Glow line */}
                    <div className="absolute bottom-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>

                {/* ═══ NAV LIST ═══ */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1">
                    {navItems?.map((item, index) => {
                        const Icon = navIcons[item.href] || Home;
                        const isActive = mounted && (
                            item.href === '/#services'
                                ? isServicePage
                                : pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                        );

                        /* ── Services dropdown ── */
                        if (item.href === '/#services') {
                            return (
                                <div key={item.href}>
                                    <button
                                        onClick={() => setServicesOpen(!isServicesOpen)}
                                        className={cn(
                                            'flex flex-row items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-300',
                                            'hover:bg-primary/8 active:scale-[0.98]',
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-foreground'
                                        )}
                                    >
                                        <span className={cn(
                                            'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200',
                                            isActive
                                                ? 'bg-primary/20 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.25)]'
                                                : 'bg-primary/8 text-primary/70'
                                        )}>
                                            <Icon className="w-[18px] h-[18px]" />
                                        </span>
                                        <span className="flex-1 text-[13px] font-semibold">{item.label}</span>
                                        <ChevronDown className={cn(
                                            'w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0',
                                            isServicesOpen && 'rotate-180 text-primary'
                                        )} />
                                    </button>

                                    {/* Service sub-items */}
                                    {isServicesOpen && (
                                        <div className="mt-1 ml-[22px] pl-3 border-l-2 border-primary/15 space-y-0.5">
                                            {serviceItems.map((service) => {
                                                const SIcon = service.icon;
                                                const localizedServiceHref = getLocalizedPath(service.href, locale as any);
                                                const isServiceActive = mounted && pathname === localizedServiceHref;
                                                return (
                                                    <Link
                                                        key={service.href}
                                                        href={localizedServiceHref}
                                                        onClick={() => { setSheetOpen(false); setServicesOpen(false); }}
                                                        className={cn(
                                                            'flex flex-row items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200',
                                                            'hover:bg-primary/8 hover:translate-x-0.5 active:scale-[0.98]',
                                                            isServiceActive
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        )}
                                                    >
                                                        <SIcon className={cn('w-4 h-4 shrink-0', isServiceActive ? 'text-primary' : service.color)} />
                                                        <span className="text-[12px] font-medium">{service.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        /* ── Regular nav item ── */
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSheetOpen(false)}
                                className={cn(
                                    'flex flex-row items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                                    'hover:bg-primary/8 active:scale-[0.98]',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground'
                                )}
                            >
                                <span className={cn(
                                    'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/20 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.25)]'
                                        : 'bg-primary/8 text-primary/70'
                                )}>
                                    <Icon className="w-[18px] h-[18px]" />
                                </span>
                                <span className="text-[13px] font-semibold">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* ═══ FOOTER ═══ */}
                <div className="px-3 pb-4 pt-2 space-y-2 border-t border-border/30">
                    {/* Search */}
                    <button onClick={() => { setSheetOpen(false); setTimeout(() => onSearchOpen(), 150); }}
                        className="flex flex-row items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-all duration-200 active:scale-[0.98] w-full"
                    >
                        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/8 text-primary/70 shrink-0">
                            <Search className="w-[18px] h-[18px]" />
                        </span>
                        <span className="text-[13px] font-semibold">{locale === 'it' ? 'Cerca' : 'Search'}</span>
                    </button>
                    {/* CTA */}
                    <Link href={getLocalizedPath('/contatti', locale as any)} onClick={() => setSheetOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold tracking-wide hover:brightness-110 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
                    >
                        Inizia un Progetto
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function DesktopNav({ onSearchOpen }: { onSearchOpen: () => void }) {
    return (
        <>
         <div className="hidden flex-1 items-center justify-between md:flex h-full">
            <Link href="/" className="mr-4 md:mr-6 flex items-center space-x-2 h-full">
              <Image src="/assets/logo.png" alt="Studio Faraj Logo" width={32} height={32} className="md:w-8 md:h-8 lg:w-10 lg:h-10 flex-shrink-0" unoptimized />
              <span className="font-brand text-sm md:text-base lg:text-lg whitespace-nowrap text-foreground">Studio Faraj</span>
            </Link>
            <div className="flex items-center h-full">
              <NavigationMenu />
            </div>
            <div className="flex items-center justify-end space-x-1 md:space-x-2 h-full">
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 text-foreground" onClick={() => onSearchOpen()}>
                <Search className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                <span className="sr-only">Search</span>
              </Button>
              <LanguageSwitcher />
            </div>
          </div>
        </>
    )
}


export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchOpen = () => setSearchOpen(true);

  return (
    <>
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
      <header className="fixed top-0 z-50 p-3 md:p-4 left-0 right-0 lg:left-[200px] lg:right-[200px] animate-fade-in-up">
        <div className="header-modern-angled header-angled-border relative flex h-14 md:h-16 items-center justify-between px-4 md:px-6 lg:px-8 animate-fade-in-up">
          {/* Left angled accent */}
          <div className="header-angle-accent header-angle-accent-top-left"></div>

          {/* Right angled accent */}
          <div className="header-angle-accent header-angle-accent-bottom-right"></div>

          {/* Right side angle overlay */}
          <div className="header-modern-angled-right"></div>

          <div className="hidden md:flex flex-1 relative z-10 h-full items-center">
            <DesktopNav onSearchOpen={handleSearchOpen} />
          </div>
          <div className="flex items-center md:hidden relative z-10 h-full">
            <Link href="/" className="flex items-center space-x-2 h-full">
              <Image src="/assets/logo.png" alt="Studio Faraj Logo" width={32} height={32} className="md:w-8 md:h-8 flex-shrink-0" unoptimized />
              <span className="font-brand text-sm md:text-base whitespace-nowrap text-foreground">Studio Faraj</span>
            </Link>
          </div>
          <div className="md:hidden relative z-10 flex items-center h-full gap-2">
            {mounted ? (
              <>
                <LanguageSwitcher />
                <MobileNav onSearchOpen={handleSearchOpen} />
              </>
            ) : (
              <>
                <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
                <div className="px-2">
                  <div className="h-6 w-6 bg-muted/50 rounded animate-pulse" />
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
