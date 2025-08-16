
"use server";

import { aiSearchAssistant } from "@/ai/flows/ai-search-assistant";
import { getDeliveryEstimate } from "@/ai/flows/get-delivery-estimate-flow";

export async function getSearchSuggestions(input: { searchQuery: string }): Promise<{ suggestions?: string[], error?: string }> {
  try {
    const result = await aiSearchAssistant(input);
    return { suggestions: result.suggestions };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `AI Search Assistant failed: ${errorMessage}` };
  }
}

export async function getEstimatedDelivery(productId: string, pincode: string): Promise<{ estimate?: string, error?: string }> {
  try {
    const result = await getDeliveryEstimate({ productId, pincode });
    return { estimate: result.estimatedDeliveryDate };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `Delivery estimation failed: ${errorMessage}` };
  }
}
