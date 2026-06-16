"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, ShieldCheck, Zap, Award, Flame, MessageSquare, Mail } from "lucide-react";

export default function HomeElite() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const bestSellersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(4));
  }, [db]);

  const { data: bestSellers } = useCollection(bestSellersQuery);

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-60 overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <pattern id="grid-modern" width="80" height="80" patternUnits="userSpaceOnUse">
               <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge className="mb-12 py-3 px-12 bg-primary/10 text-primary border-primary/20 rounded-full font-black text-[12px] tracking-[0.3em] uppercase shadow-sm">
                {config?.siteInfo?.subtitle || "Elite Experience Protocol Active"}
              </Badge>
              
              <h1 className="text-6xl md:text-9xl mb-12 font-headline font-black leading-tight tracking-tighter">
                 {config?.pageContent?.heroTitle || "حلول رقمية نُخبوية"}
              </h1>

              <p className="text-2xl md:text-3xl text-slate-500 dark:text-zinc-500 max-w-5xl mx-auto mb-20 leading-relaxed font-medium">
                {config?.pageContent?.heroDescription || "نقدم لك أرقى باقات شحن الألعاب، الهويات البصرية، والخدمات الاحترافية المعتمدة سيادياً."}
              </p>
              
              <div className="flex flex-wrap justify-center gap-8">
                <Button asChild className="royal-button h-20 px-16 text-xl shadow-primary/30">
                  <Link href="/store"><ShoppingBag className="ml-4" size={28} /> استكشاف المتجر</Link>
                </Button>
                <Button asChild variant="outline" className="h-20 px-16 text-xl rounded-2xl font-black border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900">
                  <Link href="/designs/gallery"><Palette className="ml-4" size={28} /> معرض الإبداع</Link>
                </Button>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="py-32 bg-white dark:bg-black relative">
           <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-6">
                 <div className="text-right border-r-4 border-primary pr-8">
                    <h2 className="text-5xl font-black flex items-center gap-5">
                       <Flame className="text-red-500 animate-pulse" size={44} /> إصدارات النخبة
                    </h2>
                    <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Limited Edition Assets & Services</p>
                 </div>
                 <Button asChild variant="ghost" className="text-primary font-black uppercase text-xs tracking-[0.3em] hover:bg-primary/5">
                    <Link href="/store">View Entire Inventory</Link>
                 </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                 {bestSellers.map((product: any) => (
                   <ProductCard key={product.id} product={product} />
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Footer Sovereign */}
      <footer className="py-40 bg-slate-50 dark:bg-zinc-950 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="handwritten-logo text-7xl mb-12">
            {config?.siteInfo?.title || "XMOOD STORE"}
          </div>
          <p className="text-slate-500 dark:text-zinc-500 max-w-3xl mx-auto mb-24 text-2xl leading-relaxed font-medium">
            {config?.pageContent?.footerAbout || "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-12 mb-32">
             {config?.contact?.whatsapp && (
               <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '')}`} target="_blank" className="flex items-center gap-5 text-slate-900 dark:text-white hover:gold-text transition-all font-black text-sm bg-white dark:bg-zinc-900 px-12 py-6 rounded-[2.5rem] shadow-2xl border">
                  <MessageSquare size={28} className="text-green-500" /> الدعم التنفيذي المباشر
               </a>
             )}
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-5 text-slate-900 dark:text-white hover:gold-text transition-all font-black text-sm bg-white dark:bg-zinc-900 px-12 py-6 rounded-[2.5rem] shadow-2xl border">
                  <Mail size={28} className="text-primary" /> قنوات التواصل الرسمية
               </a>
             )}
          </div>

          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-60">
            {config?.siteInfo?.copyright || "© 2025 XMOOD SOVEREIGN ASSETS. ALL RIGHTS RESERVED."}
          </p>
        </div>
      </footer>
    </main>
  );
}
