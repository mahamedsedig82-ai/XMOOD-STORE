
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Wallet, Zap, ShieldCheck, Loader2, ShoppingCart } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config, loading: configLoading } = useDoc(settingsRef);

  const labels = config?.cartLabels || {
    cartTitle: "سلة المقتنيات",
    emptyCartMsg: "السلة السيادية فارغة حالياً",
    summaryTitle: "ملخص الاستحواذ"
  };

  if (configLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
       <Loader2 className="animate-spin text-primary" size={60} />
       <p className="text-[10px] font-black uppercase tracking-widest gold-text">Initializing Sovereign Cart...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-32 max-w-7xl">
        <header className="mb-16 md:mb-24 text-center lg:text-right border-r-0 lg:border-r-8 border-primary pr-0 lg:pr-10">
           <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                 <ShoppingCart size={24} />
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 py-1.5 rounded-full">Sovereign Asset Collection</Badge>
           </div>
           <h1 className="text-5xl md:text-8xl font-headline font-black gold-text leading-tight">{labels.cartTitle}</h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] md:text-sm mt-3 italic opacity-60">Professional Digital Asset Management Center</p>
        </header>

        {items.length === 0 ? (
          <div className="py-32 md:py-48 text-center luxury-card border-dashed border-primary/20 bg-primary/5 opacity-50 flex flex-col items-center group hover:opacity-100 transition-opacity">
             <ShoppingBag size={120} className="text-muted-foreground mb-10 group-hover:scale-110 transition-transform duration-700" />
             <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest gold-text">{labels.emptyCartMsg}</h2>
             <Button asChild className="royal-button mt-12 h-16 md:h-20 px-16 text-lg md:text-xl shadow-2xl">
                <Link href="/store">استكشاف المستودع <ArrowRight className="mr-3" /></Link>
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
            <div className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl p-6 md:p-10 flex flex-col sm:flex-row items-center gap-8 md:gap-12 group hover:shadow-primary/5">
                       <div className="w-28 h-24 md:w-40 md:h-32 rounded-[2rem] overflow-hidden shrink-0 shadow-2xl border-2 border-primary/10 group-hover:scale-105 transition-transform duration-700">
                          <img src={item.imageUrl || "https://picsum.photos/seed/cart/400/300"} className="w-full h-full object-cover" alt="" />
                       </div>
                       <div className="flex-1 text-center sm:text-right space-y-2">
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-4 py-1 rounded-full">{item.category}</Badge>
                          <h3 className="text-xl md:text-3xl font-black leading-tight group-hover:gold-text transition-colors">{item.name}</h3>
                          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                             <span className="text-2xl md:text-3xl font-black text-primary tracking-tighter">{formatUSD(item.price)}</span>
                             <span className="text-[10px] text-muted-foreground font-bold uppercase">قيمة الوحدة</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-6 bg-muted/40 p-2 rounded-3xl border-2 border-border/40 shadow-inner">
                          <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl hover:bg-primary/10 text-primary" onClick={() => updateQuantity(item.id, -1)}><Minus size={18} /></Button>
                          <span className="w-8 text-center font-black text-xl md:text-3xl">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl hover:bg-primary/10 text-primary" onClick={() => updateQuantity(item.id, 1)}><Plus size={18} /></Button>
                       </div>
                       <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] text-red-500 hover:bg-red-500/10 hover:border-red-500/20 border-2 border-transparent transition-all" onClick={() => removeItem(item.id)}>
                          <Trash2 size={24} />
                       </Button>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-10">
               <Card className="luxury-card p-8 md:p-12 bg-primary/5 border-primary/20 sticky top-32 shadow-2xl">
                  <h3 className="text-2xl md:text-3xl font-black mb-12 border-b border-primary/10 pb-6 flex items-center gap-4">
                     <Zap className="text-primary animate-pulse" /> {labels.summaryTitle}
                  </h3>
                  <div className="space-y-8">
                     <div className="flex justify-between font-black text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em]">
                        <span>إجمالي المقتنيات ({itemCount})</span>
                        <span className="text-foreground">{formatUSD(total)}</span>
                     </div>
                     <div className="flex justify-between font-black text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em]">
                        <span>الضرائب والرسوم</span>
                        <span className="text-green-500">بروتوكول حماية</span>
                     </div>
                     <div className="h-px bg-primary/10 my-8" />
                     <div className="flex justify-between items-end">
                        <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.4em] text-primary">المبلغ الصافي</span>
                        <div className="text-right">
                           <span className="text-4xl md:text-6xl font-black gold-text tracking-tighter leading-none">{formatUSD(total)}</span>
                        </div>
                     </div>
                     
                     <div className="pt-12 space-y-6">
                        <Button asChild className="royal-button w-full h-20 md:h-24 text-xl md:text-2xl shadow-primary/30 group">
                           <Link href="/checkout" className="flex items-center justify-center gap-4">
                              إتمام البروتوكول المالي 
                              <ArrowRight className="mr-3 rotate-180 group-hover:translate-x-[-10px] transition-transform" />
                           </Link>
                        </Button>
                        <div className="flex items-center justify-center gap-3 text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                           <ShieldCheck size={14} className="text-green-500" /> تأمين مالي سيادي مشفر 100%
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="luxury-card p-8 md:p-10 bg-zinc-950 text-white border-none flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-inner border border-white/5 relative z-10">
                     <Wallet size={28} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] md:text-xs font-black uppercase text-zinc-500 tracking-widest mb-1">نظام الدفع المحفظي</p>
                    <p className="text-xs md:text-sm font-medium leading-relaxed opacity-80">سيتم تصفية المبلغ سيادياً من رصيدك المتاح فور التأكيد.</p>
                  </div>
               </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
