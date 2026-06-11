
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { explainProduct } from "@/ai/flows/ai-product-explainer";
import { Cpu, Send, User, Bot, Loader2 } from "lucide-react";

export default function ConciergePage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'أهلاً بك في إكسيجو! أنا مساعدك الشخصي الفاخر. كيف يمكنني مساعدتك اليوم في اختيار خدماتنا أو شرح أي منتج؟' }
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
      setMessages(prev => [...prev, { role: 'ai', content: 'عذراً، حدث خطأ ما. حاول مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full border border-primary/10">
          <div className="bg-primary p-6 text-primary-foreground flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold tracking-tight">المساعد الذكي EXIGO</h1>
              <p className="text-xs opacity-70">قوة الذكاء الاصطناعي لخدمة احتياجاتك</p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${m.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {m.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${m.role === 'ai' ? 'bg-muted/50 border-primary/5 border' : 'bg-primary text-primary-foreground'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                    <Bot size={20} />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-2xl">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 bg-white border-t">
            <div className="relative flex gap-2">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسألني عن شحن ببجي، حسابات نادرة، أو أي خدمة أخرى..." 
                className="pr-4 h-14 rounded-full border-primary/20 focus-visible:ring-primary shadow-inner"
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading}
                className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shrink-0"
              >
                <Send className="rtl:rotate-180" />
              </Button>
            </div>
            <p className="text-[10px] text-center mt-4 text-muted-foreground uppercase tracking-widest">
              Powered by Exigo AI Intelligence
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
