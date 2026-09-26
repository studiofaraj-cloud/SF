'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { SearchDialog } from './search-dialog';
import { NavigationMenu } from './navigation-menu';
import { MobileMenu, type HeaderRating } from './mobile-menu';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';

function DesktopNav({ onSearchOpen }: { onSearchOpen: () => void }) {
    const locale = useLocale();
    return (
        <>
         <div className="hidden flex-1 items-center justify-between lg:flex h-full">
            <Link href="/" title="Studio Faraj — Home" className="mr-4 md:mr-6 flex items-center space-x-2 h-full">
              <Image src="/assets/logo.png" alt="Studio Faraj Logo" width={32} height={32} className="md:w-8 md:h-8 lg:w-10 lg:h-10 flex-shrink-0" unoptimized />
              <span className="font-brand font-semibold text-sm md:text-base lg:text-lg whitespace-nowrap brand-wordmark">Studio Faraj</span>
            </Link>
            <div className="flex items-center h-full">
              <NavigationMenu />
            </div>
            <div className="flex items-center justify-end space-x-1 md:space-x-2 h-full">
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 text-foreground" onClick={() => onSearchOpen()}>
                <Search className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                <span className="sr-only">Search</span>
              </Button>
              <ThemeToggle />
              <LanguageSwitcher />
              <Link
                href={`/${locale}/hub/login`}
                title={locale === 'it' ? 'Accedi alla tua area clienti' : 'Sign in to your client area'}
                className="ml-1 hidden xl:inline-flex items-center h-9 px-3 rounded-full text-[12.5px] font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {locale === 'it' ? 'Area Clienti' : 'Client Area'}
              </Link>
              <Link
                href={getLocalizedPath('/contatti', locale as any)}
                title={locale === 'it' ? 'Richiedi un preventivo gratuito' : 'Get a free quote'}
                className="ml-1 hidden xl:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-[12.5px] font-bold tracking-wide hover:brightness-110 transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] whitespace-nowrap"
              >
                {locale === 'it' ? 'Preventivo' : 'Get a Quote'}
              </Link>
            </div>
          </div>
        </>
    )
}


export function SiteHeader({ rating = null }: { rating?: HeaderRating }) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchOpen = () => setSearchOpen(true);

  return (
    <>
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
      <header
        className={cn(
          'fixed top-0 z-50 left-0 right-0 transition-all duration-300',
          scrolled
            ? 'p-2 md:p-2.5 lg:px-6 xl:px-10 2xl:px-24'
            : 'p-3 md:p-4 lg:px-6 xl:px-10 2xl:px-24'
        )}
      >
        <div
          className={cn(
            'relative mx-auto flex w-full max-w-[1600px] items-center justify-between rounded-2xl border border-border/70 bg-background px-4 shadow-[0_2px_14px_rgba(10,22,40,0.07)] transition-all duration-300 md:px-5 lg:px-6 xl:px-8',
            scrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'
          )}
        >
          <div className="hidden lg:flex flex-1 relative z-10 h-full items-center">
            <DesktopNav onSearchOpen={handleSearchOpen} />
          </div>
          <div className="flex items-center lg:hidden relative z-10 h-full">
            <Link href="/" title="Studio Faraj — Home" className="flex items-center space-x-2 h-full">
              <Image src="/assets/logo.png" alt="Studio Faraj Logo" width={32} height={32} className="md:w-8 md:h-8 flex-shrink-0" unoptimized />
              <span className="font-brand font-semibold text-sm md:text-base whitespace-nowrap brand-wordmark">Studio Faraj</span>
            </Link>
          </div>
          <div className="lg:hidden relative z-10 flex items-center h-full gap-2">
            {mounted ? (
              <>
                <ThemeToggle />
                <LanguageSwitcher />
              </>
            ) : (
              <>
                <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
                <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
              </>
            )}
            {/* Server-rendered: the menu button is there from the first paint. */}
            <MobileMenu rating={rating} onSearchOpen={handleSearchOpen} />
          </div>
        </div>
      </header>
    </>
  );
}
