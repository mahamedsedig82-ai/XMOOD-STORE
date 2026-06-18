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

const DragonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" className="opacity-20" />
    <path d="M7 10c0-1.657 2.239-3 5-3s5 1.343 5 3" />
    <path d="M12 7v14" />
    <path d="M9 14l3 3 3-3" />
    <path d="M17 10c1.105 0 2 .895 2 2s-.895 2-2 2" />
    <path d="M7 10c-1.105 0-2 .895-2 2s.895 2 2 2" />
  </svg>
);

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
      
      {/* 🌌 Legendary Dragon Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary/15 blur-[200px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-16"
          >
            <div className="inline-flex items-center gap-4 px-10 py-3 bg-primary/10 border border-primary/25 rounded-full backdrop-blur-md">
               <Sparkles size={16} className="text-primary animate-spin-slow" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                 {config?.siteInfo?.subtitle || "SOVEREIGN ASSETS DISPATCH"}
               </span>
            </div>

            <div className="relative inline-block group">
               <div className="flex flex-col items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="mb-10 relative"
                  >
                     <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse" />
                     <DragonIcon className="w-32 h-32 md:w-48 md:h-48 text-primary relative z-10 drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]" />
                  </motion.div>
                  
                  <h1 className="text-6xl md:text-[11rem] font-headline font-black leading-none tracking-tighter text-foreground relative z-10 uppercase italic">
                    <span className="handwritten-logo text-7xl md:text-[12rem] drop-shadow-[0_0_40px_rgba(212,175,55,0.5)]">XMOOD STORE</span>
                  </h1>
               </div>
               <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10 rounded-full" />
            </div>

            <p className="text-2xl md:text-4xl text-muted-foreground max-w-5xl mx-auto font-medium leading-relaxed italic opacity-80 border-r-4 border-primary/20 pr-10">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-10 pt-12">
              <Button asChild className="royal-button h-24 px-20 text-xl shadow-[0_30px_70px_rgba(212,175,55,0.4)] hover:scale-105 group">
                <Link href="/store" className="flex items-center">
                  <DragonIcon className="w-8 h-8 ml-4 opacity-50 group-hover:opacity-100 transition-all" />
                  دخول المستودع السيادي
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 px-20 rounded-[2rem] border-primary/25 hover:bg-primary/5 font-black text-sm uppercase tracking-widest gap-6 transition-all group">
                <Link href="/designs/gallery" className="flex items-center">
                  <Palette size={28} className="text-primary group-hover:rotate-12 transition-transform" /> 
                  معرض الأعمال الفنية
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 💎 Featured Products Section */}
      {products && products.length > 0 && (
        <section className="py-40 bg-muted/20 border-y relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
              <div className="text-center md:text-right">
                <h2 className="text-5xl md:text-8xl font-headline font-black flex items-center justify-center md:justify-start gap-8 uppercase">
                  <Flame className="text-red-500 w-16 h-16 animate-pulse" /> باقات <span className="gold-text">النخبة</span>
                </h2>
                <p className="text-muted-foreground font-black text-sm uppercase tracking-[0.5em] mt-5 opacity-60">Elite Sovereign Selection</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-xs tracking-[0.4em] hover:bg-primary/15 px-10 h-16 rounded-2xl border border-primary/10">
                <Link href="/store">استعراض كافة الأصول</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🏆 Sovereign Trust Pillars */}
      <section className="py-56 relative overflow-hidden bg-background">
        <div className="container mx-auto px-6">
           <div className="text-center mb-32 space-y-6">
              <DragonIcon className="mx-auto text-primary w-24 h-24 mb-12 animate-pulse opacity-40" />
              <h2 className="text-5xl md:text-[6rem] font-headline font-black uppercase tracking-tighter">لماذا <span className="gold-text">XMOOD STORE</span>؟</h2>
              <p className="text-muted-foreground uppercase font-black text-sm tracking-[0.8em] opacity-40">The Dragon Sovereign Protocol</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات مشفرة سيادياً.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات والتحويلات محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي يمنحك رتباً استثنائية وخصومات حصرية بناءً على نشاطك في المستودع.", icon: Award }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -20, scale: 1.02 }}
                  className="p-16 luxury-card bg-card/50 border-primary/10 hover:border-primary/30 shadow-2xl text-center flex flex-col items-center group transition-all duration-700"
                >
                   <div className="w-28 h-28 bg-primary/5 rounded-[3rem] flex items-center justify-center text-primary mb-12 shadow-inner group-hover:bg-primary group-hover:text-black transition-all duration-700">
                      <item.icon size={56} />
                   </div>
                   <h4 className="font-black text-4xl mb-6 group-hover:gold-text transition-all uppercase tracking-tighter">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-xl">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}