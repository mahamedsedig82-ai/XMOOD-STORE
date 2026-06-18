"use client";

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Send, Mail, MapPin, MessageSquare } from "lucide-react";

export function Footer() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  if (config?.footer?.isActive === false) return null;

  return (
    <footer className="py-24 bg-muted/10 border-t" dir="rtl">
      <div className="container mx-auto px-6 text-center">
        <div className="mb-10 flex flex-col items-center group">
          <Link href="/" className="flex flex-col items-center">
            {config?.appearance?.logoUrl ? (
              <img src={config.appearance.logoUrl} className="h-16 md:h-24 w-auto object-contain mb-4" style={{ borderRadius: '2rem' }} alt="Logo" />
            ) : (
              <>
                <span className="handwritten-logo text-6xl md:text-9xl mb-2">XMOOD <span>Store</span></span>
                <span className="text-[10px] md:text-xs font-black tracking-[1em] uppercase text-primary opacity-60 group-hover:opacity-100 transition-opacity">Legendary Marketplace</span>
              </>
            )}
          </Link>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-lg md:text-xl leading-relaxed font-medium">
          {config?.footer?.aboutText || "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة عبر منصة XMOOD المتطورة."}
        </p>
        
        {config?.footer?.address && (
           <div className="flex items-center justify-center gap-2 mb-12 text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <MapPin size={16} className="text-primary" />
              <span>{config.footer.address}</span>
           </div>
        )}

        <div className="flex flex-wrap justify-center gap-8 mb-12">
           {config?.contact?.whatsapp && (
             <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '')}`} target="_blank" className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-xs bg-card px-10 py-5 rounded-2xl shadow-xl border">
                <MessageSquare size={24} className="text-green-500" /> الدعم التنفيذي
             </a>
           )}
           {config?.contact?.email && (
             <a href={`mailto:${config.contact.email}`} className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-xs bg-card px-10 py-5 rounded-2xl shadow-xl border">
                <Mail size={24} className="text-primary" /> التواصل الرسمي
             </a>
           )}
        </div>

        <div className="flex justify-center gap-6 mb-16">
          {config?.contact?.facebook && (
            <a href={config.contact.facebook} target="_blank" className="w-12 h-12 bg-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:scale-110 transition-all border shadow-sm">
              <Facebook size={24} />
            </a>
          )}
          {config?.contact?.instagram && (
            <a href={config.contact.instagram} target="_blank" className="w-12 h-12 bg-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-pink-600 hover:scale-110 transition-all border shadow-sm">
              <Instagram size={24} />
            </a>
          )}
          {config?.contact?.youtube && (
            <a href={config.contact.youtube} target="_blank" className="w-12 h-12 bg-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-600 hover:scale-110 transition-all border shadow-sm">
              <Youtube size={24} />
            </a>
          )}
          {config?.contact?.telegram && (
            <a href={`https://t.me/${config.contact.telegram}`} target="_blank" className="w-12 h-12 bg-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:scale-110 transition-all border shadow-sm">
              <Send size={24} />
            </a>
          )}
        </div>

        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
          {config?.footer?.copyright || "© 2025 XMOOD SOVEREIGN. ALL RIGHTS RESERVED."}
        </p>
      </div>
    </footer>
  );
}