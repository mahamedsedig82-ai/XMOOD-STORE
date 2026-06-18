"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Zap, Award, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative pt-32 pb-16 md:pt-56 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full opacity-30" />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-8 md:space-y-12">
            
            <div className="flex flex-col items-center gap-6">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/10 blur-[30px] rounded-full scale-110" />
                  {config?.appearance?.logoUrl ? (
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative z-10">
                      <img 
                        src={config.appearance.logoUrl} 
                        className="h-28 w-24 md:h-52 md:w-52 rounded-full object-cover border-4 border-primary/15 shadow-2xl transition-transform" 
                        alt="XMOOD Logo" 
                      />
                    </motion.div>
                  ) : (
                    <h1 className="handwritten-logo relative z-10" style={{ direction: 'ltr' }}>XMOOD <span>STORE</span></h1>
                  )}
               </div>
               
               <div className="space-y-3 pt-2">
                  <h2 className="text-base md:text-3xl font-headline font-bold gold-text opacity-90 tracking-wide leading-tight px-4">
                    {config?.siteInfo?.subtitle || "مركز الخدمات الرقمية المعتمدة"}
                  </h2>
                  <div className="h-0.5 w-12 md:w-20 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto rounded-full" />
               </div>
            </div>

            <p className="text-xs md:text-lg text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed italic opacity-80 px-6">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً."}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 pt-4 px-6">
              <Button asChild className="royal-button h-14 md:h-18 px-8 md:px-12 text-[10px] md:text-sm shadow-xl">
                <Link href="/store">دخول المستودع الرقمي</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 md:h-18 px-8 md:px-12 rounded-2xl border-primary/15 hover:bg-primary/5 font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2">
                <Link href="/designs/gallery" className="flex items-center gap-2"><Palette size={16} /> معرض الإبداع</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-12 md:py-24 bg-muted/5 border-y border-primary/5">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 md:mb-16 gap-6">
              <div className="text-center md:text-right">
                <h2 className="text-xl md:text-4xl font-headline font-black uppercase tracking-tight">باقات <span className="gold-text">مختارة</span></h2>
                <p className="text-muted-foreground font-black text-[8px] md:text-[9px] uppercase tracking-[0.4em] mt-1 opacity-60">Sovereign Choice Protocols</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-primary/10 px-6 h-10 rounded-xl border border-primary/10">
                <Link href="/store" className="flex items-center gap-2">كافة الأصول <ArrowRight size={14} className="rotate-180" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-32 bg-background relative overflow-hidden">
        <div className="container relative z-10 px-6">
           <div className="text-center mb-12 md:mb-20 space-y-2">
              <h2 className="text-2xl md:text-5xl font-headline font-black uppercase tracking-tighter">لماذا <span className="gold-text">تختارنا؟</span></h2>
              <p className="text-muted-foreground uppercase font-black text-[8px] md:text-[10px] tracking-[0.4em] opacity-40">Elite Trust Experience</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي متطور يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات مشفرة.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات المالية محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي يمنحك رتباً استثنائية وخصومات حصرية متزايدة بناءً على نشاطك.", icon: Award }
              ].map((item, i) => (
                <div key={i} className="p-8 md:p-12 luxury-card bg-card/40 border-primary/5 hover:border-primary/15 shadow-lg text-center flex flex-col items-center group transition-all">
                   <div className="w-14 h-14 md:w-18 md:h-18 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-black transition-all">
                      <item.icon size={24} />
                   </div>
                   <h4 className="font-black text-lg md:text-2xl mb-3 group-hover:gold-text transition-all tracking-tight">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-[11px] md:text-base opacity-90">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}