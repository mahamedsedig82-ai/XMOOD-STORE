'use client';

import { useState, useEffect } from "react";
import { X, Heart, Bot, MessageCircle, Sparkles, Send, User } from "lucide-react";
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
      setMessage("مرحباً بك! أنا مرشدك الذكي في متجر XMOOD. كيف يمكنني مساعدتك اليوم؟ ✨");
    }
  }, [config]);

  if (!isMounted) return null;

  const botColor = config?.bot?.primaryColor || "#d4af37";

  return (
    <div className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4 w-[320px] md:w-[380px] luxury-card p-0 border-primary/10 shadow-2xl bg-card/98 backdrop-blur-2xl overflow-hidden rounded-[2rem]"
          >
            {/* Minimal Header */}
            <div className="p-5 bg-muted/10 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                   <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarImage src={config?.bot?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-white"><Bot size={20} /></AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                   <p className="text-xs font-black gold-text uppercase tracking-widest">{config?.bot?.name || "X-GUIDE"}</p>
                   <p className="text-[7px] text-muted-foreground font-black uppercase tracking-widest">Verified Assistance</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors p-1.5 hover:bg-muted rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Support Message */}
            <div className="p-6 space-y-5">
               <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                  <p className="text-xs font-bold leading-relaxed text-foreground min-h-[3rem]">
                    {message}
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="h-10 rounded-xl border-border hover:bg-primary/5 hover:text-primary font-bold text-[9px] uppercase tracking-widest">
                     <a href="/store">زيارة المتجر 🛒</a>
                  </Button>
                  <Button asChild className="h-10 rounded-xl royal-button font-bold text-[9px] uppercase tracking-widest">
                     <a href={`https://wa.me/${config?.contact?.whatsapp?.replace(/\+/g, '')}`} target="_blank">دعم مباشر 👨‍💻</a>
                  </Button>
               </div>
            </div>

            <div className="px-6 pb-4 flex items-center justify-between opacity-30 pt-2 border-t">
               <span className="text-[7px] font-black uppercase tracking-widest flex items-center gap-1"><Sparkles size={8} className="text-primary"/> AI Support Powered</span>
               <Heart size={8} className="text-red-500 fill-current" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: botColor }}
        className="h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 border-4 border-background group relative"
      >
        <div className="text-white">
           {isOpen ? <X size={24} /> : (
             config?.bot?.logoUrl ? <img src={config.bot.logoUrl} className="w-8 h-8 object-contain" alt="" /> : <MessageCircle size={28} />
           )}
        </div>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background">1</div>
        )}
      </motion.button>
    </div>
  );
}
