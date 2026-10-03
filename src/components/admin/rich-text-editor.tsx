'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTree,
  Loader2,
  MessageSquareQuote,
  Minus,
  Pencil,
  Redo,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cleanBlogDoc, type CleanReport, type JSONNode } from '@/lib/blog-content';
import { cleanPastedHtml, planPaste } from './editor/clipboard';
import {
  BLOCK_OPTIONS,
  BlockShortcuts,
  CALLOUT_TONES,
  Callout,
  analyseOutline,
  countWords,
  currentBlock,
  focusBlock,
  imageFiles,
  setBlock,
  uploadContentImage,
  type BlockKind,
} from './editor/extensions';

// Re-export so existing callers (SEO tool, forms) keep working with no import changes.
export { tiptapJsonToPlainText as jsonContentToPlainText } from '@/lib/tiptap-utils';

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}';

/**
 * Image node with `size` (full | medium | small) and `align` (center | left |
 * right), stored in the JSON exactly as rich-content-renderer.tsx reads them
 * and mirrored to data-* attributes so the editor can style them.
 */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: 'full',
        parseHTML: (el) => el.getAttribute('data-size') || 'full',
        renderHTML: (attrs) => ({ 'data-size': attrs.size }),
      },
      align: {
        default: 'center',
        parseHTML: (el) => el.getAttribute('data-align') || 'center',
        renderHTML: (attrs) => ({ 'data-align': attrs.align }),
      },
    };
  },
});

function parseContent(value: string, article: boolean): object {
  let json: unknown;
  try {
    json = JSON.parse(value && value.trim() ? value : EMPTY_DOC);
  } catch {
    json = JSON.parse(EMPTY_DOC);
  }
  // The same clean-up the save action and the public page apply, so what you
  // edit is what gets published. Projects keep their heading levels.
  return cleanBlogDoc(json as JSONNode, { headingLevels: article }).doc;
}

