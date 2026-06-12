
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trophy, Cpu, Heart, Sparkles, ArrowRight, Zap, Instagram, Mail, Phone, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function HomeSovereignPRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const primaryColor = config?.appearance?.primaryColor || "#d4af37";
  const accentColor = config?.appearance?.accentColor || "#dc2626";

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
              <Link href="/designs/request">اطلب تصميمك</Link>
            </Button>
          </div>

          {/* Dynamic Banners from Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-64">
             {config?.promotions?.banner1Title && (
               <div className="luxury-card p-10 border-primary/20 bg-primary/5 text-right relative overflow-hidden group">
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
                  <h3 className="text-3xl font-bold gold-text mb-4">{config.promotions.banner1Title}</h3>
                  <p className="text-zinc-500 font-bold mb-8 text-sm">{config.promotions.banner1Subtitle}</p>
                  <Button asChild variant="outline" className="border-primary/20 text-primary hover:bg-primary hover:text-black rounded-xl h-12 px-8">
                     <Link href={config.promotions.banner1Link}>اكتشف العرض <ArrowRight size={16} className="mr-2" /></Link>
                  </Button>
               </div>
             )}
             {config?.promotions?.banner2Title && (
               <div className="luxury-card p-10 border-red-600/20 bg-red-600/5 text-right relative overflow-hidden group">
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-red-600/10 blur-3xl rounded-full" />
                  <h3 className="text-3xl font-bold text-red-500 mb-4">{config.promotions.banner2Title}</h3>
                  <p className="text-zinc-500 font-bold mb-8 text-sm">{config.promotions.banner2Subtitle}</p>
                  <Button asChild variant="outline" className="border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl h-12 px-8">
                     <Link href={config.promotions.banner2Link}>اطلب الآن <ArrowRight size={16} className="mr-2" /></Link>
                  </Button>
               </div>
             )}
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

      <section className="py-40 bg-zinc-950/20">
        <div className="container mx-auto px-6">
           <div className="max-w-6xl mx-auto luxury-card p-24 relative overflow-hidden text-center legendary-border">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full"></div>
              
              <Sparkles size={80} className="mx-auto mb-12 text-primary animate-pulse" />
              <h2 className="text-5xl md:text-7xl font-headline font-bold gold-text mb-8">التجربة الرقمية الأمثل</h2>
              <p className="text-zinc-400 text-2xl leading-relaxed mb-16 font-light max-w-3xl mx-auto">
                نجمع لك الجودة والاحترافية والسرعة في منصة واحدة تدار بأحدث تقنيات الذكاء الاصطناعي لضمان رضاك التام.
              </p>
              <Button asChild className="royal-button h-20 px-24 text-xl">
                 <Link href="/marketplace">انضم لمجتمع XMOOD <ArrowRight className="mr-4" /></Link>
              </Button>
           </div>
        </div>
      </section>

      <footer className="py-40 bg-black border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-7xl mb-12">{config?.siteInfo?.title || "XMOOD"}</div>
          
          {/* Contact Details from Admin */}
          <div className="flex flex-wrap justify-center gap-10 mb-16">
             <a href={`mailto:${config?.contact?.email}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-bold">
                <Mail size={18} className="text-red-600" /> {config?.contact?.email || "XMOODSTORE.SUPPORT@GMAIL.COM"}
             </a>
             <a href={`tel:${config?.contact?.phone}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-bold">
                <Phone size={18} className="text-primary" /> {config?.contact?.phone || "+249999484771"}
             </a>
             <a href={`https://instagram.com/${config?.contact?.instagram}`} target="_blank" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-bold">
                <Instagram size={18} className="text-red-600" /> {config?.contact?.instagram || "X3O_D"}
             </a>
          </div>

          <p className="text-zinc-500 max-w-3xl mx-auto mb-20 text-xl font-light leading-relaxed">
            {config?.siteInfo?.heroDescription || "نقدم الجودة والاحترافية في عالم الألعاب والتصميم الرقمي لمنحك أفضل الخدمات الممكنة."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-16 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">
            <Link href="/terms" className="hover:text-primary transition-all">الشروط</Link>
            <Link href="/privacy" className="hover:text-primary transition-all">الخصوصية</Link>
            <Link href="/support" className="hover:text-primary transition-all">المساعدة</Link>
            <Link href="/admin" className="hover:text-primary transition-all">الإدارة</Link>
          </div>
          <div className="mt-24 text-[9px] font-bold text-zinc-800 uppercase tracking-[0.8em]">
            © 2025 XMOOD PREMIUM SERVICES. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
