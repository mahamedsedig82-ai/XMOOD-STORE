
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trophy, Cpu, HeartHandshake, Sparkles, ArrowRight, Wand2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function HomePRO() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const primaryColor = config?.appearance?.primaryColor || "#d4af37";

  return (
    <main className="min-h-screen bg-background text-white" dir="rtl">
      <Navbar />
      
      <section className="relative pt-48 pb-64 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pro" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke={primaryColor} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pro)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center animate-fade-up">
          <Badge className="mb-12 py-2 px-12 bg-red-600/10 text-red-500 border-red-600/20 rounded-full font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">
            XMOOD PRO MAX SYSTEM V5
          </Badge>
          
          <h1 className="text-7xl md:text-[9rem] mb-12 font-headline font-bold leading-none tracking-tighter">
             <span className="block gold-text drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">
               {config?.siteInfo?.heroTitle || "إمبراطورية XMOOD"}
             </span>
             <span className="text-xl md:text-2xl font-black text-red-600 mt-6 block uppercase tracking-[0.8em] opacity-80">
               {config?.siteInfo?.subtitle || "Elite Digital Sovereignty"}
             </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-500 max-w-4xl mx-auto mb-20 leading-relaxed font-light">
            {config?.siteInfo?.heroDescription || "المنصة السيادية الأولى لإدارة الأصول الرقمية، التصاميم العالمية، والخدمات التقنية بمعايير أمنية عسكرية."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-48">
            <Button asChild className="royal-button h-20 px-24 text-xl shadow-[0_0_50px_rgba(212,175,55,0.15)] hover:shadow-primary/30 transition-all">
              <Link href="/designs/request"><Wand2 className="ml-4" /> اطلب تصميمك الملكي</Link>
            </Button>
            <Button asChild className="accent-button h-20 px-24 text-xl shadow-[0_0_50px_rgba(220,38,38,0.1)] hover:shadow-red-600/30 transition-all">
              <Link href="/store">المستودع الرقمي</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto pt-32 border-t border-white/5">
            {[
              { icon: ShieldCheck, title: "أمان سيادي", desc: "تشفير بيانات عسكري", color: "text-red-500" },
              { icon: Trophy, title: "نقاط النخبة", desc: "نظام تصنيف اجتماعي", color: "text-primary" },
              { icon: Cpu, title: "نواة ذكية", desc: "إدارة آلية بالـ AI", color: "text-red-500" },
              { icon: HeartHandshake, title: "ضمان الضمان", desc: "وساطة مالية موثقة", color: "text-primary" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group hover:translate-y-[-10px] transition-all duration-500">
                <div className={`w-24 h-24 bg-zinc-900 border border-white/5 rounded-[2rem] flex items-center justify-center ${item.color} shadow-2xl group-hover:border-primary/40 group-hover:shadow-primary/5`}>
                  <item.icon size={36} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-xl text-white mb-2">{item.title}</h4>
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-48 bg-zinc-950/30">
        <div className="container mx-auto px-6">
           <div className="max-w-6xl mx-auto luxury-card p-24 relative overflow-hidden text-center legendary-border">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full"></div>
              
              <Zap size={100} className="mx-auto mb-12 text-red-600 animate-pulse" />
              <h2 className="text-5xl md:text-8xl font-headline font-bold gold-text mb-10">تحكم كامل في إمبراطوريتك</h2>
              <p className="text-zinc-400 text-2xl leading-relaxed mb-16 font-light max-w-3xl mx-auto">
                لقد قمنا ببناء نظام لا يقهر. من إدارة المحفظة المالية إلى طلب التصاميم الفائقة الجودة، كل شيء يتم تحت إشراف النواة الذكية XMOOD PRO MAX.
              </p>
              <Button asChild className="royal-button h-20 px-20 text-xl">
                 <Link href="/marketplace">دخول السوق الاجتماعي <ArrowRight className="mr-4" /></Link>
              </Button>
           </div>
        </div>
      </section>

      <footer className="py-40 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="font-headline text-7xl font-bold gold-text mb-12">{config?.siteInfo?.title || "XMOOD PRO MAX"}</div>
          <p className="text-zinc-500 max-w-3xl mx-auto mb-20 text-xl font-light leading-relaxed">
            الريادة في الخدمات الرقمية والحلول الإبداعية. نجمع بين الفخامة البصرية والقوة التقنية لنمنحك تجربة سيادية لا تُنسى.
          </p>
          <div className="flex flex-wrap justify-center gap-20 text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">
            <Link href="/terms" className="hover:text-red-500 transition-colors">قوانين الإمبراطورية</Link>
            <Link href="/privacy" className="hover:text-red-500 transition-colors">بروتوكول الخصوصية</Link>
            <Link href="/support" className="hover:text-red-500 transition-colors">مركز الدعم السيادي</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">مركز القيادة</Link>
          </div>
          <div className="mt-24 text-[9px] font-black text-zinc-800 uppercase tracking-[0.8em]">
            © 2025 XMOOD PRO MAX SYSTEM. GLOBAL SOVEREIGNTY SECURED.
          </div>
        </div>
      </footer>
    </main>
  );
}
