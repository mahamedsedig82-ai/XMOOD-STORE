"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trophy, Cpu, HeartHandshake, Sparkles, ArrowRight, Wand2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function HomeSovereignPRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const primaryColor = config?.appearance?.primaryColor || "#d4af37";

  return (
    <main className="min-h-screen bg-background text-white" dir="rtl">
      <Navbar />
      
      <section className="relative pt-64 pb-80 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-v5" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke={primaryColor} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-v5)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center animate-fade-up">
          <Badge className="mb-14 py-3 px-14 bg-red-600/10 text-red-600 border-red-600/20 rounded-full font-black tracking-[0.6em] uppercase text-[10px] animate-pulse">
            XMOOD PRO MAX SYSTEM V5 SOVEREIGN
          </Badge>
          
          <h1 className="text-8xl md:text-[11rem] mb-16 font-headline font-bold leading-none tracking-tighter drop-shadow-2xl">
             <span className="block gold-text py-4">
               {config?.siteInfo?.heroTitle || "إمبراطورية XMOOD"}
             </span>
             <span className="text-2xl md:text-3xl font-black text-red-600 mt-8 block uppercase tracking-[1em] opacity-80">
               {config?.siteInfo?.subtitle || "Elite Digital Sovereignty"}
             </span>
          </h1>

          <p className="text-2xl md:text-3xl text-zinc-500 max-w-5xl mx-auto mb-24 leading-relaxed font-light">
            {config?.siteInfo?.heroDescription || "المنصة السيادية الأولى لإدارة الأصول الرقمية، التصاميم العالمية، والخدمات التقنية بمعايير أمنية عسكرية."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-12 mb-64">
            <Button asChild className="royal-button h-24 px-32 text-2xl shadow-[0_0_60px_rgba(212,175,55,0.2)] hover:scale-105">
              <Link href="/designs/request"><Wand2 className="ml-6" /> اطلب تصميمك الملكي</Link>
            </Button>
            <Button asChild className="accent-button h-24 px-32 text-2xl shadow-[0_0_60px_rgba(220,38,38,0.15)] hover:scale-105">
              <Link href="/store">المستودع الرقمي</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-14 max-w-7xl mx-auto pt-40 border-t border-white/5">
            {[
              { icon: ShieldCheck, title: "أمان سيادي", desc: "تشفير بيانات عسكري", color: "text-red-600" },
              { icon: Trophy, title: "نقاط النخبة", desc: "نظام تصنيف اجتماعي", color: "text-primary" },
              { icon: Cpu, title: "نواة ذكية", desc: "إدارة آلية بالـ AI", color: "text-red-600" },
              { icon: HeartHandshake, title: "ضمان الضمان", desc: "وساطة مالية موثقة", color: "text-primary" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-8 group hover:translate-y-[-15px] transition-all duration-700">
                <div className={`w-28 h-28 bg-zinc-950 border border-white/5 rounded-[2.5rem] flex items-center justify-center ${item.color} shadow-2xl group-hover:border-primary/50 group-hover:shadow-primary/10 transition-all`}>
                  <item.icon size={44} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-2xl text-white mb-3">{item.title}</h4>
                   <p className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.2em]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-64 bg-zinc-950/20">
        <div className="container mx-auto px-6">
           <div className="max-w-7xl mx-auto luxury-card p-32 relative overflow-hidden text-center legendary-border">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full"></div>
              
              <Zap size={120} className="mx-auto mb-16 text-red-600 animate-pulse" />
              <h2 className="text-6xl md:text-9xl font-headline font-bold gold-text mb-12">تحكم في إمبراطوريتك</h2>
              <p className="text-zinc-400 text-3xl leading-relaxed mb-20 font-light max-w-4xl mx-auto">
                لقد قمنا ببناء نظام لا يقهر. من إدارة المحفظة المالية إلى طلب التصاميم الفائقة الجودة، كل شيء يتم تحت إشراف النواة الذكية XMOOD PRO MAX.
              </p>
              <Button asChild className="royal-button h-24 px-28 text-2xl">
                 <Link href="/marketplace">دخول السوق الاجتماعي <ArrowRight className="mr-6" /></Link>
              </Button>
           </div>
        </div>
      </section>

      <footer className="py-64 bg-black border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-8xl mb-16">{config?.siteInfo?.title || "XMOOD PRO"}</div>
          <p className="text-zinc-500 max-w-4xl mx-auto mb-24 text-2xl font-light leading-relaxed">
            {config?.translations?.footerDesc || "الريادة في الخدمات الرقمية والحلول الإبداعية. نجمع بين الفخامة البصرية والقوة التقنية لنمنحك تجربة سيادية لا تُنسى."}
          </p>
          <div className="flex flex-wrap justify-center gap-24 text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700">
            <Link href="/terms" className="hover:text-red-600 transition-all">قوانين الإمبراطورية</Link>
            <Link href="/privacy" className="hover:text-red-600 transition-all">بروتوكول الخصوصية</Link>
            <Link href="/support" className="hover:text-red-600 transition-all">مركز الدعم السيادي</Link>
            <Link href="/admin" className="hover:text-primary transition-all">مركز القيادة</Link>
          </div>
          <div className="mt-32 text-[10px] font-black text-zinc-900 uppercase tracking-[1em]">
            © 2025 XMOOD PRO MAX SYSTEM. GLOBAL SOVEREIGNTY SECURED.
          </div>
        </div>
      </footer>
    </main>
  );
}