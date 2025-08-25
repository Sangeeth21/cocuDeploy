"use server";

import { callAIService } from "../../../../../../lib/ai-service";

export async function generateProductImages(data: {
  productName: string;
  productDescription: string;
  imageDataUri: string;
}) {
  try {
    const prompt = `
      Generate product images for:
      - Product Name: ${data.productName}
      - Description: ${data.productDescription}
      - Use the following reference image if helpful: ${data.imageDataUri}
    `;

    const result = await callAIService(prompt);
    return { images: JSON.parse(result).images };
  } catch (error) {
    console.error("Failed to generate images:", error);
    return { error: "Failed to generate images." };
  }
}
