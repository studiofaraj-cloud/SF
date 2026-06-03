'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

/**
 * Light/dark theme toggle for the site header.
 *
 * Uses next-themes (ThemeProvider is mounted in src/app/[locale]/layout.tsx
 * with `attribute="class"` and `defaultTheme="system"`). Tailwind is configured
 * with `darkMode: ['class']`, and the light + dark color palettes are defined
 * in src/app/globals.css (`:root` and `.dark`).
 *
 * Hydration: useTheme returns undefined on the server, so we render a neutral
 * placeholder until mounted to avoid a server/client mismatch on the icon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolved theme tells us what's actually applied (handles "system" correctly).
  const isDark = mounted && resolvedTheme === 'dark';
  const next = isDark ? 'light' : 'dark';

  const label =
    locale === 'it'
      ? isDark
        ? 'Passa al tema chiaro'
        : 'Passa al tema scuro'
      : isDark
        ? 'Switch to light theme'
        : 'Switch to dark theme';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 text-foreground relative"
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      {/* Pre-mount placeholder — keeps width stable, no flash of wrong icon */}
      {!mounted ? (
        <Sun className="h-4 w-4 md:h-5 md:w-5 opacity-0" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
