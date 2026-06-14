"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { adminAiAssistant } from "@/ai/flows/admin-ai-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Send, Sparkles, ShieldCheck, Zap, Terminal, Activity, MessageSquare, BarChart3, Database } from "lucide-react";
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

      setHistory(prev => [...prev, { 
        role: 'ai', 
        content: result.explanation,
        actionType: result.actionType
      }]);

      toast({ title: "تم تحليل الطلب", description: "المساعد الإداري جاهز للتنفيذ." });

    } catch (error) {
      setHistory(prev => [...prev, { role: 'ai', content: "عذراً سيادة المدير، واجهت مشكلة في معالجة طلبك الإداري." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between gap-6 bg-card p-6 rounded-[2rem] border">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold gold-text">مساعد الإدارة الذكي</h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Admin Operation Control AI</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 rounded-full font-bold text-[9px]">
           SYSTEM STATUS: OPTIMAL
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 luxury-card h-[650px] flex flex-col border-none shadow-xl bg-card/60 backdrop-blur-xl">
          <CardHeader className="bg-muted/10 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-3 font-bold">
              <Terminal size={20} className="text-primary" /> وحدة التحكم الإدارية
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {history.length === 0 && (
                  <div className="text-center py-32 opacity-20">
                    <Activity size={60} className="mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">بانتظار أوامر المدير التنفيذي..</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'admin' ? 'bg-zinc-800 text-white' : 'bg-primary text-white'}`}>
                      {msg.role === 'admin' ? <ShieldCheck size={16} /> : <Cpu size={16} />}
                    </div>
                    <div className={`p-5 rounded-2xl max-w-[85%] text-sm font-bold leading-relaxed ${msg.role === 'admin' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground border border-border' : 'bg-primary/5 border border-primary/20 text-foreground'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 bg-muted/20 border-t">
              <div className="relative flex gap-3 max-w-4xl mx-auto">
                <Input 
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCommand()}
                  placeholder="أدخل أمرك الإداري.. مثال: 'حلل معدل مبيعات الأسبوع الماضي'" 
                  className="h-14 rounded-xl bg-background border-border px-6 font-bold text-sm"
                />
                <Button 
                  onClick={handleCommand}
                  disabled={isLoading}
                  className="h-14 w-14 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md p-0"
                >
                  <Send className="rtl:rotate-180" size={20} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="luxury-card border-none p-6 bg-primary/5">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-primary mb-5">مهام مساعد الإدارة</h3>
            <ul className="space-y-4">
              {[
                { icon: BarChart3, label: "تحليل المبيعات", desc: "تقارير أداء المتجر" },
                { icon: Database, label: "فحص المخزون", desc: "تنبيهات النقص الفوري" },
                { icon: Zap, label: "تحسين الأسعار", desc: "اقتراحات بناءً على السوق" },
                { icon: ShieldCheck, label: "مراقبة الصلاحيات", desc: "تدقيق سجلات المسؤولين" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block">{item.label}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="luxury-card border-none p-6 bg-muted/20">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest">كفاءة النظام</span>
                <span className="text-primary font-black text-xs">99.9%</span>
             </div>
             <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[99.9%] rounded-full shadow-[0_0_8px_var(--primary)]" />
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
