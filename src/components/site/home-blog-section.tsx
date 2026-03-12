import { getBlogsAction } from '@/lib/actions';
import { HomeBlogContent } from './home-blog-content';

export async function HomeBlogSection() {
  try {
    const blogs = await getBlogsAction();
    const latestBlogs = (blogs || []).filter(b => b.published).slice(0, 3);
    
    return <HomeBlogContent blogs={latestBlogs} />;
  } catch (error) {
    // Gracefully handle Firestore connection errors
    // Return empty array if Firestore is unavailable (offline mode)
    console.warn('Failed to fetch blogs, using empty array:', error);
    return <HomeBlogContent blogs={[]} />;
  }
}
