
'use client';

import { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { notFound } from 'next/navigation';

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
import type { Blog } from '@/lib/definitions';
import { updateBlog, getAdminBlogBySlugAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Save className="h-4 w-4 mr-2 animate-spin" />
          Salvataggio...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Salva Modifiche
        </>
      )}
    </Button>
  );
}

export default function EditBlogClient({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [slugState, setSlug] = useState('');
  const [content, setContent] = useState('{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}');
  const { toast } = useToast();
  
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(
    async (prevState: any, formData: FormData) => {
      if (!blog?.id) {
        return { ...prevState, message: 'Blog not loaded yet', errors: {} };
      }
      return updateBlog(blog.id, prevState, formData);
    },
    initialState
  );

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const fetchedBlog = await getAdminBlogBySlugAction(slug);
        if (fetchedBlog) {
          setBlog(fetchedBlog);
          setTitle(fetchedBlog.title);
          setSlug(fetchedBlog.slug);
          setContent(fetchedBlog.content || '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (state?.message) {
      const hasErrors = Object.keys(state.errors || {}).length > 0;
      toast({
        title: hasErrors ? 'Errore' : 'Errore',
        description: state.message
      });
    }
  }, [state, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!blog) {
    notFound();
  }

  return (
    <form action={dispatch} className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <PageHeader title="Modifica Articolo">
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
              <SlugInput title={title} initialSlug={blog.slug} onSlugChange={setSlug} />
              
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  name="title"
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
                  defaultValue={blog.excerpt}
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
                <Switch id="published" name="published" defaultChecked={blog.published} />
                <Label htmlFor="published">Pubblicato</Label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Immagini Articolo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload key={`featured-${blog.id}`} label="Immagine in Evidenza" name="featuredImage" initialValue={blog.featuredImage || ''} />
              {state.errors?.featuredImage && <p className="text-sm text-destructive mt-2">{state.errors.featuredImage[0]}</p>}
              <MultiImageUpload key={`gallery-${blog.id}`} label="Immagini Galleria" name="gallery" initialValues={blog.gallery || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
