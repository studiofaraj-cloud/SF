'use client';

import { useActionState, useEffect, useRef } from 'react';
import { subscribeToNewsletter, type SignupState } from '@/lib/newsletter-actions';
import { useCookiePreferences } from '@/contexts/cookie-context';
import { cn } from '@/lib/utils';

type NewsletterCopy = {
  label: string;
  placeholder: string;
  subscribe: string;
  sending: string;
  sent: string;
  invalid: string;
  undeliverable: string;
  limited: string;
  consent: readonly [string, string, string];
};

/**
 * The footer's newsletter sign-up (double opt-in: it sends a confirmation
 * email, see src/lib/newsletter.ts). The result shows under the field (the
 * public site has no toasts). Copy comes from the server footer.
 *
 * Two quiet bot checks travel with the form: a field people never see
 * ("website": bots fill in every field) and how long the form was on screen
 * before it was sent (bots send it at once).
 */
export function FooterNewsletter({ locale, copy }: { locale: string; copy: NewsletterCopy }) {
  const form = useRef<HTMLFormElement>(null);
  const shownAt = useRef(0);
  const elapsed = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState<SignupState, FormData>(subscribeToNewsletter, { outcome: null });

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.outcome === 'sent') form.current?.reset();
  }, [state]);

  const message = state.outcome ? copy[state.outcome] : null;

  return (
    <>
      <form
        ref={form}
        action={action}
        onSubmit={() => {
          if (elapsed.current) elapsed.current.value = String(Date.now() - shownAt.current);
        }}
        className="relative mt-4 flex h-12 max-w-sm items-center gap-2 rounded-xl bg-white/[0.06] p-1.5 pl-4 ring-1 ring-inset ring-white/15 focus-within:ring-white/40"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="source" value="footer" />
        <input ref={elapsed} type="hidden" name="elapsed" defaultValue="" />
        {/* For bots only: off-screen, out of the tab order and hidden from assistive tech. */}
        <div aria-hidden className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">{copy.label}</span>
          <input
            type="email"
            name="email"
            required
            maxLength={254}
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
          {pending ? copy.sending : copy.subscribe}
        </button>
      </form>
      <p role="status" aria-live="polite" className={cn('mt-2 min-h-[1.25rem] max-w-sm text-xs leading-relaxed', state.outcome === 'sent' ? 'text-emerald-300' : 'text-red-300')}>
        {message}
      </p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/45">
        {copy.consent[0]}
        <a href={`/${locale}/privacy`} className="underline decoration-white/25 underline-offset-2 hover:text-white/70">
          {copy.consent[1]}
        </a>
        {copy.consent[2]}
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
