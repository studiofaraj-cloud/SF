import { getBlogsAction } from '@/lib/actions';
import { estimateReadingTime } from '@/lib/tiptap-utils';
import type { Locale } from '@/i18n/config';
import type { Blog } from '@/lib/definitions';
import { HomeBlogContent, type HomeBlogPost } from './home-blog-content';

export async function HomeBlogSection({ locale }: { locale: Locale }) {
  try {
    const blogs = (await getBlogsAction()) as Blog[];
    // Reading time is computed here, then the full TipTap content is dropped:
    // the list only needs the summary fields.
    const posts: HomeBlogPost[] = (blogs || [])
      .filter((b) => b.published)
      .slice(0, 3)
      .map((b) => {
        let minutes = 1;
        try {
          minutes = estimateReadingTime(b.content);
        } catch {
          // keep the 1-minute fallback
        }
        return { id: b.id, slug: b.slug, title: b.title, excerpt: b.excerpt, createdAt: b.createdAt, minutes };
      });

    return <HomeBlogContent posts={posts} locale={locale} />;
  } catch (error) {
    // Firestore unavailable with nothing cached: leave the section out.
    console.warn('Failed to fetch blogs for the homepage:', error);
    return null;
  }
}
