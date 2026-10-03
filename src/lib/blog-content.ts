/**
 * Cleaning rich-text documents (Tiptap / ProseMirror JSON) for articles.
 *
 * One set of rules, used in three places so the editor, the database and the
 * public page always agree:
 *  - the editor, when content is loaded and from "Sistema il testo";
 *  - the save action, so what is stored is already clean;
 *  - the public renderer, so older posts display consistently too.
 *
 * Pure functions with no imports beyond relative ones, so they run in the
 * browser, on the server and in plain Node (for tests).
 */

export type JSONMark = { type: string; attrs?: Record<string, unknown> };
export type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
  marks?: JSONMark[];
};

/** Heading levels an article body uses: the page title is the only h1. */
export const MIN_HEADING = 2;
export const MAX_HEADING = 4;

const BLOCK_CONTAINERS = new Set(['doc', 'blockquote', 'callout', 'listItem', 'tableCell', 'tableHeader']);
/** Containers whose empty paragraphs are noise (list items and table cells keep theirs). */
const PROSE_CONTAINERS = new Set(['doc', 'blockquote', 'callout']);
const INLINE = new Set(['text', 'hardBreak']);
const KNOWN_NODES = new Set([
  'doc', 'paragraph', 'text', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote',
  'codeBlock', 'horizontalRule', 'hardBreak', 'image', 'table', 'tableRow', 'tableHeader', 'tableCell', 'callout',
]);
const KNOWN_MARKS = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link']);
/** Marks in a fixed order, so the same formatting is always stored the same way. */
const MARK_ORDER = ['link', 'bold', 'italic', 'underline', 'strike', 'code'];

/**
 * "• Testo", "· Testo", "▪ Testo": a bullet typed or pasted as a character.
 * Like the dashes and numbers below, it only makes a list when at least two
 * lines in a row use it: a single "• " line is the author's own styling.
 */
export const BULLET_GLYPH = /^[•·▪◦‣●○■□]\s*/;
/** "- Testo", "– Testo", "* Testo". */
export const BULLET_DASH = /^[-–—*]\s+/;
/** "1. Testo" or "1) Testo". */
export const NUMBERED = /^(\d{1,2})[.)]\s+/;

export type CleanOptions = {
  /** Split paragraphs at their line breaks, one paragraph per line ("Sistema il testo"). */
  splitLines?: boolean;
  /**
   * Map heading levels to h2–h4 (default). Off for project case studies,
   * whose pages style their own levels: their headings are left as written.
   */
  headingLevels?: boolean;
};

export type CleanReport = {
  emptyRemoved: number;
  linesSplit: number;
  listsCreated: number;
  headingsAdjusted: number;
  strayRemoved: number;
};

export const textOf = (n: JSONNode): string => (n.text ?? '') + (n.content ?? []).map(textOf).join('');

const isBlank = (n: JSONNode) =>
  n.type === 'paragraph' &&
  !(n.content ?? []).some((c) => (c.type === 'text' && (c.text ?? '').trim() !== '') || c.type === 'image');

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * One canonical form for a mark: links keep only their address (the page
 * decides target and rel), other marks no attributes. The editor adds
 * default attributes on load; without this, saving an untouched post would
 * still change it.
 */
function canonicalMark(m: JSONMark): JSONMark {
  if (m.type === 'link') return { type: 'link', attrs: { href: String(m.attrs?.href ?? '') } };
  return { type: m.type };
}

/** Legacy shapes from the old editor: text wrappers without `text`, empty text, unknown marks. */
function repairInline(node: JSONNode, report: CleanReport): JSONNode[] {
  if (node.type === 'text') {
    if (!node.text && Array.isArray(node.content)) return node.content.flatMap((c) => repairInline(c, report));
    if (!node.text) return [];
    const marks = (node.marks ?? [])
      .filter((m) => KNOWN_MARKS.has(m.type))
      .map(canonicalMark)
      .sort((a, b) => MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type));
    return [marks.length ? { type: 'text', text: node.text, marks } : { type: 'text', text: node.text }];
  }
  return [node];
}

/** Adjacent text with the same formatting is one piece of text (as the editor stores it). */
function mergeText(nodes: JSONNode[]): JSONNode[] {
  const out: JSONNode[] = [];
  for (const n of nodes) {
    const last = out[out.length - 1];
    if (n.type === 'text' && last?.type === 'text' && JSON.stringify(last.marks ?? []) === JSON.stringify(n.marks ?? [])) {
      out[out.length - 1] = { ...last, text: (last.text ?? '') + (n.text ?? '') };
    } else {
      out.push(n);
    }
  }
  return out;
}