function describeReport(r: CleanReport): string {
  const parts = [
    r.linesSplit && `${r.linesSplit} ${r.linesSplit === 1 ? 'riga separata' : 'righe separate'} in paragrafi`,
    r.emptyRemoved && `${r.emptyRemoved} ${r.emptyRemoved === 1 ? 'paragrafo vuoto rimosso' : 'paragrafi vuoti rimossi'}`,
    r.listsCreated && `${r.listsCreated} ${r.listsCreated === 1 ? 'elenco creato' : 'elenchi creati'}`,
    r.headingsAdjusted && `${r.headingsAdjusted} ${r.headingsAdjusted === 1 ? 'titolo uniformato' : 'titoli uniformati'}`,
    r.strayRemoved && `${r.strayRemoved} ${r.strayRemoved === 1 ? 'frammento rimosso' : 'frammenti rimossi'}`,
  ].filter(Boolean);
  return parts.length ? `${parts.join(', ')}. Ctrl+Z per annullare.` : 'Il testo era già in ordine.';
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  /**
   * Blog articles: headings are normalised to h2–h4 when the content loads,
   * as on the public page. Off for projects, whose case-study pages style
   * their own heading levels.
   */
  article?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Inizia a scrivere, oppure incolla da Google Docs, Word, ChatGPT o un file Markdown…',
  className,
  name,
  article = false,
}: RichTextEditorProps) {
  const { toast } = useToast();
  // Re-render on editor transactions so the toolbar reflects the active state.
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  // Guards the external-value sync effect against our own onChange updates.
  const isInternalUpdate = useRef(false);
  // Lets the editor's paste / drop handlers (created once) reach current values.
  const editorRef = useRef<Editor | null>(null);
  const handlersRef = useRef<{ upload: (files: File[], at?: number) => void; dropped: (n: number) => void; link: () => void }>({
    upload: () => {},
    dropped: () => {},
    link: () => {},
  });

  const [uploads, setUploads] = useState<{ name: string; pct: number }[]>([]);
  const [showOutline, setShowOutline] = useState(false);

  const [imageDialog, setImageDialog] = useState<null | 'insert' | 'edit'>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageSize, setImageSize] = useState<'full' | 'medium' | 'small'>('full');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageBusy, setImageBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [tableDialog, setTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // The page title is the article's only h1: the body uses h2–h4.
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      CustomImage.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
      BlockShortcuts,
    ],
    content: parseContent(value, article),
    editorProps: {
      attributes: { class: 'rte-prose', spellcheck: 'true', lang: 'it' },
      // Every HTML paste (Docs, Word, web pages, chat) is cleaned first.
      transformPastedHTML: (html) => {
        const { html: clean, droppedImages } = cleanPastedHtml(html);
        if (droppedImages) handlersRef.current.dropped(droppedImages);
        return clean;
      },
      // Markdown and multi-line plain text are converted here; pasted image
      // files are uploaded. Everything else falls through to the native paste.
      handlePaste: (_view, event) => {
        const ed = editorRef.current;
        const data = event.clipboardData;
        if (!ed || !data) return false;
        const text = data.getData('text/plain') ?? '';
        const files = imageFiles(data.files);
        if (files.length && !text.trim()) {
          event.preventDefault();
          handlersRef.current.upload(files);
          return true;
        }
        if (ed.isActive('codeBlock')) return false;
        const plan = planPaste(data.getData('text/html') ?? '', text);
        if (!plan) return false;
        event.preventDefault();
        ed.chain().focus().insertContent(plan.html, { parseOptions: { preserveWhitespace: false } }).run();
        return true;
      },
      // Ctrl+K / Cmd+K opens the link dialog.
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          handlersRef.current.link();
          return true;
        }
        return false;
      },
      // Images dragged in from the desktop are uploaded where they're dropped.
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = imageFiles((event as DragEvent).dataTransfer?.files);
        if (!files.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY })?.pos;
        handlersRef.current.upload(files, at);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(JSON.stringify(editor.getJSON()));
    },
    onTransaction: () => forceUpdate(),
  });

  editorRef.current = editor;

  const uploadAndInsert = useCallback(
    async (files: File[], at?: number) => {
      for (const file of files) {
        const entry = { name: file.name, pct: 0 };
        setUploads((u) => [...u, entry]);
        try {
          const src = await uploadContentImage(file, (pct) =>
            setUploads((u) => u.map((x) => (x === entry ? Object.assign(entry, { pct }) : x)).slice()),
          );
          const ed = editorRef.current;
          if (!ed) continue;
          const node = { type: 'image', attrs: { src, alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '), title: '', size: 'full', align: 'center' } };
          if (typeof at === 'number' && at <= ed.state.doc.content.size) ed.chain().focus().insertContentAt(at, node).run();
          else ed.chain().focus().insertContent(node).run();
        } catch (error) {
          toast({ title: 'Immagine non caricata', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
        } finally {
          setUploads((u) => u.filter((x) => x !== entry));
        }
      }
    },
    [toast],
  );

  handlersRef.current = {
    link: () => openLink(),
    upload: (files, at) => void uploadAndInsert(files, at),
    dropped: (n) =>
      toast({
        title: n === 1 ? 'Un’immagine non è stata incollata' : `${n} immagini non sono state incollate`,
        description: 'Le immagini dei file locali non si possono incollare: trascinale qui o usa il pulsante Immagine.',
      }),
  };

  // Keep the editor in sync when `value` changes from OUTSIDE (an edit form
  // loading a post, a restored draft). Our own onUpdate is skipped.
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const incoming = value && value.trim() ? value : EMPTY_DOC;
    if (incoming !== JSON.stringify(editor.getJSON())) {
      try {
        editor.commands.setContent(parseContent(incoming, article), { emitUpdate: false });
      } catch {
        /* ignore malformed external content */
      }
    }
  }, [value, editor, article]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const fixText = () => {
    if (!editor) return;
    const { doc, report } = cleanBlogDoc(editor.getJSON() as JSONNode, { splitLines: true, headingLevels: article });
    editor.chain().focus().setContent(doc).run();
    toast({ title: 'Testo sistemato', description: describeReport(report) });
  };

  const openImageInsert = () => {
    setImageFile(null);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setImageSize('full');
    setImageAlign('center');
    setImageDialog('insert');
  };

  const openImageEdit = () => {
    if (!editor) return;
    const a = editor.getAttributes('image');
    setImageFile(null);
    setImageUrl(a.src ?? '');
    setImageAlt(a.alt ?? '');
    setImageCaption(a.title ?? '');
    setImageSize(a.size ?? 'full');
    setImageAlign(a.align ?? 'center');
    setImageDialog('edit');
  };

  const confirmImage = async () => {
    if (!editor) return;
    let src = imageUrl.trim();
    if (imageFile) {
      setImageBusy(true);
      try {
        src = await uploadContentImage(imageFile);
      } catch (error) {
        toast({ title: 'Immagine non caricata', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
        setImageBusy(false);
        return;
      }
      setImageBusy(false);
    }
    if (!src) return;
    const attrs = { src, alt: imageAlt.trim(), title: imageCaption.trim(), size: imageSize, align: imageAlign };
    if (imageDialog === 'edit') editor.chain().focus().updateAttributes('image', attrs).run();
    else editor.chain().focus().insertContent({ type: 'image', attrs }).run();
    setImageDialog(null);
  };

  const openLink = () => {
    if (!editor) return;
    setLinkUrl((editor.getAttributes('link').href as string | undefined) ?? '');
    setLinkText('');
    setLinkDialog(true);
  };

  const confirmLink = () => {
    if (!editor || !linkUrl.trim()) return;
    let href = linkUrl.trim();
    if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) href = `https://${href}`;
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain.insertContent({ type: 'text', text: linkText.trim() || href, marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      chain.extendMarkRange('link').setLink({ href }).run();
    }
    setLinkDialog(false);
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const block = currentBlock(editor);
  const doc = editor?.state.doc;
  const analysis = doc ? analyseOutline(doc) : { outline: [], suggestions: [] };
  const words = doc ? countWords(doc) : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const inTable = !!editor?.isActive('table');
  const onImage = !!editor?.isActive('image');

  return (
    <div className={cn('rte rounded-lg border bg-card', className)}>
      {/* Toolbar: stays under the admin header while you scroll a long article. */}
      <div className="sticky top-14 z-20 rounded-t-lg border-b bg-card/95 backdrop-blur lg:top-[60px]">
        <div role="toolbar" aria-label="Formattazione" className="flex flex-wrap items-center gap-1 p-2">
          <Select value={block} onValueChange={(v) => editor && setBlock(editor, v as BlockKind)}>
            <SelectTrigger className="h-8 w-[10.5rem] text-sm" aria-label="Tipo di blocco">
              {/* Only the name in the button; the shortcut hints are in the open list. */}
              <SelectValue>{BLOCK_OPTIONS.find((o) => o.kind === block)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BLOCK_OPTIONS.map((o) => (
                <SelectItem key={o.kind} value={o.kind}>
                  <span className={cn(o.kind === 'h2' && 'font-bold', o.kind === 'h3' && 'font-semibold', o.kind === 'h4' && 'font-medium')}>{o.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{o.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Divider />
          <Tool label="Grassetto (Ctrl+B)" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </Tool>
          <Tool label="Corsivo (Ctrl+I)" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </Tool>
          <Tool label="Sottolineato (Ctrl+U)" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </Tool>
          <Tool label="Barrato" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-4 w-4" />
          </Tool>
          <Tool label="Codice nel testo" active={editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}>
            <Code className="h-4 w-4" />
          </Tool>
          <Tool label="Link (Ctrl+K)" active={editor?.isActive('link')} onClick={openLink}>
            <LinkIcon className="h-4 w-4" />
          </Tool>

          <Divider />
          <Tool label="Elenco puntato" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </Tool>
          <Tool label="Elenco numerato" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </Tool>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" title="Riquadro" aria-label="Riquadro" className={cn('h-8 gap-1.5 px-2', editor?.isActive('callout') && 'bg-primary/15 text-primary')}>
                <MessageSquareQuote className="h-4 w-4" />
                <span className="hidden text-xs font-medium sm:inline">Riquadro</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {CALLOUT_TONES.map((t) => (
                <DropdownMenuItem key={t.tone} onSelect={() => editor?.chain().focus().setCallout(t.tone).run()}>
                  <span className={cn('mr-2 h-2.5 w-2.5 rounded-full', t.tone === 'info' && 'bg-primary', t.tone === 'tip' && 'bg-emerald-500', t.tone === 'warning' && 'bg-amber-500')} />
                  {t.label}
                </DropdownMenuItem>
              ))}
              {editor?.isActive('callout') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => editor?.chain().focus().unsetCallout().run()}>Togli il riquadro</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Tool label="Linea separatrice" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </Tool>
          <Button type="button" variant="ghost" size="sm" onClick={openImageInsert} title="Immagine: anche trascinandola qui o incollandola" className="h-8 gap-1.5 px-2 text-primary hover:text-primary">
            <ImagePlus className="h-4 w-4" />
            <span className="hidden text-xs font-medium sm:inline">Immagine</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setTableDialog(true)} title="Tabella" className="h-8 gap-1.5 px-2 text-primary hover:text-primary">
            <Table2 className="h-4 w-4" />
            <span className="hidden text-xs font-medium sm:inline">Tabella</span>
          </Button>

          <Divider />
          <Tool label="Togli la formattazione dalla selezione" onClick={() => editor?.chain().focus().unsetAllMarks().run()}>
            <Eraser className="h-4 w-4" />
          </Tool>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fixText}
            title="Sistema il testo: una riga per paragrafo, niente paragrafi vuoti, elenchi veri, titoli uniformi"
            className="h-8 gap-1.5 px-2"
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden text-xs font-medium md:inline">Sistema il testo</span>
          </Button>
          <Tool label="Annulla (Ctrl+Z)" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
          </Tool>
          <Tool label="Ripeti (Ctrl+Y)" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
          </Tool>

          <Button
            type="button"
            variant={showOutline ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowOutline((s) => !s)}
            aria-expanded={showOutline}
            className="ml-auto h-8 gap-1.5 px-2"
          >
            <ListTree className="h-4 w-4" />
            <span className="text-xs font-medium">Struttura</span>
            {analysis.suggestions.length > 0 && (
              <span className="rounded-full bg-amber-500/15 px-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">{analysis.suggestions.length}</span>
            )}
          </Button>
        </div>

        {/* Contextual controls for the table or image under the cursor. */}
        {inTable && (
          <div className="flex flex-wrap items-center gap-1 border-t bg-muted/40 px-2 py-1.5 text-xs">
            <span className="mr-1 font-medium text-muted-foreground">Tabella:</span>
            <MiniButton onClick={() => editor?.chain().focus().addRowAfter().run()}>+ Riga</MiniButton>
            <MiniButton onClick={() => editor?.chain().focus().addColumnAfter().run()}>+ Colonna</MiniButton>
            <MiniButton onClick={() => editor?.chain().focus().deleteRow().run()}>− Riga</MiniButton>
            <MiniButton onClick={() => editor?.chain().focus().deleteColumn().run()}>− Colonna</MiniButton>
            <MiniButton onClick={() => editor?.chain().focus().toggleHeaderRow().run()}>Riga d’intestazione</MiniButton>
            <MiniButton danger onClick={() => editor?.chain().focus().deleteTable().run()}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Elimina tabella
            </MiniButton>
          </div>
        )}
        {onImage && (
          <div className="flex flex-wrap items-center gap-1 border-t bg-muted/40 px-2 py-1.5 text-xs">
            <span className="mr-1 font-medium text-muted-foreground">Immagine:</span>
            {(['full', 'medium', 'small'] as const).map((s) => (
              <MiniButton key={s} active={editor?.getAttributes('image').size === s} onClick={() => editor?.chain().focus().updateAttributes('image', { size: s }).run()}>
                {s === 'full' ? 'Piena' : s === 'medium' ? 'Media' : 'Piccola'}
              </MiniButton>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([a, Icon]) => (
              <MiniButton key={a} active={editor?.getAttributes('image').align === a} onClick={() => editor?.chain().focus().updateAttributes('image', { align: a }).run()} label={a === 'left' ? 'A sinistra' : a === 'right' ? 'A destra' : 'Al centro'}>
                <Icon className="h-3.5 w-3.5" />
              </MiniButton>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            <MiniButton onClick={openImageEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Testo alternativo e didascalia
            </MiniButton>
            <MiniButton danger onClick={() => editor?.chain().focus().deleteSelection().run()}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Elimina
            </MiniButton>
          </div>
        )}

        {showOutline && editor && (
          <div className="max-h-[50vh] overflow-y-auto border-t bg-muted/30 px-4 py-3 text-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Struttura dell’articolo</p>
            {analysis.outline.length === 0 ? (
              <p className="mt-2 text-muted-foreground">
                Nessun titolo ancora. Metti il cursore su una riga e scegli <strong>Titolo sezione</strong> nel primo menu (o Ctrl+Alt+2): diventa titolo solo quella riga.
              </p>
            ) : (
              <ol className="mt-2 space-y-0.5">
                {analysis.outline.map((h) => (
                  <li key={h.pos} style={{ paddingLeft: `${(h.level - 2) * 1.1}rem` }}>
                    <button type="button" onClick={() => focusBlock(editor, h.pos)} className="flex w-full items-baseline gap-2 rounded px-1.5 py-1 text-left hover:bg-muted">
                      <span className="w-6 shrink-0 font-mono text-[10px] text-muted-foreground">H{h.level}</span>
                      <span className={cn(h.level === 2 && 'font-semibold')}>{h.text || '(titolo vuoto)'}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {analysis.suggestions.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">Sembrano titoli</p>
                <p className="mt-1 text-xs text-muted-foreground">Righe brevi o tutte in grassetto, seguite da un paragrafo: forse sono titoli scritti come testo.</p>
                <ul className="mt-2 space-y-1">
                  {analysis.suggestions.map((s) => (
                    <li key={s.pos} className="flex flex-wrap items-center gap-2 rounded px-1.5 py-1 hover:bg-muted">
                      <button type="button" onClick={() => focusBlock(editor, s.pos)} className="min-w-0 flex-1 truncate text-left">
                        {s.text}
                      </button>
                      <MiniButton onClick={() => { focusBlock(editor, s.pos); setBlock(editor, 'h2'); }}>Titolo sezione</MiniButton>
                      <MiniButton onClick={() => { focusBlock(editor, s.pos); setBlock(editor, 'h3'); }}>Sottotitolo</MiniButton>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <EditorContent editor={editor} />
        {editor?.isEmpty && <div className="pointer-events-none absolute left-5 top-6 pr-6 text-muted-foreground md:left-14 md:top-8">{placeholder}</div>}
      </div>

      {/* Status: length, structure, uploads. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-b-lg border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {words.toLocaleString('it-IT')} parole · {minutes} min di lettura · {analysis.outline.length} titoli
        </span>
        {uploads.map((u, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            {u.name} {Math.round(u.pct)}%
          </span>
        ))}
        <span className="ml-auto hidden md:inline">Incolla da Docs, Word, ChatGPT o Markdown: titoli, grassetti ed elenchi vengono riconosciuti.</span>
      </div>

      <input type="hidden" name={name} value={value} />

      <style>{`
        .rte .rte-prose { min-height: 24rem; padding: 1.5rem 1.25rem 2.5rem; outline: none; font-size: 1.0625rem; line-height: 1.8; color: hsl(var(--foreground) / 0.85); }
        @media (min-width: 768px) { .rte .rte-prose { padding: 2rem 2.5rem 3rem 3.5rem; } }
        .rte .rte-prose > * + * { margin-top: 1.1rem; }
        .rte .rte-prose strong { font-weight: 600; color: hsl(var(--foreground)); }
        .rte .rte-prose h2, .rte .rte-prose h3, .rte .rte-prose h4 { position: relative; font-family: var(--font-display), var(--font-poppins), system-ui, sans-serif; color: hsl(var(--foreground)); }
        .rte .rte-prose h2 { font-size: 1.75rem; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; margin-top: 2.4rem; }
        .rte .rte-prose h3 { font-size: 1.35rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; margin-top: 1.9rem; }
        .rte .rte-prose h4 { font-size: 1.1rem; font-weight: 600; line-height: 1.35; margin-top: 1.5rem; }
        .rte .rte-prose > :first-child { margin-top: 0; }
        @media (min-width: 768px) {
          .rte .rte-prose h2::before, .rte .rte-prose h3::before, .rte .rte-prose h4::before {
            position: absolute; left: -2.6rem; top: 0.45em; padding: 2px 4px; border: 1px solid hsl(var(--border)); border-radius: 4px;
            font: 600 10px/1 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 0; color: hsl(var(--muted-foreground));
          }
          .rte .rte-prose h2::before { content: 'H2'; }
          .rte .rte-prose h3::before { content: 'H3'; }
          .rte .rte-prose h4::before { content: 'H4'; }
        }
        .rte .rte-prose ul { list-style: disc; padding-left: 1.5rem; }
        .rte .rte-prose ol { list-style: decimal; padding-left: 1.5rem; }
        .rte .rte-prose li::marker { color: hsl(var(--primary)); }
        .rte .rte-prose li + li { margin-top: 0.4rem; }
        .rte .rte-prose li > p { margin: 0; }
        .rte .rte-prose blockquote { border-left: 2px solid hsl(var(--primary)); padding-left: 1.25rem; font-size: 1.125rem; color: hsl(var(--foreground)); }
        .rte .rte-prose .rte-callout { border-radius: 1rem; padding: 1rem 1.25rem 1.1rem; border: 1px solid hsl(var(--primary) / 0.25); background: hsl(var(--primary) / 0.06); }
        .rte .rte-prose .rte-callout::before { content: 'Nota'; display: block; margin-bottom: 0.4rem; font: 600 10.5px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 0.14em; text-transform: uppercase; color: hsl(var(--primary)); }
        .rte .rte-prose .rte-callout[data-callout='tip'] { border-color: rgb(16 185 129 / 0.3); background: rgb(16 185 129 / 0.07); }
        .rte .rte-prose .rte-callout[data-callout='tip']::before { content: 'Consiglio'; color: rgb(4 120 87); }
        .rte .rte-prose .rte-callout[data-callout='warning'] { border-color: rgb(245 158 11 / 0.35); background: rgb(245 158 11 / 0.08); }
        .rte .rte-prose .rte-callout[data-callout='warning']::before { content: 'Attenzione'; color: rgb(180 83 9); }
        .rte .rte-prose .rte-callout > * + * { margin-top: 0.6rem; }
        .rte .rte-prose code { border-radius: 6px; background: hsl(var(--muted)); padding: 0.1em 0.35em; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 0.88em; color: hsl(var(--foreground)); }
        .rte .rte-prose pre { border-radius: 1rem; background: #0A1628; color: rgb(255 255 255 / 0.9); padding: 1rem 1.25rem; font-size: 0.875rem; line-height: 1.6; overflow-x: auto; }
        .rte .rte-prose pre code { background: none; padding: 0; color: inherit; font-size: inherit; }
        .rte .rte-prose a { color: hsl(var(--primary)); text-decoration: underline; text-decoration-color: hsl(var(--primary) / 0.35); text-underline-offset: 3px; }
        .rte .rte-prose hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2rem 0; }
        .rte .rte-prose img { max-width: 100%; height: auto; border-radius: 1rem; }
        .rte .rte-prose img[data-align='center'] { display: block; margin-left: auto; margin-right: auto; }
        .rte .rte-prose img[data-align='left'] { float: left; margin: 0.25rem 1.25rem 0.5rem 0; }
        .rte .rte-prose img[data-align='right'] { float: right; margin: 0.25rem 0 0.5rem 1.25rem; }
        .rte .rte-prose img[data-size='full'] { width: 100%; }
        .rte .rte-prose img[data-size='medium'] { width: 75%; }
        .rte .rte-prose img[data-size='small'] { width: 50%; }
        .rte .rte-prose .ProseMirror-selectednode { outline: 2px solid hsl(var(--primary)); outline-offset: 3px; }
        .rte .rte-prose table { border-collapse: collapse; width: 100%; table-layout: fixed; overflow: hidden; font-size: 0.95rem; line-height: 1.5; }
        .rte .rte-prose th, .rte .rte-prose td { position: relative; border: 1px solid hsl(var(--border)); padding: 8px 10px; vertical-align: top; }
        .rte .rte-prose th { background: hsl(var(--muted)); font-weight: 600; text-align: left; color: hsl(var(--foreground)); }
        .rte .rte-prose .selectedCell:after { background: hsl(var(--primary) / 0.1); content: ''; position: absolute; inset: 0; pointer-events: none; }
        .rte .rte-prose::after { content: ''; display: table; clear: both; }
      `}</style>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setImageFile(file);
          setImageUrl('');
          if (!imageAlt) setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '));
          e.target.value = '';
        }}
      />

      {/* Image: insert or edit */}
      <Dialog open={imageDialog !== null} onOpenChange={(open) => !open && setImageDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{imageDialog === 'edit' ? 'Modifica immagine' : 'Inserisci immagine'}</DialogTitle>
            <DialogDescription>Puoi anche trascinare un’immagine nel testo o incollarla (Ctrl+V): si carica da sola.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {imageDialog === 'insert' && (
              <>
                <div>
                  <Label className="text-sm font-medium">Carica un file</Label>
                  <div className="mt-1.5">
                    {imageFile ? (
                      <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                        <ImagePlus className="h-5 w-5 shrink-0 text-primary" />
                        <span className="flex-1 truncate text-sm">{imageFile.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setImageFile(null)}>
                          Cambia
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" className="h-20 w-full border-dashed" onClick={() => imageInputRef.current?.click()}>
                        <span className="text-center text-sm text-muted-foreground">
                          <ImagePlus className="mx-auto mb-1 h-6 w-6" />
                          Scegli un’immagine (max 10 MB)
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
                {!imageFile && (
                  <div>
                    <Label htmlFor="rte-image-url" className="text-sm font-medium">
                      Oppure l’indirizzo di un’immagine
                    </Label>
                    <Input id="rte-image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1.5" />
                  </div>
                )}
              </>
            )}
            <div>
              <Label htmlFor="rte-image-alt" className="text-sm font-medium">
                Testo alternativo
              </Label>
              <Input id="rte-image-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Cosa mostra l’immagine (per Google e per chi non vede)" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="rte-image-caption" className="text-sm font-medium">
                Didascalia (facoltativa)
              </Label>
              <Input id="rte-image-caption" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} placeholder="Il testo sotto l’immagine" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Dimensione</Label>
                <Select value={imageSize} onValueChange={(v) => setImageSize(v as 'full' | 'medium' | 'small')}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Larghezza piena</SelectItem>
                    <SelectItem value="medium">Media (75%)</SelectItem>
                    <SelectItem value="small">Piccola (50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Allineamento</Label>
                <Select value={imageAlign} onValueChange={(v) => setImageAlign(v as 'center' | 'left' | 'right')}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Al centro</SelectItem>
                    <SelectItem value="left">A sinistra</SelectItem>
                    <SelectItem value="right">A destra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImageDialog(null)}>
              Annulla
            </Button>
            <Button type="button" onClick={confirmImage} disabled={(!imageFile && !imageUrl.trim()) || imageBusy}>
              {imageBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento…
                </>
              ) : imageDialog === 'edit' ? (
                'Salva'
              ) : (
                'Inserisci'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link</DialogTitle>
            <DialogDescription>I link al sito si aprono nella stessa scheda, quelli esterni in una nuova.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="rte-link-url">Indirizzo</Label>
              <Input
                id="rte-link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmLink();
                  }
                }}
                placeholder="https://... oppure /it/servizi"
                className="mt-1.5"
                autoFocus
              />
            </div>
            {editor?.state.selection.empty && !editor?.isActive('link') && (
              <div>
                <Label htmlFor="rte-link-text">Testo del link</Label>
                <Input id="rte-link-text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Il testo cliccabile" className="mt-1.5" />
              </div>
            )}
          </div>
          <DialogFooter>
            {editor?.isActive('link') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  setLinkDialog(false);
                }}
              >
                Rimuovi link
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setLinkDialog(false)}>
              Annulla
            </Button>
            <Button type="button" onClick={confirmLink} disabled={!linkUrl.trim()}>
              Applica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Dialog open={tableDialog} onOpenChange={setTableDialog}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Inserisci tabella</DialogTitle>
            <DialogDescription>La prima riga è l’intestazione. Righe e colonne si aggiungono anche dopo.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label htmlFor="rte-table-rows">Righe</Label>
              <Input id="rte-table-rows" type="number" min={2} max={30} value={tableRows} onChange={(e) => setTableRows(Math.min(30, Math.max(2, parseInt(e.target.value) || 3)))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="rte-table-cols">Colonne</Label>
              <Input id="rte-table-cols" type="number" min={1} max={8} value={tableCols} onChange={(e) => setTableCols(Math.min(8, Math.max(1, parseInt(e.target.value) || 3)))} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTableDialog(false)}>
              Annulla
            </Button>
            <Button
              type="button"
              onClick={() => {
                editor?.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
                setTableDialog(false);
              }}
            >
              Inserisci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Tool({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn('h-8 w-8 p-0', active && 'bg-primary/15 text-primary')}
    >
      {children}
    </Button>
  );
}

function MiniButton({
  onClick,
  active,
  danger,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex h-7 items-center rounded-md px-2 font-medium transition-colors hover:bg-background',
        active && 'bg-background text-primary ring-1 ring-border',
        danger && 'text-destructive',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}
