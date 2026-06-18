"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Flame, Zap, Award, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const db = useFirestore();
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative pt-48 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-8 py-2.5 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">
              المرجع الأول والوحيد للخدمات الرقمية النخبوية
            </Badge>
            <h1 className="text-5xl md:text-9xl font-headline font-black mb-8 leading-tight tracking-tighter">
              عالم <span className="handwritten-logo text-7xl md:text-[10rem] mx-4">Xmood</span> الرقمي
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              استكشف أرقى باقات شحن الألعاب، الحسابات البريميوم، والحلول الإبداعية المعتمدة سيادياً بأعلى معايير الأمان.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild className="royal-button h-18 px-12 text-base shadow-primary/30">
                <Link href="/store"><ShoppingBag className="ml-3" /> دخول المستودع</Link>
              </Button>
              <Button asChild variant="outline" className="h-18 px-12 rounded-2xl border-primary/20 hover:bg-primary/5 font-black text-xs uppercase tracking-widest gap-3">
                <Link href="/designs/gallery"><Palette size={20} className="text-primary" /> معرض الأعمال</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-24 bg-muted/20 border-y">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-headline font-black flex items-center gap-4">
                  <Flame className="text-red-500 w-10 h-10" /> باقات مختارة
                </h2>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mr-14">Elite Digital Assets Collection</p>
              </div>
              <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10">
                <Link href="/store">عرض الكل</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="text-center mb-20">
              <Zap className="mx-auto text-primary mb-6 animate-pulse" size={64} />
              <h2 className="text-4xl md:text-6xl font-headline font-black mb-4">لماذا يختار النخبة XMOOD؟</h2>
              <p className="text-muted-foreground uppercase font-black text-[10px] tracking-[0.5em]">The Sovereign Excellence Protocol</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
              {[
                { title: "تسليم فوري آلي", desc: "يتم معالجة كافة الطلبات بشكل آلي وسريع عبر بروتوكولات التسليم الذكية.", icon: Zap },
                { title: "أمان مالي سيادي", desc: "كافة المعاملات المالية محمية بنظام المحفظة الموثق والتشفير المركزي.", icon: ShieldCheck },
                { title: "دعم النخبة المباشر", desc: "فريق مختص متواجد لمساعدتك عبر الواتساب والتلجرام على مدار الساعة.", icon: Award }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-10 luxury-card bg-card border-none shadow-2xl text-center flex flex-col items-center"
                >
                   <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 shadow-inner">
                      <item.icon size={36} />
                   </div>
                   <h4 className="font-black text-2xl mb-4 gold-text">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}