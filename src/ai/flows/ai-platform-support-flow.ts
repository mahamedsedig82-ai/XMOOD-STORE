'use server';
/**
 * @fileOverview An AI assistant for XMOOD STORE.
 *
 * - aiPlatformSupport - A function that handles user queries for marketplace support.
 * - AiPlatformSupportInput - The input type for the aiPlatformSupport function.
 * - AiPlatformSupportOutput - The return type for the aiPlatformSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPlatformSupportInputSchema = z.object({
  question: z.string().describe('The user\'s question about the marketplace operations, policies, or features.'),
});
export type AiPlatformSupportInput = z.infer<typeof AiPlatformSupportInputSchema>;

const AiPlatformSupportOutputSchema = z.object({
  answer: z.string().describe('A concise and helpful answer to the user\'s question regarding the marketplace.'),
});
export type AiPlatformSupportOutput = z.infer<typeof AiPlatformSupportOutputSchema>;

export async function aiPlatformSupport(input: AiPlatformSupportInput): Promise<AiPlatformSupportOutput> {
  return aiPlatformSupportFlow(input);
}

const aiPlatformSupportPrompt = ai.definePrompt({
  name: 'aiPlatformSupportPrompt',
  input: {schema: AiPlatformSupportInputSchema},
  output: {schema: AiPlatformSupportOutputSchema},
  prompt: `You are an AI assistant for XMOOD STORE. Your role is to provide instant, concise, and helpful answers to users regarding marketplace operations, policies, or how to use specific features. If a question falls outside these categories, politely state that you cannot assist with that specific query.\n\nQuestion: {{{question}}}`,
});

const aiPlatformSupportFlow = ai.defineFlow(
  {
    name: 'aiPlatformSupportFlow',
    inputSchema: AiPlatformSupportInputSchema,
    outputSchema: AiPlatformSupportOutputSchema,
  },
  async (input) => {
    const {output} = await aiPlatformSupportPrompt(input);
    return output!;
  }
);
