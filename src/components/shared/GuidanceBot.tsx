
'use client';

import { useState, useEffect } from "react";
import { X, Heart, Bot, MessageCircle, Sparkles, Send } from "lucide-react";
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
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config?.bot?.greeting) {
      setMessage(config.bot.greeting);
    } else {
      setMessage("مرحباً بك! أنا مساعدك الذكي في متجر XMOOD. كيف يمكنني إرشادك اليوم؟ ✨");
    }
  }, [config]);

  if (!isMounted) return null;

  const botColor = config?.bot?.primaryColor || "#d4af37";

  return (
    <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[90]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="mb-4 w-[320px] md:w-[400px] luxury-card p-0 border-primary/20 relative shadow-2xl bg-card/98 backdrop-blur-3xl overflow-hidden rounded-[2.5rem]"
          >
            {/* Bot Header */}
            <div className="p-6 bg-muted/30 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <Avatar className="w-12 h-12 border-2 border-primary/30 shadow-lg">
                      <AvatarImage src={config?.bot?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-black">
                         <Bot size={24} />
                      </AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                </div>
                <div>
                   <p className="text-sm font-black gold-text uppercase tracking-widest">{config?.bot?.name || "X-ANALYST"}</p>
                   <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em]">Verified Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-primary transition-colors p-2 bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-8 space-y-6">
               <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 shadow-inner">
                  <p className="text-sm font-bold leading-relaxed text-foreground min-h-[4rem]">
                    {message}
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 hover:bg-primary/10 hover:text-primary font-black text-[10px] uppercase">
                     <a href="/store">استكشاف المتجر 🛒</a>
                  </Button>
                  <Button asChild className="h-12 rounded-2xl royal-button font-black text-[10px] uppercase">
                     <a href={`https://wa.me/${config?.contact?.whatsapp?.replace(/\+/g, '')}`} target="_blank">
                        دعم بشري مباشر 👨‍💻
                     </a>
                  </Button>
               </div>
            </div>

            {/* Bot Footer */}
            <div className="px-8 pb-6 flex items-center justify-between opacity-30 border-t border-white/5 pt-4">
               <div className="flex items-center gap-2">
                 <Sparkles size={12} className="text-primary" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em]">AI Core V3.0</span>
               </div>
               <Heart size={10} className="text-red-500 fill-current" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: botColor }}
        className="relative h-16 w-16 md:h-20 md:w-20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-background group"
      >
        <div className="text-black group-hover:scale-110 transition-transform">
           {isOpen ? <X size={28} /> : (
             config?.bot?.logoUrl ? <img src={config.bot.logoUrl} className="w-10 h-10 object-contain" alt="" /> : <Bot size={32} />
           )}
        </div>
        {!isOpen && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg"
          >
            1
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

