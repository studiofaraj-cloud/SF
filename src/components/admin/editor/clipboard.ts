/**
 * What happens when text is pasted into the editor.
 *
 * Clipboards carry the same content twice: `text/html` (formatting) and
 * `text/plain`. Which one to trust depends on where it was copied from:
 *
 *  - Google Docs, Word, web pages, ChatGPT / Claude chat: real HTML with
 *    headings, bold, lists. It's kept, after `cleanPastedHtml` strips the
 *    noise (Docs' bold wrapper, Word's list glyphs and styles, colours, fonts,
 *    line breaks used as paragraph breaks) and maps headings to h2–h4.
 *  - Claude's "copy" button, a `.md` file, a code editor: Markdown in the
 *    plain text, and no useful HTML. It's converted with `marked`.
 *  - Notes, plain-text editors: only plain text. One paragraph per line,
 *    "•"/"-" and "1." runs become lists.
 *
 * Content copied inside the editor itself (marked with data-pm-slice) is
 * left exactly as it is.
 */
import { marked } from 'marked';
import { BULLET_DASH, BULLET_GLYPH, NUMBERED, headingLevelMap } from '@/lib/blog-content';

/**
 * Markers that make a plain-text paste Markdown. List markers ("- ", "1. ")
 * aren't among them: plain notes use them too, and parsing those as Markdown
 * would join their single lines into one paragraph. The plain-text path
 * turns them into lists by itself.
 */
