import Image from 'next/image';
import Link from 'next/link';
import { getLocalizedPath } from '@/lib/i18n-helpers';
import { formatPostDate, type BlogListItem } from '@/lib/blog-list';
import type { Locale } from '@/i18n/config';
import { BrandMark } from './brand-mark';

/**
 * A post in a grid (the blog index, "keep reading"): cover, date and reading
 * time, title, two lines of excerpt. The whole card is the link. Server
 * component.
 */
export function BlogCard({
  post,
  locale,
  heading: Heading = 'h2',
}: {
  post: BlogListItem;
  locale: Locale;
  heading?: 'h2' | 'h3';
}) {
  return (
    <article className="group relative">
      <div className="relative aspect-[16/10] overflow-clip rounded-2xl bg-navy ring-1 ring-border">
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <BrandMark id={`card-mark-${post.slug}`} className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/25" />
        )}
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <time dateTime={post.createdAt}>{formatPostDate(post.createdAt, locale)}</time>
        <span aria-hidden> · </span>
        {post.minutes} min
      </p>
      <Heading className="mt-3 font-display text-xl font-bold leading-snug tracking-[-0.015em] transition-colors group-hover:text-primary">
        <Link
          href={getLocalizedPath(`/blog/${post.slug}`, locale)}
          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          {post.title}
        </Link>
      </Heading>
      {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
    </article>
  );
}
