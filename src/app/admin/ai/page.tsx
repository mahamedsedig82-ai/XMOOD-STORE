"use client";

import { useState } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { adminAiAssistant } from "@/ai/flows/admin-ai-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Send, Sparkles, Loader2, Database, ShieldCheck, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminAiPage() {
  const db = useFirestore();
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'admin' | 'ai', content: string, actionType?: string }[]>([]);
  
  const { data: products } = useCollection(collection(db, "products"));

  const handleCommand = async () => {
    if (!command.trim() || !db) return;

    const userCmd = command;
    setCommand("");
    setHistory(prev => [...prev, { role: 'admin', content: userCmd }]);
    setIsLoading(true);

    try {
      const result = await adminAiAssistant({ command: userCmd, currentContext: { products } });

      if (result.actionType !== 'UNKNOWN' && result.actionType !== 'UI_STYLE_ADVICE') {
        await applyAction(result);
      }

      setHistory(prev => [...prev, { 
        role: 'ai', 
        content: result.explanation,
        actionType: result.actionType
      }]);

      toast({ title: "تم تطبيق التعديل الذكي", description: result.explanation });

    } catch (error) {
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً، واجهت مشكلة في معالجة هذا الأمر." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAction = async (res: any) => {
    const { actionType, targetId, payload } = res;
    try {
      if (actionType === 'UPDATE_PRODUCT' && targetId) {
        await updateDoc(doc(db, "products", targetId), { ...payload, updatedAt: serverTimestamp() });
      } else if (actionType === 'CREATE_PRODUCT') {
        await addDoc(collection(db, "products"), { ...payload, createdAt: serverTimestamp(), stock: payload.stock || 100 });
      } else if (actionType === 'DELETE_PRODUCT' && targetId) {
        await deleteDoc(doc(db, "products", targetId));
      } else if (actionType === 'FINANCIAL_ADJUSTMENT' && targetId) {
        await updateDoc(doc(db, "users", targetId), payload);
      }
    } catch (e) {
      console.error("AI Action Failed:", e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20">
          <Cpu size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">مساعد التحكم الذكي</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase font-black tracking-widest">Master AI Console</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 luxury-card border-none h-[700px] flex flex-col overflow-hidden">
          <CardHeader className="bg-white/5 p-8 border-b border-white/5">
            <CardTitle className="text-xl flex items-center gap-3">
              <Zap size={20} className="text-primary" /> معالج الأوامر النصي (Real-time CMS)
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-10">
              <div className="space-y-6">
                {history.length === 0 && (
                  <div className="text-center py-20 opacity-20">
                    <Database size={80} className="mx-auto mb-6" />
                    <p className="text-xl font-bold">أنا بانتظار أوامرك لإدارة الموقع...</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'admin' ? 'bg-white/10' : 'bg-primary text-white'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={20} /> : <Cpu size={20} />}
                    </div>
                    <div className={`p-5 rounded-[1.5rem] max-w-[80%] text-sm font-bold shadow-2xl ${msg.role === 'admin' ? 'bg-slate-900 border border-white/5' : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                      {msg.content}
                      {msg.actionType && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] uppercase font-black tracking-tighter text-primary">
                          تم تنفيذ إجراء: {msg.actionType}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" />
                    </div>
                    <div className="p-5 bg-white/5 rounded-[1.5rem] w-48"></div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-10 bg-black/40 border-t border-white/5">
              <div className="relative flex gap-4">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="مثال: 'غير سعر باقة 100 جوهرة لـ 2 دولار' أو 'أضف رصيد 50$ لمستخدم X'" 
                  className="h-20 rounded-3xl bg-white/5 border-none px-10 font-bold text-lg shadow-inner text-white focus:ring-primary/40"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="w-20 h-20 rounded-3xl bg-primary hover:bg-primary/90 transition-all shrink-0 shadow-2xl shadow-primary/20"
                >
                  <Send className="rtl:rotate-180" size={24} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="luxury-card border-none p-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-8">قدرات المساعد</h3>
            <ul className="space-y-6">
              {[
                { icon: Zap, label: "تعديل الأسعار والمخزون" },
                { icon: Database, label: "إدارة الباقات الرقمية" },
                { icon: ShieldCheck, label: "إدارة الرتب والمستخدمين" },
                { icon: Cpu, label: "التعديل البرمجي للـ UI" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-bold opacity-70 group-hover:opacity-100">{item.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
