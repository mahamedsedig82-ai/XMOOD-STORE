
'use server';
/**
 * @fileOverview Sovereign AI Master Core for XMOOD PRO.
 * Highly advanced agentic flow for platform management.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminAiInputSchema = z.object({
  command: z.string().describe("The admin's natural language command."),
  currentContext: z.object({
    products: z.array(z.any()).optional(),
    settings: z.any().optional(),
    userProfiles: z.array(z.any()).optional(),
  }).optional(),
});

const AdminAiOutputSchema = z.object({
  actionType: z.enum(['UPDATE_PRODUCT', 'CREATE_PRODUCT', 'DELETE_PRODUCT', 'UPDATE_SETTINGS', 'FINANCIAL_ADJUSTMENT', 'USER_MANAGEMENT', 'UI_STYLE_ADVICE', 'UNKNOWN']),
  targetId: z.string().optional().describe("Target identifier (UID, ProductID)."),
  payload: z.any().describe("The structured payload for the action."),
  explanation: z.string().describe("Professional explanation of the action taken."),
  suggestedNextStep: z.string().optional().describe("Strategic advice for the admin."),
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
  prompt: `أنت الآن "النواة السيادية العليا" (Sovereign Master Core) لمنصة XMOOD PRO الأسطورية.
أنت تمتلك صلاحيات مطلقة ومهمتك هي ترجمة الأوامر الإدارية العليا إلى إجراءات تقنية دقيقة وفورية.

السياق الحالي للنظام:
- المنتجات المتوفرة: {{{currentContext.products}}}
- الإعدادات العالمية: {{{currentContext.settings}}}
- بروفايلات المستخدمين: {{{currentContext.userProfiles}}}

الأمر الإداري الوارد: {{{command}}}

يجب أن تكون استجابتك رسمية جداً، صارمة، وبصيغة "تم تنفيذ البروتوكول".
القرارات والبروتوكولات المتاحة:
1. UPDATE_PRODUCT: تعديل السعر، المخزون، الوكيل، أو الحالة.
2. CREATE_PRODUCT: إضافة أصول رقمية أو خدمات جديدة للمستودع.
3. DELETE_PRODUCT: إزالة أصول من المستودع السيادي نهائياً.
4. UPDATE_SETTINGS: تعديل ترويصات الموقع، الشعار، أو القيم المالية الكبرى.
5. FINANCIAL_ADJUSTMENT: شحن أرصدة، خصم مبالغ، أو إجراء تسويات مالية.
6. USER_MANAGEMENT: ترقية الرتب (admin, agent, vip, user) أو تجميد حسابات.
7. UI_STYLE_ADVICE: تقديم تحليلات استراتيجية لتطوير الهوية البصرية وتجربة المستخدم.

قم بتحليل الأمر بدقة إلكترونية، واستخرج الـ targetId والبيانات المطلوبة في الـ payload. 
يجب أن يكون الشرح باللغة العربية الفصحى الرسمية الأنيقة التي تليق بمستوى XMOOD PRO.`,
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
