'use client';

import { BlogForm } from '@/components/admin/blog-form';
import { createBlog } from '@/lib/actions';

export default function CreateBlogPage() {
  return <BlogForm action={createBlog} />;
}
