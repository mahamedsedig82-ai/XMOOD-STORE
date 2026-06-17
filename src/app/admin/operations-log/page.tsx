
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, History, CheckCircle2, User, 
  TrendingUp, Clock, Image as ImageIcon, Loader2, ArrowUpRight 
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function AdminOperationsVisualLog() {
  const db = useFirestore();

  // Fetch only completed orders to show successful sales
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "orders"),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
  }, [db]);

  const { data: sales, loading } = useCollection(ordersQuery);

  const totalRevenue = sales?.reduce((sum, s: any) => sum + (s.amount || 0), 0) || 0;

  return (
    <div className="space-y-12 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b pb-12">
        <div className="text-right space-y-3">
          <h1 className="text-4xl md:text-6xl font-headline font-black gold-text leading-tight">سجل العمليات المصور</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Visual Sales Ledger & Success Metrics Hub</p>
        </div>
        <Card className="luxury-card border-none bg-primary text-black px-10 py-6 shadow-2xl flex items-center gap-6">
           <TrendingUp size={32} className="animate-pulse" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">إجمالي عوائد السجل</p>
              <p className="text-4xl font-black tracking-tighter">{formatUSD(totalRevenue)}</p>
           </div>
        </Card>
      </header>

      {loading ? (
        <div className="py-60 flex flex-col items-center gap-6">
           <Loader2 className="animate-spin text-primary" size={80} />
           <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">جاري سحب بيانات المبيعات المكتملة...</p>
        </div>
      ) : sales?.length === 0 ? (
        <div className="py-60 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
           <History size={120} className="text-muted-foreground mb-8" />
           <h2 className="text-3xl font-black uppercase tracking-widest">لا توجد عمليات بيع مكتملة بعد</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {sales?.map((sale: any, i: number) => (
             <motion.div 
               key={sale.id}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.05 }}
             >
               <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-xl hover:border-primary/30 transition-all group overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                     {sale.productImage ? (
                       <img src={sale.productImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                          <ImageIcon size={48} />
                          <span className="text-[10px] font-bold mt-2 uppercase">No Image Logged</span>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                     <Badge className="absolute top-5 right-5 bg-green-500 text-white border-none font-black text-[9px] uppercase px-4 py-1 rounded-full shadow-lg">
                        <CheckCircle2 size={10} className="ml-1.5" /> COMPLETED
                     </Badge>
                  </div>
                  
                  <CardContent className="p-8 space-y-6">
                     <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Service Asset Delivered</p>
                        <h3 className="text-2xl font-black leading-tight truncate">{sale.productName}</h3>
                     </div>

                     <div className="flex items-center justify-between p-5 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-primary shadow-sm">
                              <User size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-muted-foreground uppercase">المشتري</span>
                              <span className="text-sm font-bold truncate max-w-[120px]">{sale.userName || sale.userEmail?.split('@')[0]}</span>
                           </div>
                        </div>
                        <div className="text-left">
                           <span className="text-[8px] font-black text-muted-foreground uppercase block">القيمة</span>
                           <span className="text-xl font-black text-primary tracking-tighter">{formatUSD(sale.amount)}</span>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                           <Clock size={14} className="text-primary" />
                           <span className="text-[10px] font-bold uppercase">{new Date(sale.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">REF: {sale.id?.substring(0,10)}</Badge>
                     </div>
                  </CardContent>
               </Card>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
}
