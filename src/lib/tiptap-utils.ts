import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';

export function tiptapJsonToHtml(json: string | object): string {
  try {
    const content = typeof json === 'string' ? JSON.parse(json) : json;
    
    const html = generateHTML(content, [
      StarterKit,
      Underline,
      Link,
      Image,
    ]);
    
    return html;
  } catch (error) {
    console.error('Error converting Tiptap JSON to HTML:', error);
    return '';
  }
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
