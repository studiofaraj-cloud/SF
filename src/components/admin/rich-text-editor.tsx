'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  ImagePlus,
  Link as LinkIcon,
  Minus,
  Loader2,
  Table2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { normalizeTiptapJson } from '@/lib/tiptap-utils';

// Re-export so existing callers (SEO tool, forms) keep working with no import changes.
export { tiptapJsonToPlainText as jsonContentToPlainText } from '@/lib/tiptap-utils';

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}';

/**
 * Image node extended with `size` (full | medium | small) and `align`
 * (center | left | right) attributes. These are serialised into the Tiptap
 * JSON exactly as the public renderer (`rich-content-renderer.tsx`) reads them,
 * and mirrored to `data-*` attributes so the editor can style them via CSS.
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

function parseInitialContent(value: string): object {
  try {
    const json = JSON.parse(value && value.trim() ? value : EMPTY_DOC);
    return normalizeTiptapJson(json);
  } catch {
    return JSON.parse(EMPTY_DOC);
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Inizia a scrivere...',
  className,
  name,
}: RichTextEditorProps) {
  // Force a re-render on editor transactions so the toolbar reflects active state.
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  // Guards the external-value sync effect against our own onChange updates.
  const isInternalUpdate = useRef(false);

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageSize, setImageSize] = useState<'full' | 'medium' | 'small'>('full');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageCaption, setImageCaption] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      CustomImage.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: parseInitialContent(value),
    editorProps: {
      attributes: {
        class:
          'max-w-none min-h-[20rem] px-4 py-3 focus:outline-none text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(JSON.stringify(editor.getJSON()));
    },
    onTransaction: () => forceUpdate(),
  });

  // Keep the editor in sync when `value` changes from OUTSIDE the editor
  // (e.g. an edit form fetching a project asynchronously). Skips updates that
  // originate from our own onUpdate to avoid cursor jumps / feedback loops.
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const incoming = value && value.trim() ? value : EMPTY_DOC;
    const current = JSON.stringify(editor.getJSON());
    if (incoming !== current) {
      try {
        editor.commands.setContent(parseInitialContent(incoming), {
          emitUpdate: false,
        });
      } catch {
        /* ignore malformed external content */
      }
    }
  }, [value, editor]);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      if (!imageAlt) {
        setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const resetImageDialog = () => {
    setShowImageDialog(false);
    setImageFile(null);
    setImageUrl('');
    setImageAlt('');
    setImageSize('full');
    setImageAlign('center');
    setImageCaption('');
    setUploadProgress(0);
  };

  const handleImageInsert = async () => {
    if (!editor || (!imageFile && !imageUrl)) return;

    let finalUrl = imageUrl;

    if (imageFile) {
      setIsUploadingImage(true);
      setUploadProgress(0);
      try {
        const timestamp = Date.now();
        const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${sanitizedFileName}`;
        const storageRef = ref(storage, `images/content/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        finalUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              setUploadProgress(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
            },
            (error) => reject(error),
            async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
          );
        });
      } catch (error) {
        console.error('Image upload error:', error);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    if (finalUrl) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: {
            src: finalUrl,
            alt: imageAlt || '',
            title: imageCaption || '',
            size: imageSize,
            align: imageAlign,
          },
        })
        .run();
    }

    resetImageDialog();
  };

  const handleInsertLink = () => {
    if (!editor || !linkUrl) return;
    const chain = editor.chain().focus();

    if (editor.state.selection.empty && linkText) {
      chain
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [{ type: 'link', attrs: { href: linkUrl, target: '_blank' } }],
        })
        .run();
    } else {
      chain
        .extendMarkRange('link')
        .setLink({ href: linkUrl, target: '_blank' })
        .run();
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleInsertTable = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({
        rows: Math.max(2, tableRows),
        cols: Math.max(1, tableCols),
        withHeaderRow: true,
      })
      .run();
    setShowTableDialog(false);
  };

  return (
    <div className={cn('rounded-md border', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          title="Grassetto"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          title="Corsivo"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive('underline')}
          title="Sottolineato"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor?.isActive('heading', { level: 1 })}
          title="Titolo 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
          title="Titolo 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
          title="Titolo 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
          title="Elenco puntato"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
          title="Elenco numerato"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive('blockquote')}
          title="Citazione"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="Linea separatrice"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const previous = editor?.getAttributes('link').href as string | undefined;
            setLinkUrl(previous || '');
            setLinkText('');
            setShowLinkDialog(true);
          }}
          active={editor?.isActive('link')}
          title="Inserisci link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          className="h-8 gap-1.5 px-2 text-primary hover:text-primary"
          title="Inserisci immagine nel contenuto"
        >
          <ImagePlus className="h-4 w-4" />
          <span className="hidden text-xs font-medium sm:inline">Immagine</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTableDialog(true)}
          className="h-8 gap-1.5 px-2 text-primary hover:text-primary"
          title="Inserisci tabella"
        >
          <Table2 className="h-4 w-4" />
          <span className="hidden text-xs font-medium sm:inline">Tabella</span>
        </Button>

        <Divider />

        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          title="Annulla"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          title="Ripeti"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="relative rte-content">
        <EditorContent editor={editor} />
        {editor?.isEmpty && (
          <div className="pointer-events-none absolute left-4 top-3 text-muted-foreground">
            {placeholder}
          </div>
        )}
      </div>

      <input type="hidden" name={name} value={value} />

      <style>{`
        .rte-content .ProseMirror { line-height: 1.7; }
        .rte-content .ProseMirror > * + * { margin-top: 0.75em; }
        .rte-content .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin-top: 1em; }
        .rte-content .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; line-height: 1.25; margin-top: 1em; }
        .rte-content .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; margin-top: 1em; }
        .rte-content .ProseMirror p { margin: 0; }
        .rte-content .ProseMirror ul { list-style: disc; padding-left: 1.5rem; }
        .rte-content .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
        .rte-content .ProseMirror li { margin: 0.25em 0; }
        .rte-content .ProseMirror li > p { margin: 0; }
        .rte-content .ProseMirror blockquote { border-left: 3px solid hsl(var(--primary) / 0.5); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; }
        .rte-content .ProseMirror a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .rte-content .ProseMirror hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 1.5em 0; }
        .rte-content .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .rte-content .ProseMirror img[data-align='center'] { display: block; margin-left: auto; margin-right: auto; }
        .rte-content .ProseMirror img[data-align='left'] { float: left; margin: 0.25rem 1rem 0.5rem 0; }
        .rte-content .ProseMirror img[data-align='right'] { float: right; margin: 0.25rem 0 0.5rem 1rem; }
        .rte-content .ProseMirror img[data-size='full'] { width: 100%; }
        .rte-content .ProseMirror img[data-size='medium'] { width: 75%; }
        .rte-content .ProseMirror img[data-size='small'] { width: 50%; }
        .rte-content .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.5em 0; table-layout: fixed; overflow: hidden; }
        .rte-content .ProseMirror th, .rte-content .ProseMirror td { border: 1px solid hsl(var(--border)); padding: 6px 10px; vertical-align: top; }
        .rte-content .ProseMirror th { background: hsl(var(--muted)); font-weight: 600; text-align: left; }
        .rte-content .ProseMirror .selectedCell:after { background: hsl(var(--primary) / 0.1); content: ''; position: absolute; inset: 0; pointer-events: none; }
        .rte-content .ProseMirror:focus { outline: none; }
      `}</style>

      {/* Hidden file input for image uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />

      {/* Image Insert Dialog */}
      <Dialog
        open={showImageDialog}
        onOpenChange={(open) => (open ? setShowImageDialog(true) : resetImageDialog())}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Inserisci Immagine</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Carica Immagine</Label>
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
                    <Button
                      type="button"
                      variant="outline"
                      className="h-20 w-full border-dashed"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <ImagePlus className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Clicca per caricare</span>
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              {!imageFile && (
                <div>
                  <Label htmlFor="image-url" className="text-sm font-medium">Oppure incolla URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="image-alt" className="text-sm font-medium">Testo alternativo</Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Descrizione dell'immagine..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="image-caption" className="text-sm font-medium">Didascalia (opzionale)</Label>
              <Input
                id="image-caption"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Didascalia sotto l'immagine..."
                className="mt-1.5"
              />
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
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="left">Sinistra</SelectItem>
                    <SelectItem value="right">Destra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isUploadingImage && (
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetImageDialog}>
              Annulla
            </Button>
            <Button
              type="button"
              onClick={handleImageInsert}
              disabled={(!imageFile && !imageUrl) || isUploadingImage}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : (
                'Inserisci'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Insert Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inserisci Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="link-text">Testo (opzionale, usa selezione se vuota)</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Testo del link..."
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            {editor?.isActive('link') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
              >
                Rimuovi link
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
              Annulla
            </Button>
            <Button type="button" onClick={handleInsertLink} disabled={!linkUrl}>
              Inserisci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Insert Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Inserisci Tabella</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="table-rows">Righe</Label>
              <Input
                id="table-rows"
                type="number"
                min={2}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(2, parseInt(e.target.value) || 3))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="table-cols">Colonne</Label>
              <Input
                id="table-cols"
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 3))}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowTableDialog(false)}>
              Annulla
            </Button>
            <Button type="button" onClick={handleInsertTable}>
              Inserisci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn('h-8 w-8 p-0', active && 'bg-primary/15 text-primary')}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}
