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

      toast({ title: "تم تنفيذ الأمر الذكي", description: result.explanation });

    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً، واجهت مشكلة تقنية في معالجة هذا الأمر." }]);
      toast({ variant: "destructive", title: "خطأ في المعالجة", description: "لم يتمكن المساعد من الوصول لقاعدة البيانات حالياً." });
    } finally {
      setIsLoading(false);
    }
  };

  const applyAction = async (res: any) => {
    const { actionType, targetId, payload } = res;
    if (!db) return;
    
    try {
      if (actionType === 'UPDATE_PRODUCT' && targetId) {
        await updateDoc(doc(db, "products", targetId), { ...payload, updatedAt: serverTimestamp() });
      } else if (actionType === 'CREATE_PRODUCT') {
        await addDoc(collection(db, "products"), { ...payload, createdAt: serverTimestamp(), stock: Number(payload.stock) || 100 });
      } else if (actionType === 'DELETE_PRODUCT' && targetId) {
        await deleteDoc(doc(db, "products", targetId));
      } else if (actionType === 'FINANCIAL_ADJUSTMENT' && targetId) {
        await updateDoc(doc(db, "users", targetId), { walletBalance: Number(payload.walletBalance) });
      }
    } catch (e) {
      console.error("AI Action Failed:", e);
      throw e;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="flex items-center gap-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-xl shadow-primary/20">
          <Cpu size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">معالج التحكم الذكي</h1>
          <p className="text-zinc-500 mt-1 text-[10px] uppercase font-black tracking-widest">Master AI Core Processor</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 luxury-card border-none h-[700px] flex flex-col overflow-hidden legendary-border">
          <CardHeader className="bg-white/5 p-8 border-b border-white/5">
            <CardTitle className="text-2xl flex items-center gap-4 gold-text">
              <Sparkles size={24} className="text-primary" /> نظام الأوامر السيادية
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-8">
              <div className="space-y-8">
                {history.length === 0 && (
                  <div className="text-center py-32 opacity-20">
                    <Database size={100} className="mx-auto mb-8 text-primary" />
                    <p className="text-2xl font-black uppercase tracking-[0.4em]">Awaiting Orders...</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-6 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'admin' ? 'bg-zinc-900 border border-white/10' : 'bg-primary text-black'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={24} /> : <Cpu size={24} />}
                    </div>
                    <div className={`p-6 rounded-3xl max-w-[80%] text-lg font-bold shadow-xl ${msg.role === 'admin' ? 'bg-zinc-900 border border-white/5 text-zinc-300' : 'bg-primary/5 border border-primary/20 text-primary'}`}>
                      {msg.content}
                      {msg.actionType && (
                        <div className="mt-4 pt-4 border-t border-primary/20 text-[9px] uppercase font-black tracking-widest text-primary/60">
                          Protocol Executed: {msg.actionType}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-6 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" />
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl w-64"></div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-8 bg-black/60 border-t border-white/5">
              <div className="relative flex gap-4">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="مثال: 'غير سعر باقة PUBG لـ 50 دولار' أو 'أضف رصيد 100$ للمستخدم X'..." 
                  className="h-20 rounded-2xl bg-zinc-900 border-primary/20 px-8 font-bold text-xl text-white shadow-inner placeholder:text-zinc-700"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="h-20 w-20 rounded-2xl bg-primary hover:bg-primary/90 text-black shadow-lg"
                >
                  <Send className="rtl:rotate-180" size={28} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="luxury-card border-none p-8 bg-primary/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-8">البروتوكولات النشطة</h3>
            <ul className="space-y-8">
              {[
                { icon: Zap, label: "إدارة السيولة الفورية" },
                { icon: Database, label: "تعديل المستودع الرقمي" },
                { icon: ShieldCheck, label: "التحكم السيادي" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-lg border border-white/5">
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-black text-zinc-500 group-hover:text-white transition-colors">{item.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
