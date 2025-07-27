"use server";

import { aiSearchAssistant } from "@/ai/flows/ai-search-assistant";

export async function handleSearch(input: { searchQuery: string }): Promise<{ enhancedSearchQuery?: string, error?: string }> {
  try {
    const result = await aiSearchAssistant(input);
    return result;
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `AI Search Assistant failed: ${errorMessage}` };
  }
}
