'use server';
/**
 * @fileOverview An AI assistant flow that explains product details, answers specific questions,
 * and recommends offerings based on available products at XMOOD STORE.
 *
 * - explainProduct - A function that handles product explanations and recommendations.
 * - AiProductExplainerInput - The input type for the explainProduct function.
 * - AiProductExplainerOutput - The return type for the explainProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProductExplainerInputSchema = z.object({
  userQuery: z.string().describe("The user's query or request regarding products, services, or recommendations."),
  availableProducts: z.array(z.object({
    id: z.string().describe("Unique identifier for the product."),
    name: z.string().describe("Name of the product or service."),
    description: z.string().describe("Detailed description of the product or service."),
    price: z.number().describe("Price of the product in USD."),
    category: z.string().describe("Category of the product (e.g., 'شحن ألعاب', 'خدمات تصميم')."),
  })).optional().describe("An optional list of available products and services in the marketplace, including their details. The AI should use this for explanations and recommendations."),
});
export type AiProductExplainerInput = z.infer<typeof AiProductExplainerInputSchema>;

const AiProductExplainerOutputSchema = z.object({
  aiResponse: z.string().describe("The AI assistant's response, explaining products, answering questions, or providing recommendations."),
});
export type AiProductExplainerOutput = z.infer<typeof AiProductExplainerOutputSchema>;

export async function explainProduct(input: AiProductExplainerInput): Promise<AiProductExplainerOutput> {
  return aiProductExplainerFlow(input);
}

const aiProductExplainerPrompt = ai.definePrompt({
  name: 'aiProductExplainerPrompt',
  input: {
    schema: z.object({
      userQuery: z.string().describe("The user's query or request."),
      availableProductsJsonString: z.string().optional().describe("A JSON string representation of available products."),
    }),
  },
  output: {schema: AiProductExplainerOutputSchema},
  prompt: `You are the "Intelligent Shopping Concierge" for XMOOD STORE, a luxurious digital marketplace. Your role is to assist users by:
1. Explaining product and service details.
2. Answering specific questions about offerings.
3. Recommending suitable products or services based on user preferences and the available inventory.

Always maintain a helpful, professional, and elegant tone.

Available Products and Services (if provided, in JSON format):
{{#if availableProductsJsonString}}
{{{availableProductsJsonString}}}
{{else}}
No specific product list provided. If asked about specific products not listed, state that you do not have information about them but can help with general queries.
{{/if}}

User's Query: {{{userQuery}}}

Based on the user's query and the available products, please provide a comprehensive and helpful response. If recommending, always refer to the products listed in 'Available Products and Services' above. If the query cannot be answered with the provided information, politely state that you can't assist with that specific query.`,
});

const aiProductExplainerFlow = ai.defineFlow(
  {
    name: 'aiProductExplainerFlow',
    inputSchema: AiProductExplainerInputSchema,
    outputSchema: AiProductExplainerOutputSchema,
  },
  async (input) => {
    const availableProductsJson = input.availableProducts ? JSON.stringify(input.availableProducts, null, 2) : undefined;

    const {output} = await aiProductExplainerPrompt({
      userQuery: input.userQuery,
      availableProductsJsonString: availableProductsJson,
    });
    return output!;
  }
);
