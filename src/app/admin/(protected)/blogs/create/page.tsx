
'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ChevronLeft, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/admin/page-header';
import { SlugInput } from '@/components/admin/slug-input';
import { ImageUpload, MultiImageUpload } from '@/components/admin/image-upload';
import { DynamicSEOTool } from '@/components/admin/dynamic-seo-tool';
import { RichTextEditor, jsonContentToPlainText } from '@/components/admin/rich-text-editor';
import { createBlog } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <PlusCircle className="h-4 w-4 mr-2 animate-spin" />
          Salvataggio...
        </>
      ) : (
        <>
          <PlusCircle className="h-4 w-4 mr-2" />
          Salva Articolo
        </>
      )}
    </Button>
  );
}

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}');
  const { toast } = useToast();

  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(createBlog, initialState);

  if (state?.message) {
    const hasErrors = Object.keys(state.errors || {}).length > 0;
    toast({
      title: hasErrors ? 'Errore' : 'Errore',
      description: state.message
    });
  }

  return (
    <form action={dispatch} className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <PageHeader title="Crea Nuovo Articolo">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blogs">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna agli Articoli
            </Link>
          </Button>
          <SubmitButton />
        </div>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Articolo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SlugInput title={title} onSlugChange={setSlug} />
              
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Il tuo fantastico titolo del blog"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                 {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Riassunto</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Un breve riassunto del tuo post"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  required
                />
                 {state.errors?.excerpt && <p className="text-sm text-destructive">{state.errors.excerpt[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenuto</Label>
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Inizia a scrivere qui il tuo contenuto..."
                    name="content"
                />
                 {state.errors?.content && <p className="text-sm text-destructive">{state.errors.content[0]}</p>}
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
                <Switch id="published" name="published" />
                <Label htmlFor="published">Pubblicato</Label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Immagini Articolo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload label="Immagine in Evidenza" name="featuredImage" />
              {state.errors?.featuredImage && <p className="text-sm text-destructive">{state.errors.featuredImage[0]}</p>}
              <MultiImageUpload label="Immagini Galleria" name="gallery" />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
