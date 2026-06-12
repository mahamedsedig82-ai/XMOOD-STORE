
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { explainProduct } from "@/ai/flows/ai-product-explainer";
import { Cpu, Send, User, Loader2, Sparkles } from "lucide-react";

export default function ConciergePage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'مرحباً بك في وحدة التحليل الرقمي لمتجر XMOOD. أنا مساعدك النصي الذكي، جاهز لتحليل استفساراتك حول باقاتنا وخدماتنا الحصرية.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!query.trim()) return;

    const userMsg = query;
    setQuery("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await explainProduct({
        userQuery: userMsg,
        availableProducts: STORE_PRODUCTS.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category
        }))
      });

      setMessages(prev => [...prev, { role: 'ai', content: result.aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'عذراً، واجهت النواة التحليلية خطأ غير متوقع. يرجى إعادة المحاولة.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] max-w-4xl pt-32">
        <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-full border border-white/5">
          <div className="bg-white/5 p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-headline text-3xl font-bold gold-text">المحلل الذكي XMOOD</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Advanced Textual Analysis Engine</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-500 bg-green-500/5 px-4 py-1.5 rounded-full border border-green-500/10">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-bold uppercase tracking-widest">System Active</span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-10">
            <div className="space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border ${m.role === 'ai' ? 'bg-primary text-black border-primary/20' : 'bg-zinc-900 text-zinc-400 border-white/5'}`}>
                    {m.role === 'ai' ? <Sparkles size={24} /> : <User size={24} />}
                  </div>
                  <div className={`p-8 rounded-[2rem] max-w-[80%] text-base leading-relaxed shadow-2xl font-bold ${m.role === 'ai' ? 'bg-primary/5 border-primary/10 border text-zinc-200' : 'bg-zinc-900 border-white/5 border text-zinc-300'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center animate-pulse">
                    <Sparkles size={24} />
                  </div>
                  <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-10 bg-black/40 border-t border-white/5 backdrop-blur-2xl">
            <div className="relative flex gap-4 max-w-4xl mx-auto">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="أدخل استفسارك للتحليل.. مثال: 'قارن بين باقات UC المتوفرة'" 
                className="h-18 rounded-2xl border-none bg-zinc-900 px-8 text-white font-bold text-lg"
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading}
                className="h-18 w-18 rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shrink-0 text-black"
              >
                <Send className="rtl:rotate-180" size={24} />
              </Button>
            </div>
            <p className="text-[9px] text-center mt-6 text-zinc-600 uppercase font-black tracking-[0.5em]">
              Precision Analysis by XMOOD AI Core
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
