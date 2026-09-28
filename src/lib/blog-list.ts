import 'server-only';
import { getBlogsAction } from '@/lib/actions';
import { estimateReadingTime } from '@/lib/tiptap-utils';
import type { Locale } from '@/i18n/config';
import type { Blog } from '@/lib/definitions';

/** What a list of posts shows: the summary fields, never the article body. */
export type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  createdAt: string;
  minutes: number;
};

export function readingMinutes(content: Blog['content']): number {
  try {
    return estimateReadingTime(content);
  } catch {
    return 1;
  }
}

export function toListItem(b: Blog): BlogListItem {
  return {
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt ?? '',
    image: b.featuredImage ?? '',
    createdAt: b.createdAt,
    minutes: readingMinutes(b.content),
  };
}

/** Published posts, newest first. Throws when the posts can't be read. */
export async function getPublishedPosts(): Promise<BlogListItem[]> {
  const blogs = (await getBlogsAction()) as Blog[];
  return blogs
    .filter((b) => b.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toListItem);
}

export function formatPostDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(d);
}
