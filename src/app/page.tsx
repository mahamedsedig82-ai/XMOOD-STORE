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
  const { data: config } = useDoc(settingsRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative pt-32 pb-20 md:pt-60 md:pb-40 overflow-hidden px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 blur-[100px] md:blur-[150px] rounded-full opacity-40" />
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-10 md:space-y-12">
            
            <div className="flex flex-col items-center gap-6 md:gap-10">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/15 blur-[40px] md:blur-[60px] rounded-full scale-125" />
                  {config?.appearance?.logoUrl ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative z-10">
                      <img 
                        src={config.appearance.logoUrl} 
                        className="h-32 w-32 md:h-56 md:w-56 rounded-full object-cover border-4 border-primary/20 shadow-2xl transition-transform duration-700" 
                        alt="XMOOD Logo" 
                      />
                    </motion.div>
                  ) : (
                    <h1 className="handwritten-logo text-4xl md:text-8xl drop-shadow-2xl relative z-10" style={{ direction: 'ltr' }}>XMOOD STORE</h1>
                  )}
               </div>
               
               <div className="space-y-4 pt-2">
                  <h2 className="text-lg md:text-3xl font-headline font-black gold-text opacity-90 tracking-wide leading-tight">
                    {config?.siteInfo?.subtitle || "مركز الخدمات الرقمية المعتمدة"}
                  </h2>
                  <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto rounded-full" />
               </div>
            </div>

            <p className="text-xs md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic opacity-70 px-4">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً وفقاً لأعلى معايير الأمان."}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-4">
              <Button asChild className="royal-button h-14 md:h-20 px-10 md:px-16 text-xs md:text-sm shadow-xl shadow-primary/20">
                <Link href="/store">دخول المستودع الرقمي</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 md:h-20 px-10 md:px-16 rounded-xl md:rounded-[1.5rem] border-primary/20 hover:bg-primary/5 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] gap-3">
                <Link href="/designs/gallery" className="flex items-center gap-3"><Palette size={18} /> معرض الإبداع</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-16 md:py-32 bg-muted/5 border-y border-primary/5 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-20 gap-6">
              <div className="text-center md:text-right">
                <h2 className="text-xl md:text-4xl font-headline font-black uppercase tracking-tight">باقات <span className="gold-text">مختارة</span></h2>
                <p className="text-muted-foreground font-black text-[8px] md:text-[9px] uppercase tracking-[0.5em] mt-2 opacity-50">Sovereign Choice Protocols</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-primary/10 px-8 h-12 rounded-xl border border-primary/10">
                <Link href="/store" className="flex items-center gap-3">كافة الأصول <ArrowRight size={16} className="rotate-180" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-14">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-40 bg-background relative overflow-hidden px-4">
        <div className="container mx-auto relative z-10">
           <div className="text-center mb-16 md:mb-24 space-y-3">
              <h2 className="text-3xl md:text-6xl font-headline font-black uppercase tracking-tighter">لماذا <span className="gold-text">تختارنا؟</span></h2>
              <p className="text-muted-foreground uppercase font-black text-[8px] md:text-[10px] tracking-[0.5em] opacity-40">Elite Trust Experience</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي متطور يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات اتصال مشفرة.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات المالية محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي المستوى.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي يمنحك رتباً استثنائية وخصومات حصرية متزايدة بناءً على نشاطك وموثوقيتك.", icon: Award }
              ].map((item, i) => (
                <div key={i} className="p-10 md:p-12 luxury-card bg-card/40 border-primary/5 hover:border-primary/20 shadow-2xl text-center flex flex-col items-center group transition-all duration-700">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-black transition-all shadow-inner">
                      <item.icon size={30} />
                   </div>
                   <h4 className="font-black text-xl md:text-2xl mb-4 group-hover:gold-text transition-all tracking-tight">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-sm md:text-base opacity-90">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}
