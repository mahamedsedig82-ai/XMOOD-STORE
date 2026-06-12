
'use server';
/**
 * @fileOverview AI Design Generation Flow using Imagen 4.
 * Generates high-quality luxury designs based on user prompts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDesignInputSchema = z.object({
  prompt: z.string().describe("The description of the image to generate."),
  style: z.string().optional().describe("The artistic style (e.g., 'luxury gold', 'cyberpunk', 'photorealistic')."),
});

const GenerateDesignOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image."),
});

export type GenerateDesignInput = z.infer<typeof GenerateDesignInputSchema>;
export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

export async function generateAiDesign(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  return generateDesignFlow(input);
}

const generateDesignFlow = ai.defineFlow(
  {
    name: 'generateDesignFlow',
    inputSchema: GenerateDesignInputSchema,
    outputSchema: GenerateDesignOutputSchema,
  },
  async (input) => {
    const fullPrompt = `${input.prompt}. Style: ${input.style || 'luxury professional golden finish'}`;
    
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: fullPrompt,
    });

    if (!media || !media.url) {
      throw new Error("Failed to generate image");
    }

    return {
      imageUrl: media.url
    };
  }
);
