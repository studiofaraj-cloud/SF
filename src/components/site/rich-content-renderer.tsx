import React from 'react';
import { FirebaseImage } from '@/components/ui/firebase-image';
import { cn } from '@/lib/utils';

type TiptapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
};

type TiptapDocument = {
  type: 'doc';
  content: TiptapNode[];
};

type RichContentRendererProps = {
  content: string | TiptapDocument;
  className?: string;
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

function renderText(node: TiptapNode): React.ReactNode {
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
            <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[0.9em] neon-border">
              {content}
            </code>
          );
          break;
        case 'link':
          content = (
            <a
              href={mark.attrs?.href}
              target={mark.attrs?.target || '_blank'}
              rel={mark.attrs?.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 hover:decoration-primary/60 transition-colors font-medium"
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

function renderNode(node: TiptapNode, index: number, insideParagraph: boolean = false): React.ReactNode {
  const key = `node-${index}`;

  switch (node.type) {
    case 'paragraph':
      if (insideParagraph) {
        return (
          <div key={key} className="mb-5 leading-[1.85] text-muted-foreground">
            {node.content?.map((child, i) => renderNode(child, i, true))}
          </div>
        );
      }

      if (!node.content || node.content.length === 0) {
        return <p key={key} className="mb-5 leading-[1.85] text-muted-foreground">&nbsp;</p>;
      }

      const hasNestedParagraph = node.content.some(child => child.type === 'paragraph');
      if (hasNestedParagraph) {
        return (
          <div key={key} className="mb-5 leading-[1.85] text-muted-foreground">
            {node.content.map((child, i) => renderNode(child, i, true))}
          </div>
        );
      }

      const hasOnlyTextNodes = node.content.every(child => {
        return child.type === 'text' || child.type === 'hardBreak';
      });

      if (hasOnlyTextNodes) {
        return (
          <p key={key} className="mb-5 leading-[1.85] text-muted-foreground">
            {node.content.map((child, i) => renderNode(child, i, true))}
          </p>
        );
      }

      return (
        <div key={key} className="mb-5 leading-[1.85] text-muted-foreground">
          {node.content.map((child, i) => renderNode(child, i, true))}
        </div>
      );

    case 'heading': {
      const level = node.attrs?.level || 1;
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      const headingClasses: Record<number, string> = {
        1: 'text-3xl md:text-4xl font-bold mb-6 mt-12 text-foreground tracking-tight',
        2: 'text-2xl md:text-3xl font-bold mb-5 mt-10 text-foreground tracking-tight',
        3: 'text-xl md:text-2xl font-semibold mb-4 mt-8 text-foreground',
        4: 'text-lg md:text-xl font-semibold mb-3 mt-6 text-foreground',
        5: 'text-base md:text-lg font-semibold mb-3 mt-5 text-foreground',
        6: 'text-base font-semibold mb-2 mt-4 text-foreground',
      };

      // Add decorative accent under h2 and h3
      const showAccent = level === 2 || level === 3;

      return (
        <div key={key}>
          <Tag className={headingClasses[level as keyof typeof headingClasses]}>
            {node.content?.map((child, i) => renderNode(child, i, false))}
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
        <ul key={key} className="list-disc mb-6 space-y-2 ml-6 marker:text-primary/60">
          {node.content?.map((child, i) => renderNode(child, i, false))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={key} className="list-decimal mb-6 space-y-2 ml-6 marker:text-primary/60 marker:font-semibold">
          {node.content?.map((child, i) => renderNode(child, i, false))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={key} className="leading-[1.85] text-muted-foreground pl-1">
          {node.content?.map((child, i) => renderNode(child, i, false))}
        </li>
      );

    case 'codeBlock': {
      const language = node.attrs?.language;
      return (
        <pre key={key} className="mb-6 p-6 rounded-xl overflow-x-auto holographic-card neon-border relative">
          <code className={cn('font-mono text-sm leading-relaxed', language && `language-${language}`)}>
            {node.content?.map((child) => child.text).join('')}
          </code>
        </pre>
      );
    }

    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-primary/40 pl-6 py-4 my-8 text-muted-foreground bg-primary/5 rounded-r-xl holographic-card">
          {node.content?.map((child, i) => renderNode(child, i, false))}
        </blockquote>
      );

    case 'horizontalRule':
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
          <div className="relative w-full overflow-hidden rounded-xl holographic-card neon-border group">
            <div className="relative aspect-video w-full">
              <FirebaseImage
                src={src}
                alt={alt}
                fill
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
          {title && (
            <figcaption className="text-sm text-center text-muted-foreground/60 mt-3 italic flex items-center justify-center gap-2">
              <span className="h-px w-4 bg-primary/30" />
              {title}
              <span className="h-px w-4 bg-primary/30" />
            </figcaption>
          )}
        </figure>
      );
    }

    case 'text':
      // Handle wrapper text nodes from old editor format (no text, but has content children)
      if (!node.text && node.content) {
        return <span key={key}>{node.content.map((child, i) => renderNode(child, i, insideParagraph))}</span>;
      }
      return <React.Fragment key={key}>{renderText(node)}</React.Fragment>;

    default:
      if (node.content) {
        return <div key={key}>{node.content.map((child, i) => renderNode(child, i, false))}</div>;
      }
      return null;
  }
}

export function RichContentRenderer({ content, className }: RichContentRendererProps) {
  if (isJSONContent(content)) {
    const doc = typeof content === 'string' ? JSON.parse(content) as TiptapDocument : content;

    return (
      <div className={cn('max-w-none', className)}>
        {doc.content.map((node, index) => renderNode(node, index, false))}
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
