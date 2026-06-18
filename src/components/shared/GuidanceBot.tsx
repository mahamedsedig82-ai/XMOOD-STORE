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
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-3 w-[290px] md:w-[330px] luxury-card p-0 border-primary/10 shadow-2xl bg-card/98 backdrop-blur-2xl overflow-hidden rounded-[1.5rem]"
          >
            {/* Compact Header */}
            <div className="p-3 bg-muted/5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                   <Avatar className="w-8 h-8 border border-primary/20">
                      <AvatarImage src={config?.bot?.avatarUrl} />
                      <AvatarFallback className="bg-primary text-white"><Bot size={16} /></AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                   <p className="text-[10px] font-black gold-text uppercase tracking-widest leading-none">{config?.bot?.name || "X-GUIDE"}</p>
                   <p className="text-[6px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">Sovereign Support</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-muted rounded-md">
                <X size={14} />
              </button>
            </div>

            {/* Compact Message Area */}
            <div className="p-4 space-y-4">
               <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="text-[11px] font-bold leading-relaxed text-foreground min-h-[2.5rem]">
                    {message}
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="h-9 rounded-lg border-border hover:bg-primary/5 hover:text-primary font-bold text-[8px] uppercase tracking-tighter">
                     <a href="/store">المتجر 🛒</a>
                  </Button>
                  <Button asChild className="h-9 rounded-lg royal-button font-bold text-[8px] uppercase tracking-tighter py-0 px-2">
                     <a href={`https://wa.me/${config?.contact?.whatsapp?.replace(/\+/g, '')}`} target="_blank">دعم مباشر 👨‍💻</a>
                  </Button>
               </div>
            </div>

            <div className="px-4 pb-3 flex items-center justify-between opacity-30 pt-1.5 border-t">
               <span className="text-[6px] font-black uppercase tracking-widest flex items-center gap-1"><Sparkles size={6} className="text-primary"/> AI Assisted</span>
               <Heart size={6} className="text-red-500 fill-current" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: botColor }}
        className="h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center shadow-xl shadow-primary/20 border-4 border-background group relative"
      >
        <div className="text-white">
           {isOpen ? <X size={20} /> : (
             config?.bot?.logoUrl ? <img src={config.bot.logoUrl} className="w-6 h-6 object-contain" alt="" /> : <MessageCircle size={24} />
           )}
        </div>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-background">1</div>
        )}
      </motion.button>
    </div>
  );
}
