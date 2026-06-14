
'use client';

import { useState, useEffect } from "react";
import { Sparkles, X, Heart, Cpu, Send, Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GuidanceBot() {
  const [isOpen, setIsOpen] = useState(false);
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);
  
  const [message, setMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      if (window.innerWidth > 768 && !isOpen) setIsOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config?.bot?.greeting) {
      setMessage(config.bot.greeting);
    } else {
      setMessage("مرحباً بك! أنا المحلل الذكي لمتجر XMOOD. كيف يمكنني مساعدتك اليوم؟ ✨");
    }
  }, [config]);

  if (!isMounted) return null;

  const tips = config?.bot ? [
    config.bot.tip1,
    config.bot.tip2,
    config.bot.tip3
  ].filter(Boolean) : [
    "بناءً على تحليل المبيعات، قسم شحن الألعاب هو الأكثر طلباً حالياً. 🎮",
    "أنصحك بشحن المحفظة مسبقاً لتفادي ضياع العروض المحدودة. 💸",
    "نظام التحويل لدينا يخضع لبروتوكول أمان عالٍ لضمان سلامة رصيدك. 🚀"
  ];

  const handleNextTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
  };

  const botColor = config?.bot?.primaryColor || "var(--primary)";

  return (
    <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[90]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-4 w-[300px] md:w-96 luxury-card p-0 border-primary/20 relative shadow-2xl bg-card/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="p-6 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <Avatar className="w-12 h-12 border-2 border-primary/30">
                      <AvatarImage src={config?.bot?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-black font-black">
                         <Bot size={24} />
                      </AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest">{config?.bot?.name || "X-ANALYST"}</p>
                   <p className="text-[8px] text-muted-foreground font-bold">مستشارك الرقمي المعتمد</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-primary transition-colors p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6">
               <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <p className="text-sm font-bold leading-relaxed text-foreground min-h-[3rem]">
                    {message}
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10 text-[9px] font-black uppercase rounded-xl border-primary/20 text-primary" onClick={handleNextTip}>
                     نصيحة أخرى 💡
                  </Button>
                  <Button asChild className="h-10 text-[9px] font-black uppercase rounded-xl royal-button">
                     <a href={`https://wa.me/${config?.contact?.whatsapp?.replace(/\+/g, '')}`} target="_blank">
                        دعم بشري 👨‍💻
                     </a>
                  </Button>
               </div>
            </div>

            <div className="px-8 pb-8 flex items-center justify-between opacity-50">
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">AI Core Powered</span>
               <Heart size={10} className="text-red-500 fill-current animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-14 w-14 md:h-20 md:w-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 border-4 border-background group"
      >
        <div className="text-black group-hover:scale-110 transition-transform">
           {isOpen ? <MessageCircle size={32} /> : <Bot size={36} />}
        </div>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce">
            1
          </div>
        )}
      </motion.button>
    </div>
  );
}
