"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trophy, Cpu, HeartHandshake, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: siteSettings } = useDoc(settingsRef);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-40 pb-60 text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lux-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffb800" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lux-grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 animate-fade-in">
          <Badge className="mb-10 py-2 px-8 bg-primary/5 text-primary border-primary/20 rounded-full font-black tracking-[0.4em] uppercase text-[10px]">
            Sovereign Elite Registry
          </Badge>
          <h1 className="text-7xl md:text-[10rem] mb-12 tracking-tighter font-headline font-bold leading-[0.9] drop-shadow-2xl">
             <span className="block gold-text">{siteSettings?.heroTitle || "XMOOD STORE"}</span>
             <span className="text-2xl md:text-4xl font-light text-zinc-600 mt-6 block uppercase tracking-[0.4em]">{siteSettings?.siteSubtitle || "Digital Sovereignty"}</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-4xl mx-auto mb-20 leading-relaxed font-light">
            {siteSettings?.heroDescription || "المنصة الأكثر فخامة في العالم الرقمي. تجارة الأصول، شحن الألعاب، وحماية الوسطاء تحت نظام سيادي لا يعرف الحدود."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-40">
            <Button asChild className="h-16 px-16 royal-button text-xl">
              <Link href="/store">دخول المتجر الأسطوري</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-16 rounded-full border-white/10 text-zinc-300 font-bold text-xl hover:bg-white/5 transition-all">
              <Link href="/marketplace">سوق التداول</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto pt-24 border-t border-white/5">
            {[
              { icon: ShieldCheck, title: "أمان سيادي", desc: "أعلى بروتوكولات التشفير" },
              { icon: Trophy, title: "نقاط النخبة", desc: "نظام تصنيف شفاف للثقة" },
              { icon: Cpu, title: "إدارة ذكية", desc: "نواة AI متطورة للتحكم" },
              { icon: HeartHandshake, title: "ضمان الضمان", desc: "حقوقك محفوظة بقوة الكود" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500">
                  <item.icon size={32} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-xl text-white mb-2">{item.title}</h4>
                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-zinc-950/50">
        <div className="container mx-auto px-6">
           <div className="max-w-5xl mx-auto text-center luxury-card p-24 rounded-[4rem] legendary-border">
              <Sparkles size={80} className="mx-auto mb-10 text-primary" />
              <h2 className="text-5xl md:text-7xl font-headline font-bold gold-text mb-8">عصر جديد من التجارة</h2>
              <p className="text-zinc-500 text-xl leading-relaxed mb-12">
                لقد تم تصفير المنصة بالكامل لتبدأ بناء إمبراطوريتك الخاصة. استخدم لوحة الإدارة السيادية لإضافة أصولك، تفعيل وكلائك، وبدء التجارة في السوق المفتوح.
              </p>
              <Button asChild className="royal-button h-16 px-12 text-lg">
                 <Link href="/admin">فتح لوحة التحكم المركزية <ArrowRight className="mr-3 rtl:rotate-180" /></Link>
              </Button>
           </div>
        </div>
      </section>

      <footer className="py-24 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6 text-center">
          <div className="font-handwriting text-8xl font-bold gold-text mb-10">{siteSettings?.siteTitle || "XMOOD STORE"}</div>
          <p className="text-zinc-600 max-w-2xl mx-auto mb-16 text-lg font-light leading-relaxed">
            حيث تلتقي التكنولوجيا بالفخامة. نحن لا نقدم خدمات فقط، نحن نبني هويات رقمية أسطورية لا تمحى.
          </p>
          <div className="flex flex-wrap justify-center gap-16 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/help" className="hover:text-primary transition-colors">Protocol</Link>
            <Link href="/agents" className="hover:text-primary transition-colors">Agents</Link>
          </div>
          <div className="mt-20 text-[10px] font-black text-zinc-800 uppercase tracking-widest">
            © 2025 XMOOD LEGENDARY SYSTEM. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
