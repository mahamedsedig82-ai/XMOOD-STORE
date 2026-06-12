
'use client';

import { useState, useEffect } from "react";
import { Sparkles, X, Zap, Heart, MessageCircleHeart } from "lucide-react";
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
    if (config?.translations?.botGreeting) {
      setMessage(config.translations.botGreeting);
    } else {
      setMessage("يا هلا بك! أنا مساعدك الذكي، موجود هنا عشان أخلي تجربتك في XMOOD سهلة وممتعة. وش حاب تعرف اليوم؟ ✨");
    }
  }, [config]);

  if (!isMounted) return null;

  const tips = [
    "تبي تشحن ألعابك؟ قسم المتجر فيه كل اللي تحتاجه! 🎮",
    "لا تنسى توثق حسابك عشان تحصل على هدايا ونقاط أكثر! 🎁",
    "نظام التحويل صار أسرع، تقدر ترسل لأخوياك بضغطة زر! 💸",
    "عندنا خدمات تصميم خرافية، شوفها في قسم الخدمات! 🎨",
    "المحفظة هي مكانك الآمن لكل عملياتك الشرائية. 🔒"
  ];

  const handleNextTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMessage(randomTip);
  };

  return (
    <div className="fixed bottom-10 left-10 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-6 w-80 luxury-card p-6 border-primary/20 relative shadow-2xl bg-zinc-950/90"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex gap-3 mb-4 items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                <MessageCircleHeart size={20} className="fill-primary" />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">XMOOD Friendly Bot</p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-zinc-300 mb-6">
              {message}
            </p>
            <div className="flex justify-between items-center">
              <Button 
                onClick={handleNextTip}
                variant="ghost" 
                className="text-[10px] font-bold text-zinc-500 hover:text-primary p-0 h-auto"
              >
                عطني نصيحة ثانية 💡
              </Button>
              <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black shadow-lg shadow-primary/20 border-4 border-zinc-950"
      >
        <Sparkles size={28} />
      </motion.button>
    </div>
  );
}
