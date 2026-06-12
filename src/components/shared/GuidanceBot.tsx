
'use client';

import { useState, useEffect } from "react";
import { Sparkles, X, Heart } from "lucide-react";
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
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config?.bot?.greeting) {
      setMessage(config.bot.greeting);
    } else {
      setMessage("يا هلا بك! أنا مساعدتك الذكية في XMOOD. كيف يمكنني مساعدتك اليوم؟ ✨");
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

  // الرابط الجديد للصورة التي تم تزويدها
  const botIcon = config?.appearance?.botIconUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/IMG_1020.webp";

  return (
    <div className="fixed bottom-8 left-8 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-4 w-72 luxury-card p-5 border-primary/20 relative shadow-2xl bg-zinc-950/95 backdrop-blur-3xl"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex gap-3 mb-3 items-center">
              <Avatar className="w-10 h-10 border-2 border-primary/40 shadow-xl">
                <AvatarImage src={botIcon} className="object-cover" />
                <AvatarFallback className="bg-primary/20 text-primary"><Sparkles size={14} /></AvatarFallback>
              </Avatar>
              <div className="text-right">
                 <p className="text-[8px] font-bold text-primary uppercase tracking-widest">XMOOD AI BOT</p>
                 <p className="text-[7px] text-zinc-500">مساعدة ذكية</p>
              </div>
            </div>
            <p className="text-xs font-medium leading-relaxed text-zinc-300 mb-4 min-h-[2.5rem]">
              {message}
            </p>
            <div className="flex justify-between items-center border-t border-white/5 pt-3">
              <Button 
                onClick={handleNextTip}
                variant="ghost" 
                className="text-[9px] font-bold text-zinc-500 hover:text-primary p-0 h-auto"
              >
                نصيحة أخرى؟ 💡
              </Button>
              <Heart size={12} className="text-red-600 fill-red-600 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 border-2 border-primary/40 group overflow-hidden"
      >
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={botIcon} className="object-cover group-hover:scale-110 transition-transform duration-500" />
          <AvatarFallback className="bg-primary text-black"><Sparkles size={20} /></AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-all" />
      </motion.button>
    </div>
  );
}
