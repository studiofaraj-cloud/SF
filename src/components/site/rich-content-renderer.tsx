import React from 'react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { cn } from '@/lib/utils';
import { cleanBlogDoc, type JSONNode } from '@/lib/blog-content';
import { headingIds, leadingTitleHeading, type TiptapDocument, type TiptapNode } from '@/lib/tiptap-outline';

type RichContentRendererProps = {
  content: string | TiptapDocument;
  className?: string;
  /**
   * 'article' is the blog's reading style: body text in the foreground
   * colour, display-font headings without the accent bars, plain images and
   * code. 'default' keeps the look the project case studies use.
   */
  variant?: 'default' | 'article';
  /** Leave out an opening heading that repeats this title (the page shows it as the h1). */
  title?: string;
};

type Ctx = {
  article: boolean;
  ids: Map<TiptapNode, string>;
  skip: TiptapNode | null;
  inList?: boolean;
};

const ARTICLE = {
  p: 'mb-6 text-[1.0625rem] leading-[1.8] text-foreground/80',
  pInList: 'mb-1.5 last:mb-0',
  heading: {
    2: 'mb-5 mt-14 scroll-mt-28 font-display text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] text-foreground md:text-[2rem]',
    3: 'mb-4 mt-10 scroll-mt-28 font-display text-xl font-bold leading-snug tracking-[-0.01em] text-foreground md:text-[1.4rem]',
    4: 'mb-3 mt-8 scroll-mt-28 text-lg font-semibold text-foreground',
    5: 'mb-3 mt-6 scroll-mt-28 text-base font-semibold text-foreground',
    6: 'mb-2 mt-5 scroll-mt-28 text-base font-semibold text-foreground',
  } as Record<number, string>,
  ul: 'mb-6 ml-6 list-disc space-y-2 marker:text-primary',
  ol: 'mb-6 ml-6 list-decimal space-y-2 marker:font-semibold marker:text-primary',
  li: 'pl-1 text-[1.0625rem] leading-[1.75] text-foreground/80',
  code: 'rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground',
  link: 'font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary',
};

