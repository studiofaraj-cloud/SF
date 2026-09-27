'use client';

import { useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/config';

const BookingDialog = dynamic(() => import('./booking-dialog').then((m) => m.BookingDialog), { ssr: false });
const preload = () => void import('./booking-dialog');

/**
 * A link to /call-booking that opens the booking dialog instead, so the
 * visitor stays on the page. Without JavaScript (or with a modifier key) it
 * is a plain link. The dialog's code loads on hover, focus or click.
 */
export function BookCallButton({ className, children }: { className?: string; children: ReactNode }) {
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <a
        ref={link}
        href={getLocalizedPath('/call-booking', locale)}
        aria-haspopup="dialog"
        onPointerEnter={preload}
        onFocus={preload}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          setMounted(true);
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </a>
      {mounted && (
        <BookingDialog
          open={open}
          onOpenChange={setOpen}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            link.current?.focus();
          }}
        />
      )}
    </>
  );
}
