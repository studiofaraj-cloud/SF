'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic SEO metadata (title, description, OG tags) for blog posts and projects.
 *
 * - generateDynamicSEO - A function that generates SEO metadata.
 * - GenerateDynamicSEOInput - The input type for the generateDynamicSEO function.
 * - GenerateDynamicSEOOutput - The return type for the generateDynamicSEO function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDynamicSEOInputSchema = z.object({
  contentTitle: z.string().describe('The title of the content (blog post or project).'),
  contentBody: z.string().describe('The main content of the blog post or project.'),
  contentType: z.enum(['blog', 'project']).describe('The type of content (blog or project).'),
});

export type GenerateDynamicSEOInput = z.infer<typeof GenerateDynamicSEOInputSchema>;

const GenerateDynamicSEOOutputSchema = z.object({
  title: z.string().describe('The SEO title for the content.'),
  description: z.string().describe('The SEO description for the content.'),
  ogTags: z.string().describe('The Open Graph (OG) tags for the content.'),
  canonicalLink: z.string().describe('The canonical link for the content.'),
});

export type GenerateDynamicSEOOutput = z.infer<typeof GenerateDynamicSEOOutputSchema>;

export async function generateDynamicSEO(input: GenerateDynamicSEOInput): Promise<GenerateDynamicSEOOutput> {
  if (!ai) {
    throw new Error('Genkit AI is not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.');
  }
  return generateDynamicSEOFlow(input);
}

const prompt = ai
  ? ai.definePrompt({
      name: 'generateDynamicSEOPrompt',
      input: {schema: GenerateDynamicSEOInputSchema},
      output: {schema: GenerateDynamicSEOOutputSchema},
      prompt: `You are an SEO expert. Generate SEO metadata for the following content.

Content Type: {{contentType}}
Title: {{contentTitle}}
Body: {{contentBody}}

Generate:
- SEO title
- SEO description
- Open Graph (OG) tags
- Canonical link

Make sure title and descriptions are engaging and optimized for search engines.
Omit any explanations, just provide the generated content.

Ensure the output conforms to the schema descriptions, with the expected types.`,
    })
  : null;

const generateDynamicSEOFlow = ai && prompt
  ? ai.defineFlow(
      {
        name: 'generateDynamicSEOFlow',
        inputSchema: GenerateDynamicSEOInputSchema,
        outputSchema: GenerateDynamicSEOOutputSchema,
      },
      async input => {
        const {output} = await prompt(input);
        return output!;
      }
    )
  : null;
