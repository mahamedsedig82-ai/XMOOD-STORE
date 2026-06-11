'use server';
/**
 * @fileOverview AI Admin Assistant Flow for XMOOD STORE.
 * Interprets natural language commands to modify Firestore data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminAiInputSchema = z.object({
  command: z.string().describe("The admin's natural language command (e.g., 'Change PUBG price to 50', 'Make the site look more gold', 'Add 100 USD to user X')."),
  currentContext: z.object({
    products: z.array(z.any()).optional(),
    settings: z.any().optional(),
  }).optional(),
});

const AdminAiOutputSchema = z.object({
  actionType: z.enum(['UPDATE_PRODUCT', 'CREATE_PRODUCT', 'DELETE_PRODUCT', 'UPDATE_SETTINGS', 'FINANCIAL_ADJUSTMENT', 'UI_STYLE_ADVICE', 'UNKNOWN']),
  targetId: z.string().optional().describe("ID of the product or user being modified."),
  payload: z.any().describe("The data object to be applied to Firestore."),
  explanation: z.string().describe("Briefly explain what you are about to do."),
});

export type AdminAiInput = z.infer<typeof AdminAiInputSchema>;
export type AdminAiOutput = z.infer<typeof AdminAiOutputSchema>;

export async function adminAiAssistant(input: AdminAiInput): Promise<AdminAiOutput> {
  return adminAiFlow(input);
}

const adminAiPrompt = ai.definePrompt({
  name: 'adminAiPrompt',
  input: { schema: AdminAiInputSchema },
  output: { schema: AdminAiOutputSchema },
  prompt: `You are the Master AI Architect for XMOOD STORE. You have full control over the platform's data.
Your job is to translate the admin's natural language request into a structured database action.

Context:
- Products: List of current offerings.
- Settings: General site configuration (exchange rates, maintenance mode, etc.).

Command: {{{command}}}

Based on the command, decide which action to take:
1. UPDATE_PRODUCT: Change price, stock, name, or image.
2. CREATE_PRODUCT: Add a new bundle.
3. DELETE_PRODUCT: Remove an item.
4. UPDATE_SETTINGS: Change USD exchange rate or site status.
5. FINANCIAL_ADJUSTMENT: Add or subtract balance from a user.
6. UI_STYLE_ADVICE: If they ask to change colors/theme, suggest the CSS variables to update.

Return the actionType, the targetId (if applicable), the payload (the actual data to update), and an explanation in Arabic.`,
});

const adminAiFlow = ai.defineFlow(
  {
    name: 'adminAiFlow',
    inputSchema: AdminAiInputSchema,
    outputSchema: AdminAiOutputSchema,
  },
  async (input) => {
    const { output } = await adminAiPrompt(input);
    return output!;
  }
);
