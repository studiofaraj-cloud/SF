import type { Locale } from '@/i18n/config';

/** How a project's `category` reads on the site; the order is the filter order. */
const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  corporate: { it: 'Sito aziendale', en: 'Company website' },
  'landing-page': { it: 'Landing page', en: 'Landing page' },
  'e-commerce': { it: 'E-commerce', en: 'E-commerce' },
  other: { it: 'Su misura', en: 'Custom build' },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

export function categoryLabel(category: string | undefined, locale: Locale): string | null {
  if (!category) return null;
  return CATEGORY_LABELS[category]?.[locale] ?? null;
}

/** "https://www.ainfissi.it/…" → "ainfissi.it"; null when there's no valid URL. */
export function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
