
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
      } else if (actionType === 'UPDATE_SETTINGS') {
        // إضافة نظام إعدادات هنا مستقبلاً
      }
    } catch (e) {
      console.error("AI Action Failed:", e);
      throw e;
    }
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex items-center gap-10">
        <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-black shadow-2xl shadow-primary/30">
          <Cpu size={48} />
        </div>
        <div>
          <h1 className="text-6xl font-headline font-bold gold-text">معالج التحكم الذكي (Sovereign AI)</h1>
          <p className="text-slate-500 mt-3 text-sm uppercase font-black tracking-[0.5em]">Master AI Core Processor</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <Card className="lg:col-span-3 luxury-card border-none h-[800px] flex flex-col overflow-hidden legendary-border">
          <CardHeader className="bg-white/5 p-12 border-b border-white/5">
            <CardTitle className="text-3xl flex items-center gap-6 gold-text">
              <Sparkles size={32} className="text-primary" /> مركز التحكم العصبي للمنصة
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-12">
              <div className="space-y-10">
                {history.length === 0 && (
                  <div className="text-center py-40 opacity-20">
                    <Database size={120} className="mx-auto mb-10 text-primary" />
                    <p className="text-4xl font-black uppercase tracking-[0.5em]">Awaiting Orders...</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-8 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl ${msg.role === 'admin' ? 'bg-zinc-900 border border-white/10' : 'bg-primary text-black'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={28} /> : <Cpu size={28} />}
                    </div>
                    <div className={`p-10 rounded-[3rem] max-w-[85%] text-xl font-bold shadow-2xl ${msg.role === 'admin' ? 'bg-zinc-900 border border-white/5 text-slate-300' : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                      {msg.content}
                      {msg.actionType && (
                        <div className="mt-6 pt-6 border-t border-primary/20 text-[11px] uppercase font-black tracking-[0.4em] text-primary/60">
                          AI Protocol Executed: {msg.actionType}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-8 animate-pulse">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-primary/20 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" />
                    </div>
                    <div className="p-10 bg-white/5 rounded-[3rem] w-80"></div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-12 bg-black/60 border-t border-white/5">
              <div className="relative flex gap-8">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="مثال: 'غير سعر باقة PUBG لـ 50 دولار' أو 'أضف رصيد 100$ للمستخدم X'..." 
                  className="h-28 rounded-[2.5rem] bg-zinc-900/50 border-primary/20 px-12 font-bold text-2xl text-white focus:ring-primary shadow-inner placeholder:text-slate-700"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="w-28 h-28 rounded-[2.5rem] royal-button shrink-0"
                >
                  <Send className="rtl:rotate-180" size={40} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-10">
          <Card className="luxury-card border-none p-12 bg-primary/5">
            <h3 className="text-xs font-black uppercase tracking-[0.6em] text-primary mb-12">البروتوكولات النشطة</h3>
            <ul className="space-y-10">
              {[
                { icon: Zap, label: "إدارة السيولة الفورية" },
                { icon: Database, label: "تعديل المستودع الرقمي" },
                { icon: ShieldCheck, label: "التحكم في الرتب العليا" },
                { icon: Cpu, label: "المزامنة اللحظية (Sync)" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-8 group cursor-default">
                  <div className="w-14 h-14 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-xl border border-white/5">
                    <item.icon size={28} />
                  </div>
                  <span className="text-lg font-black opacity-40 group-hover:opacity-100 transition-opacity">{item.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
