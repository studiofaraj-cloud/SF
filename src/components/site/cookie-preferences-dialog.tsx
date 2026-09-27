'use client';

import { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { NONE, ALL, COPY, readPreferences, type CookiePreferences } from './cookie-consent';

const CATEGORIES = ['essential', 'analytics', 'functional'] as const;

/** Cookie preferences: the saved choice per category, and reject / save / accept all. */
export default function CookiePreferencesDialog({
  copy,
  open,
  onOpenChange,
  onDecide,
}: {
  copy: (typeof COPY)[keyof typeof COPY];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecide: (prefs: CookiePreferences) => void;
}) {
  const [prefs, setPrefs] = useState<CookiePreferences>(NONE);

  // Opening shows what is saved now.
  useEffect(() => {
    if (open) setPrefs(readPreferences());
  }, [open]);

  const decide = onDecide;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-x-2.5 bottom-2.5 z-[70] max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-3xl bg-card text-card-foreground shadow-[0_40px_90px_-30px_rgba(10,22,40,0.6)] outline-none ring-1 ring-border',
            'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[30rem] sm:-translate-x-1/2 sm:-translate-y-1/2',
            'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4',
          )}
        >
          <div className="px-6 pb-2 pt-6 sm:px-7 sm:pt-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{copy.eyebrow}</p>
            <DialogPrimitive.Title className="mt-2.5 pr-8 font-display text-[1.35rem] font-bold tracking-[-0.02em]">
              {copy.prefsTitle}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {copy.prefsBody}
            </DialogPrimitive.Description>
          </div>

          <ul className="mt-3 px-6 sm:px-7">
            {CATEGORIES.map((id) => {
              const [name, text] = copy.categories[id];
              const locked = id === 'essential';
              return (
                <li key={id} className="flex items-center gap-4 border-t border-border py-3.5">
                  <label htmlFor={`cookie-${id}`} className={cn('flex-1', !locked && 'cursor-pointer')}>
                    <span className="block text-[15px] font-semibold">{name}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                      {text}
                      {locked && <> · {copy.always}</>}
                    </span>
                  </label>
                  <Switch
                    id={`cookie-${id}`}
                    checked={locked || prefs[id]}
                    disabled={locked}
                    onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [id]: checked }))}
                  />
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/50 px-6 py-5 sm:px-7">
            <button
              type="button"
              onClick={() => decide(NONE)}
              className="h-11 rounded-xl bg-background text-sm font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {copy.rejectAll}
            </button>
            <button
              type="button"
              onClick={() => decide({ ...prefs, essential: true, marketing: false })}
              className="h-11 rounded-xl bg-background text-sm font-semibold ring-1 ring-inset ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {copy.save}
            </button>
            <button
              type="button"
              onClick={() => decide(ALL)}
              className="col-span-2 h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.acceptAll}
            </button>
          </div>

          <DialogPrimitive.Close
            aria-label={copy.closePrefs}
            className="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-[18px] w-[18px]" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