const MARKDOWN_SIGNALS = [
  /^ {0,3}#{1,6} +\S/m, // headings
  /^ {0,3}> +\S/m, // blockquote
  /^ {0,3}(?:```|~~~)/m, // fenced code
  /^ {0,3}(?:-{3,}|\*{3,}|_{3,}) *$/m, // horizontal rule
  /^ {0,3}\|.+\| *$/m, // table row
  /\*\*[^*\n]+\*\*/, // bold
  /\[[^\]\n]+\]\([^)\s]+\)/, // link
];
const MARKDOWN_HEADING = /^ {0,3}#{1,6} +\S/m;
/** HTML that carries structure worth keeping (a code editor's copy is only divs and spans). */
const SEMANTIC_HTML = /<(?:h[1-6]|p|li|ul|ol|strong|b|em|i|u|blockquote|table|a|pre)[\s>]/i;

export function looksLikeMarkdown(text: string): boolean {
  return MARKDOWN_SIGNALS.some((re) => re.test(text));
}

export type PastePlan = { kind: 'markdown' | 'text'; html: string };

/**
 * Decide how to handle a paste. Returns HTML to insert for Markdown and
 * multi-line plain text; null means "let the editor paste it", in which case
 * HTML goes through `cleanPastedHtml` (wired as transformPastedHTML).
 */
export function planPaste(html: string, text: string): PastePlan | null {
  if (html && html.includes('data-pm-slice')) return null;
  const semantic = !!html && SEMANTIC_HTML.test(html);
  // Markdown wins when there is no structured HTML, or when the HTML is just
  // the Markdown source shown as text (a raw file in a browser, a <pre>).
  if (text && looksLikeMarkdown(text) && (!semantic || (MARKDOWN_HEADING.test(text) && !/<h[1-6][\s>]/i.test(html)))) {
    const converted = markdownToHtml(text);
    if (converted) return { kind: 'markdown', html: cleanPastedHtml(converted).html };
  }
  if (semantic) return null;
  if (text && /\n/.test(text.trim())) return { kind: 'text', html: plainTextToHtml(text) };
  return null;
}

/** Markdown -> HTML. "• item" lines aren't Markdown, so they become "- item". */
export function markdownToHtml(markdown: string): string | null {
  try {
    const prepared = markdown.replace(/^(\s*)[•·▪◦‣●○■□]\s*/gm, '$1- ');
    const html = marked.parse(prepared, { gfm: true, breaks: false, async: false });
    return typeof html === 'string' && html.trim() ? html : null;
  } catch {
    return null;
  }
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain text -> HTML: one paragraph per line; runs of bullets or numbers become lists. */
export function plainTextToHtml(text: string): string {
  type Line = { kind: 'text' | 'bullet' | 'num'; text: string; n?: number; re?: RegExp };
  const lines: (Line | null)[] = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((raw) => {
      const line = raw.trim();
      if (!line) return null;
      if (BULLET_GLYPH.test(line)) return { kind: 'bullet', text: line, re: BULLET_GLYPH };
      if (BULLET_DASH.test(line)) return { kind: 'bullet', text: line, re: BULLET_DASH };
      const m = line.match(NUMBERED);
      if (m) return { kind: 'num', text: line, n: Number(m[1]) };
      return { kind: 'text', text: line };
    });

  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l) {
      i++;
      continue;
    }
    if (l.kind === 'bullet' || (l.kind === 'num' && l.n === 1)) {
      let j = i;
      let expected = 1;
      while (j < lines.length) {
        const k = lines[j];
        if (!k || k.kind !== l.kind) break;
        if (k.kind === 'num' && k.n !== expected) break;
        expected++;
        j++;
      }
      if (j - i >= 2) {
        const tag = l.kind === 'bullet' ? 'ul' : 'ol';
        const items = lines.slice(i, j).map((k) => `<li><p>${escapeHtml(k!.text.replace(k!.re ?? NUMBERED, ''))}</p></li>`);
        out.push(`<${tag}>${items.join('')}</${tag}>`);
        i = j;
        continue;
      }
    }
    out.push(`<p>${escapeHtml(l.text)}</p>`);
    i++;
  }
  return out.join('');
}

// ── HTML clean-up ────────────────────────────────────────────────────────────

const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'TABLE', 'HR', 'DIV', 'FIGURE', 'IMG']);
const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ['href'],
  IMG: ['src', 'alt', 'title'],
  OL: ['start'],
  TD: ['colspan', 'rowspan'],
  TH: ['colspan', 'rowspan'],
};

function unwrap(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function rename(el: Element, tag: string): Element {
  const next = el.ownerDocument.createElement(tag);
  while (el.firstChild) next.appendChild(el.firstChild);
  el.parentNode?.replaceChild(next, el);
  return next;
}

const all = (root: ParentNode, selector: string) => Array.from(root.querySelectorAll(selector));

function styleOf(el: Element): string {
  return (el.getAttribute('style') ?? '').toLowerCase().replace(/\s+/g, '');
}

/** Formatting expressed as inline styles (Google Docs, Word) becomes tags the editor understands. */
function stylesToTags(body: HTMLElement) {
  for (const el of all(body, 'span, font, a')) {
    const s = styleOf(el);
    if (!s) continue;
    const wraps: string[] = [];
    if (/font-weight:(bold|bolder|[6-9]00)/.test(s)) wraps.push('strong');
    if (/font-style:(italic|oblique)/.test(s)) wraps.push('em');
    if (/text-decoration(-line)?:[^;]*underline/.test(s)) wraps.push('u');
    if (/text-decoration(-line)?:[^;]*line-through/.test(s)) wraps.push('s');
    for (const tag of wraps) {
      const w = el.ownerDocument.createElement(tag);
      while (el.firstChild) w.appendChild(el.firstChild);
      el.appendChild(w);
    }
  }
}

/** Word writes lists as paragraphs with a bullet glyph in a special span: rebuild real lists. */
function convertWordLists(body: HTMLElement) {
  const isItem = (el: Element | null): el is HTMLElement =>
    !!el && el.tagName === 'P' && (/mso-list:l\d/.test(styleOf(el)) || /^MsoListParagraph/i.test(el.getAttribute('class') ?? ''));
  for (const first of all(body, 'p')) {
    // Paragraphs already moved into a list are detached: skip them.
    if (!first.isConnected || !isItem(first) || isItem(first.previousElementSibling)) continue;
    const group: HTMLElement[] = [];
    let cur: Element | null = first;
    while (isItem(cur)) {
      group.push(cur);
      cur = cur.nextElementSibling;
    }
    const marker = group[0].querySelector('span[style*="mso-list"]')?.textContent?.trim() ?? '';
    const ordered = /^\(?[0-9a-z]{1,3}[.)]/i.test(marker);
    const list = body.ownerDocument.createElement(ordered ? 'ol' : 'ul');
    group[0].parentNode?.insertBefore(list, group[0]);
    for (const p of group) {
      for (const m of all(p, 'span')) if (/mso-list:ignore/.test(styleOf(m))) m.remove();
      const li = body.ownerDocument.createElement('li');
      while (p.firstChild) li.appendChild(p.firstChild);
      list.appendChild(li);
      p.remove();
    }
  }
}

/** A div with only inline content is a paragraph; one with blocks inside is just a wrapper. */
function divsToParagraphs(body: HTMLElement) {
  for (const div of all(body, 'div').reverse()) {
    const hasBlock = Array.from(div.children).some((c) => BLOCK_TAGS.has(c.tagName));
    if (hasBlock) unwrap(div);
    else rename(div, 'p');
  }
}

/** Text left directly in a container (body, list item, cell) is wrapped in paragraphs. */
function wrapLooseInline(container: Element) {
  const doc = container.ownerDocument;
  let run: Node[] = [];
  const flush = (before: Node | null) => {
    if (run.some((n) => (n.textContent ?? '').trim() !== '' || (n as Element).tagName === 'IMG')) {
      const p = doc.createElement('p');
      container.insertBefore(p, before);
      for (const n of run) p.appendChild(n);
    } else {
      for (const n of run) n.parentNode?.removeChild(n);
    }
    run = [];
  };
  for (const node of Array.from(container.childNodes)) {
    const isBlock = node.nodeType === 1 && BLOCK_TAGS.has((node as Element).tagName);
    if (isBlock) flush(node);
    else run.push(node);
  }
  flush(null);
}

/** A paragraph whose lines are separated by <br> becomes one paragraph per line. */
function splitBreaks(body: HTMLElement) {
  const doc = body.ownerDocument;
  for (const p of all(body, 'p')) {
    if (!Array.from(p.children).some((c) => c.tagName === 'BR')) continue;
    const parts: Node[][] = [[]];
    for (const n of Array.from(p.childNodes)) {
      if (n.nodeType === 1 && (n as Element).tagName === 'BR') parts.push([]);
      else parts[parts.length - 1].push(n);
    }
    const lines = parts.filter((nodes) => nodes.some((n) => (n.textContent ?? '').trim() !== '' || (n as Element).tagName === 'IMG'));
    for (const nodes of lines) {
      const np = doc.createElement('p');
      for (const n of nodes) np.appendChild(n);
      p.parentNode?.insertBefore(np, p);
    }
    p.remove();
  }
  for (const h of all(body, 'h1, h2, h3, h4, h5, h6')) for (const br of all(h, 'br')) br.replaceWith(doc.createTextNode(' '));
}

/** Heading levels shifted so sections are h2, never deeper than h4; no bold inside headings. */
function normalizeHeadings(body: HTMLElement) {
  const headings = all(body, 'h1, h2, h3, h4, h5, h6');
  if (!headings.length) return;
  const leading = body.firstElementChild === headings[0];
  const map = headingLevelMap(headings.map((h) => Number(h.tagName[1])), leading);
  headings.forEach((h, i) => {
    for (const b of all(h, 'strong, b')) unwrap(b);
    const level = map(Number(h.tagName[1]), i);
    if (`H${level}` !== h.tagName) rename(h, `h${level}`);
  });
}

function removeEmpty(body: HTMLElement) {
  for (const el of all(body, 'strong, b, em, i, u, s, a, code').reverse()) if (!(el.textContent ?? '').trim() && !el.querySelector('img')) unwrap(el);
  for (const el of all(body, 'p, h1, h2, h3, h4, h5, h6, li').reverse()) if (!(el.textContent ?? '').trim() && !el.querySelector('img')) el.remove();
  for (const el of all(body, 'ul, ol, blockquote').reverse()) if (!el.children.length) el.remove();
}

function stripAttributes(body: HTMLElement) {
  for (const el of all(body, '*')) {
    const keep = ALLOWED_ATTRS[el.tagName] ?? [];
    for (const attr of Array.from(el.attributes)) if (!keep.includes(attr.name)) el.removeAttribute(attr.name);
  }
}

/**
 * Clean HTML from another application before the editor parses it. Returns
 * the HTML and how many images were left out (pasted files, data: URIs and
 * local paths can't be stored: they have to go through the image upload).
 */
export function cleanPastedHtml(html: string): { html: string; droppedImages: number } {
  if (html.includes('data-pm-slice')) return { html, droppedImages: 0 };
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  for (const el of all(body, 'script, style, meta, link, title, noscript, template, iframe, object, embed, svg, canvas, button, input, select, textarea, form, colgroup, col')) el.remove();
  const walker = doc.createTreeWalker(body, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const c of comments) c.parentNode?.removeChild(c);

  convertWordLists(body);
  // Word's "Titolo" / "Sottotitolo" styles are paragraphs with a class.
  for (const p of all(body, 'p.MsoTitle')) rename(p, 'h1');
  for (const p of all(body, 'p.MsoSubtitle')) rename(p, 'h2');
  // Google Docs wraps the whole selection in <b style="font-weight:normal">.
  for (const b of all(body, 'b')) if (/font-weight:(normal|400)/.test(styleOf(b)) || (b.getAttribute('id') ?? '').startsWith('docs-internal-guid')) unwrap(b);
  stylesToTags(body);
  // Namespaced Office tags (o:p, w:sdt…) and meaningless inline wrappers.
  for (const el of all(body, '*')) if (el.tagName.includes(':')) unwrap(el);
  for (const el of all(body, 'span, font, small, big, ins, abbr, cite, dfn, kbd, samp, var, time, mark, sub, sup, label, bdi, bdo, wbr')) unwrap(el);
  for (const el of all(body, 'section, article, header, footer, main, nav, aside, center, details, summary, dl, dt, dd, picture, source')) unwrap(el);
  for (const el of all(body, 'strike, del')) rename(el, 's');
  for (const el of all(body, 'tt')) rename(el, 'code');
  // A figure's caption becomes the image caption.
  for (const fig of all(body, 'figure')) {
    const img = fig.querySelector('img');
    const cap = fig.querySelector('figcaption')?.textContent?.trim();
    if (img && cap && !img.getAttribute('title')) img.setAttribute('title', cap);
    fig.querySelector('figcaption')?.remove();
    unwrap(fig);
  }
  divsToParagraphs(body);
  wrapLooseInline(body);
  splitBreaks(body);
  normalizeHeadings(body);

  let droppedImages = 0;
  for (const img of all(body, 'img')) {
    const src = img.getAttribute('src') ?? '';
    if (!/^https?:\/\//i.test(src)) {
      img.remove();
      droppedImages++;
    }
  }
  for (const a of all(body, 'a')) {
    const href = (a.getAttribute('href') ?? '').trim();
    if (!href || /^(javascript|data|vbscript):/i.test(href) || href.startsWith('#')) unwrap(a);
  }
  removeEmpty(body);
  stripAttributes(body);
  return { html: body.innerHTML, droppedImages };
}