function repair(node: JSONNode, report: CleanReport): JSONNode[] {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return [];
  if (INLINE.has(node.type)) return repairInline(node, report);
  if (!KNOWN_NODES.has(node.type)) {
    // An unknown wrapper: keep what it contains.
    report.strayRemoved++;
    return (node.content ?? []).flatMap((c) => repair(c, report));
  }
  const out: JSONNode = { ...node };
  if (node.content) out.content = node.content.flatMap((c) => repair(c, report));
  return [out];
}

const hasText = (run: JSONNode[]) => run.some((n) => n.type === 'text' && (n.text ?? '').trim() !== '');

/**
 * Put every node where the schema allows it. Seen in stored posts:
 *  - paragraphs nested in paragraphs (old editor): the inner blocks are lifted out;
 *  - text directly in the document, a list or a quote (newlines left by pastes):
 *    whitespace is dropped, real text is wrapped in a paragraph;
 *  - anything but list items in a list, rows in a table, cells in a row.
 * Returns the node's replacement: none, itself, or several nodes.
 */
function fix(node: JSONNode, report: CleanReport): JSONNode[] {
  if (INLINE.has(node.type)) return [node];
  const children = (node.content ?? []).flatMap((c) => fix(c, report));

  // Text blocks hold inline content only. The old editor split a line into
  // nested paragraphs at every change of formatting ("• ", "Dati personali:",
  // " venduti per un like."): those fragments are joined back into the line.
  // Real blocks inside (a list, an image) are lifted out.
  if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'codeBlock') {
    if (children.every((c) => INLINE.has(c.type))) return [node.content ? { ...node, content: children } : node];
    const out: JSONNode[] = [];
    let run: JSONNode[] = [];
    const flush = () => {
      if (hasText(run)) out.push({ ...node, content: run });
      run = [];
    };
    for (const c of children) {
      if (INLINE.has(c.type)) run.push(c);
      else if (c.type === 'paragraph') {
        if (!hasText(c.content ?? [])) report.emptyRemoved++;
        run.push(...(c.content ?? []));
      }
      else {
        flush();
        out.push(c);
      }
    }
    flush();
    if (out.length === 0) report.emptyRemoved++;
    return out;
  }

  if (BLOCK_CONTAINERS.has(node.type)) {
    const blocks: JSONNode[] = [];
    let run: JSONNode[] = [];
    const flush = () => {
      if (hasText(run)) blocks.push({ type: 'paragraph', content: run });
      else if (run.length) report.strayRemoved++;
      run = [];
    };
    for (const c of children) {
      if (INLINE.has(c.type)) run.push(c);
      else {
        flush();
        blocks.push(c);
      }
    }
    flush();
    // A list item starts with a paragraph; cells and items are never empty.
    if (node.type === 'listItem' && blocks[0]?.type !== 'paragraph') blocks.unshift({ type: 'paragraph' });
    if ((node.type === 'tableCell' || node.type === 'tableHeader') && blocks.length === 0) blocks.push({ type: 'paragraph' });
    // An empty quote or callout has nothing to show.
    if ((node.type === 'blockquote' || node.type === 'callout') && !blocks.some((b) => b.type !== 'paragraph' || hasText(b.content ?? []))) {
      report.emptyRemoved++;
      return [];
    }
    return [{ ...node, content: blocks }];
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    const items: JSONNode[] = [];
    let run: JSONNode[] = [];
    const flush = () => {
      if (hasText(run)) items.push({ type: 'listItem', content: [{ type: 'paragraph', content: run }] });
      else if (run.length) report.strayRemoved++;
      run = [];
    };
    for (const c of children) {
      if (INLINE.has(c.type)) run.push(c);
      else {
        flush();
        items.push(c.type === 'listItem' ? c : { type: 'listItem', content: c.type === 'paragraph' ? [c] : [{ type: 'paragraph' }, c] });
      }
    }
    flush();
    return items.length ? [{ ...node, content: items }] : [];
  }

  if (node.type === 'table' || node.type === 'tableRow') {
    const allowed = node.type === 'table' ? ['tableRow'] : ['tableCell', 'tableHeader'];
    const kept = children.filter((c) => allowed.includes(c.type));
    report.strayRemoved += children.length - kept.length;
    return kept.length ? [{ ...node, content: kept }] : [];
  }

  return [node.content ? { ...node, content: children } : node];
}

