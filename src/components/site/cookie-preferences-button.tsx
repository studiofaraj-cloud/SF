'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useCookiePreferences } from '@/contexts/cookie-context';

/** Opens the cookie preferences, the same panel as "Preferenze cookie" in the footer. */
export function CookiePreferencesButton({ label }: { label: string }) {
  const { openPreferences } = useCookiePreferences();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <SlidersHorizontal aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}
