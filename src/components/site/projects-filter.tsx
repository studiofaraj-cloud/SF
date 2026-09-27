'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Type filter for the projects index. The rows are server-rendered children
 * (<li data-category>); filtering only toggles their `hidden` attribute, so
 * every project stays in the HTML for readers and crawlers.
 */
export function ProjectsFilter({
  listId,
  label,
  options,
  children,
}: {
  listId: string;
  label: string;
  options: { value: string; label: string }[];
  children: ReactNode;
}) {
  const [filter, setFilter] = useState('all');
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>(':scope > li[data-category]').forEach((li) => {
      li.hidden = filter !== 'all' && li.dataset.category !== filter;
    });
  }, [filter]);

  return (
    <>
      {options.length > 2 && (
        <div role="group" aria-label={label} className="flex flex-wrap gap-2 pb-8">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={filter === o.value}
              onClick={() => setFilter(o.value)}
              className={cn(
                'h-10 rounded-full px-4 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                filter === o.value
                  ? 'bg-foreground text-background ring-foreground'
                  : 'text-muted-foreground ring-border hover:text-foreground hover:ring-foreground/40',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <ol id={listId} ref={listRef} className="border-t border-border">
        {children}
      </ol>
    </>
  );
}
