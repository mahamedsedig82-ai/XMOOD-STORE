
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/ProductCard";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { ShieldCheck, Zap, HeartHandshake, Send, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const categories = Array.from(new Set(STORE_PRODUCTS.map(p => p.category)));

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Pure White & Minimalist */}
      <section className="relative py-24 md:py-32 text-center border-b bg-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="py-2 px-6 text-[10px] font-bold tracking-[0.3em] bg-primary/5 text-primary border-primary/20 rounded-full animate-fade-in uppercase">
              XMOOD DIGITAL LUXURY
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl mb-8 tracking-tighter leading-tight animate-fade-in">
             <span className="font-handwriting text-primary block mb-2 text-4xl md:text-6xl">XMOOD STORE</span>
             <span className="font-headline font-bold text-slate-900">فخامة الخدمات الرقمية</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-fade-in" style={{ animationDelay: '0.1s' }}>
            تجربة استثنائية في عالم شحن الألعاب، شراء الحسابات، والخدمات الخاصة. جودة وسرعة وأمان في كل عملية.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="h-14 px-10 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
              <Link href="/store">تصفح المتجر</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
              <Link href="/marketplace">سوق المستخدمين</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-4xl mx-auto border-t pt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: ShieldCheck, title: "وساطة آمنة", desc: "ضمان الحقوق" },
              { icon: Zap, title: "شحن تلقائي", desc: "تنفيذ فوري" },
              { icon: HeartHandshake, title: "وكلاء معتمدون", desc: "دفع موثوق" },
              { icon: Send, title: "دعم فني", desc: "على مدار الساعة" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                   <p className="text-[10px] text-muted-foreground uppercase">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          {categories.map((cat, idx) => (
            <div key={cat} className={`mb-24 ${idx !== 0 ? 'pt-16 border-t border-slate-50' : ''}`}>
              <div className="flex justify-between items-end mb-10">
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-none rounded-md px-3 font-bold">قسم خاص</Badge>
                  <h3 className="text-3xl font-headline font-bold text-slate-900">{cat}</h3>
                </div>
                <Link href={`/store?category=${cat}`} className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                  عرض المزيد <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {STORE_PRODUCTS.filter(p => p.category === cat).slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Concierge & Specialized Services */}
      <section className="container mx-auto px-4 py-20">
         <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
            <div className="relative z-10 max-w-xl text-center md:text-right">
               <h2 className="text-4xl font-headline font-bold mb-6">هل تبحث عن خدمة مخصصة؟</h2>
               <p className="text-slate-400 text-lg mb-8 leading-relaxed font-light">
                  نحن نوفر خدمات الوساطة الخاصة وطلبات التصميم الفريدة. فريقنا من الوكلاء المعتمدين جاهز لتلبية احتياجاتك مهما كانت معقدة.
               </p>
               <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-10 rounded-2xl shadow-2xl shadow-primary/20">
                     <Link href="/middleman">نظام الوساطة</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-10 rounded-2xl">
                     <Link href="/concierge">المساعد الذكي</Link>
                  </Button>
               </div>
            </div>
            <div className="relative z-10">
               <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-3xl animate-pulse">
                  <Sparkles size={48} className="text-primary" />
               </div>
            </div>
         </div>
      </section>

      <footer className="py-16 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="font-handwriting text-5xl font-bold text-primary mb-6">XMOOD STORE</div>
          <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">الوجهة الأولى للتميز الرقمي. الأمان والفخامة في مكان واحد.</p>
          <div className="flex justify-center gap-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/help" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
