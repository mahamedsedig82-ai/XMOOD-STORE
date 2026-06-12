"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, addDoc, deleteDoc, query, limit } from "firebase/firestore";
import { adminAiAssistant } from "@/ai/flows/admin-ai-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Send, Sparkles, Database, ShieldCheck, Zap, Terminal, Activity, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminAiPage() {
  const db = useFirestore();
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'admin' | 'ai', content: string, actionType?: string }[]>([]);
  
  const productsRef = useMemoFirebase(() => collection(db, "products"), [db]);
  const usersRef = useMemoFirebase(() => query(collection(db, "users"), limit(100)), [db]);
  
  const { data: products } = useCollection(productsRef);
  const { data: userProfiles } = useCollection(usersRef);

  const handleCommand = async () => {
    if (!command.trim() || !db) return;

    const userCmd = command;
    setCommand("");
    setHistory(prev => [...prev, { role: 'admin', content: userCmd }]);
    setIsLoading(true);

    try {
      const result = await adminAiAssistant({ 
        command: userCmd, 
        currentContext: { products, userProfiles } 
      });

      if (result.actionType !== 'UNKNOWN' && result.actionType !== 'UI_STYLE_ADVICE') {
        await applyAction(result);
      }

      setHistory(prev => [...prev, { 
        role: 'ai', 
        content: result.explanation,
        actionType: result.actionType
      }]);

      toast({ title: "تم تنفيذ الطلب", description: "المساعد الذكي أتم المهمة بنجاح." });

    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً، واجهت مشكلة في معالجة طلبك. يرجى إعادة الصياغة." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAction = async (res: any) => {
    const { actionType, targetId, payload } = res;
    if (!db) return;
    
    try {
      if (actionType === 'UPDATE_PRODUCT' && targetId) {
        await updateDoc(doc(db, "products", targetId), { ...payload, updatedAt: new Date().toISOString() });
      } else if (actionType === 'CREATE_PRODUCT') {
        await addDoc(collection(db, "products"), { ...payload, createdAt: new Date().toISOString() });
      } else if (actionType === 'DELETE_PRODUCT' && targetId) {
        await deleteDoc(doc(db, "products", targetId));
      } else if (actionType === 'FINANCIAL_ADJUSTMENT' && targetId) {
        await updateDoc(doc(db, "users", targetId), { walletBalance: Number(payload.walletBalance) });
      } else if (actionType === 'USER_MANAGEMENT' && targetId) {
        await updateDoc(doc(db, "users", targetId), payload);
      } else if (actionType === 'UPDATE_SETTINGS') {
        await updateDoc(doc(db, "settings", "global"), payload);
      }
    } catch (e) {
      console.error("AI Action Failed:", e);
      throw e;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black">
            <Cpu size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold gold-text">المساعد الإداري الذكي</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Smart Store Operations Hub</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary px-6 py-2 rounded-full font-bold">
           AI STATUS: ACTIVE
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 luxury-card h-[700px] flex flex-col overflow-hidden relative border-none">
          <CardHeader className="bg-black/40 p-8 border-b border-white/5 backdrop-blur-xl">
            <CardTitle className="text-xl flex items-center gap-4 gold-text font-bold">
              <MessageSquare size={24} className="text-primary" /> دردشة العمليات الذكية
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-8">
              <div className="space-y-8">
                {history.length === 0 && (
                  <div className="text-center py-40 opacity-20">
                    <Sparkles size={80} className="mx-auto mb-6" />
                    <p className="text-xl font-bold uppercase tracking-widest">مرحباً بك.. كيف يمكنني مساعدتك في إدارة المتجر اليوم؟</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-5 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'admin' ? 'bg-zinc-900' : 'bg-primary text-black'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={20} /> : <Cpu size={20} />}
                    </div>
                    <div className={`p-6 rounded-[2rem] max-w-[80%] text-base font-bold ${msg.role === 'admin' ? 'bg-zinc-900 border border-white/5 text-zinc-300' : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-5 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-primary/20" />
                    <div className="p-6 bg-white/5 rounded-[2rem] w-64 h-20" />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-8 bg-black/80 border-t border-white/5 backdrop-blur-2xl">
              <div className="relative flex gap-4 max-w-4xl mx-auto">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="أدخل أمرك.. مثال: 'حدث سعر باقة UC ببجي لتصبح 50 دولار'" 
                  className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold text-lg text-white"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 text-black shadow-lg"
                >
                  <Send className="rtl:rotate-180" size={24} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="luxury-card border-none p-8 bg-primary/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6">قدرات المساعد الإداري</h3>
            <ul className="space-y-6">
              {[
                { icon: Zap, label: "تعديل الأسعار والمخزون", desc: "أوامر مباشرة للمنتجات" },
                { icon: Database, label: "إدارة العضويات", desc: "ترقيات وتعديلات الحسابات" },
                { icon: ShieldCheck, label: "تعديل إعدادات الواجهة", desc: "تغيير النصوص والألوان" },
                { icon: Terminal, label: "تحليل المبيعات", desc: "تقارير ذكية وسريعة" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{item.label}</span>
                    <span className="text-[8px] text-zinc-500 uppercase">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
