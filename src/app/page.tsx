
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Send, ArrowRight, Sparkles, TrendingUp, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const categories = Array.from(new Set(STORE_PRODUCTS.map(p => p.category)));

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section Luxury Redesign */}
      <section className="relative py-32 md:py-48 text-center bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lux-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lux-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Badge className="mb-8 py-2 px-8 bg-primary/10 text-primary border-primary/20 rounded-full font-black tracking-[0.4em] animate-fade-in uppercase text-[10px]">
            The Royal Digital Experience
          </Badge>
          <h1 className="text-6xl md:text-9xl mb-10 tracking-tighter font-headline font-bold text-slate-950 animate-fade-in">
             <span className="block gold-gradient-text drop-shadow-sm">XMOOD STORE</span>
             <span className="text-4xl md:text-5xl font-light opacity-80 mt-4 block">فخامة الخدمات الرقمية</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed font-light animate-fade-in" style={{ animationDelay: '0.1s' }}>
            الوجهة الفاخرة لخبراء الألعاب والخدمات الرقمية. نجمع بين السرعة المطلقة والأمان الملكي في كل عملية.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-24 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button asChild className="h-20 px-16 royal-button text-xl shadow-2xl">
              <Link href="/store">دخول المتجر</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 px-16 rounded-[1.5rem] border-slate-200 text-slate-600 font-bold text-xl hover:bg-slate-50">
              <Link href="/marketplace">سوق التداول</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto border-t pt-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: ShieldCheck, title: "ضمان ملكي", desc: "أمان فائق لبياناتك" },
              { icon: Zap, title: "شحن فوري", desc: "تنفيذ بلمح البصر" },
              { icon: Gem, title: "باقات نادرة", desc: "حصرياً لعملاء XMOOD" },
              { icon: HeartHandshake, title: "دعم مخصص", desc: "نحن معك دائماً" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-lg text-slate-900">{item.title}</h4>
                   <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          {categories.map((cat, idx) => (
            <div key={cat} className="mb-32 last:mb-0">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-primary" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Collection Elite</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-headline font-bold text-slate-950">{cat}</h3>
                </div>
                <Button asChild variant="link" className="text-primary font-bold text-lg p-0 hover:no-underline flex items-center gap-2 group">
                  <Link href={`/store?category=${cat}`}>تصفح المجموعة بالكامل <ArrowRight size={20} className="group-hover:translate-x-[-5px] transition-transform" /></Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                {STORE_PRODUCTS.filter(p => p.category === cat).slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Royal Footer */}
      <footer className="py-24 border-t bg-slate-950 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="font-handwriting text-6xl font-bold gold-gradient-text mb-8">XMOOD STORE</div>
            <p className="text-slate-400 max-w-lg mb-12 text-lg font-light leading-relaxed">
              الوجهة الأولى والأرقى للتميز الرقمي في المنطقة. نضع بين يديك خلاصة الأمان والفخامة في مكان واحد.
            </p>
            <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
              <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
              <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link href="/help" className="hover:opacity-100 transition-opacity">Global Support</Link>
            </div>
            <div className="mt-16 text-[10px] font-medium text-slate-600">
              © 2025 XMOOD STORE. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
