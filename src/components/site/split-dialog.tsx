'use client';

import type { CSSProperties, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * The quote and booking dialogs' shell: full screen on phones, from lg a
 * floating two-column sheet with a navy side and the form beside it.
 */
export function SplitDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  aside,
  closeLabel,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opened from outside a DialogTrigger? Use this to send focus back on close. */
  onCloseAutoFocus?: (event: Event) => void;
  aside: ReactNode;
  closeLabel: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy/70 backdrop-blur-md duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            'fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-background text-foreground outline-none',
            'duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-6',
            // From lg: a floating two-column sheet, centred without transforms
            // so the entrance animation is free to use them.
            'lg:m-auto lg:grid lg:h-fit lg:grid-rows-[minmax(0,1fr)] lg:max-h-[calc(100dvh-4rem)] lg:w-[min(1120px,calc(100vw-4rem))] lg:grid-cols-[5fr_7fr] lg:overflow-hidden lg:rounded-[28px] lg:shadow-[0_50px_120px_-30px_rgba(2,8,23,0.8)] lg:ring-1 lg:ring-white/10 lg:data-[state=closed]:zoom-out-[0.98] lg:data-[state=open]:zoom-in-[0.97] lg:data-[state=open]:slide-in-from-bottom-3',
          )}
        >
          {aside}

          <div className="relative min-h-0 lg:flex lg:flex-col lg:overflow-y-auto">
            <div className="px-5 pb-10 pt-8 sm:px-10 lg:my-auto lg:px-12 lg:py-12">{children}</div>
          </div>

          <DialogPrimitive.Close className="fixed right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:absolute lg:right-5 lg:top-5">
            <X className="h-5 w-5" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** The navy side: a status line, the title, what happens next, and a footer. */
export function DialogAside({
  eyebrow,
  title,
  description,
  stepsTitle,
  steps,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  footer?: ReactNode;
}) {
  return (
    <aside className="relative isolate overflow-hidden bg-navy px-5 pb-9 pt-16 text-white sm:px-10 lg:flex lg:flex-col lg:px-12 lg:py-12">
      <div aria-hidden className="tech-grid absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -bottom-48 -left-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/35 blur-[120px]" />

      <p className="qd-rise flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 motion-reduce:hidden" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        {eyebrow}
      </p>

      <DialogTitle
        className="qd-rise mt-6 max-w-[12ch] font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]"
        style={{ '--d': '60ms' } as CSSProperties}
      >
        {title}
      </DialogTitle>
      <DialogDescription
        className="qd-rise mt-5 max-w-md leading-relaxed text-white/70 lg:text-[17px]"
        style={{ '--d': '120ms' } as CSSProperties}
      >
        {description}
      </DialogDescription>

      <div className="lg:mt-auto">
        <div className="hidden lg:block lg:pt-10 [@media(max-height:880px)]:!hidden">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{stepsTitle}</p>
          <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-white/15">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="qd-rise relative grid grid-cols-[1.75rem_1fr]"
                style={{ '--d': `${200 + i * 70}ms` } as CSSProperties}
              >
                <span aria-hidden className="mt-1.5 h-[11px] w-[11px] rounded-full border-2 border-sky-400 bg-navy" />
                <span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs text-sky-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-semibold">{step.title}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/60">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {footer && (
          <div className="mt-10 hidden flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/65 lg:flex">{footer}</div>
        )}
      </div>
    </aside>
  );
}
