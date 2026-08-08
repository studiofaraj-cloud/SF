import { Poppins, Lora, Tomorrow } from 'next/font/google';

/**
 * Font singletons, shared by every root layout.
 *
 * There are three root layouts ([locale], admin, c) because <html> can only be
 * emitted by a root layout and each tree needs a different `lang`. next/font
 * instances must be created at module scope, so they live here and are imported
 * rather than redeclared — declaring them per-layout would emit three separate
 * preload sets for the same files.
 */

// Primary UI font — geometric, modern, very readable
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

// Elegant serif — used for review quote text and pull-quotes
export const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
  preload: false, // non-critical, load after body font
  adjustFontFallback: true,
});

// Brand / heading accent
export const tomorrow = Tomorrow({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-tomorrow',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const fontVariables = `${poppins.variable} ${lora.variable} ${tomorrow.variable}`;
