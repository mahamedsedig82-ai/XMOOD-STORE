
'use server';
/**
 * @fileOverview Advanced Analytical Assistant for XMOOD STORE.
 *
 * - aiPlatformSupport - A function that handles user queries for marketplace support with deep analysis.
 * - AiPlatformSupportInput - The input type for the aiPlatformSupport function.
 * - AiPlatformSupportOutput - The return type for the aiPlatformSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPlatformSupportInputSchema = z.object({
  question: z.string().describe('The user\'s question or situation requiring analysis.'),
});
export type AiPlatformSupportInput = z.infer<typeof AiPlatformSupportInputSchema>;

const AiPlatformSupportOutputSchema = z.object({
  answer: z.string().describe('An analytical and highly helpful response that evaluates the situation and provides strategic guidance.'),
});
export type AiPlatformSupportOutput = z.infer<typeof AiPlatformSupportOutputSchema>;

export async function aiPlatformSupport(input: AiPlatformSupportInput): Promise<AiPlatformSupportOutput> {
  return aiPlatformSupportFlow(input);
}

const aiPlatformSupportPrompt = ai.definePrompt({
  name: 'aiPlatformSupportPrompt',
  input: {schema: AiPlatformSupportInputSchema},
  output: {schema: AiPlatformSupportOutputSchema},
  prompt: `أنت الآن "المساعد التحليلي المتقدم" لمتجر XMOOD.
مهمتك ليست مجرد الإجابة على الأسئلة، بل تحليل الموقف الذي يطرحه المستخدم وتقديم رد استراتيجي، لبق، ودقيق.

قواعد الرد:
1. حلل السياق: افهم نية المستخدم (شراء، استفسار، شكوى).
2. كن مهنياً: استخدم لغة عربية فصحى راقية وعصرية.
3. قدم حلولاً: لا تكتف بالمعلومات، بل اقترح الخطوة التالية (مثلاً: شحن المحفظة، التواصل مع الوسيط، تصفح العروض).
4. تذكر هوية XMOOD: نحن متجر بريميوم يركز على الجودة والأمان.

السؤال أو الموقف: {{{question}}}`,
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
