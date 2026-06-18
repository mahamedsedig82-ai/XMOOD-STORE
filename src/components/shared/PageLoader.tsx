'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * 🛡️ PageLoader Pro 24.0 (Hydration-Safe)
 * Strictly renders client-side to prevent hydration mismatch with Framer Motion.
 */
export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // ⚡ تم تقليل الوقت لزيادة سرعة دخول المستخدم للموقع
    const timer = setTimeout(() => setIsVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 🛡️ SSR Guard: Never render on server
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-background"
        >
          <div className="relative">
            {/* Golden Ripple Effect - High Performance */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 bg-primary rounded-full will-change-transform"
            />
            
            {/* Brand Identity */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center relative z-10"
            >
              <span className="handwritten-logo text-6xl md:text-8xl block mb-4 drop-shadow-2xl">
                XMOOD STORE
              </span>
              <div className="flex items-center justify-center gap-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "80px" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="h-[1px] bg-primary/30"
                />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap">
                  Premium Experience
                </span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "80px" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="h-[1px] bg-primary/30"
                />
              </div>
            </motion.div>
          </div>

          {/* Minimal Progress Bar */}
          <div className="absolute bottom-20 w-40 h-[1.5px] bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-primary shadow-[0_0_8px_#d4af37]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}