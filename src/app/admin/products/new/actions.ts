
'use server';

import { generateProductImagesFlow } from '@/ai/flows/generate-product-images-flow';
import type { GenerateProductImagesOutput } from '@/ai/flows/generate-product-images-flow';

export async function generateProductImages(input: {
  productName: string;
  productDescription: string;
  imageDataUri: string;
}): Promise<{ images?: GenerateProductImagesOutput, error?: string }> {
  try {
    const result = await generateProductImagesFlow(input);
    return { images: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `AI image generation failed: ${errorMessage}` };
  }
}

    
