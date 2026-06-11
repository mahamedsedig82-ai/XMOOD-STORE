"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Send, ArrowRight, Sparkles, TrendingUp, Gem, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const { data: products } = useCollection(query(collection(db, "products"), limit(8)));
  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  return (
    <main className="min-h-screen bg-slate-950 font-body">
      <Navbar />
      
      {/* Hero Section Luxury Pro */}
      <section className="relative py-40 md:py-60 text-center bg-slate-950 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lux-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lux-grid)" />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 animate-fade-in">
          <Badge className="mb-10 py-3 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black tracking-[0.5em] uppercase text-[10px]">
            Master Identity Digital Store
          </Badge>
          <h1 className="text-7xl md:text-[10rem] mb-12 tracking-tighter font-headline font-bold leading-none">
             <span className="block gold-text drop-shadow-2xl">XMOOD STORE</span>
             <span className="text-3xl md:text-5xl font-light text-slate-400 mt-6 block uppercase tracking-[0.3em]">The Royal Protocol</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto mb-20 leading-relaxed font-light">
            المنصة الرقمية الفاخرة لخبراء الألعاب والخدمات التقنية. نوفر لك شحناً فورياً، أماناً ملكياً، وتجربة مستخدم لا تضاهى.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-32">
            <Button asChild className="h-24 px-20 royal-button text-2xl">
              <Link href="/store">دخول المتجر</Link>
            </Button>
            <Button asChild variant="outline" className="h-24 px-20 rounded-3xl border-white/10 text-white font-bold text-2xl hover:bg-white/5 transition-all">
              <Link href="/marketplace">سوق التداول</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto border-t border-white/5 pt-32">
            {[
              { icon: ShieldCheck, title: "أمان ملكي", desc: "تشفير وحماية لكافة بياناتك" },
              { icon: Zap, title: "تنفيذ فوري", desc: "شحن الأكواد في أجزاء من الثانية" },
              { icon: Cpu, title: "ذكاء اصطناعي", desc: "مساعد ذكي لخدمتكم 24/7" },
              { icon: HeartHandshake, title: "ضمان XMOOD", desc: "حقك محفوظ بنظام ضمان ذكي" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-2xl">
                  <item.icon size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-xl text-white mb-2">{item.title}</h4>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Collections */}
      <section className="py-40 bg-slate-950/50">
        <div className="container mx-auto px-4">
          {products?.length === 0 ? (
            <div className="py-40 text-center luxury-card border-dashed p-20">
               <Sparkles size={80} className="mx-auto mb-8 text-slate-800" />
               <h2 className="text-4xl font-headline font-bold text-slate-600">المتجر قيد التحديث...</h2>
               <p className="text-slate-500 mt-4">نحن نقوم الآن برفع باقات رقمية جديدة وحصرية لعملاء XMOOD.</p>
            </div>
          ) : categories.map((cat, idx) => (
            <div key={cat} className="mb-40 last:mb-0">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Elite Collection</span>
                  </div>
                  <h3 className="text-5xl md:text-7xl font-headline font-bold text-white">{cat}</h3>
                </div>
                <Button asChild variant="link" className="text-primary font-bold text-xl p-0 hover:no-underline flex items-center gap-3 group">
                  <Link href={`/store?category=${cat}`}>تصفح المجموعة بالكامل <ArrowRight size={24} className="group-hover:translate-x-[-8px] transition-transform" /></Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                {products?.filter(p => p.category === cat).slice(0, 4).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Royal Footer */}
      <footer className="py-32 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="font-handwriting text-8xl font-bold gold-text mb-10">XMOOD STORE</div>
            <p className="text-slate-500 max-w-2xl mb-16 text-xl font-light leading-relaxed">
              الوجهة الأولى والأرقى للتميز الرقمي في المنطقة. نضع بين يديك خلاصة الأمان والفخامة في مكان واحد.
            </p>
            <div className="flex flex-wrap justify-center gap-16 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
              <Link href="/terms" className="hover:opacity-100 text-white transition-opacity">Terms</Link>
              <Link href="/privacy" className="hover:opacity-100 text-white transition-opacity">Privacy</Link>
              <Link href="/help" className="hover:opacity-100 text-white transition-opacity">Support</Link>
              <Link href="/agents" className="hover:opacity-100 text-white transition-opacity">Agents</Link>
            </div>
            <div className="mt-24 text-[10px] font-black text-slate-800 uppercase tracking-widest">
              © 2025 XMOOD STORE SYSTEM. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
