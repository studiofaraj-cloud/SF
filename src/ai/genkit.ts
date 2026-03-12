import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Only initialize Genkit if API key is available
// Wrap in try-catch to handle cases where API key is missing
let ai: ReturnType<typeof genkit> | null = null;

try {
  const hasApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (hasApiKey) {
    try {
      ai = genkit({
        plugins: [googleAI()],
        model: 'googleai/gemini-2.5-flash',
      });
    } catch (pluginError) {
      // googleAI() plugin initialization failed
      console.warn('Genkit Google AI plugin not initialized:', pluginError instanceof Error ? pluginError.message : 'Unknown error');
      ai = null;
    }
  }
} catch (error) {
  // Genkit initialization failed
  console.warn('Genkit AI not initialized:', error instanceof Error ? error.message : 'Unknown error');
  ai = null;
}

export { ai };
