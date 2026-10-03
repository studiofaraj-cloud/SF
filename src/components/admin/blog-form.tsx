'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ChevronLeft, ExternalLink, History, Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DynamicSEOTool } from '@/components/admin/dynamic-seo-tool';
import { ImageUpload, MultiImageUpload } from '@/components/admin/image-upload';
import { PageHeader } from '@/components/admin/page-header';
import { RichTextEditor, jsonContentToPlainText } from '@/components/admin/rich-text-editor';
import { SlugInput } from '@/components/admin/slug-input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Blog } from '@/lib/definitions';

const EMPTY_CONTENT = '{"type":"doc","content":[{"type":"paragraph"}]}';

type FormResult = { message: string; errors?: Record<string, string[] | undefined> };
type Draft = { title: string; excerpt: string; content: string; savedAt: number };

function SubmitButton({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending || busy}>
      {pending || busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {busy ? 'Caricamento immagini…' : pending ? 'Salvataggio…' : 'Salva articolo'}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="text-sm text-destructive">{errors[0]}</p> : null;
}

/**
 * The blog post form, shared by "new" and "edit". Besides the fields it keeps
 * a draft of title, summary and text in this browser while you write (so a
 * closed tab or a failed save loses nothing), warns before leaving with
 * unsaved changes, and shows how long the summary is (it is the description
 * Google shows).
 */
export function BlogForm({
  blog,
  action,
}: {
  /** The post being edited; none when creating one. */
  blog?: Blog;
  action: (prev: FormResult, formData: FormData) => Promise<FormResult>;
}) {
  const { toast } = useToast();
  const draftKey = `sf-blog-draft:${blog?.id ?? 'new'}`;
  const initial = { title: blog?.title ?? '', excerpt: blog?.excerpt ?? '', content: blog?.content || EMPTY_CONTENT };

  const [title, setTitle] = useState(initial.title);
  // The slug lives in SlugInput's own field (name="slug"); nothing else reads it here.
  const [, setSlug] = useState(blog?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const dirty = useRef(false);
  const submitting = useRef(false);

  const [state, dispatch] = useActionState(action, { message: '', errors: {} });
  const errors = state.errors ?? {};

  // A draft from an earlier session that differs from the saved post.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw) as Draft;
      const differs = d.title !== initial.title || d.excerpt !== initial.excerpt || d.content !== initial.content;
      const newer = !blog?.updatedAt || d.savedAt > new Date(blog.updatedAt).getTime();
      if (differs && newer) setDraft(d);
      else localStorage.removeItem(draftKey);
    } catch {
      /* storage unavailable: no drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Save a draft a moment after each change.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ title, excerpt, content, savedAt: Date.now() } satisfies Draft));
      } catch {
        /* storage full or blocked */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [title, excerpt, content, draftKey]);

  // Leaving with unsaved changes: the browser asks first.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current && !submitting.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // A failed save: say what's wrong (the draft stays in this browser).
  useEffect(() => {
    if (!state.message) return;
    submitting.current = false;
    toast({ title: 'Articolo non salvato', description: state.message, variant: 'destructive' });
  }, [state, toast]);

  const touch = () => {
    dirty.current = true;
  };

  const restoreDraft = () => {
    if (!draft) return;
    dirty.current = true;
    setTitle(draft.title);
    setExcerpt(draft.excerpt);
    setContent(draft.content);
    setDraft(null);
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
    setDraft(null);
  };

  const excerptLength = excerpt.trim().length;
  const isEdit = !!blog;

  return (
    <form
      action={dispatch}
      onSubmit={() => {
        // The save action redirects on success: the draft is no longer needed.
        submitting.current = true;
        try {
          localStorage.removeItem(draftKey);
        } catch {
          /* ignore */
        }
      }}
      className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
    >
      {isEdit && <input type="hidden" name="previousSlug" value={blog.slug} />}
      <PageHeader title={isEdit ? 'Modifica articolo' : 'Nuovo articolo'}>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blogs">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Articoli
            </Link>
          </Button>
          {isEdit && blog.published && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/it/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Vedi articolo
              </a>
            </Button>
          )}
          <SubmitButton busy={uploadingFeatured || uploadingGallery} />
        </div>
      </PageHeader>

      {draft && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <History className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
          <span className="flex-1">
            C’è una bozza non salvata di questo articolo, del{' '}
            {new Date(draft.savedAt).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.
          </span>
          <Button type="button" size="sm" onClick={restoreDraft}>
            Ripristina
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={discardDraft}>
            Scarta
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid min-w-0 auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Articolo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Il titolo dell’articolo"
                  value={title}
                  onChange={(e) => {
                    touch();
                    setTitle(e.target.value);
                  }}
                  required
                  className="text-base"
                />
                <FieldError errors={errors.title} />
              </div>

              <div className="space-y-2">
                <SlugInput title={title} initialSlug={blog?.slug} onSlugChange={setSlug} basePath="/blog/" />
                <FieldError errors={errors.slug} />
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="excerpt">Riassunto</Label>
                  <span className={cn('text-xs tabular-nums', excerptLength > 170 ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}>
                    {excerptLength} caratteri · ideale 120–160
                  </span>
                </div>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Due righe su cosa trova il lettore: compaiono nell’elenco del blog e su Google."
                  value={excerpt}
                  onChange={(e) => {
                    touch();
                    setExcerpt(e.target.value);
                  }}
                  rows={3}
                  required
                />
                <FieldError errors={errors.excerpt} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autore</Label>
                <Input id="author" name="author" placeholder="Studio Faraj" defaultValue={blog?.author || 'Studio Faraj'} />
              </div>

              <div className="space-y-2">
                <Label>Testo</Label>
                <RichTextEditor
                  article
                  value={content}
                  onChange={(v) => {
                    touch();
                    setContent(v);
                  }}
                  name="content"
                />
                <FieldError errors={errors.content} />
              </div>
            </CardContent>
          </Card>
          <DynamicSEOTool contentTitle={title} contentBody={jsonContentToPlainText(content)} contentType="blog" />
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="published" name="published" defaultChecked={blog?.published ?? false} />
                <Label htmlFor="published">Pubblicato</Label>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Spento: l’articolo resta una bozza, visibile solo qui.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Immagini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                key={`featured-${blog?.id ?? 'new'}`}
                label="Immagine in evidenza"
                name="featuredImage"
                initialValue={blog?.featuredImage || ''}
                onUploadingChange={setUploadingFeatured}
              />
              <FieldError errors={errors.featuredImage} />
              <MultiImageUpload
                key={`gallery-${blog?.id ?? 'new'}`}
                label="Galleria"
                name="gallery"
                initialValues={blog?.gallery || []}
                onUploadingChange={setUploadingGallery}
              />
              <FieldError errors={errors.gallery} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
