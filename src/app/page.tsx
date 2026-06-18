
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
      
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 blur-[150px] rounded-full opacity-40" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-12">
            <div className="flex flex-col items-center gap-8">
               {config?.appearance?.logoUrl ? (
                 <motion.img 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   src={config.appearance.logoUrl} 
                   className="h-32 md:h-56 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" 
                   alt="XMOOD Logo" 
                 />
               ) : (
                 <h1 className="handwritten-logo text-5xl md:text-8xl drop-shadow-xl">XMOOD STORE</h1>
               )}
               
               <div className="space-y-4">
                  <h2 className="text-xl md:text-3xl font-handwriting text-primary opacity-90 tracking-wide animate-fade-in">
                    {config?.siteInfo?.subtitle || "مركز الخدمات الرقمية المعتمدة"}
                  </h2>
                  <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full" />
               </div>
            </div>

            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic opacity-60 px-4">
              {config?.siteInfo?.description || "المستودع الرقمي الأول لإدارة وتوريد أصول النخبة من شحن الألعاب والخدمات التقنية المعتمدة سيادياً."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Button asChild className="royal-button h-16 md:h-20 px-12 text-sm shadow-xl shadow-primary/10">
                <Link href="/store">دخول المستودع</Link>
              </Button>
              <Button asChild variant="outline" className="h-16 md:h-20 px-12 rounded-2xl border-primary/20 hover:bg-primary/5 font-black text-[10px] uppercase tracking-[0.2em] gap-3">
                <Link href="/designs/gallery"><Palette size={18} /> معرض الإبداع</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-24 md:py-40 bg-muted/10 border-y">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
              <div className="text-center md:text-right">
                <h2 className="text-3xl md:text-5xl font-headline font-black uppercase">باقات <span className="gold-text">النخبة</span></h2>
                <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em] mt-3 opacity-40">Elite Sovereign Selection</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 px-10 h-14 rounded-xl border border-primary/10">
                <Link href="/store" className="flex items-center gap-3">كافة الأصول <ArrowRight size={16} className="rotate-180" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 md:py-40 bg-background">
        <div className="container mx-auto px-6">
           <div className="text-center mb-20 space-y-3">
              <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">ما <span className="gold-text">يميزنا</span></h2>
              <p className="text-muted-foreground uppercase font-black text-[10px] tracking-[0.5em] opacity-30">The Sovereign Excellence Protocol</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "استحواذ آلي فوري", desc: "نظام ذكي يقوم بنقل الأصول الرقمية لحسابك في أجزاء من الثانية عبر قنوات مشفرة.", icon: Zap },
                { title: "أمان بنكي مركزي", desc: "كافة المعاملات والتحويلات محمية ببروتوكولات البنك المركزي للمنصة وتشفير أمني عالي.", icon: ShieldCheck },
                { title: "امتيازات العضوية", desc: "نظام سمعة رقمي يمنحك رتباً استثنائية وخصومات حصرية بناءً على نشاطك.", icon: Award }
              ].map((item, i) => (
                <div key={i} className="p-10 luxury-card bg-card/40 border-primary/10 hover:border-primary/25 shadow-xl text-center flex flex-col items-center group transition-all duration-500">
                   <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-black transition-all shadow-inner">
                      <item.icon size={36} />
                   </div>
                   <h4 className="font-black text-2xl mb-4 group-hover:gold-text transition-all tracking-tight">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium text-base opacity-80">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}
