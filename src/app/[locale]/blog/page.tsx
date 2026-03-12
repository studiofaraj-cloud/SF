import { getBlogsAction } from '@/lib/actions';
import { BlogListClient } from '@/components/site/blog-list-client';

export default async function BlogPage() {
  try {
    const blogs = await getBlogsAction();
    return <BlogListClient blogs={blogs || []} />;
  } catch (error) {
    // Gracefully handle Firestore connection errors during build
    // Return empty array if Firestore is unavailable (offline mode or build time)
    console.warn('Failed to fetch blogs, using empty array:', error);
    return <BlogListClient blogs={[]} />;
  }
}
