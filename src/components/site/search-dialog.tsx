'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FileText, FolderKanban, ArrowRight, Loader2, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { getBlogsAction, getProjectsAction } from '@/lib/actions';
import type { Blog, Project } from '@/lib/definitions';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SearchResult = (
  | ({ type: 'blog' } & Blog)
  | ({ type: 'project' } & Project)
);

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [allContent, setAllContent] = useState<SearchResult[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();

  // Preload data when dialog opens
  useEffect(() => {
    if (open && !dataLoaded) {
      setLoading(true);
      Promise.all([getBlogsAction(), getProjectsAction()])
        .then(([blogs, projects]) => {
          const content: SearchResult[] = [
            ...(blogs || []).filter(b => b.published).map(blog => ({ ...blog, type: 'blog' as const })),
            ...(projects || []).filter(p => p.published).map(project => ({ ...project, type: 'project' as const })),
          ];
          setAllContent(content);
          setDataLoaded(true);
        })
        .catch(() => setAllContent([]))
        .finally(() => setLoading(false));
    }
    if (!open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [open, dataLoaded]);

  // Filter results as user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const filtered = allContent.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const contentMatch = 'content' in item && item.content?.toLowerCase().includes(q);
      const excerptMatch = 'excerpt' in item && (item as Blog).excerpt?.toLowerCase().includes(q);
      const descriptionMatch = 'description' in item && (item as Project).description?.toLowerCase().includes(q);
      return titleMatch || contentMatch || excerptMatch || descriptionMatch;
    });

    setResults(filtered.slice(0, 8));
    setActiveIndex(0);
  }, [query, allContent]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) {
        const path = `/${locale}/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`;
        router.push(path);
        onOpenChange(false);
      }
    }
  }, [results, activeIndex, locale, router, onOpenChange]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current) {
      const activeItem = resultsRef.current.children[0]?.children[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, onOpenChange]);

  const getExcerpt = (item: SearchResult): string => {
    if (item.type === 'blog') return (item as Blog).excerpt || '';
    return (item as Project).description || '';
  };

  const highlightMatch = (text: string, q: string): React.ReactNode => {
    if (!q.trim() || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <span className="bg-primary/20 text-primary font-medium rounded px-0.5">{match}</span>
        {after}
      </>
    );
  };

  const isIt = locale === 'it';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!fixed p-0 border-0 gap-0 overflow-hidden",
          // Mobile: near top, full width
          "!top-[10%] !translate-y-0 w-[95vw] max-w-[95vw] rounded-2xl",
          // Desktop: higher center
          "sm:!top-[20%] sm:w-full sm:max-w-[580px] sm:rounded-2xl",
          "bg-card/98 backdrop-blur-2xl border border-primary/15",
          "shadow-2xl shadow-black/20",
          "[&>button.absolute]:hidden"
        )}
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>{isIt ? 'Cerca nel sito' : 'Search website'}</DialogTitle>
        </VisuallyHidden>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 sm:px-5 border-b border-border/50">
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          <Input
            ref={inputRef}
            type="search"
            placeholder={isIt ? 'Cerca blog, progetti...' : 'Search blogs, projects...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-14 sm:h-16 border-0 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded-md border border-border/50 flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto overscroll-contain" ref={resultsRef}>
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((item, index) => {
                  const path = `/${locale}/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`;
                  const excerpt = getExcerpt(item);

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={path}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-start gap-3 px-4 sm:px-5 py-3 transition-colors duration-150 cursor-pointer group",
                        index === activeIndex
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        index === activeIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.type === 'blog'
                          ? <FileText className="w-4 h-4" />
                          : <FolderKanban className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm sm:text-base truncate">
                            {highlightMatch(item.title, query)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                            {item.type === 'blog' ? 'Blog' : (isIt ? 'Progetto' : 'Project')}
                          </span>
                        </div>
                        {excerpt && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {highlightMatch(excerpt.slice(0, 120), query)}
                          </p>
                        )}
                      </div>
                      <ArrowRight className={cn(
                        "w-4 h-4 flex-shrink-0 mt-1 transition-all",
                        index === activeIndex
                          ? "text-primary opacity-100 translate-x-0"
                          : "text-muted-foreground opacity-0 -translate-x-1"
                      )} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground text-sm">
                  {isIt ? 'Nessun risultato trovato per' : 'No results found for'}{' '}
                  <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state hints */}
        {!query.trim() && !loading && (
          <div className="px-4 sm:px-5 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              {isIt
                ? 'Cerca tra blog e progetti. Usa ↑↓ per navigare, Invio per selezionare.'
                : 'Search blogs and projects. Use ↑↓ to navigate, Enter to select.'}
            </p>
          </div>
        )}

        {/* Keyboard hints footer */}
        {query.trim() && results.length > 0 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 text-[10px]">↑↓</kbd>
                {isIt ? 'naviga' : 'navigate'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 text-[10px]">↵</kbd>
                {isIt ? 'apri' : 'open'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border/50 text-[10px]">esc</kbd>
                {isIt ? 'chiudi' : 'close'}
              </span>
            </div>
            <span>{results.length} {isIt ? 'risultati' : 'results'}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
