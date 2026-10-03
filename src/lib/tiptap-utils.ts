/**
 * Small helpers for stored rich text (Tiptap JSON): plain text, word count,
 * reading time. Dependency-free on purpose: the public blog pages use them
 * for reading time, and must not load the editor to do it. Cleaning a
 * document lives in blog-content.ts.
 */

// Normalize JSON saved by older editor versions to valid TipTap/ProseMirror JSON.
// Handles two legacy quirks from the previous custom contentEditable editor:
//   1. Wrapper text nodes like { type: 'text', content: [...] } (no `text`).
//   2. Empty text nodes { type: 'text', text: '' }, which ProseMirror rejects.
// Exported so the editor can sanitise content before calling setContent().
export function normalizeTiptapJson(node: any): any {
  if (!node || typeof node !== 'object') return node;

  // A text node with content (wrapper from old inline mark handling) — flatten it
  if (node.type === 'text' && node.content && Array.isArray(node.content) && !node.text) {
    return node.content.map((c: any) => normalizeTiptapJson(c)).flat();
  }

  // Drop invalid empty text nodes (ProseMirror throws on zero-length text).
  if (node.type === 'text' && (node.text === undefined || node.text === '')) {
    return [];
  }

  // Recursively normalize children
  if (node.content && Array.isArray(node.content)) {
    const newContent: any[] = [];
    for (const child of node.content) {
      const normalized = normalizeTiptapJson(child);
      if (Array.isArray(normalized)) {
        newContent.push(...normalized);
      } else if (normalized) {
        newContent.push(normalized);
      }
    }
    node.content = newContent;
  }

  return node;
}

export function tiptapJsonToPlainText(json: string | object): string {
  try {
    const content = typeof json === 'string' ? JSON.parse(json) : json;
    
    function extractText(node: any): string {
      if (node.type === 'text') {
        return node.text || '';
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      
      return '';
    }
    
    const text = extractText(content);
    return text.trim();
  } catch (error) {
    console.error('Error converting Tiptap JSON to plain text:', error);
    return '';
  }
}

export function generateExcerpt(json: string | object, maxLength: number = 160): string {
  const plainText = tiptapJsonToPlainText(json);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}

export function countWords(json: string | object): number {
  const plainText = tiptapJsonToPlainText(json);
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function estimateReadingTime(json: string | object, wordsPerMinute: number = 200): number {
  const wordCount = countWords(json);
  return Math.ceil(wordCount / wordsPerMinute);
}

export function validateTiptapJson(json: string | object): boolean {
  try {
    const content = typeof json === 'string' ? JSON.parse(json) : json;
    
    if (!content || typeof content !== 'object') {
      return false;
    }
    
    if (content.type !== 'doc') {
      return false;
    }
    
    if (!Array.isArray(content.content)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
