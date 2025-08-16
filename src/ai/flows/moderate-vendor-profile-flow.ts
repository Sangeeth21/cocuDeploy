
'use server';
/**
 * @fileOverview An AI flow to moderate vendor profile content.
 *
 * - moderateVendorProfile - A function that checks vendor-submitted text for forbidden content.
 * - ModerateVendorProfileInput - The input type for the function.
 * - ModerateVendorProfileOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ModerateVendorProfileInputSchema = z.object({
  profileText: z.string().describe('The vendor profile text (e.g., bio, description) to be moderated.'),
});
export type ModerateVendorProfileInput = z.infer<typeof ModerateVendorProfileInputSchema>;

export const ModerateVendorProfileOutputSchema = z.object({
  isAllowed: z.boolean().describe('Whether the provided text is allowed or not.'),
  reason: z.string().optional().describe('A brief, user-facing reason why the content was not allowed. This should be empty if isAllowed is true.'),
});
export type ModerateVendorProfileOutput = z.infer<typeof ModerateVendorProfileOutputSchema>;

export async function moderateVendorProfile(input: ModerateVendorProfileInput): Promise<ModerateVendorProfileOutput> {
  if (!input.profileText.trim()) {
    return { isAllowed: true };
  }
  return moderateVendorProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateVendorProfilePrompt',
  input: {schema: ModerateVendorProfileInputSchema},
  output: {schema: ModerateVendorProfileOutputSchema},
  prompt: `You are a content moderator for an e-commerce platform named Co & Cu. Your primary role is to prevent vendors from moving transactions or communication off-platform.

You must analyze the provided profile text from a vendor. Your task is to determine if the text contains any forbidden information that would allow a customer to contact or pay the vendor directly, outside of the platform.

Forbidden information includes, but is not limited to:
- Phone numbers (any format, e.g., (123) 456-7890, 123-456-7890, 1234567890)
- Email addresses (e.g., user@example.com)
- Website URLs (e.g., www.example.com, example.net, http://...)
- Social media handles or links (e.g., @username, find us on Facebook/Instagram/Twitter/LinkedIn)
- Physical addresses, store locations, or P.O. Boxes.
- Instructions for off-platform payments (e.g., "Pay me on Venmo", "CashApp me", "PayPal details are...")
- Instructions for off-platform communication (e.g., "Call me at", "Text us on", "DM for details", "Find us at...")

If any such information is found, you must set 'isAllowed' to false and provide a brief, clear, user-facing reason. The reason should be concise and directly state the issue, for example: "Please remove phone numbers from your profile." or "Please remove external website links."

If the text is clean and contains no forbidden information, set 'isAllowed' to true.

Vendor Profile Text to Analyze:
"{{{profileText}}}"
`,
});

const moderateVendorProfileFlow = ai.defineFlow(
  {
    name: 'moderateVendorProfileFlow',
    inputSchema: ModerateVendorProfileInputSchema,
    outputSchema: ModerateVendorProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
