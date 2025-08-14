
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
  styleBackendPrompt: z.string().describe('A pre-defined string of keywords and phrases that define the artistic style, e.g., "Ghibli".'),
  aspectRatio: z.string().optional().describe('The desired aspect ratio for the generated image, e.g., "1:1", "16:9", "4:5".'),
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
    
    // MASTER STYLE PROMPT provided by user
    const masterPrompt = `
      MASTER STYLE PROMPT — “Ghibli Watercolor (Filmic Anime)” — v1.1
      INPUTS (replace or leave empty/omit):
      INPUT_IMAGE={{#if referenceImageDataUri}}"{{referenceImageDataUri}}"{{else}}""{{/if}}
      USER_PROMPT="{{prompt}}"
      STYLE="{{styleBackendPrompt}}"
      ASPECT_RATIO="{{aspectRatio}}"
      MOOD=""
      LIGHTING=""
      ACCENT_COLOR=""
      STYLIZATION="medium"
      SEED=""

      GOAL
      Generate ONE high-quality illustration with a hand-painted, filmic anime aesthetic. Produce an 8K-quality result (target 7680×4320); if native 8K is unavailable, render clean hi-res and internally upscale 2–4× with detail preservation. Return the image plus a one-sentence summary noting framing, lighting, accent color, and whether img2img or text2image was used.

      MODE SELECTION
      • If INPUT_IMAGE is provided → img2img. Preserve the identity, pose, outfit silhouette, proportions, composition, and scene layout from the photo. Allow tasteful cleanup only.
      • If INPUT_IMAGE is not provided → text2image. Use USER_PROMPT as the narrative seed; if USER_PROMPT is empty, infer a gentle slice-of-life moment consistent with STYLE and MOOD.

      STYLE SWITCH
      • If STYLE = "Ghibli":
        Apply a “Ghibli-inspired hand-painted anime film look” (no licensed characters): watercolor + gouache textures; clean pencil linework with soft line-weight; gentle cel-shading on characters; atmospheric perspective; painterly clouds; naturalistic foliage; cozy, lived-in worldbuilding; luminous dust motes; subtle paper grain. Palette: earthy greens, warm creams, desaturated reds, soft sky blues with ACCENT_COLOR as a soft highlight. Avoid photoreal pores or plastic gloss.
      • Otherwise (STYLE empty or other):
        Use a tasteful painterly illustration with soft edges, filmic lighting, atmospheric depth, and gentle cel-shading; keep the rest of the directives below.

      COMPOSITION & CAMERA
      Respect ASPECT_RATIO if provided; else choose the most readable framing.
      • If a person is present or implied: waist-up or full-body, eye-level or 3/4; rule of thirds; clear silhouette; expressive, well-drawn hands; light negative space.
      • If environment/room/street/landscape: medium-wide or wide establishing; strong leading lines; layered depth with thin haze; foreground→midground→background separation.

      LIGHTING & ATMOSPHERE
      Use LIGHTING if given; else a flattering cinematic setup (golden hour backlight + soft skylight fill). Add subtle rim light on hair/shoulders, mild bloom (tasteful), gentle volumetric rays through windows/trees, ambient occlusion in creases, and only natural soft reflections.

      MATERIALS & SURFACE FINISH
      Paper texture with watercolor edge darkening; micro-details in eyes (catchlights, faint iris spokes); hair with two-tone cel-shading; fabrics with believable folds and occasional stitch hints; ceramics/metal/glass with painterly highlights (not CG gloss). Signage/labels should be non-readable; absolutely no logos or text.

      BACKGROUNDS & STORY HINTS
      Add cozy, lived-in props (books, mugs, plants, postcards, tools). Optionally include a tiny original forest-spirit-like creature (non-franchise), subtle and friendly.

      FIDELITY RULES (when img2img)
      Preserve facial ratios, eye shape, nose/mouth spacing, hair silhouette, key accessories, outfit cut, and the core scene identity. Permit minor cleanup of stray hairs or clutter only.

      QUALITY & OUTPUT
      Aim for crisp linework, painterly interiors, smooth gradients, and zero banding/JPEG artifacts. If native 8K is unsupported, render ≥2048–3072 long side and upscale 2–4× with a detail-preserving method; optionally apply a very light refinement pass to crisp lines and watercolor textures. Keep edges precise and style consistent.

      PARAMETER HINTS (use if supported; otherwise ignore silently)
      • Steps: 28–40 (modern sampler)
      • Guidance/CFG: 5.5–7.5 (start 6.5)
      • Face restore (portraits): subtle
      • Control (pose/line): weight 0.5–0.7 for stability
      • Img2img denoise strength by STYLIZATION:
        – low: 0.34
        – medium: 0.42
        – high: 0.55

      CONTENT TO RENDER
      • Base subject/scene:
        – If INPUT_IMAGE exists: follow the photo as the core reference (identity & layout), then translate to STYLE with the directives above.
        – If no INPUT_IMAGE: synthesize from USER_PROMPT; if empty, render a gentle slice-of-life moment matching STYLE and MOOD.
      • Optional explicit additions: incorporate any props/animals/weather/season/festival cues mentioned in USER_PROMPT.

      SAFETY, LEGAL & ETHICS — DO NOT GENERATE text/captions/watermarks/signatures/logos/brand marks; copyrighted or franchise characters; celebrity likeness misuse; political party logos or propaganda; extremist symbols; hateful or harassing content; explicit sexual content; minors in suggestive contexts; gore. Avoid photoreal pores, plastic/oily skin, neon HDR, oversaturation, over-sharpening, lens dirt/chromatic aberration, noise/moire/tiling, repeating patterns, banding, muddy colors, harsh gradients, anatomy errors (extra fingers/limbs), warped perspective, melted features, blurry or misaligned eyes, deformed pupils, low-res or pixelation, and JPEG artifacts.

      OUTPUT FORMAT
      Return: the final image and a concise one-sentence summary stating the chosen framing, lighting, accent color, and whether img2img or text2image was used.
    `;
    
    // Construct the prompt parts based on user input
    const promptParts: any[] = [];
    let filledPrompt = masterPrompt
      .replace('{{USER_PROMPT}}', input.prompt)
      .replace('{{STYLE}}', input.styleBackendPrompt)
      .replace('{{ASPECT_RATIO}}', input.aspectRatio || '');

    if (input.referenceImageDataUri) {
      promptParts.push({ media: { url: input.referenceImageDataUri } });
      filledPrompt = filledPrompt.replace('{{INPUT_IMAGE}}', `"${input.referenceImageDataUri}"`);
    } else {
      filledPrompt = filledPrompt.replace('{{INPUT_IMAGE}}', '""');
    }
    
    promptParts.push({ text: filledPrompt });

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptParts,
      config: {
          responseModalities: ['TEXT', 'IMAGE'],
          ...(input.aspectRatio && { aspectRatio: input.aspectRatio }),
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
