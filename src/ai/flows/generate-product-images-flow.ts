
'use server';

/**
 * @fileOverview An AI flow to generate different views of a product from a single image.
 *
 * - generateProductImagesFlow - A function that takes a single product image and generates other views.
 * - GenerateProductImagesInput - The input type for the flow.
 * - GenerateProductImagesOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateProductImagesInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().optional().describe('A description of the product.'),
  imageDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateProductImagesInput = z.infer<typeof GenerateProductImagesInputSchema>;

const GenerateProductImagesOutputSchema = z.object({
  back: z.string().optional().describe('URL of the back view of the product image.'),
  left: z.string().optional().describe('URL of the left side view of the product image.'),
  right: z.string().optional().describe('URL of the right side view of the product image.'),
});
export type GenerateProductImagesOutput = z.infer<typeof GenerateProductImagesOutputSchema>;


const generateImageView = async (
  input: GenerateProductImagesInput,
  view: 'back' | 'left' | 'right'
) => {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: [
      { media: { url: input.imageDataUri } },
      { text: `The user has provided an image of a product named "${input.productName}". Generate a realistic image of the ${view} view of the same product. The product has the following description: "${input.productDescription}". Maintain a consistent style, background, and lighting.` },
    ],
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
  });
  return media?.url;
};

export const generateProductImagesFlow = ai.defineFlow(
  {
    name: 'generateProductImagesFlow',
    inputSchema: GenerateProductImagesInputSchema,
    outputSchema: GenerateProductImagesOutputSchema,
  },
  async (input) => {
    const [back, left, right] = await Promise.all([
      generateImageView(input, 'back'),
      generateImageView(input, 'left'),
      generateImageView(input, 'right'),
    ]);

    return {
      back,
      left,
      right,
    };
  }
);
    
