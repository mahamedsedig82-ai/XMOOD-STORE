
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trophy, Cpu, HeartHandshake, Sparkles, ArrowRight, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function HomePRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const primaryColor = config?.appearance?.primaryColor || "#d4af37";

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative pt-40 pb-60 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.1] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pro" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke={primaryColor} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pro)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center animate-fade-up">
          <Badge className="mb-10 py-2 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black tracking-widest uppercase text-[10px]">
            XMOOD PRO MAX SYSTEM
          </Badge>
          <h1 className="text-7xl md:text-[8rem] mb-12 font-headline font-bold leading-none text-slate-900 tracking-tight">
             <span className="block gold-gradient-text">{config?.siteInfo?.heroTitle || "XMOOD PRO MAX"}</span>
             <span className="text-2xl md:text-3xl font-light text-slate-400 mt-6 block uppercase tracking-[0.5em]">{config?.siteInfo?.subtitle || "Elite Digital Sovereignty"}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto mb-20 leading-relaxed font-light">
            {config?.siteInfo?.heroDescription || "المنصة الرقمية المتكاملة لإدارة الأصول والتصاميم والخدمات الرقمية بأعلى معايير الجودة العالمية."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-40">
            <Button asChild className="royal-button h-20 px-20 text-xl">
              <Link href="/designs/request"><Wand2 className="ml-3" /> اطلب تصميمك الآن</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 px-20 rounded-full border-primary/10 text-primary font-bold text-xl hover:bg-primary/5">
              <Link href="/store">المتجر الملكي</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto pt-24 border-t border-primary/5">
            {[
              { icon: ShieldCheck, title: "أمان سيادي", desc: "تشفير بيانات عسكري" },
              { icon: Trophy, title: "نقاط النخبة", desc: "نظام تصنيف اجتماعي متطور" },
              { icon: Cpu, title: "إدارة ذكية", desc: "نواة AI لإدارة العمليات" },
              { icon: HeartHandshake, title: "ضمان الضمان", desc: "وساطة مالية موثقة" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group hover:translate-y-[-10px] transition-transform">
                <div className="w-20 h-20 bg-white border border-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-xl group-hover:shadow-primary/20 transition-all">
                  <item.icon size={32} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-xl text-slate-800 mb-2">{item.title}</h4>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-slate-50">
        <div className="container mx-auto px-6">
           <div className="max-w-5xl mx-auto text-center luxury-card p-24">
              <Sparkles size={80} className="mx-auto mb-10 text-primary" />
              <h2 className="text-5xl md:text-7xl font-headline font-bold gold-gradient-text mb-8">إدارة أصولك تحت سقف واحد</h2>
              <p className="text-slate-500 text-xl leading-relaxed mb-12 font-light">
                نحن لا نقدم خدمات فقط، نحن نبني لك إمبراطورية رقمية. من التصميم إلى الشحن والوساطة، كل شيء يدار من خلال النواة الذكية XMOOD PRO.
              </p>
              <Button asChild className="royal-button h-16 px-16 text-lg">
                 <Link href="/marketplace">دخول السوق الاجتماعي <ArrowRight className="mr-3" /></Link>
              </Button>
           </div>
        </div>
      </section>

      <footer className="py-32 bg-white border-t border-primary/5">
        <div className="container mx-auto px-6 text-center">
          <div className="font-headline text-6xl font-bold gold-gradient-text mb-10">{config?.siteInfo?.title || "XMOOD STORE"}</div>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg font-light leading-relaxed">
            الريادة في الخدمات الرقمية. نجمع بين الفخامة البصرية والقوة التقنية لنمنحك تجربة لا تُنسى.
          </p>
          <div className="flex flex-wrap justify-center gap-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            <Link href="/terms" className="hover:text-primary transition-colors">البنود</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">الخصوصية</Link>
            <Link href="/support" className="hover:text-primary transition-colors">الدعم</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">الإدارة</Link>
          </div>
          <div className="mt-20 text-[10px] font-black text-slate-200 uppercase tracking-widest">
            © 2025 XMOOD PRO MAX SYSTEM. GLOBAL SOVEREIGNTY.
          </div>
        </div>
      </footer>
    </main>
  );
}
