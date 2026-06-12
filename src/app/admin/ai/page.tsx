"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { adminAiAssistant } from "@/ai/flows/admin-ai-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Send, Sparkles, Database, ShieldCheck, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminAiPage() {
  const db = useFirestore();
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'admin' | 'ai', content: string, actionType?: string }[]>([]);
  
  const productsRef = useMemoFirebase(() => collection(db, "products"), [db]);
  const { data: products } = useCollection(productsRef);

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

      toast({ title: "تم تنفيذ الأمر الملكي", description: result.explanation });

    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً، واجهت مشكلة في الاتصال بالبروتوكول الذكي." }]);
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
        await addDoc(collection(db, "products"), { ...payload, createdAt: new Date().toISOString(), stock: Number(payload.stock) || 100 });
      } else if (actionType === 'DELETE_PRODUCT' && targetId) {
        await deleteDoc(doc(db, "products", targetId));
      } else if (actionType === 'FINANCIAL_ADJUSTMENT' && targetId) {
        await updateDoc(doc(db, "users", targetId), { walletBalance: Number(payload.walletBalance) });
      }
    } catch (e) {
      console.error("AI Mutation Failed:", e);
      throw e;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex items-center gap-6">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black shadow-xl shadow-primary/20">
          <Cpu size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">المعالج السيادي AI</h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-1">Master Core Interface</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 luxury-card border-none h-[650px] flex flex-col overflow-hidden legendary-border">
          <CardHeader className="bg-white/5 p-6 border-b border-white/5">
            <CardTitle className="text-xl flex items-center gap-3 gold-text">
              <Sparkles size={20} className="text-primary" /> نظام التحكم اللحظي
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {history.length === 0 && (
                  <div className="text-center py-32 opacity-10">
                    <Database size={80} className="mx-auto mb-4" />
                    <p className="text-lg font-black uppercase tracking-[0.3em]">Awaiting Imperial Orders...</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'admin' ? 'bg-zinc-950' : 'bg-primary text-black'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={20} /> : <Cpu size={20} />}
                    </div>
                    <div className={`p-5 rounded-3xl max-w-[80%] text-base font-bold ${msg.role === 'admin' ? 'bg-zinc-900 border border-white/5 text-zinc-300' : 'bg-primary/5 border border-primary/20 text-primary'}`}>
                      {msg.content}
                      {msg.actionType && (
                        <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-primary/40">Action: {msg.actionType}</div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-primary/20" />
                    <div className="p-5 bg-white/5 rounded-3xl w-48" />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 bg-black/60 border-t border-white/5">
              <div className="relative flex gap-3">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="مثال: 'غير سعر PUBG لـ 50' أو 'احذف المنتج X'..." 
                  className="h-16 rounded-xl bg-zinc-900 border-none px-6 font-bold text-lg text-white"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="h-16 w-16 rounded-xl bg-primary hover:bg-primary/90 text-black shadow-lg"
                >
                  <Send className="rtl:rotate-180" size={24} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="luxury-card border-none p-6 bg-primary/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">البروتوكولات النشطة</h3>
            <ul className="space-y-6">
              {[
                { icon: Zap, label: "التحكم في السيولة" },
                { icon: Database, label: "تعديل المخزون" },
                { icon: ShieldCheck, label: "الأمان السيادي" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-primary">
                    <item.icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-zinc-400">{item.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
