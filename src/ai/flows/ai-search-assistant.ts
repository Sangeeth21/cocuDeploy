'use server';

/**
 * @fileOverview A flow that enhances search functionality by generating alternative search formulations.
 *
 * - aiSearchAssistant - A function that takes a search query and returns an enhanced search query.
 * - AiSearchAssistantInput - The input type for the aiSearchAssistant function.
 * - AiSearchAssistantOutput - The return type for the aiSearchAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSearchAssistantInputSchema = z.object({
  searchQuery: z.string().describe('The original search query entered by the user.'),
});
export type AiSearchAssistantInput = z.infer<typeof AiSearchAssistantInputSchema>;

const AiSearchAssistantOutputSchema = z.object({
  enhancedSearchQuery: z
    .string()    
    .describe("An alternative, potentially better, search query."),
});
export type AiSearchAssistantOutput = z.infer<typeof AiSearchAssistantOutputSchema>;

export async function aiSearchAssistant(input: AiSearchAssistantInput): Promise<AiSearchAssistantOutput> {
  return aiSearchAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSearchAssistantPrompt',
  input: {schema: AiSearchAssistantInputSchema},
  output: {schema: AiSearchAssistantOutputSchema},
  prompt: `You are an AI assistant designed to enhance search query.
  The goal is to generate alternative formulations of the original search query to improve search result relevance.
  Consider synonyms, related terms, and common misspellings.

  Original Search Query: {{{searchQuery}}}

  Enhanced Search Query:`,
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
