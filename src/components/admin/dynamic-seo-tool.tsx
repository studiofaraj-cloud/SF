'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  generateDynamicSEO,
  type GenerateDynamicSEOInput,
  type GenerateDynamicSEOOutput,
} from '@/ai/flows/generate-dynamic-seo';
import { useToast } from '@/hooks/use-toast';

type DynamicSEOToolProps = {
  contentTitle: string;
  contentBody: string;
  contentType: 'blog' | 'project';
};

export function DynamicSEOTool({ contentTitle, contentBody, contentType }: DynamicSEOToolProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateDynamicSEOOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!contentTitle || !contentBody) {
      toast({
        variant: 'destructive',
        title: 'Content Missing',
        description: 'Please provide a title and content before generating SEO data.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const input: GenerateDynamicSEOInput = { contentTitle, contentBody, contentType };
      const seoData = await generateDynamicSEO(input);
      setResult(seoData);
    } catch (error) {
      console.error('Failed to generate SEO data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating SEO data.';
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage.includes('not configured') 
          ? 'AI SEO generation is not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.'
          : 'An error occurred while generating SEO data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Dynamic SEO Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate SEO Data'
          )}
        </Button>
        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="seo-title">Generated SEO Title</Label>
              <Input id="seo-title" value={result.title} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description">Generated Meta Description</Label>
              <Textarea id="seo-description" value={result.description} readOnly />
            </div>
             <div className="space-y-2">
              <Label htmlFor="seo-og">Generated OG Tags</Label>
              <Textarea id="seo-og" value={result.ogTags} readOnly rows={5} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="seo-canonical">Generated Canonical Link</Label>
              <Input id="seo-canonical" value={result.canonicalLink} readOnly />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
