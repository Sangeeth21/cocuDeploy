
'use server';

/**
 * @fileOverview An AI flow to estimate the delivery date for a product to a given pincode.
 * - getDeliveryEstimate - The main function to call.
 * - DeliveryEstimateInputSchema - The Zod schema for the input.
 * - DeliveryEstimateOutputSchema - The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getShippingCost } from '@/app/admin/orders/new/shipping-actions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DisplayProduct, User } from '@/lib/types';
import { addDays, format } from 'date-fns';

export const DeliveryEstimateInputSchema = z.object({
  productId: z.string().describe('The ID of the product.'),
  pincode: z.string().length(6).describe('The 6-digit destination pincode.'),
});
export type DeliveryEstimateInput = z.infer<typeof DeliveryEstimateInputSchema>;

export const DeliveryEstimateOutputSchema = z.object({
  estimatedDeliveryDate: z.string().describe('The estimated delivery date range, e.g., "July 29 - Aug 1".'),
});
export type DeliveryEstimateOutput = z.infer<typeof DeliveryEstimateOutputSchema>;

// Define a tool for the AI to get shipping transit time
const getTransitTimeTool = ai.defineTool(
  {
    name: 'getTransitTime',
    description: 'Gets the estimated shipping transit time in days between two pincodes.',
    inputSchema: z.object({
      originPincode: z.string().length(6),
      destinationPincode: z.string().length(6),
      weight: z.number().describe('Package weight in kg. Default to 1 if not provided.'),
    }),
    outputSchema: z.object({
      days: z.number().describe('Estimated number of transit days.'),
    }),
  },
  async (input) => {
    // We are calling the Shiprocket action here.
    // In a real scenario, you might have more complex logic or multiple carriers.
    const result = await getShippingCost({
      pickup_postcode: input.originPincode,
      delivery_postcode: input.destinationPincode,
      weight: input.weight || 1,
      cod: 0, // Not relevant for estimation
      length: 10, // Default dimensions
      breadth: 10,
      height: 10,
    });
    
    // Simulate transit days based on cost for now. This would be a direct output from a real API.
    const cost = result.cost || 10;
    const days = Math.ceil(cost / 2.5);
    return { days: Math.max(1, days) };
  }
);


const deliveryEstimatePrompt = ai.definePrompt({
    name: 'deliveryEstimatePrompt',
    input: { schema: z.object({ productCategory: z.string(), vendorId: z.string() }) },
    output: { schema: z.object({ fulfillmentDays: z.number() }) },
    tools: [getTransitTimeTool],
    prompt: `Based on the product category "{{productCategory}}", estimate a realistic fulfillment time in business days for the vendor.
    Consider that electronics might ship faster than handcrafted items.
    Default to 2-3 days if unsure.
    The response must be a number of days.`,
});


export const getDeliveryEstimateFlow = ai.defineFlow(
  {
    name: 'getDeliveryEstimateFlow',
    inputSchema: DeliveryEstimateInputSchema,
    outputSchema: DeliveryEstimateOutputSchema,
  },
  async (input) => {
    // 1. Get Product and Vendor details from Firestore
    const productRef = doc(db, 'products', input.productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }
    const product = productSnap.data() as DisplayProduct;

    const vendorRef = doc(db, 'users', product.vendorId);
    const vendorSnap = await getDoc(vendorRef);
    if (!vendorSnap.exists()) {
      throw new Error('Vendor not found');
    }
    const vendor = vendorSnap.data() as User;
    const vendorPincode = vendor.vendorDetails?.address?.pincode; // Assuming pincode is stored here
    
    if (!vendorPincode) {
         throw new Error('Vendor location is not available.');
    }

    // 2. Use AI to estimate fulfillment time
    const fulfillmentResponse = await deliveryEstimatePrompt({ 
        productCategory: product.category,
        vendorId: product.vendorId
    });
    const fulfillmentDays = fulfillmentResponse.output?.fulfillmentDays || 2; // Default to 2 days

    // 3. Use the tool to get shipping transit time
    const shippingResponse = await getTransitTimeTool({
        originPincode: vendorPincode,
        destinationPincode: input.pincode,
        weight: 1 // Placeholder weight
    });
    const transitDays = shippingResponse.days;

    // 4. Calculate the date range
    const totalMinDays = fulfillmentDays + transitDays;
    const totalMaxDays = totalMinDays + 2; // Add a buffer of 2 days for the range

    const minDeliveryDate = addDays(new Date(), totalMinDays);
    const maxDeliveryDate = addDays(new Date(), totalMaxDays);
    
    const estimate = `${format(minDeliveryDate, 'MMM d')} - ${format(maxDeliveryDate, 'MMM d')}`;

    return {
      estimatedDeliveryDate: `Get it by ${estimate}`
    };
  }
);

export async function getDeliveryEstimate(input: DeliveryEstimateInput) {
    return getDeliveryEstimateFlow(input);
}
