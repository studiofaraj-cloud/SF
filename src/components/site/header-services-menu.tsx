'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { SERVICES, serviceGroupsFor } from '@/lib/services-catalog';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

const COPY = {
  it: { label: 'Servizi', all: 'Tutti i servizi' },
  en: { label: 'Services', all: 'All services' },
} as const;

/**
 * The header's Servizi item: opens on hover (mouse) or click, and lists the
 * services in the same three groups as the /servizi hub. Closed, the panel is
 * invisible, so its links are out of the tab order.
 */
export function HeaderServicesMenu({ locale, className }: { locale: Locale; className: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pointer = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = COPY[locale];

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(timer.current);
    if (next) setOpen(true);
    else timer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div ref={wrap} className="relative" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="header-services"
        onPointerDown={(e) => (pointer.current = e.pointerType)}
        // A mouse has already opened it by hovering: a click keeps it open.
        onClick={() => setOpen((o) => (pointer.current === 'mouse' ? true : !o))}
        onKeyDown={() => (pointer.current = '')}
        className={className}
      >
        {copy.label}
        <ChevronDown aria-hidden className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <div
        id="header-services"
        className={cn(
          'absolute left-1/2 top-full z-50 w-[40rem] -translate-x-1/2 pt-3 transition-[opacity,transform,visibility] duration-200',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <div className="overflow-clip rounded-2xl bg-background text-foreground shadow-[0_30px_80px_-30px_rgba(10,22,40,0.45)] ring-1 ring-border">
          <div className="grid grid-cols-3 gap-6 p-6">
            {serviceGroupsFor(locale).map((g) => (
              <div key={g.id}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{g.title[locale]}</p>
                <ul className="mt-3 space-y-0.5">
                  {g.services.map((slug) => {
                    const href = getLocalizedPath(`/servizi/${slug}`, locale);
                    const current = pathname === href;
                    return (
                      <li key={slug}>
                        <Link
                          href={href}
                          aria-current={current ? 'page' : undefined}
                          onClick={() => setOpen(false)}
                          className={cn(
                            '-mx-2 block rounded-lg px-2 py-1.5 text-[15px] font-medium transition-colors hover:bg-muted',
                            current && 'text-primary',
                          )}
                        >
                          {SERVICES[slug].name[locale]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <Link
            href={getLocalizedPath('/servizi', locale)}
            onClick={() => setOpen(false)}
            className="group flex items-center justify-between border-t border-border bg-muted/40 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            {copy.all}
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
