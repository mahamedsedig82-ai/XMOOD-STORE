
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

export default function ConciergePage() {
  const db = useFirestore();
  const [queryInput, setQueryInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'مرحباً بك في وحدة التحليل الرقمي لمتجر XMOOD. أنا مساعدك النصي الذكي، جاهز لتحليل استفساراتك حول باقاتنا وخدماتنا الحصرية.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب المنتجات الحقيقية لتزويد الـ AI بالسياق الصحيح
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
      const result = await explainProduct({
        userQuery: userMsg,
        availableProducts: (products || []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: p.price,
          category: p.category
        }))
      });

      setMessages(prev => [...prev, { role: 'ai', content: result.aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'عذراً، واجهت النواة التحليلية خطأ غير متوقع في معالجة البيانات. يرجى إعادة المحاولة لاحقاً.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 h-[calc(100vh-100px)] max-w-5xl pt-32 pb-6">
        <div className="emerald-glass rounded-[3.5rem] overflow-hidden flex flex-col h-full border border-primary/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          
          {/* Header */}
          <div className="bg-white/[0.03] p-8 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
                <Cpu className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h1 className="font-headline text-3xl font-black gold-text tracking-tighter">المحلل الذكي XMOOD</h1>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-1">Sovereign Neural Analysis Core</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 px-6 py-2 bg-green-500/5 rounded-full border border-green-500/20 shadow-inner">
               <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
               <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Core Active</span>
            </div>
          </div>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-8 md:p-12">
            <div className="space-y-12">
              <AnimatePresence mode="popLayout">
                {messages.map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: m.role === 'ai' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border transition-transform hover:scale-110 ${m.role === 'ai' ? 'bg-primary text-black border-primary/30' : 'bg-zinc-900 text-zinc-400 border-white/10'}`}>
                      {m.role === 'ai' ? <Sparkles size={28} /> : <User size={28} />}
                    </div>
                    <div className={`p-8 rounded-[2.5rem] max-w-[85%] text-lg leading-relaxed shadow-2xl font-bold border ${m.role === 'ai' ? 'bg-primary/5 border-primary/20 text-zinc-100' : 'bg-zinc-900/50 border-white/5 text-zinc-300'}`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-xl">
                    <Sparkles size={28} />
                  </div>
                  <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-xs font-black uppercase text-primary/60 tracking-widest">جاري التحليل المنطقي...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-8 md:p-10 bg-black/60 border-t border-white/5 backdrop-blur-3xl">
            <div className="relative flex gap-4 max-w-5xl mx-auto items-center">
              <Input 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="أدخل استفسارك للتحليل.. مثال: 'قارن بين باقات الشحن المتوفرة'" 
                className="h-20 rounded-[1.75rem] border-none bg-zinc-900 px-10 text-white font-bold text-xl shadow-2xl focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading || !queryInput.trim()}
                className="h-20 w-20 rounded-[1.75rem] bg-primary hover:bg-primary/90 shadow-[0_15px_40px_rgba(212,175,55,0.3)] shrink-0 text-black transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="rtl:rotate-180" size={32} />}
              </Button>
            </div>
            <div className="flex justify-center gap-8 mt-8 opacity-30 grayscale hover:opacity-80 transition-opacity">
               <div className="flex items-center gap-2"><Zap size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Real-time Data Sync</span></div>
               <div className="flex items-center gap-2"><ShieldCheck size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Secure Query Execution</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
