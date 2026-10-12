'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { brandedTitle, fitDescription, siteConfig } from '@/lib/seo';
import { cn } from '@/lib/utils';

/**
 * The title and description Google shows for a post or project, when they
 * should differ from the page's own title and summary (a long article title
 * stays the H1; the search result gets a short one). Empty = use the page's.
 * The preview applies the same rules as the page metadata (src/lib/seo.ts).
 */
export function SeoFields({
  path,
  fallbackTitle,
  fallbackDescription,
  defaultTitle = '',
  defaultDescription = '',
}: {
  /** Public path, e.g. /it/blog/my-post. */
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  defaultTitle?: string;
  defaultDescription?: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const shownTitle = brandedTitle(title.trim() || fallbackTitle || 'Titolo della pagina');
  const shownDescription = fitDescription(description.trim() || fallbackDescription || 'Descrizione della pagina');
  const titleLength = (title.trim() || fallbackTitle).length;
  const descriptionLength = (description.trim() || fallbackDescription).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Su Google</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="seoTitle">Titolo SEO</Label>
            <span className={cn('text-xs tabular-nums', titleLength > 60 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}>
              {titleLength} · max 60
            </span>
          </div>
          <Input
            id="seoTitle"
            name="seoTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={fallbackTitle || 'Vuoto: si usa il titolo'}
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground">Vuoto: si usa il titolo. Con le parole che la gente cerca, entro 60 caratteri.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="seoDescription">Descrizione SEO</Label>
            <span
              className={cn(
                'text-xs tabular-nums',
                descriptionLength > 160 || descriptionLength < 120 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground',
              )}
            >
              {descriptionLength} · ideale 140–160
            </span>
          </div>
          <Textarea
            id="seoDescription"
            name="seoDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={fallbackDescription || 'Vuoto: si usa il riassunto'}
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">Vuoto: si usa il riassunto. Un vantaggio concreto e un invito all’azione.</p>
        </div>

        <div aria-label="Anteprima del risultato su Google" className="rounded-lg border border-border bg-background p-4">
          <p className="truncate text-xs text-muted-foreground">{`${siteConfig.url.replace('https://', '')}${path}`}</p>
          <p className="mt-1 line-clamp-1 text-[17px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{shownTitle}</p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">{shownDescription}</p>
        </div>
      </CardContent>
    </Card>
  );
}
