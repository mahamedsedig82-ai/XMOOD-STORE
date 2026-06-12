
'use client';

import { useState, useEffect } from "react";
import { Sparkles, X, Heart, MessageCircleHeart } from "lucide-react";
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
      if (!isOpen) setIsOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config?.bot?.greeting) {
      setMessage(config.bot.greeting);
    } else {
      setMessage("يا هلا بك! أنا مساعدك الذكي في XMOOD. كيف يمكنني مساعدتك اليوم؟ ✨");
    }
  }, [config]);

  if (!isMounted) return null;

  const tips = config?.bot ? [
    config.bot.tip1,
    config.bot.tip2,
    config.bot.tip3
  ].filter(Boolean) : [
    "تبي تشحن ألعابك؟ قسم المتجر فيه كل اللي تحتاجه! 🎮",
    "لا تنسى توثق حسابك عشان تحصل على هدايا ونقاط أكثر! 🎁",
    "نظام التحويل صار أسرع، تقدر ترسل لأخوياك بضغطة زر! 💸"
  ];

  const handleNextTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
  };

  const botIcon = config?.appearance?.botIconUrl || "https://picsum.photos/seed/anime/200/200";

  return (
    <div className="fixed bottom-10 left-10 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-6 w-80 luxury-card p-6 border-primary/20 relative shadow-2xl bg-zinc-950/95 backdrop-blur-3xl"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex gap-3 mb-4 items-center">
              <Avatar className="w-12 h-12 border-2 border-primary/40 shadow-xl">
                <AvatarImage src={botIcon} className="object-cover" />
                <AvatarFallback className="bg-primary/20 text-primary"><Sparkles size={16} /></AvatarFallback>
              </Avatar>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest">XMOOD AI BOT</p>
                 <p className="text-[8px] text-zinc-500">Smart Concierge</p>
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed text-zinc-300 mb-6 min-h-[3rem]">
              {message}
            </p>
            <div className="flex justify-between items-center">
              <Button 
                onClick={handleNextTip}
                variant="ghost" 
                className="text-[10px] font-bold text-zinc-500 hover:text-primary p-0 h-auto"
              >
                هل من نصيحة أخرى؟ 💡
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
        className="relative w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-primary/40 group overflow-hidden"
      >
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={botIcon} className="object-cover group-hover:scale-110 transition-transform duration-500" />
          <AvatarFallback className="bg-primary text-black"><Sparkles size={28} /></AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-all" />
      </motion.button>
    </div>
  );
}
