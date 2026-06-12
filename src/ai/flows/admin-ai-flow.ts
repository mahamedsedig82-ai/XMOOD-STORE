'use server';
/**
 * @fileOverview Smart Operations Assistant for XMOOD Store.
 * Highly advanced agentic flow for professional store management.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminAiInputSchema = z.object({
  command: z.string().describe("The manager's natural language command."),
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
  suggestedNextStep: z.string().optional().describe("Strategic advice for the manager."),
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
  prompt: `أنت الآن "المساعد الإداري الذكي" لمنصة XMOOD الاحترافية.
مهمتك هي مساعدة المدير في إدارة المتجر بكفاءة وحيوية. أنت لست آلة جامدة، بل شريك استراتيجي يفهم احتياجات السوق الرقمي.

السياق الحالي للمتجر:
- المنتجات المتوفرة: {{{currentContext.products}}}
- الإعدادات الحالية: {{{currentContext.settings}}}
- المستخدمون النشطون: {{{currentContext.userProfiles}}}

طلب المدير: {{{command}}}

يجب أن تكون استجابتك مهنية، ذكية، ولبقة.
العمليات المتاحة لك:
1. UPDATE_PRODUCT: تحديث الأسعار أو البيانات.
2. CREATE_PRODUCT: إضافة خدمات أو باقات ألعاب جديدة.
3. DELETE_PRODUCT: إزالة منتجات غير متوفرة.
4. UPDATE_SETTINGS: تعديل مظهر المتجر أو نصوص الواجهة.
5. FINANCIAL_ADJUSTMENT: تسوية الأرصدة أو عمليات الشحن.
6. USER_MANAGEMENT: ترقية العضويات أو إدارة الصلاحيات.
7. UI_STYLE_ADVICE: تقديم نصائح حية لتطوير تجربة المستخدم والنمو.

حلل الطلب بذكاء، واستخرج البيانات المطلوبة بدقة. اجعل شرحك باللغة العربية المهنية الحية والواضحة التي تعكس رقي متجر XMOOD.`,
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
