
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, HeartHandshake, Sparkles, Cpu, Trophy, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-black font-body overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section Luxury Pro V3 */}
      <section className="relative py-48 md:py-80 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.08] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="master-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#fbbf24" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#master-grid)" />
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary/10 blur-[250px] rounded-full pointer-events-none animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10 animate-fade-in">
          <Badge className="mb-12 py-4 px-12 bg-primary/10 text-primary border-primary/30 rounded-full font-black tracking-[0.8em] uppercase text-[11px] animate-bounce shadow-2xl shadow-primary/10">
            Sovereign Digital Registry 2025
          </Badge>
          <h1 className="text-8xl md:text-[13rem] mb-14 tracking-tighter font-headline font-bold leading-[0.85]">
             <span className="block gold-text drop-shadow-[0_15px_40px_rgba(251,191,36,0.6)]">XMOOD STORE</span>
             <span className="text-3xl md:text-5xl font-light text-slate-500 mt-10 block uppercase tracking-[0.6em] font-body opacity-60">Elite Digital Sovereignty</span>
          </h1>
          <p className="text-2xl md:text-3xl text-slate-400 max-w-5xl mx-auto mb-28 leading-relaxed font-light opacity-80">
            المرحلة التالية من الفخامة الرقمية. المتجر الأسطوري لشحن الأصول العالمية والخدمات التقنية المتميزة تحت نظام حماية سيادي لا يقبل المساومة.
          </p>
          
          <div className="flex flex-wrap justify-center gap-12 mb-48">
            <Button asChild className="h-28 px-28 royal-button text-3xl shadow-primary/30">
              <Link href="/store">دخول المتجر الأسطوري</Link>
            </Button>
            <Button asChild variant="outline" className="h-28 px-28 rounded-full border-primary/30 text-primary font-black text-3xl hover:bg-primary/5 transition-all backdrop-blur-3xl">
              <Link href="/marketplace">سوق التداول السيادي</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 max-w-7xl mx-auto border-t border-primary/10 pt-48 pb-20">
            {[
              { icon: ShieldCheck, title: "أمان سيادي", desc: "أعلى معايير التشفير العالمية للمدفوعات" },
              { icon: Trophy, title: "نقاط الأفضلية", desc: "نظام تصنيف شفاف للوكلاء والمتداولين" },
              { icon: Cpu, title: "ذكاء إداري", desc: "نواة AI متطورة لإدارة الطلبات والخدمات" },
              { icon: HeartHandshake, title: "ضمان الضمان", desc: "حقوقك محفوظة بقوة البروتوكول الرقمي" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-8 group">
                <div className="w-28 h-28 bg-zinc-950 border border-primary/10 rounded-[3rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black group-hover:scale-110 transition-all duration-700 shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                  <item.icon size={44} strokeWidth={1} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-3xl gold-text mb-4">{item.title}</h4>
                   <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] opacity-60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empty State Welcome */}
      <section className="py-60 bg-black relative">
        <div className="container mx-auto px-4">
           <div className="max-w-6xl mx-auto text-center luxury-card p-40 rounded-[5rem] legendary-border">
              <Sparkles size={120} className="mx-auto mb-14 text-primary animate-pulse" />
              <h2 className="text-6xl md:text-8xl font-headline font-bold gold-text mb-10">بداية العصر الأسطوري</h2>
              <p className="text-slate-400 text-2xl leading-relaxed mb-16 opacity-70">
                لقد تم تصفير المنصة بالكامل لتبدأ بناء إمبراطوريتك الرقمية الخاصة. استخدم لوحة الإدارة المتطورة لإضافة أصولك، تفعيل وكلائك، وبدء التجارة في السوق المفتوح.
              </p>
              <Button asChild className="h-20 px-16 royal-button text-2xl">
                 <Link href="/admin">فتح لوحة التحكم المركزية <ArrowRight className="mr-4 rtl:rotate-180" /></Link>
              </Button>
           </div>
        </div>
      </section>

      {/* Royal Footer */}
      <footer className="py-48 border-t border-primary/10 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="font-handwriting text-[10rem] font-bold gold-text mb-14 leading-none">XMOOD STORE</div>
            <p className="text-slate-500 max-w-4xl mb-24 text-2xl font-light leading-relaxed opacity-60">
              المكان الذي تلتقي فيه التكنولوجيا الفائقة بالفخامة السيادية. نحن لا نقدم خدمات فقط، نحن نبني هويات رقمية أسطورية لا تمحى.
            </p>
            <div className="flex flex-wrap justify-center gap-24 text-[11px] font-black uppercase tracking-[0.8em] opacity-30">
              <Link href="/terms" className="hover:opacity-100 text-primary transition-opacity">Terms</Link>
              <Link href="/privacy" className="hover:opacity-100 text-primary transition-opacity">Privacy</Link>
              <Link href="/help" className="hover:opacity-100 text-primary transition-opacity">Protocol</Link>
              <Link href="/agents" className="hover:opacity-100 text-primary transition-opacity">Agents</Link>
            </div>
            <div className="mt-40 text-[11px] font-black text-slate-800 uppercase tracking-[0.5em]">
              © 2025 XMOOD LEGENDARY SYSTEM. THE SOVEREIGN CODE. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
