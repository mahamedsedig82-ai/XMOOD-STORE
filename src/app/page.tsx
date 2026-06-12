"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, HeartHandshake, ArrowRight, Sparkles, Gem, Cpu, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-black font-body">
      <Navbar />
      
      {/* Hero Section Luxury Pro */}
      <section className="relative py-40 md:py-60 text-center overflow-hidden">
        {/* Legendary Grid Effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.07] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lux-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#fbbf24" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lux-grid)" />
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/10 blur-[180px] rounded-full pointer-events-none animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10 animate-fade-in">
          <Badge className="mb-10 py-3 px-10 bg-primary/10 text-primary border-primary/40 rounded-full font-black tracking-[0.6em] uppercase text-[10px] animate-bounce">
            The Legendary Protocol 2025
          </Badge>
          <h1 className="text-7xl md:text-[11rem] mb-12 tracking-tighter font-headline font-bold leading-none">
             <span className="block gold-text drop-shadow-[0_10px_30px_rgba(251,191,36,0.5)]">XMOOD STORE</span>
             <span className="text-2xl md:text-4xl font-light text-slate-500 mt-8 block uppercase tracking-[0.4em]">Elite Digital Sovereignty</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto mb-24 leading-relaxed font-light">
            بوابتك الرقمية نحو الفخامة المطلقة. المتجر الأسطوري لشحن الألعاب والخدمات التقنية المتميزة تحت نظام حماية ملكي لا يُخترق.
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-40">
            <Button asChild className="h-24 px-24 royal-button text-2xl">
              <Link href="/store">دخول المتجر الأسطوري</Link>
            </Button>
            <Button asChild variant="outline" className="h-24 px-24 rounded-3xl border-primary/30 text-primary font-bold text-2xl hover:bg-primary/5 transition-all">
              <Link href="/marketplace">سوق التداول المفتوح</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto border-t border-primary/10 pt-40">
            {[
              { icon: ShieldCheck, title: "أمان سيادي", desc: "أعلى معايير التشفير العالمية" },
              { icon: Trophy, title: "نقاط الأفضلية", desc: "نظام تصنيف شفاف للمتداولين" },
              { icon: Cpu, title: "عقل اصطناعي", desc: "إدارة ذكية للخدمات والطلبات" },
              { icon: HeartHandshake, title: "ضمان الضمان", desc: "حقك محفوظ بقوة القانون الرقمي" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group">
                <div className="w-24 h-24 bg-white/5 border border-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black group-hover:scale-110 transition-all duration-700 shadow-[0_0_40px_rgba(251,191,36,0.1)]">
                  <item.icon size={36} strokeWidth={1} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-2xl gold-text mb-3">{item.title}</h4>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empty State / Welcome Section */}
      <section className="py-60 bg-black relative">
        <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto text-center luxury-card p-32 rounded-[4rem] legendary-border">
              <Sparkles size={100} className="mx-auto mb-12 text-primary animate-pulse" />
              <h2 className="text-5xl md:text-7xl font-headline font-bold gold-text mb-8">مرحباً بك في عصر XMOOD الجديد</h2>
              <p className="text-slate-400 text-xl leading-relaxed mb-12">
                لقد تم تصفير المنصة بالكامل لتبدأ رحلتك الأسطورية. استخدم لوحة الإدارة لإضافة منتجاتك، تفعيل وكلائك، وبدء التجارة في السوق المفتوح.
              </p>
              <Button asChild className="h-16 px-12 royal-button text-xl">
                 <Link href="/admin">فتح لوحة التحكم المركزية</Link>
              </Button>
           </div>
        </div>
      </section>

      {/* Royal Footer */}
      <footer className="py-40 border-t border-primary/10 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="font-handwriting text-9xl font-bold gold-text mb-12">XMOOD STORE</div>
            <p className="text-slate-500 max-w-3xl mb-20 text-xl font-light leading-relaxed">
              المكان الذي تلتقي فيه التكنولوجيا بالفخامة. نحن لا نبيع خدمات، نحن نبني هويات رقمية أسطورية.
            </p>
            <div className="flex flex-wrap justify-center gap-20 text-[10px] font-black uppercase tracking-[0.6em] opacity-40">
              <Link href="/terms" className="hover:opacity-100 text-primary transition-opacity">Terms</Link>
              <Link href="/privacy" className="hover:opacity-100 text-primary transition-opacity">Privacy</Link>
              <Link href="/help" className="hover:opacity-100 text-primary transition-opacity">Protocol</Link>
              <Link href="/agents" className="hover:opacity-100 text-primary transition-opacity">Agents</Link>
            </div>
            <div className="mt-32 text-[10px] font-black text-slate-800 uppercase tracking-widest">
              © 2025 XMOOD LEGENDARY SYSTEM. THE SOVEREIGN CODE.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}