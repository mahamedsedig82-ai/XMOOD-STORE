"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Loader2, Clock, Zap } from "lucide-react";
import { formatUSD } from "@/lib/currency";

export default function AdminOrders() {
  const db = useFirestore();
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);
  
  const { data: orders, loading } = useCollection(ordersQuery);

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold mb-1 gold-text">مراقبة الطلبات الآلية</h1>
          <p className="text-muted-foreground text-sm uppercase font-black text-[9px] tracking-widest">Real-time Automated Dispatch Monitor</p>
        </div>
        <div className="h-12 px-6 bg-primary/10 rounded-xl flex items-center gap-3 border border-primary/20">
           <Zap size={16} className="text-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase">System: Fully Automated</span>
        </div>
      </header>

      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card/60 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-right font-black text-[10px] py-6 pr-8 uppercase">رقم الطلب</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">المنتج المسلم</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">القيمة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">الحالة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase pl-8">التوقيت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin text-primary mx-auto" /></TableCell></TableRow>
              ) : orders?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 opacity-30 italic">لا توجد طلبات مسجلة</TableCell></TableRow>
              ) : orders?.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-primary/5 transition-colors border-b border-border/30">
                  <TableCell className="py-6 pr-8">
                    <span className="font-mono text-[10px] text-primary font-black uppercase tracking-tighter">{order.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.items?.[0]?.name}</span>
                      <span className="text-[9px] text-muted-foreground uppercase font-black">{order.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-lg tracking-tighter text-foreground">{formatUSD(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full font-black text-[8px] uppercase tracking-widest px-4 ${
                      order.status === 'completed' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 
                      order.status === 'pending_stock' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 
                      'border-red-500/20 text-red-500 bg-red-500/5'
                    }`}>
                      {order.status === 'completed' ? 'مكتمل' : order.status === 'pending_stock' ? 'بانتظار المخزون' : order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-black text-muted-foreground uppercase pl-8">
                    {new Date(order.createdAt).toLocaleTimeString('ar-EG')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
