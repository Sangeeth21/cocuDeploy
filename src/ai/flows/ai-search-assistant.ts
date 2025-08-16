'use server';

/**
 * @fileOverview A flow that enhances search functionality by generating alternative search formulations.
 *
 * - aiSearchAssistant - A function that takes a search query and returns an enhanced search query.
 * - AiSearchAssistantInput - The input type for the aiSearchAssistant function.
 * - AiSearchAssistantOutput - The return type for the aiSearchAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AiSearchAssistantInputSchema = z.object({
  searchQuery: z.string().describe('The original search query entered by the user.'),
});
export type AiSearchAssistantInput = z.infer<typeof AiSearchAssistantInputSchema>;

const AiSearchAssistantOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of up to 5 search suggestions, including auto-complete and recommendations.'),
});
export type AiSearchAssistantOutput = z.infer<typeof AiSearchAssistantOutputSchema>;

export async function aiSearchAssistant(input: AiSearchAssistantInput): Promise<AiSearchAssistantOutput> {
  if (!input.searchQuery.trim()) {
    return { suggestions: [] };
  }
  return aiSearchAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSearchAssistantPrompt',
  input: {schema: AiSearchAssistantInputSchema},
  output: {schema: AiSearchAssistantOutputSchema},
  prompt: `You are an AI assistant for an e-commerce site called Co & Cu. You are designed to provide search suggestions.
Given a user's search query, provide a list of up to 5 suggestions.
These suggestions should include auto-completions of the current query and recommendations for related searches.
Do not suggest categories, only specific product searches.
Keep the suggestions concise and relevant.

Original Search Query: {{{searchQuery}}}
`,
});

const aiSearchAssistantFlow = ai.defineFlow(
  {
    name: 'aiSearchAssistantFlow',
    inputSchema: AiSearchAssistantInputSchema,
    outputSchema: AiSearchAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
