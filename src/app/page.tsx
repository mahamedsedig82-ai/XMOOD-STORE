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
            XMOOD - الوجهة الرقمية الأولى
          </Badge>
          
          <h1 className="text-7xl md:text-[9rem] mb-12 font-headline font-bold leading-tight tracking-tight">
             <span className="block gold-text py-2">
               {config?.siteInfo?.heroTitle || "عالمك الرقمي المتكامل"}
             </span>
             <span className="text-xl md:text-2xl font-bold text-red-500 mt-6 block uppercase tracking-[0.6em] opacity-90">
               {config?.siteInfo?.subtitle || "Premium Digital Services"}
             </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-4xl mx-auto mb-20 leading-relaxed font-light">
            {config?.siteInfo?.heroDescription || "نقدم لك أرقى باقات شحن الألعاب، الحسابات النادرة، والخدمات الرقمية والاحترافية بأعلى معايير الأمان والسرعة."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-64">
            <Button asChild className="royal-button h-20 px-24 text-xl shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:scale-105">
              <Link href="/store"><Zap className="ml-4" /> تصفح المتجر</Link>
            </Button>
            <Button asChild className="accent-button h-20 px-24 text-xl shadow-[0_0_40px_rgba(220,38,38,0.1)] hover:scale-105">
              <Link href="/designs/request">اطلب تصميمك</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto pt-40 border-t border-white/5">
            {[
              { icon: ShieldCheck, title: "أمان تام", desc: "عمليات مشفرة وآمنة", color: "text-red-500" },
              { icon: Trophy, title: "نقاط مكافأة", desc: "نظام ولاء حصري", color: "text-primary" },
              { icon: Cpu, title: "دعم ذكي", desc: "مساعد رقمي متاح دائماً", color: "text-red-500" },
              { icon: HeartHandshake, title: "وساطة موثوقة", desc: "ضمان كامل لعملياتك", color: "text-primary" },
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
              <h2 className="text-5xl md:text-7xl font-headline font-bold gold-text mb-8">طور تجربتك الرقمية</h2>
              <p className="text-zinc-400 text-2xl leading-relaxed mb-16 font-light max-w-3xl mx-auto">
                لقد وفرنا لك كل ما تحتاجه من خدمات رقمية في مكان واحد، مدعومة بنظام إدارة ذكي يضمن لك أفضل تجربة شرائية وتفاعلية.
              </p>
              <Button asChild className="royal-button h-20 px-24 text-xl">
                 <Link href="/marketplace">انضم للمجتمع الرقمي <ArrowRight className="mr-4" /></Link>
              </Button>
           </div>
        </div>
      </section>

      <footer className="py-40 bg-black border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-7xl mb-12">{config?.siteInfo?.title || "XMOOD"}</div>
          <p className="text-zinc-500 max-w-3xl mx-auto mb-20 text-xl font-light leading-relaxed">
            {config?.translations?.footerDesc || "نجمع بين الجودة الرقمية والاحترافية الإبداعية لمنحك أفضل الخدمات في عالم الألعاب والتصميم."}
          </p>
          <div className="flex flex-wrap justify-center gap-16 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">
            <Link href="/terms" className="hover:text-primary transition-all">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-primary transition-all">سياسة الخصوصية</Link>
            <Link href="/support" className="hover:text-primary transition-all">مركز المساعدة</Link>
            <Link href="/admin" className="hover:text-primary transition-all">لوحة الإدارة</Link>
          </div>
          <div className="mt-24 text-[9px] font-bold text-zinc-800 uppercase tracking-[0.8em]">
            © 2025 XMOOD PREMIUM SERVICES. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
