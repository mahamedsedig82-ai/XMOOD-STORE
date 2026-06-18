"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Flame, Zap, Award, ShieldCheck, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config, loading: configLoading } = useDoc(settingsRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 blur-[150px] rounded-full opacity-40" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-12 md:space-y-16">
            
            <div className="flex flex-col items-center gap-8">
               <div className="logo-glow-container">
                  {config?.appearance?.logoUrl ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <img 
                        src={config.appearance.logoUrl} 
                        className="h-36 w-36 md:h-64 md:w-64 rounded-full object-cover border-4 border-primary/20 shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform duration-700" 
                        alt="XMOOD Logo" 
                      />
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] pointer-events-none" />
                    </motion.div>
                  ) : (
                    <h1 className="handwritten-logo text-5xl md:text-8xl drop-shadow-2xl" style={{ direction: 'ltr' }}>XMOOD STORE</h1>
                  )}
               </div>
               
               <div className="space-y-6">
                  <h2 className="text-2xl md:text-4xl font-handwriting text-primary opacity-90 tracking-wide leading-relaxed drop-shadow-sm">
                    {config?.siteInfo?.subtitle || "مركز الخدمات الرقمية المعتمدة"}
                  </h2>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto rounded-full" />
               </div>
            </div>

            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed italic opacity-70 px-6">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً وفقاً لأعلى معايير الأمان العالمية."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              <Button asChild className="royal-button h-16 md:h-20 px-14 text-sm shadow-xl shadow-primary/20 hover:-translate-y-1">
                <Link href="/store">دخول المستودع</Link>
              </Button>
              <Button asChild variant="outline" className="h-16 md:h-20 px-14 rounded-[1.5rem] border-primary/20 hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-3 transition-all">
                <Link href="/designs/gallery" className="flex items-center gap-3"><Palette size={20} /> معرض الإبداع</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-24 md:py-32 bg-muted/10 border-y border-primary/5">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-10">
              <div className="text-center md:text-right">
                <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">ما <span className="gold-text">يميزنا</span></h2>
                <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.5em] mt-4 opacity-50">Elite Sovereign Selection Protocols</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 px-10 h-14 rounded-2xl border border-primary/10">
                <Link href="/store" className="flex items-center gap-4">كافة الأصول الرقمية <ArrowRight size={18} className="rotate-180" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 md:py-40 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
           <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter">لماذا <span className="gold-text">تختارنا؟</span></h2>
              <p className="text-muted-foreground uppercase font-black text-[10px] tracking-[0.6em] opacity-40">The Sovereign Excellence Experience</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي متطور يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات اتصال مشفرة بالكامل.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات والتحويلات المالية محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي المستوى.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي فريد يمنحك رتباً استثنائية وخصومات حصرية متزايدة بناءً على نشاطك وموثوقيتك.", icon: Award }
              ].map((item, i) => (
                <div key={i} className="p-12 luxury-card bg-card/40 border-primary/10 hover:border-primary/30 shadow-2xl text-center flex flex-col items-center group transition-all duration-700">
                   <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-black transition-all shadow-inner border border-primary/5">
                      <item.icon size={36} />
                   </div>
                   <h4 className="font-black text-2xl mb-5 group-hover:gold-text transition-all tracking-tight">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-base opacity-90">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}
