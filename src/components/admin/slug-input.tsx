'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

type SlugInputProps = {
  title: string;
  initialSlug?: string;
  onSlugChange: (slug: string) => void;
};

export function SlugInput({ title, initialSlug = '', onSlugChange }: SlugInputProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing && title) {
      const newSlug = generateSlug(title);
      setSlug(newSlug);
      onSlugChange(newSlug);
    }
  }, [title, isEditing, onSlugChange]);
  
  useEffect(() => {
    if (initialSlug) {
      setSlug(initialSlug);
    }
  }, [initialSlug]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = generateSlug(e.target.value);
    setSlug(newSlug);
    onSlugChange(newSlug);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">Slug</Label>
      <div className="flex items-center gap-2">
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={handleSlugChange}
          readOnly={!isEditing}
          className="flex-grow"
        />
        {!isEditing && (
          <button type="button" onClick={handleEditClick} className="text-sm text-primary hover:underline">
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        URL: yoursite.com/blog/{slug}
      </p>
    </div>
  );
}
