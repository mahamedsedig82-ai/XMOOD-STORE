
'use client';

import { useState, useEffect } from "react";
import { Sparkles, X, Heart, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

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
      if (!isOpen) setIsOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config?.bot?.greeting) {
      setMessage(config.bot.greeting);
    } else {
      setMessage("يا هلا بك! أنا المحلل الذكي لمتجر XMOOD. كيف يمكنني مساعدتك في تحليل خياراتك اليوم؟ ✨");
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

  return (
    <div className="fixed bottom-8 left-8 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-4 w-80 luxury-card p-6 border-primary/20 relative shadow-2xl bg-zinc-950/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600" />
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex gap-4 mb-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Cpu size={20} />
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">XMOOD ANALYST</p>
                 <p className="text-[8px] text-zinc-500 font-bold">المحلل الرقمي الذكي</p>
              </div>
            </div>
            <p className="text-xs font-bold leading-relaxed text-zinc-300 mb-6 min-h-[3rem]">
              {message}
            </p>
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <Button 
                onClick={handleNextTip}
                variant="ghost" 
                className="text-[10px] font-black text-zinc-500 hover:text-primary p-0 h-auto"
              >
                تحليل آخر؟ 💡
              </Button>
              <Heart size={14} className="text-red-600 fill-red-600 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-16 px-6 bg-zinc-950 rounded-2xl flex items-center gap-3 shadow-2xl shadow-primary/20 border border-primary/30 group"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
          <Sparkles size={18} />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest">X-ANALYST</span>
      </motion.button>
    </div>
  );
}
