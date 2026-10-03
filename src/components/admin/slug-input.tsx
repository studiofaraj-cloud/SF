'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Pencil, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Title -> URL slug. Accents are transliterated, not dropped ("Perché la
 * velocità" -> "perche-la-velocita", not "perch-la-velocit"); apostrophes
 * separate words ("dell'idea" -> "dell-idea").
 */
export function slugify(text: string, { trim = true }: { trim?: boolean } = {}): string {
  const s = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-');
  if (!trim) return s.replace(/^-+/, '');
  return s.replace(/^-+|-+$/g, '').slice(0, 90).replace(/-+$/, '');
}

type SlugInputProps = {
  title: string;
  /** The saved slug when editing: it never changes on its own. */
  initialSlug?: string;
  onSlugChange: (slug: string) => void;
  /** Path shown before the slug in the preview, e.g. "/blog/". */
  basePath?: string;
};

/**
 * The address of a post or project. New content follows the title until
 * you edit the slug by hand; saved content keeps its slug unless you change
 * it, with a warning, because the old address stops working.
 */
export function SlugInput({ title, initialSlug = '', onSlugChange, basePath = '/blog/' }: SlugInputProps) {
  const isExisting = initialSlug !== '';
  const [slug, setSlug] = useState(initialSlug);
  const [editing, setEditing] = useState(false);
  // New content follows the title until the slug is edited by hand.
  const [follow, setFollow] = useState(!isExisting);
  const onChange = useRef(onSlugChange);
  onChange.current = onSlugChange;

  useEffect(() => {
    if (isExisting) {
      setSlug(initialSlug);
      onChange.current(initialSlug);
    }
  }, [initialSlug, isExisting]);

  useEffect(() => {
    if (!follow) return;
    const next = slugify(title);
    setSlug(next);
    onChange.current(next);
  }, [title, follow]);

  const changed = isExisting && slug !== initialSlug;

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">Indirizzo (slug)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="slug"
          name="slug"
          value={slug}
          readOnly={!editing}
          onChange={(e) => {
            // Light clean-up while typing (hyphens can still be typed); full on blur.
            const next = slugify(e.target.value, { trim: false });
            setSlug(next);
            onChange.current(next);
          }}
          onBlur={() => {
            const next = slugify(slug);
            setSlug(next);
            onChange.current(next);
          }}
          className="flex-grow font-mono text-sm"
          required
        />
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setFollow(false);
            }}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifica
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const next = isExisting ? initialSlug : slugify(title);
              setSlug(next);
              onChange.current(next);
              setEditing(false);
              setFollow(!isExisting);
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            title={isExisting ? 'Torna all’indirizzo salvato' : 'Torna all’indirizzo generato dal titolo'}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Ripristina
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        studiofaraj.it/it{basePath}
        <span className="font-medium text-foreground">{slug || '…'}</span>
      </p>
      {changed && (
        <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Cambiando l’indirizzo, i link già condivisi e quelli su Google al vecchio indirizzo smettono di funzionare.
        </p>
      )}
    </div>
  );
}
