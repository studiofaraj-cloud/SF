'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, Sparkles, Tag, Clock, LifeBuoy, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FaqCategoryKey = 'services' | 'pricing' | 'process' | 'support';

export interface FaqItem {
  id: string;
  category: FaqCategoryKey;
  question: string;
  answer: string;
}

export interface FaqLabels {
  searchPlaceholder: string;
  categoryAll: string;
  categories: Record<FaqCategoryKey, string>;
  noResults: string;
  noResultsDesc: string;
}

const CATEGORY_ICON: Record<FaqCategoryKey, React.ComponentType<{ className?: string }>> = {
  services: Sparkles,
  pricing: Tag,
  process: Clock,
  support: LifeBuoy,
};

// Tailwind accent classes per category — pre-listed so JIT picks them up
const CATEGORY_ACCENT: Record<FaqCategoryKey, { ring: string; text: string; bg: string }> = {
  services: { ring: 'ring-violet-400/30', text: 'text-violet-400', bg: 'bg-violet-400/10' },
  pricing:  { ring: 'ring-emerald-400/30', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  process:  { ring: 'ring-sky-400/30',     text: 'text-sky-400',     bg: 'bg-sky-400/10' },
  support:  { ring: 'ring-amber-400/30',   text: 'text-amber-400',   bg: 'bg-amber-400/10' },
};

export function FaqAccordion({ faqs, labels }: { faqs: FaqItem[]; labels: FaqLabels }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategoryKey | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  // Distinct categories actually present in the data (preserves order)
  const presentCategories = useMemo(() => {
    const seen = new Set<FaqCategoryKey>();
    const ordered: FaqCategoryKey[] = [];
    for (const f of faqs) {
      if (!seen.has(f.category)) {
        seen.add(f.category);
        ordered.push(f.category);
      }
    }
    return ordered;
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (activeCategory !== 'all' && f.category !== activeCategory) return false;
      if (!q) return true;
      return (
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      );
    });
  }, [faqs, query, activeCategory]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className={cn(
            'w-full pl-11 pr-11 py-3.5 rounded-2xl bg-card border border-border/60',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
            'transition-all duration-200 shadow-sm'
          )}
          aria-label={labels.searchPlaceholder}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
        <CategoryPill
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          label={labels.categoryAll}
        />
        {presentCategories.map((cat) => {
          const Icon = CATEGORY_ICON[cat];
          const accent = CATEGORY_ACCENT[cat];
          return (
            <CategoryPill
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              label={labels.categories[cat]}
              icon={<Icon className={cn('w-3.5 h-3.5', activeCategory === cat ? '' : accent.text)} />}
            />
          );
        })}
      </div>

      {/* Accordion / empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 px-6 py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">{labels.noResults}</p>
          <p className="text-sm text-muted-foreground">{labels.noResultsDesc}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item, idx) => {
            const isOpen = openId === item.id;
            const Icon = CATEGORY_ICON[item.category];
            const accent = CATEGORY_ACCENT[item.category];
            return (
              <li key={item.id}>
                <div
                  className={cn(
                    'rounded-2xl border bg-card transition-all duration-200',
                    isOpen
                      ? 'border-primary/40 shadow-lg shadow-primary/5'
                      : 'border-border/60 hover:border-primary/25 hover:shadow-sm'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-4 px-4 md:px-5 py-4 md:py-5 text-left"
                  >
                    {/* Number */}
                    <span className="hidden sm:flex shrink-0 w-9 h-9 rounded-xl bg-secondary/60 items-center justify-center text-xs font-bold text-muted-foreground">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Category icon */}
                    <span
                      className={cn(
                        'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ring-1',
                        accent.bg,
                        accent.ring,
                      )}
                    >
                      <Icon className={cn('w-4 h-4', accent.text)} />
                    </span>

                    {/* Question */}
                    <span className="flex-1 text-sm md:text-base font-semibold text-foreground leading-snug">
                      {item.question}
                    </span>

                    {/* Chevron */}
                    <ChevronDown
                      className={cn(
                        'shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-300',
                        isOpen && 'rotate-180 text-primary'
                      )}
                    />
                  </button>

                  {/* Answer */}
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-300 ease-in-out',
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 md:px-5 pb-5 pt-0 sm:pl-[5.5rem] text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Category pill ────────────────────────────────────────────────────────────

function CategoryPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
        active
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
          : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30'
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}
