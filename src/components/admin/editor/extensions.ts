/**
 * Editor building blocks: the callout node, the line-aware block commands,
 * heading suggestions and image uploads. Kept apart from the React component
 * so they can be tested with a headless editor.
 */
import { Extension, Node, mergeAttributes, type Editor } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';

// ── Callout ──────────────────────────────────────────────────────────────────

export type CalloutTone = 'info' | 'tip' | 'warning';
export const CALLOUT_TONES: { tone: CalloutTone; label: string }[] = [
  { tone: 'info', label: 'Nota' },
  { tone: 'tip', label: 'Consiglio' },
  { tone: 'warning', label: 'Attenzione' },
];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /** Wrap the selected blocks in a callout, or change the tone of the current one. */
      setCallout: (tone: CalloutTone) => ReturnType;
      /** Take the content out of the callout. */
      unsetCallout: () => ReturnType;
    };
  }
}

/**
 * A highlighted box (Nota / Consiglio / Attenzione) holding paragraphs and
 * lists. Stored as { type: 'callout', attrs: { tone } }, rendered by
 * rich-content-renderer.tsx.
 */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      tone: {
        default: 'info',
        parseHTML: (el) => {
          const t = el.getAttribute('data-callout');
          return t === 'tip' || t === 'warning' ? t : 'info';
        },
        renderHTML: (attrs) => ({ 'data-callout': attrs.tone }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-callout]' }, { tag: 'aside[data-callout]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'rte-callout' }), 0];
  },
  addCommands() {
    return {
      setCallout:
        (tone) =>
        ({ editor, commands }) =>
          editor.isActive(this.name) ? commands.updateAttributes(this.name, { tone }) : commands.wrapIn(this.name, { tone }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

// ── Block types, one line at a time ─────────────────────────────────────────

export type BlockKind = 'paragraph' | 'h2' | 'h3' | 'h4' | 'quote' | 'code';

export const BLOCK_OPTIONS: { kind: BlockKind; label: string; hint: string }[] = [
  { kind: 'paragraph', label: 'Testo', hint: 'Ctrl+Alt+0' },
  { kind: 'h2', label: 'Titolo sezione', hint: 'Ctrl+Alt+2 · ## ' },
  { kind: 'h3', label: 'Sottotitolo', hint: 'Ctrl+Alt+3 · ### ' },
  { kind: 'h4', label: 'Titoletto', hint: 'Ctrl+Alt+4 · #### ' },
  { kind: 'quote', label: 'Citazione', hint: '> ' },
  { kind: 'code', label: 'Codice', hint: '``` ' },
];

export function currentBlock(editor: Editor | null): BlockKind {
  if (!editor) return 'paragraph';
  if (editor.isActive('codeBlock')) return 'code';
  for (const level of [2, 3, 4] as const) if (editor.isActive('heading', { level })) return `h${level}`;
  if (editor.isActive('blockquote')) return 'quote';
  return 'paragraph';
}

/**
 * If the selection sits in a paragraph made of several lines (joined by line
 * breaks, as pastes and the old editor produced), split that paragraph into
 * one paragraph per line first. Then a heading applies to the line the
 * cursor is on, not to the whole block. Returns whether it split.
 */
export function splitLinesAroundSelection(editor: Editor): boolean {
  const { state, view } = editor;
  const { $from, $to } = state.selection;
  if (!$from.sameParent($to)) return false;
  const block = $from.parent;
  if (!block.isTextblock || block.type.name === 'codeBlock') return false;
  let hasBreak = false;
  block.forEach((child) => {
    if (child.type.name === 'hardBreak') hasBreak = true;
  });
  if (!hasBreak) return false;

  type Line = { nodes: PMNode[]; start: number; end: number };
  const lines: Line[] = [];
  let current: PMNode[] = [];
  let start = 0;
  block.forEach((child, offset) => {
    if (child.type.name === 'hardBreak') {
      lines.push({ nodes: current, start, end: offset });
      current = [];
      start = offset + child.nodeSize;
    } else {
      current.push(child);
    }
  });
  lines.push({ nodes: current, start, end: block.content.size });

  const lineAt = (offset: number) => {
    const i = lines.findIndex((l) => offset >= l.start && offset <= l.end);
    return i === -1 ? lines.length - 1 : i;
  };
  const a = lineAt($from.parentOffset);
  const b = lineAt($to.parentOffset);

  const blockPos = $from.before();
  const blocks: PMNode[] = [];
  let pos = blockPos;
  let selFrom = -1;
  let selTo = -1;
  lines.forEach((line, i) => {
    const empty = line.nodes.every((n) => n.isText && !(n.text ?? '').trim());
    if (empty && (i < a || i > b)) return;
    const node = block.type.create(block.attrs, line.nodes, block.marks);
    if (i === a) selFrom = pos + 1 + ($from.parentOffset - line.start);
    if (i === b) selTo = pos + 1 + ($to.parentOffset - line.start);
    blocks.push(node);
    pos += node.nodeSize;
  });

  view.dispatch(state.tr.replaceWith(blockPos, blockPos + block.nodeSize, blocks));
  editor.commands.setTextSelection({ from: selFrom, to: selTo });
  return true;
}

/** Remove the bold mark from the text block the cursor is in (a heading is already bold). */
function unboldCurrentBlock(editor: Editor) {
  const { state, view } = editor;
  const { $from } = state.selection;
  const bold = state.schema.marks.bold;
  if (!bold || !$from.parent.isTextblock) return;
  const from = $from.start();
  const to = $from.end();
  if (state.doc.rangeHasMark(from, to, bold)) view.dispatch(state.tr.removeMark(from, to, bold));
}

/** Set the type of the block(s) under the selection; headings apply to the current line only. */
export function setBlock(editor: Editor, kind: BlockKind) {
  if (kind !== 'code') splitLinesAroundSelection(editor);
  const chain = editor.chain().focus();
  switch (kind) {
    case 'paragraph':
      if (editor.isActive('blockquote')) chain.lift('blockquote');
      chain.setParagraph().run();
      return;
    case 'h2':
    case 'h3':
    case 'h4':
      chain.setHeading({ level: Number(kind[1]) as 2 | 3 | 4 }).run();
      unboldCurrentBlock(editor);
      return;
    case 'quote':
      if (!editor.isActive('blockquote')) chain.setParagraph().wrapIn('blockquote').run();
      else chain.run();
      return;
    case 'code':
      chain.toggleCodeBlock().run();
      return;
  }
}

/**
 * Ctrl+Alt+0 / 2 / 3 / 4: text, section title, subtitle, small title. Runs
 * before the heading extension's own shortcuts so they also work one line
 * at a time.
 */
export const BlockShortcuts = Extension.create({
  name: 'blockShortcuts',
  priority: 1000,
  addKeyboardShortcuts() {
    const run = (kind: BlockKind) => () => {
      setBlock(this.editor as Editor, kind);
      return true;
    };
    return { 'Mod-Alt-0': run('paragraph'), 'Mod-Alt-2': run('h2'), 'Mod-Alt-3': run('h3'), 'Mod-Alt-4': run('h4') };
  },
});

// ── Outline and heading suggestions ─────────────────────────────────────────

export type OutlineItem = { pos: number; level: number; text: string };
export type HeadingSuggestion = { pos: number; text: string; reason: 'bold' | 'short' };

/**
 * The article's headings, and short lines that read like headings but are
 * still paragraphs: a whole line in bold, or a short line without final
 * punctuation followed by a longer paragraph.
 */
export function analyseOutline(doc: PMNode): { outline: OutlineItem[]; suggestions: HeadingSuggestion[] } {
  const outline: OutlineItem[] = [];
  const suggestions: HeadingSuggestion[] = [];
  const blocks: { node: PMNode; pos: number }[] = [];
  doc.forEach((node, offset) => blocks.push({ node, pos: offset }));

  blocks.forEach(({ node, pos }, i) => {
    if (node.type.name === 'heading') {
      outline.push({ pos, level: Number(node.attrs.level), text: node.textContent.trim() });
      return;
    }
    if (node.type.name !== 'paragraph') return;
    const text = node.textContent.trim();
    if (text.length < 3 || text.length > 90 || /^[•·▪◦‣●○■□\-–*]/.test(text)) return;
    const prev = blocks[i - 1]?.node;
    const next = blocks[i + 1]?.node;
    if (!next || prev?.type.name === 'heading') return;
    let texts = 0;
    let bolds = 0;
    node.forEach((c) => {
      if (c.isText && (c.text ?? '').trim()) {
        texts++;
        if (c.marks.some((m) => m.type.name === 'bold')) bolds++;
      }
    });
    const nextIsProse = ['paragraph', 'bulletList', 'orderedList', 'blockquote', 'callout', 'table', 'image'].includes(next.type.name);
    const words = text.split(/\s+/).length;
    if (texts > 0 && bolds === texts && nextIsProse && !/[.!?;,]$/.test(text)) {
      suggestions.push({ pos, text, reason: 'bold' });
    } else if (words <= 10 && !/[.!?;:,…»"”)]$/.test(text) && next.type.name === 'paragraph' && next.textContent.trim().length > 120) {
      suggestions.push({ pos, text, reason: 'short' });
    }
  });
  return { outline, suggestions: suggestions.slice(0, 12) };
}

/** Put the cursor at the start of the block at `pos` and scroll it into view. */
export function focusBlock(editor: Editor, pos: number) {
  editor.chain().focus().setTextSelection(pos + 1).scrollIntoView().run();
}

// ── Words and reading time ──────────────────────────────────────────────────

export function countWords(doc: PMNode): number {
  const text = doc.textBetween(0, doc.content.size, ' ', ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

// ── Image uploads ────────────────────────────────────────────────────────────

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function imageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
}

/** Upload an image to Firebase Storage (images/content/) and return its public URL. */
export async function uploadContentImage(file: File, onProgress?: (pct: number) => void): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('L’immagine supera i 10 MB.');
  const [{ storage }, { ref, uploadBytesResumable, getDownloadURL }] = await Promise.all([import('@/firebase/config'), import('firebase/storage')]);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') || 'immagine';
  const task = uploadBytesResumable(ref(storage, `images/content/${Date.now()}-${safeName}`), file, { contentType: file.type });
  return new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress?.((s.bytesTransferred / s.totalBytes) * 100),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    );
  });
}
