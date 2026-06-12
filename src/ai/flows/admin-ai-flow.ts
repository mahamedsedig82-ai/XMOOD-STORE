
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
  prompt: `أنت الآن "النواة السيادية العليا" (Sovereign Master Core) لمنصة XMOOD PRO.
مهمتك هي ترجمة الأوامر الإدارية العليا إلى إجراءات تقنية دقيقة وفورية.

السياق الحالي:
- المنتجات: {{{currentContext.products}}}
- الإعدادات: {{{currentContext.settings}}}
- المستخدمين: {{{currentContext.userProfiles}}}

الأمر الإداري: {{{command}}}

يجب أن تكون استجابتك رسمية جداً وبصيغة "تم تنفيذ البروتوكول".
القرارات المتاحة:
1. UPDATE_PRODUCT: تعديل السعر، المخزون، أو الوكيل.
2. CREATE_PRODUCT: إضافة أصول جديدة.
3. DELETE_PRODUCT: إزالة أصول من المستودع.
4. UPDATE_SETTINGS: تعديل ترويصات الموقع، الشعار، أو القيم المالية الكبرى.
5. FINANCIAL_ADJUSTMENT: شحن أرصدة، خصومات، أو تحويلات إدارية.
6. USER_MANAGEMENT: ترقية الرتب (admin, agent, vip) أو تجميد حسابات.
7. UI_STYLE_ADVICE: تقديم نصائح لتطوير الهوية البصرية.

قم بتحليل الأمر بدقة، واستخرج الـ targetId والبيانات المطلوبة في الـ payload. 
يجب أن يكون الشرح باللغة العربية الرسمية الفصحى.`,
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
