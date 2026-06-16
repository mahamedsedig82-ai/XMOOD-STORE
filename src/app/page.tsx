"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Megaphone, Zap, Award, Flame, MessageSquare, Mail, ChevronLeft, ExternalLink } from "lucide-react";

export default function HomeElite() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const bestSellersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: bestSellers } = useCollection(bestSellersQuery);

  return (
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 overflow-hidden bg-muted/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <pattern id="grid-modern" width="80" height="80" patternUnits="userSpaceOnUse">
               <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge className="mb-10 py-3 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black text-[11px] tracking-[0.2em] uppercase shadow-sm">
                {config?.siteInfo?.subtitle || "SOVEREIGN DIGITAL ASSETS v3"}
              </Badge>
              
              <h1 className="text-5xl md:text-8xl mb-8 font-headline font-black leading-tight tracking-tighter max-w-6xl mx-auto">
                 {config?.pageContent?.heroTitle || "تجربة رقمية نُخبوية وموثوقة"}
              </h1>

              <p className="text-lg md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
                {config?.pageContent?.heroDescription || "نقدم لك أرقى باقات شحن الألعاب، الهويات البصرية، والخدمات الاحترافية المعتمدة سيادياً."}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <Button asChild className="royal-button h-16 md:h-20 px-10 md:px-16 text-lg md:text-xl shadow-primary/30">
                  <Link href="/store"><ShoppingBag className="ml-3" size={24} /> استكشاف المتجر</Link>
                </Button>
                <Button asChild variant="outline" className="h-16 md:h-20 px-10 md:px-16 text-lg md:text-xl rounded-2xl font-black border-border hover:bg-muted">
                  <Link href="/designs/gallery"><Palette className="ml-3" size={24} /> معرض الإبداع</Link>
                </Button>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Ad Banner - Real Content */}
      {config?.ads?.isActive && (
        <section className="container mx-auto px-6 mb-24 animate-fade-up">
           <div className="relative rounded-[3rem] overflow-hidden group shadow-2xl border-4 border-primary/20">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700 z-10" />
              <img 
                src={config.ads.headerBanner || "https://picsum.photos/seed/ad1/1200/400"} 
                className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="XMOOD Promotion" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 p-8">
                 <Badge className="bg-red-600 text-white mb-6 animate-bounce px-6 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                    عرض لفترة محدودة
                 </Badge>
                 <h2 className="text-3xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">
                    {config.ads.promoText || "باقة النخبة متاحة الآن بخصم 20%"}
                 </h2>
                 <Button asChild className="royal-button h-14 px-12 text-sm bg-white text-black hover:bg-zinc-100 shadow-white/10">
                    <Link href="/store">استفد من العرض الآن <ChevronLeft size={16} className="mr-2 rotate-180" /></Link>
                 </Button>
              </div>
           </div>
        </section>
      )}

      {/* Featured Products */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="py-24 relative">
           <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                 <div className="text-right border-r-4 border-primary pr-6">
                    <h2 className="text-4xl md:text-5xl font-black flex items-center gap-4">
                       <Flame className="text-red-500" size={36} /> إصدارات النخبة
                    </h2>
                    <p className="text-muted-foreground mt-1 font-bold uppercase tracking-widest text-[9px]">Exclusive Limited Time Assets</p>
                 </div>
                 <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary/5">
                    <Link href="/store" className="flex items-center gap-2">المستودع الكامل <ExternalLink size={14} /></Link>
                 </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                 {bestSellers.map((product: any) => (
                   <ProductCard key={product.id} product={product} />
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Footer Sovereign */}
      <footer className="py-24 bg-muted/10 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="handwritten-logo text-6xl mb-10">
            {config?.siteInfo?.title || "XMOOD STORE"}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-lg md:text-xl leading-relaxed font-medium">
            {config?.pageContent?.footerAbout || "المرجع الأول والأكثر موثوقية في تقديم الخدمات الرقمية والحلول الإبداعية المتكاملة."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-20">
             {config?.contact?.whatsapp && (
               <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '')}`} target="_blank" className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-xs bg-card px-10 py-5 rounded-2xl shadow-xl border">
                  <MessageSquare size={24} className="text-green-500" /> الدعم التنفيذي
               </a>
             )}
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-xs bg-card px-10 py-5 rounded-2xl shadow-xl border">
                  <Mail size={24} className="text-primary" /> التواصل الرسمي
               </a>
             )}
          </div>

          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
            {config?.siteInfo?.copyright || "© 2025 XMOOD SOVEREIGN. ALL RIGHTS RESERVED."}
          </p>
        </div>
      </footer>
    </main>
  );
}