/** Links to the site open in the same tab; others in a new one. */
function linkProps(href: string): { href: string; target?: string; rel?: string } {
  const internal = /^(\/|#|mailto:|tel:)/i.test(href) || /^https?:\/\/(www\.)?studiofaraj\.it(\/|$|[?#])/i.test(href);
  return internal ? { href } : { href, target: '_blank', rel: 'noopener noreferrer' };
}

/**
 * Hosts the Next image optimiser accepts (images.remotePatterns in
 * next.config.ts). An image from anywhere else is shown as it is: optimising
 * it would throw and take the page down.
 */
function optimizable(src: string): boolean {
  if (src.startsWith('/')) return true;
  const host = src.match(/^https?:\/\/([^/?#]+)/i)?.[1]?.toLowerCase() ?? '';
  return (
    ['firebasestorage.googleapis.com', 'storage.googleapis.com', 'placehold.co', 'images.unsplash.com', 'picsum.photos'].includes(host) ||
    host.endsWith('.firebasestorage.app')
  );
}

const CALLOUT: Record<'info' | 'tip' | 'warning', { box: string; label: string; name: string }> = {
  info: { box: 'border-primary/25 bg-primary/[0.06]', label: 'text-primary', name: 'Nota' },
  tip: { box: 'border-emerald-500/30 bg-emerald-500/[0.07]', label: 'text-emerald-700 dark:text-emerald-300', name: 'Consiglio' },
  warning: { box: 'border-amber-500/35 bg-amber-500/[0.08]', label: 'text-amber-700 dark:text-amber-300', name: 'Attenzione' },
};

function isJSONContent(content: string | TiptapDocument): content is TiptapDocument {
  if (typeof content === 'object') return true;
  try {
    const parsed = JSON.parse(content);
    return parsed.type === 'doc' && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

/**
 * A paragraph carrying nothing visible — no children, or only hard breaks and
 * whitespace-only text. Pasting a Markdown file used to leave one of these per
 * blank line; rendering them as `&nbsp;` turned the article into a column of
 * gaps, so they are dropped instead.
 */
function isBlankParagraph(node: TiptapNode): boolean {
  if (!node.content || node.content.length === 0) return true;
  return node.content.every(
    (child) =>
      child.type === 'hardBreak' ||
      (child.type === 'text' && !child.text?.trim())
  );
}

function renderText(node: TiptapNode, ctx: Ctx): React.ReactNode {
  if (!node.text) return null;

  let content: React.ReactNode = node.text;

  if (node.marks && node.marks.length > 0) {
    node.marks.forEach((mark) => {
      switch (mark.type) {
        case 'bold':
          content = <strong className="font-bold text-foreground">{content}</strong>;
          break;
        case 'italic':
          content = <em className="italic">{content}</em>;
          break;
        case 'strike':
          content = <s className="line-through">{content}</s>;
          break;
        case 'underline':
          content = <u className="underline">{content}</u>;
          break;
        case 'code':
          content = (
            <code className={ctx.article ? ARTICLE.code : 'px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[0.9em] neon-border'}>
              {content}
            </code>
          );
          break;
        case 'link':
          content = (
            <a
              {...linkProps(String(mark.attrs?.href ?? ''))}
              className={ctx.article ? ARTICLE.link : 'text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 hover:decoration-primary/60 transition-colors font-medium'}
            >
              {content}
            </a>
          );
          break;
      }
    });
  }

  return content;
}

function renderNode(node: TiptapNode, index: number, insideParagraph: boolean, ctx: Ctx): React.ReactNode {
  const key = `node-${index}`;
  const pClass = ctx.article ? cn(ARTICLE.p, ctx.inList && ARTICLE.pInList) : 'mb-5 leading-[1.85] text-muted-foreground';

  switch (node.type) {
    case 'paragraph': {
      if (isBlankParagraph(node)) return null;

      const children = node.content ?? [];

      if (insideParagraph) {
        return (
          <div key={key} className={pClass}>
            {children.map((child, i) => renderNode(child, i, true, ctx))}
          </div>
        );
      }

      const hasNestedParagraph = children.some(child => child.type === 'paragraph');
      if (hasNestedParagraph) {
        return (
          <div key={key} className={pClass}>
            {children.map((child, i) => renderNode(child, i, true, ctx))}
          </div>
        );
      }

      const hasOnlyTextNodes = children.every(child => {
        return child.type === 'text' || child.type === 'hardBreak';
      });

      if (hasOnlyTextNodes) {
        return (
          <p key={key} className={pClass}>
            {children.map((child, i) => renderNode(child, i, true, ctx))}
          </p>
        );
      }

      return (
        <div key={key} className={pClass}>
          {children.map((child, i) => renderNode(child, i, true, ctx))}
        </div>
      );
    }

    case 'heading': {
      if (node === ctx.skip) return null;
      const level = node.attrs?.level || 1;
      const id = ctx.ids.get(node);
      // Pages that render this content already have their own <h1> (the post
      // or project title), so a level-1 heading in the content is output as
      // an <h2>, keeping its level-1 look: one h1 per page.
      const Tag = `h${Math.max(level, 2)}` as keyof React.JSX.IntrinsicElements;
      const headingClasses: Record<number, string> = {
        1: 'text-3xl md:text-4xl font-bold mb-6 mt-12 text-foreground tracking-tight',
        2: 'text-2xl md:text-3xl font-bold mb-5 mt-10 text-foreground tracking-tight',
        3: 'text-xl md:text-2xl font-semibold mb-4 mt-8 text-foreground',
        4: 'text-lg md:text-xl font-semibold mb-3 mt-6 text-foreground',
        5: 'text-base md:text-lg font-semibold mb-3 mt-5 text-foreground',
        6: 'text-base font-semibold mb-2 mt-4 text-foreground',
      };

      if (ctx.article) {
        return (
          <Tag key={key} id={id} className={ARTICLE.heading[Math.max(level, 2)]}>
            {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
          </Tag>
        );
      }

      // Add decorative accent under h2 and h3
      const showAccent = level === 2 || level === 3;

      return (
        <div key={key}>
          <Tag id={id} className={cn('scroll-mt-28', headingClasses[level as keyof typeof headingClasses])}>
            {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
          </Tag>
          {showAccent && (
            <div className="flex items-center gap-1 -mt-3 mb-5">
              <div className="h-0.5 w-8 bg-primary/50 rounded-full" />
              <div className="h-0.5 w-3 bg-primary/25 rounded-full" />
            </div>
          )}
        </div>
      );
    }

    case 'bulletList':
      return (
        <ul key={key} className={ctx.article ? ARTICLE.ul : 'list-disc mb-6 space-y-2 ml-6 marker:text-primary/60'}>
          {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={key} className={ctx.article ? ARTICLE.ol : 'list-decimal mb-6 space-y-2 ml-6 marker:text-primary/60 marker:font-semibold'}>
          {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={key} className={ctx.article ? ARTICLE.li : 'leading-[1.85] text-muted-foreground pl-1'}>
          {node.content?.map((child, i) => renderNode(child, i, false, ctx.article ? { ...ctx, inList: true } : ctx))}
        </li>
      );

    case 'codeBlock': {
      const language = node.attrs?.language;
      return (
        <pre key={key} className={ctx.article ? 'mb-6 overflow-x-auto rounded-2xl bg-navy p-6 text-white/90' : 'mb-6 p-6 rounded-xl overflow-x-auto holographic-card neon-border relative'}>
          <code className={cn('font-mono text-sm leading-relaxed', language && `language-${language}`)}>
            {node.content?.map((child) => child.text).join('')}
          </code>
        </pre>
      );
    }

    case 'blockquote':
      return (
        <blockquote key={key} className={ctx.article ? 'my-10 border-l-2 border-primary pl-6 text-lg text-foreground [&_p]:text-foreground' : 'border-l-4 border-primary/40 pl-6 py-4 my-8 text-muted-foreground bg-primary/5 rounded-r-xl holographic-card'}>
          {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
        </blockquote>
      );

    case 'horizontalRule':
      if (ctx.article) return <hr key={key} className="my-14 border-border" />;
      return (
        <div key={key} className="my-12 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      );

    case 'hardBreak':
      return <br key={key} />;

    case 'image': {
      const src = node.attrs?.src;
      const alt = node.attrs?.alt || '';
      const title = node.attrs?.title;
      const size = node.attrs?.size || 'full';
      const align = node.attrs?.align || 'center';

      if (!src) return null;

      const sizeClasses: Record<string, string> = {
        full: 'w-full',
        medium: 'w-full md:w-3/4',
        small: 'w-full md:w-1/2',
      };

      const alignClasses: Record<string, string> = {
        center: 'mx-auto',
        left: 'mr-auto',
        right: 'ml-auto',
      };

      const floatClasses: Record<string, string> = {
        left: size !== 'full' ? 'md:float-left md:mr-8 md:mb-4' : '',
        right: size !== 'full' ? 'md:float-right md:ml-8 md:mb-4' : '',
        center: '',
      };

      return (
        <figure
          key={key}
          className={cn(
            'my-10 clear-both',
            sizeClasses[size],
            floatClasses[align] || alignClasses[align],
          )}
        >
          {ctx.article ? (
            // Articles show the whole image at its own proportions (screenshots, charts).
            <FirebaseImage
              src={src}
              alt={alt}
              width={0}
              height={0}
              unoptimized={!optimizable(src)}
              sizes={size === 'full' ? '(max-width: 768px) 100vw, 720px' : size === 'medium' ? '(max-width: 768px) 100vw, 540px' : '(max-width: 768px) 100vw, 360px'}
              className="h-auto w-full rounded-2xl bg-muted ring-1 ring-border"
            />
          ) : (
            <div className="relative w-full overflow-hidden rounded-xl holographic-card neon-border group">
              <div className="relative aspect-video w-full">
                <FirebaseImage
                  src={src}
                  alt={alt}
                  fill
                  unoptimized={!optimizable(src)}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  title={title}
                  sizes={
                    size === 'full'
                      ? '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 800px'
                      : size === 'medium'
                        ? '(max-width: 768px) 100vw, 600px'
                        : '(max-width: 768px) 100vw, 400px'
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          )}
          {title &&
            (ctx.article ? (
              <figcaption className="mt-3 text-center text-sm text-muted-foreground">{title}</figcaption>
            ) : (
              <figcaption className="text-sm text-center text-muted-foreground/60 mt-3 italic flex items-center justify-center gap-2">
                <span className="h-px w-4 bg-primary/30" />
                {title}
                <span className="h-px w-4 bg-primary/30" />
              </figcaption>
            ))}
        </figure>
      );
    }

    case 'callout': {
      const tone = node.attrs?.tone === 'tip' || node.attrs?.tone === 'warning' ? node.attrs.tone : 'info';
      const style = CALLOUT[tone as keyof typeof CALLOUT];
      return (
        <aside key={key} className={cn('my-8 rounded-2xl border px-5 py-4 md:px-6 md:py-5 [&>*:last-child]:mb-0', style.box)}>
          <p className={cn('mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]', style.label)}>{style.name}</p>
          {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
        </aside>
      );
    }

    case 'table':
      return (
        <div key={key} className={ctx.article ? 'my-8 overflow-x-auto rounded-2xl ring-1 ring-border' : 'overflow-x-auto my-6'}>
          <table className={ctx.article ? 'w-full border-collapse text-left text-[15px] leading-snug' : 'w-full border-collapse text-sm'}>
            <tbody>{node.content?.map((child, i) => renderNode(child, i, false, ctx))}</tbody>
          </table>
        </div>
      );

    case 'tableRow':
      return (
        <tr key={key} className={ctx.article ? 'border-t border-border first:border-t-0' : 'border-b border-border/40'}>
          {node.content?.map((child, i) => renderNode(child, i, false, ctx))}
        </tr>
      );

    case 'tableHeader':
      return (
        <th key={key} className={ctx.article ? 'bg-muted/60 px-4 py-3 align-top font-semibold text-foreground' : 'px-4 py-2 text-left font-semibold text-foreground bg-primary/5 border border-border/30'}>
          {node.content?.map((child, i) => renderNode(child, i, true, ctx.article ? { ...ctx, inList: true } : ctx))}
        </th>
      );

    case 'tableCell':
      return (
        <td key={key} className={ctx.article ? 'px-4 py-3 align-top text-foreground/80' : 'px-4 py-2 text-muted-foreground border border-border/30'}>
          {node.content?.map((child, i) => renderNode(child, i, true, ctx.article ? { ...ctx, inList: true } : ctx))}
        </td>
      );

    case 'text':
      // Handle wrapper text nodes from old editor format (no text, but has content children)
      if (!node.text && node.content) {
        return <span key={key}>{node.content.map((child, i) => renderNode(child, i, insideParagraph, ctx))}</span>;
      }
      return <React.Fragment key={key}>{renderText(node, ctx)}</React.Fragment>;

    default:
      if (node.content) {
        return <div key={key}>{node.content.map((child, i) => renderNode(child, i, false, ctx))}</div>;
      }
      return null;
  }
}

export function RichContentRenderer({ content, className, variant = 'default', title }: RichContentRendererProps) {
  if (!content) return null;

  if (isJSONContent(content)) {
    const raw = typeof content === 'string' ? JSON.parse(content) as TiptapDocument : content;
    // Articles are cleaned with the same rules as the editor and the save
    // action, so older posts display like new ones (headings h2–h4, real
    // lists, no stray fragments).
    const doc = variant === 'article' ? (cleanBlogDoc(raw as JSONNode).doc as TiptapDocument) : raw;
    const ctx: Ctx = {
      article: variant === 'article',
      ids: headingIds(doc),
      skip: title ? leadingTitleHeading(doc, title) : null,
    };

    return (
      <div className={cn('max-w-none', className)}>
        {(doc.content ?? []).map((node, index) => renderNode(node, index, false, ctx))}
        <div className="clear-both" />
      </div>
    );
  }

  return (
    <div
      className={cn('prose prose-slate dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: content as string }}
    />
  );
}
