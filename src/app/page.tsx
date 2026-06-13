
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Trophy, Cpu, Heart, Sparkles, ArrowRight, 
  Zap, Instagram, Mail, Phone, MessageSquare, Palette, 
  Facebook, Youtube, Video 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function HomeSovereignPRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const primaryColor = config?.appearance?.primaryColor || "#d4af37";

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      <section className="relative pt-64 pb-80 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-v6" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke={primaryColor} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-v6)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center animate-fade-up">
          <Badge className="mb-14 py-3 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-bold tracking-widest uppercase text-[10px]">
            {config?.siteInfo?.subtitle || "XMOOD - الوجهة الأولى للخدمات الرقمية"}
          </Badge>
          
          <h1 className="text-7xl md:text-[8rem] mb-12 font-headline font-bold leading-tight tracking-tight">
             <span className="block gold-text py-2">
               {config?.siteInfo?.heroTitle || "عالمك الرقمي الحصري"}
             </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-4xl mx-auto mb-20 leading-relaxed font-light">
            {config?.siteInfo?.heroDescription || "نقدم لك أفضل باقات شحن الألعاب، الحسابات المميزة، والخدمات الاحترافية بأعلى معايير الأمان والسرعة."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-64">
            <Button asChild className="royal-button h-20 px-24 text-xl shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:scale-105">
              <Link href="/store"><Zap className="ml-4" /> تصفح المتجر</Link>
            </Button>
            <Button asChild className="accent-button h-20 px-24 text-xl shadow-[0_0_40px_rgba(220,38,38,0.1)] hover:scale-105">
              <Link href="/designs/gallery"><Palette className="ml-4" /> معرض التصاميم</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto pt-40 border-t border-white/5">
            {[
              { icon: ShieldCheck, title: "حماية تامة", desc: "أنظمة تشفير متطورة", color: "text-red-500" },
              { icon: Trophy, title: "مكافآت النخبة", desc: "نقاط وهدايا مستمرة", color: "text-primary" },
              { icon: Cpu, title: "مساعد ذكي", desc: "دعم فني فوري 24/7", color: "text-red-500" },
              { icon: Heart, title: "وساطة مضمونة", desc: "أمان كامل لصفقاتك", color: "text-primary" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group hover:translate-y-[-10px] transition-all duration-500">
                <div className={`w-24 h-24 bg-zinc-950 border border-white/5 rounded-3xl flex items-center justify-center ${item.color} shadow-xl group-hover:border-primary/40 transition-all`}>
                  <item.icon size={36} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-xl text-white mb-2">{item.title}</h4>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-40 bg-black border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-7xl mb-12">{config?.siteInfo?.title || "XMOOD"}</div>
          <p className="text-zinc-500 max-w-2xl mx-auto mb-16 text-lg leading-relaxed">{config?.siteInfo?.description}</p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-16">
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-bold">
                  <Mail size={18} className="text-red-600" /> {config.contact.email}
               </a>
             )}
             {config?.contact?.whatsapp && (
               <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-bold">
                  <MessageSquare size={18} className="text-green-500" /> واتساب الدعم
               </a>
             )}
             {config?.contact?.phone && (
               <a href={`tel:${config.contact.phone}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-bold">
                  <Phone size={18} className="text-primary" /> {config.contact.phone}
               </a>
             )}
          </div>

          <div className="flex flex-wrap justify-center gap-12 mb-20">
             {config?.contact?.telegram && (
               <a href={`https://t.me/${config.contact.telegram}`} target="_blank" className="text-zinc-500 hover:text-primary transition-all"><Zap size={24}/></a>
             )}
             {config?.contact?.instagram && (
               <a href={`https://instagram.com/${config.contact.instagram}`} target="_blank" className="text-zinc-500 hover:text-primary transition-all"><Instagram size={24}/></a>
             )}
             {config?.contact?.facebook && (
               <a href={config.contact.facebook} target="_blank" className="text-zinc-500 hover:text-primary transition-all"><Facebook size={24}/></a>
             )}
             {config?.contact?.youtube && (
               <a href={config.contact.youtube} target="_blank" className="text-zinc-500 hover:text-primary transition-all"><Youtube size={24}/></a>
             )}
             {config?.contact?.tiktok && (
               <a href={config.contact.tiktok} target="_blank" className="text-zinc-500 hover:text-primary transition-all"><Video size={24}/></a>
             )}
          </div>

          <div className="flex flex-wrap justify-center gap-16 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">
            <Link href="/marketplace" className="hover:text-primary transition-all">المجتمع</Link>
            <Link href="/designs/gallery" className="hover:text-primary transition-all">المعرض</Link>
            <Link href="/middleman" className="hover:text-primary transition-all">الوكلاء</Link>
            <Link href="/admin" className="hover:text-primary transition-all">الإدارة</Link>
          </div>
          <div className="mt-24 text-[9px] font-bold text-zinc-800 uppercase tracking-[0.8em]">
            {config?.siteInfo?.copyright || "© 2025 XMOOD PREMIUM SERVICES. ALL RIGHTS RESERVED."}
          </div>
        </div>
      </footer>
    </main>
  );
}
