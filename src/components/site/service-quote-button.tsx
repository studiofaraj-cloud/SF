'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuoteDialog = dynamic(() => import('@/components/site/quote-dialog'), { ssr: false });
const preload = () => void import('@/components/site/quote-dialog');

/**
 * A service page's main call to action: opens the quote form with this
 * service already selected. The dialog's code loads on hover, focus or click.
 */
export function ServiceQuoteButton({ label, service, className }: { label: string; service?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="dialog"
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className={cn(
          'group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        {label}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      {mounted && (
        <QuoteDialog
          open={open}
          onOpenChange={setOpen}
          prefill={service ? { service } : undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            button.current?.focus();
          }}
        />
      )}
    </>
  );
}
