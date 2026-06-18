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
      
      {/* 🌌 Minimal Luxury Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-4 px-8 py-2.5 bg-card border border-primary/15 rounded-full backdrop-blur-md shadow-sm">
               <Sparkles size={14} className="text-primary opacity-60" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                 {config?.siteInfo?.subtitle || "SOVEREIGN ASSETS DISPATCH"}
               </span>
            </div>

            <div className="relative inline-block">
               <h1 className="text-7xl md:text-[10rem] font-headline font-black leading-none tracking-tighter text-foreground uppercase italic flex flex-col items-center">
                 <span className="handwritten-logo text-8xl md:text-[12rem] drop-shadow-[0_0_25px_rgba(212,175,55,0.25)]">XMOOD STORE</span>
               </h1>
            </div>

            <p className="text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed italic opacity-70 border-r-2 border-primary/20 pr-8">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 pt-10">
              <Button asChild className="royal-button h-20 px-16 text-lg shadow-xl shadow-primary/15 hover:scale-105 transition-all">
                <Link href="/store">دخول المستودع</Link>
              </Button>
              <Button asChild variant="outline" className="h-20 px-16 rounded-[1.75rem] border-primary/20 hover:bg-primary/5 font-black text-xs uppercase tracking-widest gap-4 transition-all">
                <Link href="/designs/gallery" className="flex items-center">
                  <Palette size={20} className="text-primary" /> 
                  معرض الإبداع
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 💎 Featured Products Section */}
      {products && products.length > 0 && (
        <section className="py-40 bg-muted/10 border-y relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-8">
              <div className="text-center md:text-right">
                <h2 className="text-4xl md:text-7xl font-headline font-black flex items-center justify-center md:justify-start gap-6 uppercase">
                  باقات <span className="gold-text">النخبة</span>
                </h2>
                <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em] mt-4 opacity-50">Elite Sovereign Selection</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-[0.3em] hover:bg-primary/10 px-8 h-14 rounded-xl border border-primary/10">
                <Link href="/store">كافة الأصول</Link>
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

      {/* 🏆 Sovereign Trust Pillars */}
      <section className="py-48 relative overflow-hidden bg-background">
        <div className="container mx-auto px-6">
           <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl md:text-[5rem] font-headline font-black uppercase tracking-tighter">لماذا <span className="gold-text">XMOOD STORE</span>؟</h2>
              <p className="text-muted-foreground uppercase font-black text-[10px] tracking-[0.6em] opacity-30">The Sovereign Excellence Protocol</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات مشفرة.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات والتحويلات محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي يمنحك رتباً استثنائية وخصومات حصرية بناءً على نشاطك.", icon: Award }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-12 luxury-card bg-card/40 border-primary/10 hover:border-primary/25 shadow-xl text-center flex flex-col items-center group transition-all duration-500"
                >
                   <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mb-10 shadow-inner group-hover:bg-primary group-hover:text-black transition-all duration-500">
                      <item.icon size={32} />
                   </div>
                   <h4 className="font-black text-2xl mb-4 group-hover:gold-text transition-all uppercase tracking-tighter">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-lg">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}