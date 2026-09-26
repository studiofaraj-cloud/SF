'use client';

import { useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const QuoteDialog = dynamic(() => import('@/components/site/quote-dialog'), { ssr: false });

// Warms the dialog's chunk on hover/focus so the first click opens it quickly.
const preload = () => void import('@/components/site/quote-dialog');

/**
 * The hero's rendered quote form: a button that opens the real QuoteDialog.
 * The preview itself is server-rendered and passed in as children; the dialog
 * is only downloaded and mounted once someone reaches for it.
 */
export function HeroQuotePreview({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      {mounted && (
        <QuoteDialog
          open={open}
          onOpenChange={setOpen}
          // No DialogTrigger here, so hand focus back to the preview ourselves.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            buttonRef.current?.focus();
          }}
        />
      )}
    </>
  );
}
