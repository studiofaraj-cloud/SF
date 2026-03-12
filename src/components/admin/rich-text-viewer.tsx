'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

type RichTextViewerProps = {
  content: string;
  className?: string;
};

export function RichTextViewer({ content, className = '' }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      try {
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        editor.commands.setContent(parsedContent);
      } catch (error) {
        console.error('Error parsing content:', error);
      }
    }
  }, [content, editor]);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
