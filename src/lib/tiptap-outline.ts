/**
 * Headings of a Tiptap document: the ids the renderer puts on them and the
 * table of contents a blog post shows. Both come from `headingIds`, so the
 * links always match the headings. Pure functions, usable on the server.
 */

export type TiptapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
};

export type TiptapDocument = { type: 'doc'; content: TiptapNode[] };

export function parseTiptap(content: string | object | null | undefined): TiptapDocument | null {
  if (!content) return null;
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return doc?.type === 'doc' && Array.isArray(doc.content) ? (doc as TiptapDocument) : null;
  } catch {
    return null;
  }
}

export function nodeText(node: TiptapNode): string {
  return (node.text ?? '') + (node.content ?? []).map(nodeText).join('');
}

/** "📊 2. Il 75° percentile" → "2-il-75-percentile". */
function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'sezione'
  );
}

/** A unique id for every top-level heading, in document order. */
export function headingIds(doc: TiptapDocument): Map<TiptapNode, string> {
  const ids = new Map<TiptapNode, string>();
  const used = new Map<string, number>();
  for (const node of doc.content) {
    if (node.type !== 'heading') continue;
    const base = slugify(nodeText(node));
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    ids.set(node, n === 0 ? base : `${base}-${n + 1}`);
  }
  return ids;
}

const squash = (s: string) => slugify(s).replace(/-/g, '');

/**
 * The document opens with a heading that repeats the post title (content
 * pasted with its "# Title"): the page already shows the title as its h1.
 */
export function leadingTitleHeading(doc: TiptapDocument, title: string): TiptapNode | null {
  const first = doc.content.find((n) => n.type !== 'paragraph' || nodeText(n).trim() !== '');
  if (first?.type !== 'heading') return null;
  const a = squash(nodeText(first));
  const b = squash(title);
  return a && b && (a.startsWith(b) || b.startsWith(a)) ? first : null;
}

/**
 * Table of contents: the level-2 headings, or level 3 where a post uses those
 * as its sections. Fewer than three entries isn't worth a contents box.
 */
export function articleOutline(doc: TiptapDocument, title: string): { id: string; text: string }[] {
  const ids = headingIds(doc);
  const skip = leadingTitleHeading(doc, title);
  const headings = doc.content.filter((n) => n.type === 'heading' && n !== skip);
  const level = (l: number) => headings.filter((n) => Math.max(n.attrs?.level ?? 1, 2) === l);
  const pick = level(2).length >= 3 ? level(2) : level(3).length >= 3 ? level(3) : [];
  return pick.map((n) => ({ id: ids.get(n)!, text: nodeText(n).replace(/^[^\p{L}\p{N}]+/u, '').replace(/^\d+[.)]\s*/, '').trim() }));
}
