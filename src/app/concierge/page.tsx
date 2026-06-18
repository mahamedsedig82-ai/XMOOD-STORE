"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { explainProduct } from "@/ai/flows/ai-product-explainer";
import { Cpu, Send, User, Loader2, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function ConciergePage() {
  const db = useFirestore();
  const [queryInput, setQueryInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'مرحباً بك في وحدة التحليل الرقمي لمتجر XMOOD STORE. أنا مساعدك الذكي، جاهز لتحليل استفساراتك حول باقاتنا وخدماتنا الحصرية.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), limit(50));
  }, [db]);
  const { data: products } = useCollection(productsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  async function handleSend() {
    if (!queryInput.trim() || isLoading) return;

    const userMsg = queryInput;
    setQueryInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // 🛡️ تنظيف البيانات لضمان عدم وجود أخطاء في الـ AI Flow
      const cleanProducts = (products || []).map(p => ({
        id: p.id || String(Math.random()),
        name: p.name || "باقة غير معروفة",
        description: p.description || "لا يوجد وصف متوفر",
        price: Number(p.price) || 0,
        category: p.category || "عام"
      }));

      const result = await explainProduct({
        userQuery: userMsg,
        availableProducts: cleanProducts
      });

      setMessages(prev => [...prev, { role: 'ai', content: result.aiResponse }]);
    } catch (error) {
      console.error("Concierge AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'عذراً، واجهت النواة التحليلية خطأ غير متوقع. يرجى التأكد من اتصالك وإعادة المحاولة.' }]);
      toast({ variant: "destructive", title: "خطأ في النواة الذكية" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 h-[calc(100vh-100px)] max-w-5xl pt-32 pb-6">
        <div className="luxury-card h-full flex flex-col border-primary/10 shadow-2xl bg-card/60 backdrop-blur-3xl">
          
          <div className="bg-muted/10 p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                <Cpu size={24} className="animate-pulse" />
              </div>
              <div>
                <h1 className="font-headline text-2xl font-black gold-text tracking-widest uppercase">XMOOD ANALYZER</h1>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-1">Sovereign Neural Core</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-5 py-1.5 bg-green-500/5 rounded-full border border-green-500/20">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
               <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">System Active</span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6 md:p-10">
            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {messages.map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg border ${m.role === 'ai' ? 'bg-primary text-black border-primary/30' : 'bg-muted text-muted-foreground border-border'}`}>
                      {m.role === 'ai' ? <Sparkles size={20} /> : <User size={20} />}
                    </div>
                    <div className={`p-6 rounded-[2.5rem] max-w-[85%] text-base leading-relaxed shadow-sm font-bold border ${m.role === 'ai' ? 'bg-primary/5 border-primary/10 text-foreground' : 'bg-muted/40 border-border text-foreground'}`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-5 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center shadow-lg">
                    <Sparkles size={20} />
                  </div>
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={18} />
                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Processing...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-6 md:p-8 bg-muted/10 border-t border-border">
            <div className="relative flex gap-3 max-w-5xl mx-auto items-center">
              <Input 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="أدخل استفسارك للتحليل.." 
                className="h-16 rounded-2xl border-primary/20 bg-background px-8 text-foreground font-bold text-lg shadow-inner focus:ring-2 focus:ring-primary/10"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading || !queryInput.trim()}
                className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shrink-0 text-black transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="rtl:rotate-180" size={24} />}
              </Button>
            </div>
            <div className="flex justify-center gap-8 mt-6 opacity-30">
               <div className="flex items-center gap-2"><Zap size={12} /><span className="text-[7px] font-black uppercase tracking-widest">Sync Active</span></div>
               <div className="flex items-center gap-2"><ShieldCheck size={12} /><span className="text-[7px] font-black uppercase tracking-widest">Secure Core</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}