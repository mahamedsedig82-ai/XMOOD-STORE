"use client";

import { useState } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { adminAiAssistant } from "@/ai/flows/admin-ai-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Send, Sparkles, Loader2, Database, ShieldCheck, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminAiPage() {
  const db = useFirestore();
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'admin' | 'ai', content: string, action?: any }[]>([]);
  
  const { data: products } = useCollection(collection(db, "products"));

  const handleCommand = async () => {
    if (!command.trim() || !db) return;

    const userCommand = command;
    setCommand("");
    setHistory(prev => [...prev, { role: 'admin', content: userCommand }]);
    setIsLoading(true);

    try {
      const result = await adminAiAssistant({
        command: userCommand,
        currentContext: { products }
      });

      if (result.actionType !== 'UNKNOWN' && result.actionType !== 'UI_STYLE_ADVICE') {
        await applyAiChange(result);
      }

      setHistory(prev => [...prev, { 
        role: 'ai', 
        content: result.explanation,
        action: result
      }]);

      toast({
        title: "تم تطبيق التعديل الذكي",
        description: result.explanation
      });

    } catch (error) {
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً، واجهت مشكلة في معالجة هذا الأمر." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAiChange = async (result: any) => {
    const { actionType, targetId, payload } = result;

    try {
      if (actionType === 'UPDATE_PRODUCT' && targetId) {
        updateDoc(doc(db, "products", targetId), payload);
      } else if (actionType === 'CREATE_PRODUCT') {
        addDoc(collection(db, "products"), { ...payload, createdAt: new Date().toISOString() });
      } else if (actionType === 'DELETE_PRODUCT' && targetId) {
        deleteDoc(doc(db, "products", targetId));
      } else if (actionType === 'FINANCIAL_ADJUSTMENT' && targetId) {
        updateDoc(doc(db, "users", targetId), payload);
      }
    } catch (e) {
      console.error("AI Action Failed:", e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Master AI Control</span>
          </div>
          <h1 className="text-4xl font-headline font-bold">مساعد الإدارة الذكي</h1>
          <p className="text-muted-foreground">تحكم في المتجر بالكامل عبر الأوامر النصية بذكاء XMOOD AI.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white flex flex-col h-[700px]">
          <CardHeader className="bg-slate-950 text-white p-8">
            <CardTitle className="text-xl flex items-center gap-3">
              <Cpu className="text-primary" /> معالج الأوامر الفوري
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-8">
              <div className="space-y-6">
                {history.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Database size={48} className="mx-auto mb-4 opacity-10" />
                    <p>ابدأ بكتابة أمر مثل: "غير سعر باقة 100 جوهرة إلى 1.5 دولار"</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'admin' ? 'bg-slate-100' : 'bg-primary text-white'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={20} /> : <Cpu size={20} />}
                    </div>
                    <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-bold shadow-sm ${msg.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-50 border'}`}>
                      {msg.content}
                      {msg.action && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-primary uppercase font-black">
                          تم تنفيذ إجراء: {msg.action.actionType}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl w-32 h-10"></div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-8 border-t bg-slate-50/50">
              <div className="relative flex gap-4">
                <Input 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                  placeholder="اكتب أمرك هنا... (مثال: أضف منتج جديد باسم باقة الصيف بسعر 20 دولار)" 
                  className="h-16 rounded-2xl border-none shadow-inner bg-white px-8 font-bold text-lg"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-2xl bg-slate-950 hover:bg-primary transition-all shrink-0"
                >
                  <Send className="rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">قدرات الذكاء الاصطناعي</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Zap size={16} className="text-primary" />
                <span className="text-sm font-bold">تعديل الأسعار والمخزون</span>
              </li>
              <li className="flex items-center gap-3">
                <Database size={16} className="text-primary" />
                <span className="text-sm font-bold">إضافة وحذف المنتجات</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-sm font-bold">إدارة رتب المستخدمين</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
