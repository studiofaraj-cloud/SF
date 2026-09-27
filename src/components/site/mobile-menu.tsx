'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';
import type { Rect } from './mobile-menu-panel';

/** The live Google average, or null when there is no live data. */
export type HeaderRating = { value: number } | null;

// The panel (links, trust card, contacts, Radix Dialog) loads when the button
// is first touched, not with every page.
const MobileMenuPanel = dynamic(() => import('./mobile-menu-panel'), { ssr: false });
const preload = () => void import('./mobile-menu-panel');

const LABEL = { it: 'Apri il menu', en: 'Open menu' } as const;

/**
 * The header's menu button (below lg). It opens the full-screen menu panel,
 * which grows out of the button (see mobile-menu-panel.tsx).
 */
export function MobileMenu({
  rating,
  onSearchOpen,
  triggerClassName,
}: {
  rating: HeaderRating;
  onSearchOpen: () => void;
  /** Extra classes for the menu button, e.g. white over a navy hero. */
  triggerClassName?: string;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const [origin, setOrigin] = useState<Rect>({ x: -1, y: 20, w: 40, h: 40 });

  // A link was followed: close.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={LABEL[locale]}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerDown={preload}
        onFocus={preload}
        onClick={() => {
          const r = button.current?.getBoundingClientRect();
          if (r) setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
          setUsed(true);
          setOpen(true);
        }}
        className={cn(
          'group grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden',
          triggerClassName,
        )}
      >
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-3 self-end rounded-full bg-current transition-all duration-300 group-hover:w-5" />
        </span>
      </button>
      {used && (
        <MobileMenuPanel open={open} onOpenChange={setOpen} origin={origin} rating={rating} onSearchOpen={onSearchOpen} trigger={button} />
      )}
    </>
  );
}
