'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLocale } from 'next-intl';
import { getLocalizedPath, removeLocaleFromPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';
import { HeaderServicesMenu } from './header-services-menu';
import { LocaleSwitch } from './locale-switch';
import { MobileMenu, type HeaderRating } from './mobile-menu';
import { ServiceQuoteButton } from './service-quote-button';
import { ThemeToggle } from './theme-toggle';

// Loaded on the first search, not with every page.
const SearchDialog = dynamic(() => import('./search-dialog').then((m) => m.SearchDialog), { ssr: false });

const COPY = {
  it: {
    home: 'Studio Faraj, home',
    nav: 'Navigazione principale',
    projects: 'Progetti',
    about: 'Chi siamo',
    blog: 'Blog',
    contact: 'Contatti',
    search: 'Cerca nel sito',
    area: 'Area clienti',
    areaTitle: 'Accedi alla tua area clienti',
    quote: 'Richiedi un preventivo',
    quoteShort: 'Preventivo',
  },
  en: {
    home: 'Studio Faraj, home',
    nav: 'Main navigation',
    projects: 'Projects',
    about: 'About',
    blog: 'Blog',
    contact: 'Contact',
    search: 'Search the site',
    area: 'Client area',
    areaTitle: 'Sign in to your client area',
    quote: 'Get a quote',
    quoteShort: 'Quote',
  },
} as const;

/** Pages whose first section is navy: at the top the header is see-through and white. */
const DARK_TOP = new Set(['/', '/chi-siamo']);

/**
 * The site header: a full-width bar, see-through at the top of the page
 * (white over a navy hero) and solid once the page scrolls. Desktop has the
 * services menu, four links, search, theme, IT / EN, the client area and the
 * quote button, which opens the quote dialog; phones get the full-screen menu.
 */
export function SiteHeader({ rating = null }: { rating?: HeaderRating }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const copy = COPY[locale];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchUsed, setSearchUsed] = useState(false);
  const openSearch = () => {
    setSearchUsed(true);
    setSearchOpen(true);
  };
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLSpanElement>(null);

  // A marker in the first 24px of the page: once it leaves the viewport, the bar turns solid.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onDark = !scrolled && DARK_TOP.has(removeLocaleFromPath(pathname));
  const isActive = (href: string) => {
    const localized = getLocalizedPath(href, locale);
    return pathname === localized || pathname.startsWith(`${localized}/`);
  };
  const item = (active: boolean) =>
    cn(
      'inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:px-4',
      active ? 'font-semibold' : 'font-medium',
      onDark
        ? active
          ? 'text-white'
          : 'text-white/75 hover:bg-white/10 hover:text-white'
        : active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    );
  const tool = cn('transition-colors', onDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-foreground hover:bg-muted');

  const links = [
    { href: '/projects', label: copy.projects },
    { href: '/chi-siamo', label: copy.about },
    { href: '/blog', label: copy.blog },
    { href: '/contatti', label: copy.contact },
  ];

  return (
    <>
      <span ref={sentinel} aria-hidden className="pointer-events-none absolute left-0 top-0 h-6 w-px" />
      {searchUsed && <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300',
          scrolled ? 'bg-background/85 shadow-[0_1px_0_hsl(var(--border))] backdrop-blur-xl' : 'bg-transparent',
          onDark ? 'text-white' : 'text-foreground',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[1400px] items-center gap-4 px-5 transition-[height] duration-300 md:px-8 lg:gap-6 lg:px-10',
            scrolled ? 'h-16' : 'h-[72px] md:h-[84px]',
          )}
        >
          <Link href={getLocalizedPath('/', locale)} aria-label={copy.home} className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {/* White mark over the navy hero, the coloured one everywhere else: they cross-fade. */}
            <span className="relative h-9 w-9 shrink-0 md:h-[38px] md:w-[38px]">
              <Image
                src="/assets/logo.webp"
                alt=""
                width={38}
                height={38}
                priority
                unoptimized
                className={cn('absolute inset-0 h-full w-full transition-opacity duration-300', onDark && 'opacity-0')}
              />
              <Image
                src="/assets/logo-white.webp"
                alt=""
                width={38}
                height={38}
                priority
                unoptimized
                className={cn('absolute inset-0 h-full w-full transition-opacity duration-300', !onDark && 'opacity-0')}
              />
            </span>
            <span className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.01em] md:text-lg">Studio Faraj</span>
          </Link>

          <nav aria-label={copy.nav} className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            <HeaderServicesMenu locale={locale} className={item(isActive('/servizi'))} />
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link key={l.href} href={getLocalizedPath(l.href, locale)} aria-current={active ? 'page' : undefined} className={item(active)}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            <button
              type="button"
              onClick={openSearch}
              onPointerEnter={() => void import('./search-dialog')}
              aria-label={copy.search}
              className={cn('hidden h-10 w-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:grid', tool)}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <ThemeToggle className={cn('h-10 w-10 rounded-full md:h-10 md:w-10', tool)} />
            <LocaleSwitch className={onDark ? 'text-white' : 'text-foreground'} />
            <Link
              href={`/${locale}/hub/login`}
              // The client area ships the Firebase SDK: don't fetch it for every visitor.
              prefetch={false}
              title={copy.areaTitle}
              className={cn('hidden h-10 items-center whitespace-nowrap rounded-full px-3 text-sm font-semibold xl:inline-flex', tool)}
            >
              {copy.area}
            </Link>
            <ServiceQuoteButton
              label={copy.quote}
              variant="plain"
              className="ml-1.5 hidden h-11 items-center whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 lg:inline-flex"
            >
              <span className="xl:hidden">{copy.quoteShort}</span>
              <span className="hidden xl:inline">{copy.quote}</span>
            </ServiceQuoteButton>
            {/* Server-rendered: the menu button is there from the first paint. */}
            <MobileMenu rating={rating} onSearchOpen={openSearch} triggerClassName={onDark ? 'text-white hover:bg-white/10' : undefined} />
          </div>
        </div>
      </header>
    </>
  );
}
