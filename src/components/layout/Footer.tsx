"use client";

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Send, Mail, MapPin, MessageSquare, Zap } from "lucide-react";

export function Footer() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  if (config?.footer?.isActive === false) return null;

  return (
    <footer className="py-24 bg-muted/10 border-t relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,175,55,0.02),transparent_60%)]" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-12 flex flex-col items-center group">
          <Link href="/" className="flex flex-col items-center transition-transform hover:scale-105">
            {config?.appearance?.logoUrl ? (
              <img src={config.appearance.logoUrl} className="h-16 md:h-20 w-auto object-contain mb-6 rounded-2xl border border-primary/10 shadow-xl" alt="Logo" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="handwritten-logo text-4xl md:text-6xl mb-2">XMOOD <span>STORE</span></span>
                <span className="text-[10px] md:text-xs font-black tracking-[0.8em] uppercase text-primary/40 group-hover:opacity-70 transition-opacity">Sovereign Cloud Hub</span>
              </div>
            )}
          </Link>
        </div>
        
        <p className="text-muted-foreground max-w-3xl mx-auto mb-16 text-lg md:text-xl leading-relaxed font-medium italic opacity-70">
          {config?.footer?.aboutText || "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة عبر منصة XMOOD STORE المتطورة، حيث تلتقي الفخامة بالتقنية السيادية."}
        </p>
        
        {config?.footer?.address && (
           <div className="flex items-center justify-center gap-3 mb-12 text-muted-foreground font-black text-xs uppercase tracking-widest bg-card/40 w-fit mx-auto px-8 py-3 rounded-xl border shadow-sm">
              <MapPin size={16} className="text-primary animate-bounce" />
              <span>{config.footer.address}</span>
           </div>
        )}

        <div className="flex flex-wrap justify-center gap-8 mb-16">
           {config?.contact?.whatsapp && (
             <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '')}`} target="_blank" className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-xs bg-card px-10 py-5 rounded-2xl shadow-xl border hover:border-primary/20 group">
                <MessageSquare size={24} className="text-green-500 group-hover:scale-110 transition-transform" /> الدعم المباشر
             </a>
           )}
           {config?.contact?.email && (
             <a href={`mailto:${config.contact.email}`} className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-xs bg-card px-10 py-5 rounded-2xl shadow-xl border hover:border-primary/20 group">
                <Mail size={24} className="text-primary group-hover:scale-110 transition-transform" /> المراسلات الرسمية
             </a>
           )}
        </div>

        <div className="flex justify-center gap-6 mb-20">
          {[
            { icon: Facebook, href: config?.contact?.facebook, color: 'hover:text-blue-600' },
            { icon: Instagram, href: config?.contact?.instagram, color: 'hover:text-pink-600' },
            { icon: Youtube, href: config?.contact?.youtube, color: 'hover:text-red-600' },
            { icon: Send, href: config?.contact?.telegram ? `https://t.me/${config.contact.telegram}` : null, color: 'hover:text-blue-400' }
          ].map((social, i) => social.href && (
            <a key={i} href={social.href} target="_blank" className={`w-12 h-12 bg-card rounded-xl flex items-center justify-center text-muted-foreground transition-all border shadow-md hover:border-primary/20 hover:scale-110 ${social.color}`}>
              <social.icon size={24} />
            </a>
          ))}
        </div>

        <div className="pt-12 border-t border-border/50">
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30">
             {config?.footer?.copyright || "© 2025 XMOOD STORE SOVEREIGN GROUP. ALL RIGHTS RESERVED."}
           </p>
        </div>
      </div>
    </footer>
  );
}