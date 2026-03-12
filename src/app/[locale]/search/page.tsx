'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getBlogsAction, getProjectsAction } from '@/lib/actions';
import type { Blog, Project } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, FolderKanban } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type SearchResult = (
  | ({ type: 'blog' } & Blog)
  | ({ type: 'project' } & Project)
);

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const locale = useLocale();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [blogs, projects] = await Promise.all([
            getBlogsAction(),
            getProjectsAction()
        ]);
        
        const allContent: SearchResult[] = [
            ...(blogs || []).map(blog => ({ ...blog, type: 'blog' as const })),
            ...(projects || []).map(project => ({ ...project, type: 'project' as const })),
        ];

        const filteredResults = allContent.filter(item => {
            if (!item.published) return false;
            const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
            const contentMatch = 'content' in item && item.content && item.content.toLowerCase().includes(query.toLowerCase());
            const excerptMatch = 'excerpt' in item && item.excerpt && item.excerpt.toLowerCase().includes(query.toLowerCase());
            const descriptionMatch = 'description' in item && item.description && item.description.toLowerCase().includes(query.toLowerCase());

            return titleMatch || contentMatch || excerptMatch || descriptionMatch;
        });

        setResults(filteredResults);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query]);

  return (
    <div className="container mx-auto py-16 sm:py-24 px-4">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-8">
        {query ? (
          <>
            {loading ? 'Searching...' : `Found ${results.length} results for: `}
            <span className="font-semibold text-foreground">{query}</span>
          </>
        ) : (
          'Please enter a search term to find content.'
        )}
      </p>

      {loading ? (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          {results.map(item => (
            <Link key={`${item.type}-${item.id}`} href={`/${locale}/${item.type === 'blog' ? 'blog' : 'projects'}/${item.slug}`} className="block">
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {item.type === 'blog' ? 
                      <FileText className="h-5 w-5 text-primary" /> : 
                      <FolderKanban className="h-5 w-5 text-primary" />}
                    <span>{item.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {'excerpt' in item ? item.excerpt : item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        query && <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No results found.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-16 sm:py-24 px-4">
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2 mb-8" />
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
