
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, addDoc, deleteDoc, query, limit } from "firebase/firestore";
import { adminAiAssistant } from "@/ai/flows/admin-ai-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Send, Sparkles, Database, ShieldCheck, Zap, Terminal } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

      toast({ title: "تم تنفيذ الإجراء السيادي", description: result.explanation });

    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً أيها القائد، واجهت النواة صعوبة في معالجة هذا البروتوكول المعقد." }]);
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
      console.error("Master Core Mutation Failed:", e);
      throw e;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between gap-6 bg-white/5 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-black shadow-[0_0_50px_rgba(255,184,0,0.3)]">
            <Cpu size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold gold-text">المعالج السيادي PRO</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 italic">Sovereign Artificial Intelligence Nucleus</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary px-6 py-2 rounded-full font-black animate-pulse">SYSTEM ONLINE</Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 luxury-card border-none h-[750px] flex flex-col overflow-hidden legendary-border relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
             <Terminal className="w-full h-full p-20" />
          </div>
          <CardHeader className="bg-black/40 p-8 border-b border-white/5 backdrop-blur-xl">
            <CardTitle className="text-xl flex items-center gap-4 gold-text font-bold">
              <Zap size={24} className="text-primary" /> واجهة التحكم في البروتوكولات
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-10">
              <div className="space-y-8">
                {history.length === 0 && (
                  <div className="text-center py-40 opacity-10">
                    <Database size={100} className="mx-auto mb-6" />
                    <p className="text-2xl font-black uppercase tracking-[0.4em]">Awaiting Imperial Commands...</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-6 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${msg.role === 'admin' ? 'bg-zinc-950 border border-white/10' : 'bg-primary text-black'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={24} /> : <Cpu size={24} />}
                    </div>
                    <div className={`p-8 rounded-[2.5rem] max-w-[85%] text-lg font-bold leading-relaxed ${msg.role === 'admin' ? 'bg-zinc-900/80 border border-white/5 text-zinc-300' : 'bg-primary/10 border border-primary/30 text-primary shadow-[0_0_30px_rgba(255,184,0,0.05)]'}`}>
                      {msg.content}
                      {msg.actionType && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Protocol: {msg.actionType}</span>
                           <ShieldCheck size={14} className="opacity-40" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-6 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20" />
                    <div className="p-8 bg-white/5 rounded-[2.5rem] w-64 h-24" />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-10 bg-black/80 border-t border-white/5 backdrop-blur-2xl">
              <div className="relative flex gap-4 max-w-5xl mx-auto">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="أدخل أمرك الإداري.. مثال: 'قم بترقية المستخدم أحمد إلى رتبة VIP'" 
                  className="h-20 rounded-[1.5rem] bg-zinc-900 border-none px-10 font-bold text-xl text-white focus:ring-primary/40 shadow-inner"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="h-20 w-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-black shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="rtl:rotate-180" size={32} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="luxury-card border-none p-10 bg-primary/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8 italic">نظام السيادة PRO</h3>
            <ul className="space-y-8">
              {[
                { icon: Zap, label: "التحكم المالي المطلق", desc: "تعديل أرصدة الخزينة" },
                { icon: Database, label: "إدارة الأصول الكبرى", desc: "تعديل، حذف، إنشاء" },
                { icon: ShieldCheck, label: "هيكلة الرتب الإدارية", desc: "ترقيات، تجميد حسابات" },
                { icon: Terminal, label: "أوامر النواة المباشرة", desc: "تحكم برمجي ذكي" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-primary shrink-0 border border-white/5">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block mb-1">{item.label}</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="luxury-card border-none p-10 bg-white/5 text-center">
             <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Master Security Key</p>
             <p className="font-mono text-xl text-primary/40 blur-[4px] hover:blur-none transition-all cursor-help tracking-widest">PRO-999-XM-2025</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
