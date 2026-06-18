"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Flame, Zap, Award, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
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
      
      <section className="relative pt-40 pb-20 md:pt-64 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 blur-[150px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-8 md:space-y-12">
            <div className="inline-flex items-center gap-4 px-8 py-2.5 bg-card border border-primary/15 rounded-full backdrop-blur-md">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80">Sovereign Experience Protocol</span>
            </div>

            <div className="flex flex-col items-center">
               <h1 className="handwritten-logo text-5xl md:text-8xl drop-shadow-xl">XMOOD STORE</h1>
               <h2 className="text-lg md:text-2xl font-handwriting text-primary mt-4 opacity-90 animate-pulse">
                 {config?.siteInfo?.subtitle || "مركز الخدمات الرقمية المعتمدة"}
               </h2>
            </div>

            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic opacity-60">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild className="royal-button h-16 md:h-18 px-12 text-sm shadow-xl">
                <Link href="/store">دخول المستودع</Link>
              </Button>
              <Button asChild variant="outline" className="h-16 md:h-18 px-12 rounded-2xl border-primary/20 hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest gap-3">
                <Link href="/designs/gallery"><Palette size={16} className="ml-2" /> معرض الإبداع</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-20 md:py-40 bg-muted/10 border-y">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
              <div className="text-center md:text-right">
                <h2 className="text-3xl md:text-5xl font-headline font-black uppercase">باقات <span className="gold-text">النخبة</span></h2>
                <p className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.3em] mt-2 opacity-50">Elite Sovereign Selection</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 px-8 h-12 rounded-xl border border-primary/10">
                <Link href="/store" className="flex items-center gap-2">كافة الأصول <ArrowRight size={14} className="rotate-180" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16 space-y-2">
              <h2 className="text-2xl md:text-4xl font-headline font-black uppercase">مـا <span className="gold-text">يمـيـزنـا</span></h2>
              <p className="text-muted-foreground uppercase font-black text-[9px] tracking-[0.4em] opacity-30">The Sovereign Excellence Protocol</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات مشفرة.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات والتحويلات محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي يمنحك رتباً استثنائية وخصومات حصرية بناءً على نشاطك.", icon: Award }
              ].map((item, i) => (
                <div key={i} className="p-8 luxury-card bg-card/40 border-primary/10 hover:border-primary/25 shadow-xl text-center flex flex-col items-center group transition-all">
                   <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-black transition-all">
                      <item.icon size={28} />
                   </div>
                   <h4 className="font-black text-xl mb-3 group-hover:gold-text transition-all">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-sm">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}