'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

export type JSONContent = {
  type: string;
  content?: JSONContent[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, any> }[];
  attrs?: Record<string, any>;
};

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
  placeholder = 'Start writing...',
  className,
  name
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageSize, setImageSize] = useState<'full' | 'medium' | 'small'>('full');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageCaption, setImageCaption] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Initialize editor content from JSON
  useEffect(() => {
    if (editorRef.current && value) {
      try {
        const json = JSON.parse(value);
        editorRef.current.innerHTML = jsonToHtml(json);
      } catch {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value;
        }
      }
    }
  }, []);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const json = htmlToJson(html);
      const jsonString = JSON.stringify(json);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(jsonString);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      onChange(jsonString);
    }
  }, [onChange, history, historyIndex]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
    editorRef.current?.focus();
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      onChange(content);
      if (editorRef.current) {
        try {
          const json = JSON.parse(content);
          editorRef.current.innerHTML = jsonToHtml(json);
        } catch {
          editorRef.current.innerHTML = content;
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      onChange(content);
      if (editorRef.current) {
        try {
          const json = JSON.parse(content);
          editorRef.current.innerHTML = jsonToHtml(json);
        } catch {
          editorRef.current.innerHTML = content;
        }
      }
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile && !imageUrl) return;

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
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } catch (error) {
        console.error('Image upload error:', error);
        setIsUploadingImage(false);
        return;
      }

      setIsUploadingImage(false);
    }

    if (finalUrl && editorRef.current) {
      // Build a custom image block with data attributes for size/align
      const imgHtml = `<div class="editor-image-block" data-size="${imageSize}" data-align="${imageAlign}" contenteditable="false">` +
        `<img src="${finalUrl}" alt="${imageAlt || ''}" title="${imageCaption || ''}" data-size="${imageSize}" data-align="${imageAlign}" />` +
        (imageCaption ? `<p class="image-caption">${imageCaption}</p>` : '') +
        `</div><p><br></p>`;

      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      updateContent();
    }

    // Reset dialog state
    setShowImageDialog(false);
    setImageFile(null);
    setImageUrl('');
    setImageAlt('');
    setImageSize('full');
    setImageAlign('center');
    setImageCaption('');
    setUploadProgress(0);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;

    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        document.execCommand('createLink', false, linkUrl);
      } else if (linkText) {
        const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        document.execCommand('insertHTML', false, html);
      }
      updateContent();
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

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

  return (
    <div className={cn('border rounded-md', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        {/* Text formatting */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('bold')} className="h-8 w-8 p-0" title="Grassetto">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('italic')} className="h-8 w-8 p-0" title="Corsivo">
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'h1')} className="h-8 w-8 p-0" title="Titolo 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'h2')} className="h-8 w-8 p-0" title="Titolo 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'h3')} className="h-8 w-8 p-0" title="Titolo 3">
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')} className="h-8 w-8 p-0" title="Elenco puntato">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertOrderedList')} className="h-8 w-8 p-0" title="Elenco numerato">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'blockquote')} className="h-8 w-8 p-0" title="Citazione">
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Horizontal rule */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertHorizontalRule')} className="h-8 w-8 p-0" title="Linea separatrice">
          <Minus className="h-4 w-4" />
        </Button>

        {/* Link */}
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkDialog(true)} className="h-8 w-8 p-0" title="Inserisci link">
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Image */}
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowImageDialog(true)} className="h-8 px-2 gap-1.5 text-primary hover:text-primary" title="Inserisci immagine nel contenuto">
          <ImagePlus className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Immagine</span>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button type="button" variant="ghost" size="sm" onClick={undo} disabled={historyIndex === 0} className="h-8 w-8 p-0" title="Annulla">
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={redo} disabled={historyIndex === history.length - 1} className="h-8 w-8 p-0" title="Ripeti">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onBlur={updateContent}
        className="prose prose-sm max-w-none p-4 min-h-[20rem] focus:outline-none [&_img]:max-w-full [&_img]:rounded-lg [&_.editor-image-block]:my-4 [&_.editor-image-block]:relative [&_.editor-image-block[data-align='center']]:mx-auto [&_.editor-image-block[data-align='left']]:mr-auto [&_.editor-image-block[data-align='right']]:ml-auto [&_.editor-image-block[data-size='full']]:w-full [&_.editor-image-block[data-size='medium']]:w-3/4 [&_.editor-image-block[data-size='small']]:w-1/2 [&_.image-caption]:text-sm [&_.image-caption]:text-center [&_.image-caption]:text-muted-foreground [&_.image-caption]:mt-2 [&_.image-caption]:italic"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <input type="hidden" name={name} value={value} />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          position: absolute;
        }
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
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Inserisci Immagine</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Upload or URL */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Carica Immagine</Label>
                <div className="mt-1.5">
                  {imageFile ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <ImagePlus className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm truncate flex-1">{imageFile.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setImageFile(null)}>
                        Cambia
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-20 border-dashed"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <ImagePlus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
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

            {/* Alt text */}
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

            {/* Caption */}
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

            {/* Size & Alignment */}
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

            {/* Upload progress */}
            {isUploadingImage && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowImageDialog(false)}>
              Annulla
            </Button>
            <Button
              type="button"
              onClick={handleImageUpload}
              disabled={(!imageFile && !imageUrl) || isUploadingImage}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
              Annulla
            </Button>
            <Button type="button" onClick={handleInsertLink} disabled={!linkUrl}>
              Inserisci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions to convert between HTML and JSON structure
function htmlToJson(html: string): JSONContent {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return nodeToJson(doc.body);
}

function nodeToJson(node: Node): JSONContent {
  if (node.nodeType === Node.TEXT_NODE) {
    return {
      type: 'text',
      text: node.textContent || ''
    };
  }

  const element = node as HTMLElement;
  const tagName = element.tagName?.toLowerCase();

  // Handle image blocks
  if (tagName === 'div' && element.classList.contains('editor-image-block')) {
    const img = element.querySelector('img');
    const caption = element.querySelector('.image-caption');
    if (img) {
      return {
        type: 'image',
        attrs: {
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || caption?.textContent || '',
          size: element.getAttribute('data-size') || img.getAttribute('data-size') || 'full',
          align: element.getAttribute('data-align') || img.getAttribute('data-align') || 'center',
        }
      };
    }
  }

  // Handle standalone images
  if (tagName === 'img') {
    return {
      type: 'image',
      attrs: {
        src: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        title: element.getAttribute('title') || '',
        size: element.getAttribute('data-size') || 'full',
        align: element.getAttribute('data-align') || 'center',
      }
    };
  }

  const content: JSONContent = {
    type: tagNameToType(tagName)
  };

  // Handle heading levels
  if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
    content.attrs = { level: parseInt(tagName.charAt(1)) };
  }

  // Handle marks (bold, italic, etc.)
  const marks: { type: string; attrs?: Record<string, any> }[] = [];
  if (tagName === 'strong' || tagName === 'b') marks.push({ type: 'bold' });
  if (tagName === 'em' || tagName === 'i') marks.push({ type: 'italic' });
  if (tagName === 'a') {
    marks.push({
      type: 'link',
      attrs: {
        href: element.getAttribute('href') || '',
        target: element.getAttribute('target') || '_blank'
      }
    });
  }

  // Process children
  const children: JSONContent[] = [];
  node.childNodes.forEach(child => {
    const childJson = nodeToJson(child);
    if (childJson.type === 'image') {
      children.push(childJson);
    } else if (childJson.text || childJson.content) {
      if (marks.length > 0 && childJson.type === 'text') {
        childJson.marks = marks;
      }
      children.push(childJson);
    }
  });

  if (children.length > 0) {
    content.content = children;
  }

  return content;
}

