"use client";

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Send, Mail, MapPin, MessageSquare } from "lucide-react";

const DragonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export function Footer() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  if (config?.footer?.isActive === false) return null;

  return (
    <footer className="py-32 bg-muted/15 border-t relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,175,55,0.03),transparent_60%)]" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-12 flex flex-col items-center group">
          <Link href="/" className="flex flex-col items-center transition-transform hover:scale-105">
            {config?.appearance?.logoUrl ? (
              <img src={config.appearance.logoUrl} className="h-20 md:h-28 w-auto object-contain mb-6 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl" alt="Logo" />
            ) : (
              <div className="flex flex-col items-center">
                <DragonIcon className="w-16 h-16 text-primary mb-6 opacity-40 group-hover:opacity-100 transition-all duration-700" />
                <span className="handwritten-logo text-5xl md:text-8xl mb-3">XMOOD STORE</span>
                <span className="text-[11px] md:text-sm font-black tracking-[1.2em] uppercase text-primary opacity-40 group-hover:opacity-80 transition-opacity">Legendary Digital Sovereign</span>
              </div>
            )}
          </Link>
        </div>
        
        <p className="text-muted-foreground max-w-3xl mx-auto mb-20 text-xl md:text-2xl leading-relaxed font-medium italic">
          {config?.footer?.aboutText || "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة عبر منصة XMOOD STORE المتطورة، حيث تلتقي الفخامة بالتقنية السيادية."}
        </p>
        
        {config?.footer?.address && (
           <div className="flex items-center justify-center gap-3 mb-16 text-muted-foreground font-black text-sm uppercase tracking-widest bg-card/40 w-fit mx-auto px-10 py-4 rounded-[2rem] border shadow-inner">
              <MapPin size={20} className="text-primary animate-bounce" />
              <span>{config.footer.address}</span>
           </div>
        )}

        <div className="flex flex-wrap justify-center gap-10 mb-20">
           {config?.contact?.whatsapp && (
             <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '')}`} target="_blank" className="flex items-center gap-5 text-foreground hover:gold-text transition-all font-black text-sm bg-card px-12 py-6 rounded-[2.25rem] shadow-2xl border hover:border-primary/30 group">
                <MessageSquare size={28} className="text-green-500 group-hover:scale-110 transition-transform" /> الدعم التنفيذي المباشر
             </a>
           )}
           {config?.contact?.email && (
             <a href={`mailto:${config.contact.email}`} className="flex items-center gap-5 text-foreground hover:gold-text transition-all font-black text-sm bg-card px-12 py-6 rounded-[2.25rem] shadow-2xl border hover:border-primary/30 group">
                <Mail size={28} className="text-primary group-hover:scale-110 transition-transform" /> المراسلات الرسمية
             </a>
           )}
        </div>

        <div className="flex justify-center gap-8 mb-24">
          {config?.contact?.facebook && (
            <a href={config.contact.facebook} target="_blank" className="w-16 h-16 bg-card rounded-[1.75rem] flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:scale-110 transition-all border shadow-xl hover:border-blue-500/20">
              <Facebook size={32} />
            </a>
          )}
          {config?.contact?.instagram && (
            <a href={config.contact.instagram} target="_blank" className="w-16 h-16 bg-card rounded-[1.75rem] flex items-center justify-center text-muted-foreground hover:text-pink-600 hover:scale-110 transition-all border shadow-xl hover:border-pink-500/20">
              <Instagram size={32} />
            </a>
          )}
          {config?.contact?.youtube && (
            <a href={config.contact.youtube} target="_blank" className="w-16 h-16 bg-card rounded-[1.75rem] flex items-center justify-center text-muted-foreground hover:text-red-600 hover:scale-110 transition-all border shadow-xl hover:border-red-500/20">
              <Youtube size={32} />
            </a>
          )}
          {config?.contact?.telegram && (
            <a href={`https://t.me/${config.contact.telegram}`} target="_blank" className="w-16 h-16 bg-card rounded-[1.75rem] flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:scale-110 transition-all border shadow-xl hover:border-blue-400/20">
              <Send size={32} />
            </a>
          )}
        </div>

        <div className="pt-16 border-t border-border/50">
           <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-40">
             {config?.footer?.copyright || "© 2025 XMOOD STORE SOVEREIGN GROUP. ALL RIGHTS RESERVED."}
           </p>
        </div>
      </div>
    </footer>
  );
}