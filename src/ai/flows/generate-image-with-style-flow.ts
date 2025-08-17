
'use server';

/**
 * @fileOverview An AI flow to generate an image based on a prompt, a style, and an optional reference image.
 *
 * - generateImageWithStyle - A function that orchestrates the image generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateImageWithStyleInput, GenerateImageWithStyleOutput } from '@/lib/types';

export async function generateImageWithStyle(input: GenerateImageWithStyleInput): Promise<GenerateImageWithStyleOutput> {
  const promptParts: any[] = [];
  
  // If a reference image is provided, instruct the AI to transform it.
  if (input.referenceImageDataUri) {
      promptParts.push({ media: { url: input.referenceImageDataUri } });
      // The text prompt should guide the transformation of the existing image.
      const imageGuidance = input.prompt ? ` The user has provided this additional guidance for the transformation: "${input.prompt}".` : '';
      promptParts.push({ text: `Transform the provided image using the following style: ${input.styleBackendPrompt}.${imageGuidance}` });
  } else {
      // If no image is provided, the prompt is a direct text-to-image request.
      promptParts.push({ text: `${input.prompt}, ${input.styleBackendPrompt}` });
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
