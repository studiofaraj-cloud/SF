'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { BlogForm } from '@/components/admin/blog-form';
import type { Blog } from '@/lib/definitions';
import { getAdminBlogBySlugAction, updateBlog } from '@/lib/actions';

export default function EditBlogClient({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBlogBySlugAction(slug)
      .then((b) => setBlog(b ?? null))
      .catch((error) => console.error('Error fetching blog:', error))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">Caricamento…</div>;
  }
  if (!blog) notFound();

  return <BlogForm blog={blog} action={updateBlog.bind(null, blog.id)} />;
}
