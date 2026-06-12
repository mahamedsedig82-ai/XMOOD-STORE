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
      setMessage("يا هلا بك! أنا مساعدك الذكي في XMOOD. كيف أقدر أخدمك اليوم؟ ✨");
    }
  }, [config]);

  if (!isMounted) return null;

  const tips = config?.bot ? [
    config.bot.tip1,
    config.bot.tip2,
    config.bot.tip3
  ].filter(Boolean) : [
    "تبي تشحن ألعابك؟ تصفح قسم المتجر لآخر العروض! 🎮",
    "تأكد من توثيق حسابك للاستفادة من كامل مميزاتنا! 🎁",
    "التحويل بين المستخدمين سهل وسريع، جربه الآن! 💸"
  ];

  const handleNextTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
  };

  const botIcon = config?.appearance?.botIconUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/IMG_1020.webp";

  return (
    <div className="fixed bottom-8 left-8 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-4 w-72 luxury-card p-6 border-primary/20 relative shadow-2xl bg-zinc-950/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600" />
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex gap-4 mb-4 items-center">
              <Avatar className="w-12 h-12 border-2 border-primary/40 shadow-xl">
                <AvatarImage src={botIcon} className="object-cover" />
                <AvatarFallback className="bg-zinc-900 text-primary"><Sparkles size={16} /></AvatarFallback>
              </Avatar>
              <div className="text-right">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">XMOOD AI BOT</p>
                 <p className="text-[8px] text-zinc-500 font-bold">مساعدك الذكي</p>
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
                نصيحة أخرى؟ 💡
              </Button>
              <Heart size={14} className="text-red-600 fill-red-600 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-18 h-18 bg-zinc-950 rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 border-2 border-primary/40 group overflow-hidden"
      >
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={botIcon} className="object-cover group-hover:scale-110 transition-transform duration-500" />
          <AvatarFallback className="bg-zinc-900 text-primary font-black"><Sparkles size={24} /></AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-all" />
      </motion.button>
    </div>
  );
}
