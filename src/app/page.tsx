
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Flame, Zap, Award, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      {/* 🌌 Epic Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-3 px-8 py-2 bg-primary/10 border border-primary/20 rounded-full">
               <Sparkles size={14} className="text-primary animate-spin-slow" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                 {config?.siteInfo?.subtitle || "The Sovereign Digital Experience"}
               </span>
            </div>

            <div className="relative inline-block">
               <h1 className="text-5xl md:text-[10rem] font-headline font-black leading-none tracking-tighter text-foreground relative z-10">
                 عـالـم <span className="handwritten-logo text-7xl md:text-[11rem] mx-4 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">Xmood</span> الـرقمـي
               </h1>
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[80px] -z-10 rounded-full" />
            </div>

            <p className="text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed italic opacity-80">
              {config?.siteInfo?.description || "بوابتكم الحصرية نحو أرقى الخدمات الرقمية، شحن الألعاب، والحلول الإبداعية المعتمدة عالمياً."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <Button asChild className="royal-button h-20 px-16 text-lg shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:scale-105">
                <Link href="/store"><ShoppingBag className="ml-3" size={24} /> دخول المستودع</Link>
              </Button>
              <Button asChild variant="outline" className="h-20 px-16 rounded-[1.5rem] border-primary/20 hover:bg-primary/5 font-black text-xs uppercase tracking-widest gap-4 transition-all">
                <Link href="/designs/gallery"><Palette size={24} className="text-primary" /> معرض الأعمال</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 💎 Featured Products */}
      {products && products.length > 0 && (
        <section className="py-32 bg-muted/20 border-y relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
              <div className="text-center md:text-right">
                <h2 className="text-4xl md:text-6xl font-headline font-black flex items-center justify-center md:justify-start gap-5">
                  <Flame className="text-red-500 w-12 h-12 animate-pulse" /> باقات <span className="gold-text">النخبة</span>
                </h2>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.4em] mt-3">Elite Digital Assets Selection</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[11px] tracking-[0.3em] hover:bg-primary/10 px-8 h-12 rounded-xl">
                <Link href="/store">استعراض الكل</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🏆 Why XMOOD */}
      <section className="py-40 relative overflow-hidden bg-background">
        <div className="container mx-auto px-6">
           <div className="text-center mb-24 space-y-4">
              <Zap size={80} className="mx-auto text-primary mb-8 animate-bounce" />
              <h2 className="text-4xl md:text-7xl font-headline font-black">لماذا يختار النخبة <span className="gold-text">XMOOD</span>؟</h2>
              <p className="text-muted-foreground uppercase font-black text-[12px] tracking-[0.6em] opacity-60">The Sovereign Excellence Protocol</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "تسليم فوري آلي", desc: "نظام ذكي يقوم بمعالجة وتسليم طلباتكم في أجزاء من الثانية عبر بروتوكولات مشفرة.", icon: Zap },
                { title: "أمان مالي سيادي", desc: "كافة المعاملات المالية محمية بنظام المحفظة الموثق وتشفير البنك المركزي للمنصة.", icon: ShieldCheck },
                { title: "دعم نُخبوي مباشر", desc: "فريق من الخبراء متواجد لخدمتكم وضمان تجربة رقمية لا تشوبها شائبة على مدار الساعة.", icon: Award }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -15 }}
                  className="p-12 luxury-card bg-card/40 border-primary/5 hover:border-primary/20 shadow-2xl text-center flex flex-col items-center group transition-all duration-500"
                >
                   <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary mb-10 shadow-inner group-hover:bg-primary group-hover:text-black transition-all duration-500">
                      <item.icon size={44} />
                   </div>
                   <h4 className="font-black text-3xl mb-5 group-hover:gold-text transition-all">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-lg">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}
