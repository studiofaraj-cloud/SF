import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { categoryLabel } from '@/lib/project-display';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';

/** A real portfolio project a service page cites as an example. */
export type ServiceProof = Pick<Project, 'slug' | 'title' | 'clientName' | 'year' | 'category'>;

const COPY = {
  it: { example: 'Esempio reale', caseStudy: 'Caso studio' },
  en: { example: 'Real example', caseStudy: 'Case study' },
} as const;

/**
 * Navy panel: a numbered list (what the client gets, or what a scenario
 * includes) and, when there is one, a strip at the bottom naming a real
 * project of that kind and linking to its case study. Text only — the
 * service pages show no project screenshots.
 */
export function ServicePanel({
  label,
  items,
  example,
  locale,
}: {
  label: string;
  items: string[];
  example?: ServiceProof | null;
  locale: Locale;
}) {
  const copy = COPY[locale];
  return (
    <div className="overflow-clip rounded-3xl bg-navy text-white">
      <div className="p-8 md:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</p>
        <ol className="mt-6 divide-y divide-white/10">
          {items.map((item, i) => (
            <li key={item} className="flex items-baseline gap-5 py-3.5">
              <span className="w-6 shrink-0 font-mono text-xs text-sky-300">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-lg font-semibold tracking-[-0.01em] md:text-xl">{item}</span>
            </li>
          ))}
        </ol>
      </div>
      {example && (
        <Link
          href={getLocalizedPath(`/projects/${example.slug}`, locale)}
          className="group flex items-center justify-between gap-4 border-t border-white/10 bg-white/[0.06] px-8 py-5 transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300 md:px-10"
        >
          <span className="min-w-0">
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{copy.example}</span>
            <span className="mt-1 block font-semibold">
              {[example.clientName ?? example.title, categoryLabel(example.category, locale), example.year].filter(Boolean).join(' · ')}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-sky-300">
            {copy.caseStudy}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      )}
    </div>
  );
}
