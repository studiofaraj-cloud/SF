import { getBlogsAction } from '@/lib/actions';
import { HomeBlogContent } from './home-blog-content';

export async function HomeBlogSection() {
  try {
    const blogs = await getBlogsAction();
    // Strip the full TipTap `content` field — the homepage only needs
    // title, slug, excerpt, featuredImage, createdAt. Including the full
    // content body embeds ~20 KB of JSON per post in the RSC flight data.
    const latestBlogs = (blogs || [])
      .filter(b => b.published)
      .slice(0, 3)
      .map(({ content: _content, gallery: _gallery, ...rest }) => rest);

    return <HomeBlogContent blogs={latestBlogs as any} />;
  } catch (error) {
    // Gracefully handle Firestore connection errors
    // Return empty array if Firestore is unavailable (offline mode)
    console.warn('Failed to fetch blogs, using empty array:', error);
    return <HomeBlogContent blogs={[]} />;
  }
}