function tagNameToType(tagName: string): string {
  const typeMap: Record<string, string> = {
    'p': 'paragraph',
    'h1': 'heading',
    'h2': 'heading',
    'h3': 'heading',
    'ul': 'bulletList',
    'ol': 'orderedList',
    'li': 'listItem',
    'blockquote': 'blockquote',
    'strong': 'text',
    'b': 'text',
    'em': 'text',
    'i': 'text',
    'a': 'text',
    'br': 'hardBreak',
    'hr': 'horizontalRule',
    'body': 'doc'
  };
  return typeMap[tagName] || 'paragraph';
}

function jsonToHtml(json: JSONContent): string {
  if (json.type === 'text') {
    let text = json.text || '';
    if (json.marks) {
      json.marks.forEach(mark => {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
        if (mark.type === 'italic') text = `<em>${text}</em>`;
        if (mark.type === 'link') text = `<a href="${mark.attrs?.href || '#'}" target="${mark.attrs?.target || '_blank'}" rel="noopener noreferrer">${text}</a>`;
      });
    }
    return text;
  }

  if (json.type === 'image') {
    const src = json.attrs?.src || '';
    const alt = json.attrs?.alt || '';
    const title = json.attrs?.title || '';
    const size = json.attrs?.size || 'full';
    const align = json.attrs?.align || 'center';
    return `<div class="editor-image-block" data-size="${size}" data-align="${align}" contenteditable="false">` +
      `<img src="${src}" alt="${alt}" title="${title}" data-size="${size}" data-align="${align}" />` +
      (title ? `<p class="image-caption">${title}</p>` : '') +
      `</div>`;
  }

  if (json.type === 'horizontalRule') {
    return '<hr>';
  }

  if (json.type === 'hardBreak') {
    return '<br>';
  }

  const children = json.content?.map(child => jsonToHtml(child)).join('') || '';

  const typeToTag: Record<string, string> = {
    'doc': 'div',
    'paragraph': 'p',
    'heading': `h${json.attrs?.level || 2}`,
    'bulletList': 'ul',
    'orderedList': 'ol',
    'listItem': 'li',
    'blockquote': 'blockquote',
  };

  const tag = typeToTag[json.type] || 'p';
  return `<${tag}>${children}</${tag}>`;
}

export function jsonContentToPlainText(jsonString: string): string {
  try {
    const json = JSON.parse(jsonString);
    return extractText(json);
  } catch {
    return jsonString;
  }
}

function extractText(node: JSONContent): string {
  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.content) {
    return node.content.map(child => extractText(child)).join(' ');
  }

  return '';
}
