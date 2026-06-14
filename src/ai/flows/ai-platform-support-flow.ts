
'use server';
/**
 * @fileOverview Advanced Analytical Assistant for XMOOD STORE.
 * Highly contextual agent that understands the site structure, FAQs, and common procedures.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPlatformSupportInputSchema = z.object({
  question: z.string().describe('The user\'s question or situation.'),
  context: z.object({
    botName: z.string().optional(),
    personality: z.string().optional(),
    faq: z.array(z.string()).optional(),
  }).optional(),
});
export type AiPlatformSupportInput = z.infer<typeof AiPlatformSupportInputSchema>;

const AiPlatformSupportOutputSchema = z.object({
  answer: z.string().describe('The helpful and strategic response.'),
  suggestedAction: z.enum(['NONE', 'GOTO_WALLET', 'GOTO_STORE', 'CONTACT_AGENT', 'CHECK_STATUS']).default('NONE'),
});
export type AiPlatformSupportOutput = z.infer<typeof AiPlatformSupportOutputSchema>;

export async function aiPlatformSupport(input: AiPlatformSupportInput): Promise<AiPlatformSupportOutput> {
  return aiPlatformSupportFlow(input);
}

const aiPlatformSupportPrompt = ai.definePrompt({
  name: 'aiPlatformSupportPrompt',
  input: {schema: AiPlatformSupportInputSchema},
  output: {schema: AiPlatformSupportOutputSchema},
  prompt: `أنت الآن المساعد الذكي المتقدم لمتجر XMOOD. اسمك هو: {{{context.botName}}}.
شخصيتك: {{{context.personality}}}.

مهمتك:
1. إرشاد المستخدمين للعثور على الخدمات الإلكترونية (شحن ألعاب، بطاقات).
2. شرح نظام المحفظة (الرصيد يظهر بالدولار والعملة المحلية).
3. شرح نظام الوكلاء (الوسطاء المعتمدون هم الضمان الموثوق للصفقات).
4. الرد بناءً على الأسئلة الشائعة: {{{context.faq}}}.

قواعد الإجابة:
- كن مختصراً، مهنياً، ومفيداً جداً.
- إذا سأل المستخدم عن "كيف أشحن؟" وجهه لاستخدام معرفه الرقمي UID والتواصل مع وكيل.
- إذا سأل عن الأمان، أكد أن كافة العمليات تمر عبر بروتوكولات حماية مركزية.

السؤال: {{{question}}}`,
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
