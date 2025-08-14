
'use server';

/**
 * @fileOverview An AI flow to generate an image based on a prompt, a style, and an optional reference image.
 *
 * - generateImageWithStyle - A function that orchestrates the image generation.
 * - GenerateImageWithStyleInput - The input type for the flow.
 * - GenerateImageWithStyleOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageWithStyleInputSchema = z.object({
  prompt: z.string().describe('The user\'s description of the image they want.'),
  styleBackendPrompt: z.string().describe('A pre-defined string of keywords and phrases that define the artistic style.'),
  referenceImageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional reference photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageWithStyleInput = z.infer<typeof GenerateImageWithStyleInputSchema>;

const GenerateImageWithStyleOutputSchema = z.object({
  imageUrl: z.string().describe('URL of the generated 8K quality image.'),
});
export type GenerateImageWithStyleOutput = z.infer<typeof GenerateImageWithStyleOutputSchema>;

export async function generateImageWithStyle(input: GenerateImageWithStyleInput): Promise<GenerateImageWithStyleOutput> {
  return generateImageWithStyleFlow(input);
}


const generateImageWithStyleFlow = ai.defineFlow(
  {
    name: 'generateImageWithStyleFlow',
    inputSchema: GenerateImageWithStyleInputSchema,
    outputSchema: GenerateImageWithStyleOutputSchema,
  },
  async (input) => {
    const promptParts = [];
    
    if (input.referenceImageDataUri) {
        promptParts.push({ media: { url: input.referenceImageDataUri } });
        if (!input.prompt.trim()) {
            promptParts.push({ text: `Transform this image using the following style: 8k resolution, highly detailed${input.styleBackendPrompt}` });
        } else {
             promptParts.push({ text: `${input.prompt}, 8k resolution, highly detailed${input.styleBackendPrompt}` });
        }
    } else {
         promptParts.push({ text: `${input.prompt}, 8k resolution, highly detailed${input.styleBackendPrompt}` });
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptParts,
      config: {
          responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a valid image URL.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
