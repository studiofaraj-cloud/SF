'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';

// Client-only: the dialog pulls in form + validation code that no first paint needs.
const QuoteDialog = dynamic(() => import('@/components/site/quote-dialog'), { ssr: false });

/**
 * Tertiary "or request a quote" action.
 *
 * Isolated into its own client island so the rest of the hero — headline, CTAs,
 * project cards, trust strip — can stay a server component. Previously the whole
 * hero was client-only just to support this dialog and a rotating word, which
 * kept every word of above-the-fold copy out of the served HTML.
 */
export function HeroQuoteButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <QuoteDialog open={open} onOpenChange={setOpen} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-primary"
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </>
  );
}
