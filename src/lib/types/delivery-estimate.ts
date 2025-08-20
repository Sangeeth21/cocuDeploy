
import { z } from 'zod';

export const DeliveryEstimateInputSchema = z.object({
  productId: z.string().describe('The ID of the product.'),
  pincode: z.string().length(6).describe('The 6-digit destination pincode.'),
});
export type DeliveryEstimateInput = z.infer<typeof DeliveryEstimateInputSchema>;

export const DeliveryEstimateOutputSchema = z.object({
  estimatedDeliveryDate: z.string().describe('The estimated delivery date range, e.g., "July 29 - Aug 1".'),
});
export type DeliveryEstimateOutput = z.infer<typeof DeliveryEstimateOutputSchema>;