/**
 * Newline characters inside a paragraph's text (pasted plain text, the old
 * editor): the editor shows them as line breaks, the page used to show a
 * space, so "Titolo\n\nTesto" read as one run-on line. A blank line (two or
 * more newlines) now separates paragraphs, a single newline is a line break.
 */
function newlinesToBreaks(p: JSONNode): JSONNode[] {
  if (!(p.content ?? []).some((n) => n.type === 'text' && /[\r\n]/.test(n.text ?? ''))) return [p];
  const parts: JSONNode[][] = [[]];
  for (const n of p.content ?? []) {
    if (n.type !== 'text' || !/[\r\n]/.test(n.text ?? '')) {
      parts[parts.length - 1].push(n);
      continue;
    }
    for (const seg of (n.text ?? '').replace(/\r\n?/g, '\n').split(/(\n[ \t]*\n\s*|\n)/)) {
      if (!seg) continue;
      if (/^\n[ \t]*\n/.test(seg)) parts.push([]);
      else if (seg === '\n') parts[parts.length - 1].push({ type: 'hardBreak' });
      else parts[parts.length - 1].push({ ...n, text: seg });
    }
  }
  return parts
    .map((line) => {
      let nodes = line;
      while (nodes[0]?.type === 'hardBreak') nodes = nodes.slice(1);
      while (nodes[nodes.length - 1]?.type === 'hardBreak') nodes = nodes.slice(0, -1);
      return trimLine(nodes);
    })
    .filter((line) => line.some((n) => n.type !== 'text' || (n.text ?? '').trim() !== ''))
    .map((line) => ({ ...p, content: line }));
}

/** Apply newlinesToBreaks everywhere text can hold them (not in code blocks); headings get a space. */
function splitNewlines(node: JSONNode, report: CleanReport): JSONNode {
  if (!node.content || node.type === 'codeBlock') return node;
  if (node.type === 'heading') {
    return { ...node, content: node.content.map((n) => (n.type === 'text' && n.text ? { ...n, text: n.text.replace(/\s*[\r\n]+\s*/g, ' ') } : n)) };
  }
  const content = node.content.flatMap((c) => {
    const fixed = splitNewlines(c, report);
    if (fixed.type !== 'paragraph') return [fixed];
    const parts = newlinesToBreaks(fixed);
    if (parts.length > 1) report.linesSplit += parts.length - 1;
    return parts;
  });
  return { ...node, content };
}

function splitParagraphLines(p: JSONNode): JSONNode[] {
  const kids = p.content ?? [];
  if (!kids.some((k) => k.type === 'hardBreak')) return [p];
  const lines: JSONNode[][] = [[]];
  for (const k of kids) {
    if (k.type === 'hardBreak') lines.push([]);
    else lines[lines.length - 1].push(k);
  }
  return lines
    .map((line) => trimLine(line))
    .filter((line) => line.some((n) => n.type !== 'text' || (n.text ?? '').trim() !== ''))
    .map((line) => ({ ...p, content: line }));
}

/** Leading / trailing spaces of a line, left over from the break that ended the previous one. */
function trimLine(line: JSONNode[]): JSONNode[] {
  const out = line.map((n) => ({ ...n }));
  const first = out.find((n) => n.type === 'text');
  if (first?.text) first.text = first.text.replace(/^\s+/, '');
  const last = [...out].reverse().find((n) => n.type === 'text');
  if (last?.text) last.text = last.text.replace(/\s+$/, '');
  return out.filter((n) => n.type !== 'text' || n.text !== '');
}

/** Remove a list marker typed as text ("• ", "1. ") from the start of a paragraph. */
function stripMarker(p: JSONNode, re: RegExp): JSONNode {
  const content = (p.content ?? []).map((n) => ({ ...n }));
  const first = content[0];
  if (first?.type === 'text' && first.text) first.text = first.text.replace(re, '');
  return { ...p, content: content.filter((n) => n.type !== 'text' || n.text !== '') };
}

/**
 * A list squashed into one paragraph ("Intro: • uno • due • tre"), left by
 * pastes that joined their lines: an intro paragraph (if any) and a real
 * list. Only "•" counts, at least twice: "·" is a separator in prose
 * ("Studio Faraj · Padova").
 */
