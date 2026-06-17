"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Wallet, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config, loading: configLoading } = useDoc(settingsRef);

  const labels = config?.cartLabels || {
    cartTitle: "سلة المقتنيات",
    emptyCartMsg: "السلة السيادية فارغة حالياً",
    summaryTitle: "ملخص الاستحواذ"
  };

  if (configLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={60} /></div>;

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-32 max-w-6xl">
        <header className="mb-12 md:mb-16 text-center lg:text-right border-r-0 md:border-r-8 border-primary pr-0 md:pr-8">
           <h1 className="text-4xl md:text-7xl font-headline font-black gold-text leading-tight">{labels.cartTitle}</h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] md:text-sm mt-2">Sovereign Shopping & Asset Management</p>
        </header>

        {items.length === 0 ? (
          <div className="py-24 md:py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
             <ShoppingBag size={80} className="md:w-32 md:h-32 text-muted-foreground mb-8" />
             <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest">{labels.emptyCartMsg}</h2>
             <Button asChild className="royal-button mt-10 h-14 md:h-16 px-12 text-base md:text-lg">
                <Link href="/store">العودة للتسوق</Link>
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6 md:gap-8 group">
                       <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                          <img src={item.imageUrl || "https://picsum.photos/seed/cart/200/200"} className="w-full h-full object-cover" alt="" />
                       </div>
                       <div className="flex-1 text-center sm:text-right">
                          <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest">{item.category}</span>
                          <h3 className="text-lg md:text-2xl font-black leading-tight">{item.name}</h3>
                          <p className="text-base md:text-lg font-black text-muted-foreground mt-1">{formatUSD(item.price)}</p>
                       </div>
                       <div className="flex items-center gap-4 bg-muted/40 p-1.5 rounded-2xl border">
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-xl" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></Button>
                          <span className="w-6 text-center font-black text-lg md:text-xl">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-xl" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></Button>
                       </div>
                       <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl text-red-500 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                          <Trash2 size={18} />
                       </Button>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-6 md:space-y-8">
               <Card className="luxury-card p-6 md:p-10 bg-primary/5 border-primary/20 sticky top-32">
                  <h3 className="text-lg md:text-xl font-black mb-8 border-b pb-4 flex items-center gap-3"><Zap className="text-primary" /> {labels.summaryTitle}</h3>
                  <div className="space-y-6">
                     <div className="flex justify-between font-bold text-muted-foreground text-xs md:text-sm">
                        <span>إجمالي المنتجات ({itemCount})</span>
                        <span>{formatUSD(total)}</span>
                     </div>
                     <div className="flex justify-between font-bold text-muted-foreground text-xs md:text-sm">
                        <span>الضرائب والرسوم</span>
                        <span className="text-green-500">مغطاة سيادياً</span>
                     </div>
                     <div className="h-px bg-border/50 my-6" />
                     <div className="flex justify-between items-end">
                        <span className="font-black text-[10px] md:text-sm uppercase">المبلغ الإجمالي</span>
                        <span className="text-2xl md:text-4xl font-black gold-text tracking-tighter">{formatUSD(total)}</span>
                     </div>
                     
                     <div className="pt-8 space-y-4">
                        <Button asChild className="royal-button w-full h-16 md:h-18 text-lg md:text-xl shadow-2xl">
                           <Link href="/checkout">إتمام البروتوكول المالي <ArrowRight className="mr-3 rotate-180" /></Link>
                        </Button>
                        <div className="flex items-center justify-center gap-2 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                           <ShieldCheck size={12} className="text-green-500" /> تأمين مالي مشفر 100%
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="luxury-card p-6 md:p-8 bg-zinc-950 text-white border-none flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary shrink-0"><Wallet size={20} /></div>
                  <div>
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-zinc-500">الدفع عبر المحفظة</p>
                    <p className="text-[10px] md:text-xs font-bold leading-relaxed">سيتم خصم المبلغ من رصيدك المتاح فور تأكيد الطلب.</p>
                  </div>
               </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}