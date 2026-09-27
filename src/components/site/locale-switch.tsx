'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPath, getLocalizedPath, removeLocaleFromPath } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

// Published in Italian only: the English link for these goes to the closest English page.
const IT_ONLY: [prefix: string, fallback: string][] = [
  ['/servizi/software-gestionale', '/servizi'],
  ['/siti-web', '/servizi'],
  ['/dall-idea-al-progetto', '/'],
  ['/quanto-costa-un-sito-web', '/'],
];

function englishPath(path: string) {
  const hit = IT_ONLY.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return hit ? hit[1] : path;
}

/**
 * IT / EN as two plain links to the same page in the other language (full
 * page loads, so the server sends that language's messages). Languages are
 * named, not flagged: a flag stands for a country.
 */
export function LocaleSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = getLocaleFromPath(pathname);
  const path = removeLocaleFromPath(pathname);
  const targets: Record<Locale, string> = {
    it: getLocalizedPath(path, 'it'),
    en: getLocalizedPath(englishPath(path), 'en'),
  };

  return (
    <span className={cn('inline-flex h-10 items-center gap-1 px-1.5 font-mono text-xs tracking-[0.08em]', className)}>
      {(['it', 'en'] as const).map((loc, i) => (
        <span key={loc} className="inline-flex items-center gap-1">
          {i > 0 && <span aria-hidden className="opacity-40">/</span>}
          {loc === current ? (
            <span aria-current="true" className="font-bold">{loc.toUpperCase()}</span>
          ) : (
            <a
              href={targets[loc]}
              hrefLang={loc}
              lang={loc}
              aria-label={loc === 'it' ? 'Italiano' : 'English'}
              className="rounded px-0.5 opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {loc.toUpperCase()}
            </a>
          )}
        </span>
      ))}
    </span>
  );
}