function inlineBullets(p: JSONNode, report: CleanReport): JSONNode[] {
  const kids = p.content ?? [];
  const count = kids.reduce((n, k) => n + (k.type === 'text' ? ((k.text ?? '').match(/(^|\s)•\s/g) ?? []).length : 0), 0);
  if (count < 2) return [p];
  const segments: JSONNode[][] = [[]];
  for (const k of kids) {
    if (k.type !== 'text' || !(k.text ?? '').includes('•')) {
      segments[segments.length - 1].push(k);
      continue;
    }
    const pieces = (k.text ?? '').split(/(?:^|\s)•\s/);
    pieces.forEach((piece, i) => {
      if (i > 0) segments.push([]);
      if (piece) segments[segments.length - 1].push({ ...k, text: piece });
    });
  }
  const [intro, ...items] = segments.map(trimLine);
  const filled = items.filter((s) => hasText(s));
  if (filled.length < 2) return [p];
  report.listsCreated++;
  const list: JSONNode = { type: 'bulletList', content: filled.map((s) => ({ type: 'listItem', content: [{ type: 'paragraph', content: s }] })) };
  return hasText(intro) ? [{ ...p, content: intro }, list] : [list];
}

/** Runs of paragraphs that start with a bullet or a number become real lists. */
function buildLists(blocks: JSONNode[], report: CleanReport): JSONNode[] {
  const out: JSONNode[] = [];
  let i = 0;
  const firstText = (b: JSONNode) => (b.type === 'paragraph' ? (b.content?.[0]?.type === 'text' ? b.content[0].text ?? '' : '') : '');
  while (i < blocks.length) {
    const t = firstText(blocks[i]);
    const glyph = BULLET_GLYPH.test(t);
    const dash = !glyph && BULLET_DASH.test(t);
    const num = !glyph && !dash ? t.match(NUMBERED) : null;
    if (glyph || dash) {
      const re = glyph ? BULLET_GLYPH : BULLET_DASH;
      let j = i;
      while (j < blocks.length && re.test(firstText(blocks[j]))) j++;
      if (j - i >= 2) {
        out.push({ type: 'bulletList', content: blocks.slice(i, j).map((p) => ({ type: 'listItem', content: [stripMarker(p, re)] })) });
        report.listsCreated++;
        i = j;
        continue;
      }
    } else if (num && num[1] === '1') {
      let j = i;
      let expected = 1;
      while (j < blocks.length) {
        const m = firstText(blocks[j]).match(NUMBERED);
        if (!m || Number(m[1]) !== expected) break;
        expected++;
        j++;
      }
      if (j - i >= 2) {
        out.push({ type: 'orderedList', attrs: { start: 1 }, content: blocks.slice(i, j).map((p) => ({ type: 'listItem', content: [stripMarker(p, NUMBERED)] })) });
        report.listsCreated++;
        i = j;
        continue;
      }
    }
    out.push(blocks[i]);
    i++;
  }
  return out;
}

/** Bold inside a heading is redundant (headings are bold) and makes pasted titles inconsistent. */
function cleanHeading(h: JSONNode): JSONNode {
  const content = (h.content ?? [])
    .map((n) => (n.type === 'hardBreak' ? { type: 'text', text: ' ' } : n))
    .map((n) => (n.marks ? { ...n, marks: n.marks.filter((m) => m.type !== 'bold') } : n))
    .map((n) => (n.marks && n.marks.length === 0 ? { type: n.type, text: n.text } : n));
  return { ...h, content };
}

/**
 * The levels in use, shifted so the top section level is h2 and nothing goes
 * past h4. An h1 that opens the document above lower-level sections is a
 * pasted document title: it becomes an h2 without pulling the sections down.
 * `leading` says whether the first heading is the document's first block.
 */
export function headingLevelMap(levels: number[], leading: boolean): (level: number, index: number) => number {
  if (levels.length === 0) return (l) => l;
  const [first, ...rest] = levels;
  const titleFirst = leading && first === 1 && rest.length > 0 && rest.every((l) => l > first);
  const top = Math.min(...(titleFirst ? rest : levels));
  const shift = MIN_HEADING - top;
  const clamp = (l: number) => Math.min(MAX_HEADING, Math.max(MIN_HEADING, l));
  return (level, index) => (titleFirst && index === 0 ? MIN_HEADING : clamp(level + shift));
}

/**
 * Clean an article document. Idempotent: cleaning twice gives the same
 * result, so the editor, the save action and the renderer can all apply it.
 */
