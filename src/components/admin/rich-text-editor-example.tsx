'use client';

import { useState } from 'react';
import { RichTextEditor } from './rich-text-editor';
import { RichTextViewer } from './rich-text-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RichTextEditorExample() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');

  const handleSave = () => {
    setSavedContent(content);
    alert('Content saved!');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="json">JSON Output</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Try out the rich text editor..."
              />
              <Button onClick={handleSave}>Save Content</Button>
            </TabsContent>
            
            <TabsContent value="preview">
              {content ? (
                <RichTextViewer content={content} />
              ) : (
                <div className="text-muted-foreground p-4 text-center border rounded-md">
                  No content to preview. Start typing in the editor!
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="json">
              <pre className="p-4 bg-secondary rounded-md overflow-auto max-h-[500px]">
                <code>{content || 'No content yet'}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {savedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Content (Read-Only View)</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextViewer content={savedContent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
