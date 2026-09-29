'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createSubscriber } from '@/lib/actions';
import { useCookiePreferences } from '@/contexts/cookie-context';
import { cn } from '@/lib/utils';

/**
 * The footer's newsletter sign-up. The result shows under the field (the
 * public site has no toasts). Copy comes from the server footer.
 */
export function FooterNewsletter({
  locale,
  copy,
}: {
  locale: string;
  copy: { label: string; placeholder: string; subscribe: string; done: string; failed: string };
}) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<{ message: string | null; success: boolean }, FormData>(createSubscriber, {
    message: null,
    success: false,
  });

  useEffect(() => {
    if (state?.success) form.current?.reset();
  }, [state]);

  return (
    <>
      <form ref={form} action={action} className="mt-4 flex h-12 max-w-sm items-center gap-2 rounded-xl bg-white/[0.06] p-1.5 pl-4 ring-1 ring-inset ring-white/15 focus-within:ring-white/40">
        <input type="hidden" name="locale" value={locale} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">{copy.label}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={copy.placeholder}
            className="w-full bg-transparent text-[15px] text-white placeholder:text-white/45 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-9 shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-70"
        >
          {copy.subscribe}
        </button>
      </form>
      <p role="status" aria-live="polite" className={cn('mt-2 min-h-[1.25rem] text-xs', state?.success ? 'text-emerald-300' : 'text-red-300')}>
        {state?.message ? (state.success ? copy.done : copy.failed) : null}
      </p>
    </>
  );
}

/** Reopens the cookie choice: consent must be changeable at any time. */
export function CookiePreferencesLink({ label, className }: { label: string; className?: string }) {
  const { openPreferences } = useCookiePreferences();
  return (
    <button type="button" onClick={openPreferences} className={className}>
      {label}
    </button>
  );
}
