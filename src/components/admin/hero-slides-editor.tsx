'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Save, GripVertical, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/image-upload';
import { saveHeroSlidesAction } from '@/lib/actions';
import type { HeroSlideData } from '@/lib/firestore-data';

interface HeroSlidesEditorProps {
  initialSlides: HeroSlideData[];
}

function generateId() {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function HeroSlidesEditor({ initialSlides }: HeroSlidesEditorProps) {
  const [slides, setSlides] = useState<HeroSlideData[]>(
    initialSlides.length > 0
      ? initialSlides
      : [
          {
            id: generateId(),
            title: 'Professionalità Garantita',
            description: 'Un team di esperti dedicati per risultati impeccabili e affidabili.',
            imageUrl: '/assets/hero-1.jpg',
            imageHint: 'professional workspace',
            order: 0,
          },
        ]
  );
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  // Track which slides have ongoing uploads
  const [uploadingSlideIds, setUploadingSlideIds] = useState<Set<string>>(new Set());
  const isAnyUploading = uploadingSlideIds.size > 0;

  // ── Field updaters ──────────────────────────────────────────────────────────

  const updateField = (id: string, field: keyof HeroSlideData, value: string | number) => {
    setSlides(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleUploadingChange = (id: string, isUploading: boolean) => {
    setUploadingSlideIds(prev => {
      const next = new Set(prev);
      if (isUploading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const addSlide = () => {
    setSlides(prev => [
      ...prev,
      {
        id: generateId(),
        title: '',
        description: '',
        imageUrl: '',
        imageHint: '',
        order: prev.length,
      },
    ]);
  };

  const removeSlide = (id: string) => {
    setSlides(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  // ── Drag-to-reorder ─────────────────────────────────────────────────────────

  const handleDragStart = (idx: number) => setDraggedIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setSlides(prev => {
      const next = [...prev];
      const [removed] = next.splice(draggedIdx, 1);
      next.splice(idx, 0, removed);
      return next.map((s, i) => ({ ...s, order: i }));
    });
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => setDraggedIdx(null);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      const ordered = slides.map((s, i) => ({ ...s, order: i }));
      const result = await saveHeroSlidesAction(ordered);
      setStatus({ type: result.success ? 'success' : 'error', message: result.message });
      // Auto-clear success after 4s
      if (result.success) {
        setTimeout(() => setStatus(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status bar */}
      {status && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      {/* Slide list */}
      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <Card
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${draggedIdx === idx ? 'opacity-40' : 'opacity-100'}`}
          >
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                  <CardTitle className="text-base">Slide {idx + 1}</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeSlide(slide.id)}
                  disabled={slides.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 grid md:grid-cols-2 gap-6">
              {/* Left: text fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${slide.id}`}>Title</Label>
                  <Input
                    id={`title-${slide.id}`}
                    value={slide.title}
                    onChange={e => updateField(slide.id, 'title', e.target.value)}
                    placeholder="e.g. Professionalità Garantita"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`desc-${slide.id}`}>Description</Label>
                  <Textarea
                    id={`desc-${slide.id}`}
                    value={slide.description}
                    onChange={e => updateField(slide.id, 'description', e.target.value)}
                    placeholder="Short description shown below the title"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`hint-${slide.id}`}>Image hint (for SEO / alt text)</Label>
                  <Input
                    id={`hint-${slide.id}`}
                    value={slide.imageHint}
                    onChange={e => updateField(slide.id, 'imageHint', e.target.value)}
                    placeholder="e.g. professional workspace"
                  />
                </div>
              </div>

              {/* Right: image upload */}
              <div>
                <ImageUpload
                  label="Background Image"
                  name={`hero-image-${slide.id}`}
                  initialValue={slide.imageUrl}
                  onUploadComplete={url => updateField(slide.id, 'imageUrl', url)}
                  onUploadingChange={isUploading => handleUploadingChange(slide.id, isUploading)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={addSlide}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>

        <Button type="button" onClick={handleSave} disabled={isPending || isAnyUploading}>
          {isPending || isAnyUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isAnyUploading ? 'Uploading Image...' : 'Saving…'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Slides
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
