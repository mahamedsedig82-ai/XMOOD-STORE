
'use client';

import { useState, useEffect } from "react";
import { Sparkles, X, Cpu, Zap, ShieldCheck } from "lucide-react";
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
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config?.translations?.botGreeting) {
      setMessage(config.translations.botGreeting);
    } else {
      setMessage("أهلاً بك أيها القائد! أنا 'نواة-X' مرشدك الذكي. تذكر: لا تشارك رمز الطوارئ الخاص بك مع أي شخص!");
    }
  }, [config]);

  if (!isMounted) return null;

  const tips = [
    "يمكنك شحن رصيدك عبر الوكلاء المعتمدين في قسم 'المحفظة'.",
    "نظام الوساطة لدينا يضمن حقك بنسبة 100% في العمليات الكبرى.",
    "استخدم استوديو التصميم لتوليد صور احترافية بذكاء Imagen 4.",
    "تحقق من نقاط أفضليتك في السوق لرفع رتبتك الاجتماعية.",
    "تأكد من مراجعة سجل التدفقات المالية بانتظام في محفظتك."
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
            className="mb-6 w-80 luxury-card p-8 border-primary/30 relative"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shrink-0 animate-pulse">
                <Cpu size={20} />
              </div>
              <p className="text-[11px] font-black text-primary uppercase tracking-widest">نواة-X الذكي</p>
            </div>
            <p className="text-sm font-bold leading-relaxed text-zinc-300 mb-6">
              {message}
            </p>
            <div className="flex justify-between items-center">
              <Button 
                onClick={handleNextTip}
                variant="ghost" 
                className="text-[9px] font-black uppercase text-zinc-500 hover:text-primary p-0 h-auto"
              >
                نصيحة أخرى <Zap size={10} className="ml-1" />
              </Button>
              <ShieldCheck size={14} className="text-primary/40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,184,0,0.3)] border-4 border-black"
      >
        <Sparkles size={28} />
      </motion.button>
    </div>
  );
}
