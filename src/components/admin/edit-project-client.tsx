
'use client';

import { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ChevronLeft, Save, Plus, X, Code, Award, TrendingUp } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/admin/page-header';
import { SlugInput } from '@/components/admin/slug-input';
import { ImageUpload, MultiImageUpload } from '@/components/admin/image-upload';
import { RichTextEditor, jsonContentToPlainText } from '@/components/admin/rich-text-editor';
import { DynamicSEOTool } from '@/components/admin/dynamic-seo-tool';
import type { Project } from '@/lib/definitions';
import { updateProject, getProjectBySlugAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const TECHNOLOGY_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'TypeScript', 'JavaScript', 'Node.js', 'Python', 'PHP', 'Java', '.NET',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Firebase',
  'AWS', 'Vercel', 'Netlify', 'Azure', 'GCP',
  'Tailwind CSS', 'Docker', 'GraphQL', 'REST API'
];

const CATEGORY_OPTIONS = [
  'E-commerce',
  'Portfolio',
  'Corporate',
  'SaaS',
  'Mobile App',
  'Landing Page',
  'Blog/Content',
  'Dashboard/Admin',
  'Other'
];

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

export default function EditProjectClient({ slug }: { slug: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [slugState, setSlug] = useState('');
  const [content, setContent] = useState('{"type":"doc","content":[{"type":"paragraph"}]}');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [metrics, setMetrics] = useState<Array<{label: string, value: string}>>([{label: '', value: ''}]);
  const [clientName, setClientName] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const { toast } = useToast();
  
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(
    async (prevState: any, formData: FormData) => {
      if (!project?.id) {
        return { ...prevState, message: 'Project not loaded yet', errors: {} };
      }
      return updateProject(project.id, prevState, formData);
    },
    initialState
  );

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const fetchedProject = await getProjectBySlugAction(slug);
        if (fetchedProject) {
          setProject(fetchedProject);
          setTitle(fetchedProject.title);
          setSlug(fetchedProject.slug);
          setContent(fetchedProject.content || '{"type":"doc","content":[{"type":"paragraph"}]}');
          setTechnologies(fetchedProject.technologies || []);
          setHighlights(fetchedProject.highlights && fetchedProject.highlights.length > 0 ? fetchedProject.highlights : ['']);
          setMetrics(fetchedProject.metrics && fetchedProject.metrics.length > 0 ? fetchedProject.metrics : [{label: '', value: ''}]);
          setClientName(fetchedProject.clientName || '');
          setYear(fetchedProject.year || '');
          setCategory(fetchedProject.category || '');
          setProjectUrl(fetchedProject.projectUrl || '');
          setGithubUrl(fetchedProject.githubUrl || '');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  const addTechnology = (tech: string) => {
    if (!technologies.includes(tech)) {
      setTechnologies([...technologies, tech]);
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const addMetric = () => {
    setMetrics([...metrics, {label: '', value: ''}]);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: 'label' | 'value', value: string) => {
    const newMetrics = [...metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setMetrics(newMetrics);
  };

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

  if (!project) {
    notFound();
  }

  return (
    <form action={dispatch} className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <PageHeader title="Modifica Progetto">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/projects">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna ai Progetti
            </Link>
          </Button>
          <SubmitButton />
        </div>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Progetto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SlugInput title={title} initialSlug={project.slug} onSlugChange={setSlug} />
              
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
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={project.description}
                  required
                />
                {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenuto</Label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Inizia a descrivere il tuo progetto qui..."
                  name="content"
                />
                {state.errors?.content && <p className="text-sm text-destructive">{state.errors.content[0]}</p>}
              </div>
            </CardContent>
          </Card>
          <DynamicSEOTool contentTitle={title} contentBody={jsonContentToPlainText(content)} contentType="project" />
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="published" name="published" defaultChecked={project.published} />
                <Label htmlFor="published">Pubblicato</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informazioni Progetto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome Cliente (Opzionale)</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Es: Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Anno Progetto</Label>
                <Input
                  id="year"
                  name="year"
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Es: 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectUrl">URL Progetto Live</Label>
                <Input
                  id="projectUrl"
                  name="projectUrl"
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">URL GitHub (Opzionale)</Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Stack Tecnologico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aggiungi Tecnologie</Label>
                <Select onValueChange={addTechnology}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tecnologia" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNOLOGY_OPTIONS.filter(t => !technologies.includes(t)).map(tech => (
                      <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {technologies.map(tech => (
                    <div key={tech} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <input type="hidden" name="technologies[]" value={tech} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Punti di Forza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Punto di forza ${index + 1}`}
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    name={`highlights[]`}
                  />
                  {highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHighlight}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Punto di Forza
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Metriche Chiave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Etichetta (es: Traffic Increase)"
                    value={metric.label}
                    onChange={(e) => updateMetric(index, 'label', e.target.value)}
                    name={`metrics[][label]`}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Valore (es: 300%)"
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      name={`metrics[][value]`}
                    />
                    {metrics.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMetric(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetric}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Metrica
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Immagini Progetto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload key={`featured-${project.id}`} label="Immagine Principale" name="featuredImage" initialValue={project.featuredImage || ''} />
              {state.errors?.featuredImage && <p className="text-sm text-destructive">{state.errors.featuredImage[0]}</p>}
              <MultiImageUpload key={`gallery-${project.id}`} label="Immagini Galleria" name="gallery" initialValues={project.gallery || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