export function cleanBlogDoc(input: JSONNode, options: CleanOptions = {}): { doc: JSONNode; report: CleanReport } {
  const report: CleanReport = { emptyRemoved: 0, linesSplit: 0, listsCreated: 0, headingsAdjusted: 0, strayRemoved: 0 };
  const base: JSONNode = input && input.type === 'doc' ? clone(input) : { type: 'doc', content: [] };

  let doc = repair(base, report)[0] ?? { type: 'doc', content: [] };
  doc = fix(doc, report)[0] ?? { type: 'doc', content: [] };
  doc = splitNewlines(doc, report);

  // Prose containers: split lines, drop empty paragraphs, turn typed bullets into lists.
  const walk = (node: JSONNode, inProse: boolean): JSONNode => {
    if (!node.content) return node;
    let content = node.content.map((c) => walk(c, PROSE_CONTAINERS.has(c.type)));
    if (inProse) {
      if (options.splitLines) {
        content = content.flatMap((c) => {
          if (c.type !== 'paragraph') return [c];
          const parts = splitParagraphLines(c);
          if (parts.length > 1) report.linesSplit += parts.length - 1;
          return parts;
        });
      }
      const before = content.length;
      content = content.filter((c) => !isBlank(c));
      report.emptyRemoved += before - content.length;
      content = content.flatMap((c) => (c.type === 'paragraph' ? inlineBullets(c, report) : [c]));
      content = buildLists(content, report);
    }
    return { ...node, content };
  };
  doc = walk(doc, true);

  // Headings: no bold inside, no empty ones, levels mapped to h2–h4.
  const top = (doc.content ?? []).filter((n) => !(n.type === 'heading' && textOf(n).trim() === ''));
  if (top.length !== (doc.content ?? []).length) report.emptyRemoved += (doc.content ?? []).length - top.length;
  const levels = top.filter((n) => n.type === 'heading').map((n) => Number(n.attrs?.level ?? 2));
  const keepLevels = options.headingLevels === false;
  const map = keepLevels ? (level: number) => level : headingLevelMap(levels, top[0]?.type === 'heading');
  let hi = 0;
  doc.content = top.map((n) => {
    if (n.type !== 'heading') return n;
    const level = Number(n.attrs?.level ?? 2);
    const next = map(level, hi++);
    if (next !== level) report.headingsAdjusted++;
    return cleanHeading({ ...n, attrs: { ...(n.attrs ?? {}), level: next } });
  });
  // Headings inside quotes or callouts: only clamp.
  const clampNested = (node: JSONNode): JSONNode =>
    node.content
      ? {
          ...node,
          content: node.content.map((c) => {
            if (c.type !== 'heading') return clampNested(c);
            const raw = Number(c.attrs?.level ?? 2);
            const level = keepLevels ? raw : Math.min(MAX_HEADING, Math.max(MIN_HEADING, raw));
            return cleanHeading({ ...c, attrs: { ...(c.attrs ?? {}), level } });
          }),
        }
      : node;
  doc.content = doc.content.map((n) => (n.type === 'heading' ? n : clampNested(n)));

  // Canonical form: no empty or default attributes (the editor adds them on
  // load), adjacent text with the same formatting merged.
  const DEFAULTS: Record<string, Record<string, unknown>> = {
    orderedList: { start: 1 },
    tableCell: { colspan: 1, rowspan: 1 },
    tableHeader: { colspan: 1, rowspan: 1 },
  };
  const canonical = (node: JSONNode): JSONNode => {
    const out: JSONNode = { type: node.type };
    if (node.text !== undefined) out.text = node.text;
    if (node.marks?.length) out.marks = node.marks;
    if (node.attrs) {
      const defaults = DEFAULTS[node.type] ?? {};
      const attrs = Object.fromEntries(Object.entries(node.attrs).filter(([k, v]) => v !== null && v !== undefined && defaults[k] !== v));
      if (Object.keys(attrs).length) out.attrs = attrs;
    }
    if (node.content) {
      const content = node.content.map(canonical);
      out.content = content.some((c) => c.type === 'text') ? mergeText(content) : content;
    }
    return out;
  };
  doc = canonical(doc);

  if (!doc.content?.length) doc.content = [{ type: 'paragraph' }];
  return { doc, report };
}

/** Parse stored content (a JSON string) and clean it; null when it isn't a document. */
export function cleanBlogContent(raw: unknown, options: CleanOptions = {}): { json: string; report: CleanReport } | null {
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== 'object' || (parsed as JSONNode).type !== 'doc') return null;
  const { doc, report } = cleanBlogDoc(parsed as JSONNode, options);
  return { json: JSON.stringify(doc), report };
}
