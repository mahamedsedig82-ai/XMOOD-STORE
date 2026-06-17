
"use client";

import { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, History, CheckCircle2, User, 
  TrendingUp, Clock, Image as ImageIcon, Loader2, 
  Search, Filter, Calendar, DollarSign, Zap, 
  FileText, Truck, Mail, Tag, ArrowRightLeft, 
  ChevronRight, MoreVertical, XCircle, AlertCircle,
  Eye, RefreshCw, Smartphone, Trash2
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function AdminOperationsControlCenter() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(500));
  }, [db]);

  const { data: orders, loading } = useCollection(ordersQuery);

  const stats = useMemo(() => {
    if (!orders) return { revenue: 0, completed: 0, processing: 0, total: 0, cancelled: 0 };
    return orders.reduce((acc: any, order: any) => {
      acc.total += 1;
      const orderAmount = order.totalAmount || order.amount || 0;
      if (order.status === 'completed') {
        acc.completed += 1;
        acc.revenue += orderAmount;
      } else if (order.status === 'pending_stock') {
        acc.processing += 1;
      } else if (order.status === 'cancelled') {
        acc.cancelled += 1;
      }
      return acc;
    }, { revenue: 0, completed: 0, processing: 0, total: 0, cancelled: 0 });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        o.id?.toLowerCase().includes(search) || 
        o.userName?.toLowerCase().includes(search) ||
        o.userEmail?.toLowerCase().includes(search);
      
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      
      let matchesTime = true;
      if (timeFilter !== "all") {
        const orderDate = new Date(o.createdAt);
        const now = new Date();
        if (timeFilter === "today") {
          matchesTime = orderDate.toDateString() === now.toDateString();
        } else if (timeFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matchesTime = orderDate >= weekAgo;
        } else if (timeFilter === "month") {
          matchesTime = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [orders, searchTerm, statusFilter, timeFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus, 
        updatedAt: new Date().toISOString(),
        modifiedBy: "Sovereign Auto Logic" 
      });
      toast({ title: "تم تحديث حالة الطلب" });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b pb-12">
        <div className="text-right space-y-3">
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">مركز العمليات الذاتي</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Real-time Automated Sales Intelligence</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
           <Card className="p-4 luxury-card border-none bg-primary/5 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">صافي الإيرادات</p>
              <p className="text-xl font-black text-primary">{formatUSD(stats.revenue)}</p>
           </Card>
           <Card className="p-4 luxury-card border-none bg-green-500/5 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">تسليم آلي</p>
              <p className="text-xl font-black text-green-500">{stats.completed}</p>
           </Card>
           <Card className="p-4 luxury-card border-none bg-amber-500/5 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">بانتظار المخزون</p>
              <p className="text-xl font-black text-amber-500">{stats.processing}</p>
           </Card>
           <Card className="p-4 luxury-card border-none bg-muted/20 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">إجمالي المعاملات</p>
              <p className="text-xl font-black">{stats.total}</p>
           </Card>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-card/60 backdrop-blur-xl p-6 rounded-[2.5rem] border shadow-sm">
         <div className="md:col-span-2 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="ابحث برقم الطلب، الاسم، أو البريد..." 
              className="pr-12 h-14 bg-background border-none rounded-2xl font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-14 rounded-2xl bg-background border-none font-bold">
               <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
               <SelectItem value="all">كافة الحالات</SelectItem>
               <SelectItem value="completed">مكتمل (تم التسليم)</SelectItem>
               <SelectItem value="pending_stock">بانتظار المخزون</SelectItem>
               <SelectItem value="failed">فشل التسليم</SelectItem>
               <SelectItem value="cancelled">ملغاة</SelectItem>
            </SelectContent>
         </Select>
         <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-14 rounded-2xl bg-background border-none font-bold">
               <SelectValue placeholder="تصفية حسب الزمن" />
            </SelectTrigger>
            <SelectContent dir="rtl">
               <SelectItem value="all">كل الأوقات</SelectItem>
               <SelectItem value="today">اليوم</SelectItem>
               <SelectItem value="week">الأسبوع</SelectItem>
               <SelectItem value="month">الشهر</SelectItem>
            </SelectContent>
         </Select>
      </section>

      <Card className="luxury-card border-none bg-card/40 overflow-hidden shadow-2xl">
         <ScrollArea className="max-h-[700px] overflow-x-auto responsive-table">
            <Table>
               <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow>
                     <TableHead className="text-right py-6 pr-10 font-black uppercase text-[10px]">العملية والمستحوذ</TableHead>
                     <TableHead className="text-right font-black uppercase text-[10px]">الأصل الرقمي</TableHead>
                     <TableHead className="text-right font-black uppercase text-[10px]">الحالة الآلية</TableHead>
                     <TableHead className="text-right font-black uppercase text-[10px]">القيمة</TableHead>
                     <TableHead className="text-center font-black uppercase text-[10px]">القسيمة</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={50} /></TableCell></TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-40 opacity-30 italic">لا توجد عمليات مسجلة</TableCell></TableRow>
                  ) : filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-primary/5 transition-all border-b border-border/30">
                       <TableCell className="py-6 pr-10" data-label="المشتري">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-zinc-400 border shadow-sm">
                                <User size={18} />
                             </div>
                             <div>
                                <p className="font-bold text-sm truncate max-w-[150px]">{order.userName}</p>
                                <p className="text-[8px] font-mono text-primary uppercase tracking-tighter">REF: {order.id}</p>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell data-label="المنتج">
                          <p className="font-bold text-xs">{order.items?.[0]?.name || "باقة متنوعة"}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                       </TableCell>
                       <TableCell data-label="الحالة">
                          <Badge className={`rounded-full px-4 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                            order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            order.status === 'pending_stock' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {order.status === 'completed' ? 'تم التسليم' : order.status === 'pending_stock' ? 'نقص مخزون' : order.status}
                          </Badge>
                       </TableCell>
                       <TableCell data-label="المبلغ" className="font-black text-lg tracking-tighter">
                          {formatUSD(order.totalAmount || order.amount || 0)}
                       </TableCell>
                       <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"
                            onClick={() => setSelectedOrder(order)}
                          >
                             <Eye size={18} />
                          </Button>
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </ScrollArea>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
         <DialogContent className="max-w-4xl bg-zinc-950 border-primary/20 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl text-white">
            <DialogHeader className="sr-only">
               <DialogTitle>بيانات العملية الآلية التفصيلية</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="flex flex-col h-full max-h-[90vh]">
                 <div className="p-8 md:p-12 bg-gradient-to-br from-zinc-900 to-black border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                       <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em]">Official Sovereign Record</Badge>
                       <h2 className="text-3xl md:text-5xl font-headline font-black gold-text leading-tight">بيانات العملية الآلية</h2>
                       <div className="flex items-center gap-4 text-xs font-mono opacity-50">
                          <span className="flex items-center gap-2"><Tag size={12}/> REF: {selectedOrder.id}</span>
                          <span className="flex items-center gap-2"><Clock size={12}/> {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}</span>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <Button onClick={() => handleUpdateStatus(selectedOrder.id, 'refunded')} variant="outline" className="font-black h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5">استرداد المبلغ</Button>
                       <Button onClick={async () => { if(confirm("حذف السجل نهائياً؟")) { await deleteDoc(doc(db, "orders", selectedOrder.id)); setSelectedOrder(null); toast({title: "تم حذف السجل"}); } }} variant="destructive" className="h-14 w-14 rounded-2xl p-0"><Trash2 size={20}/></Button>
                    </div>
                 </div>

                 <ScrollArea className="flex-1 p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-10">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><User size={14}/> بيانات المستحوذ</h4>
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">الاسم</p><p className="font-black text-lg">{selectedOrder.userName}</p></div>
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">البريد</p><p className="font-bold text-sm text-zinc-300">{selectedOrder.userEmail}</p></div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><Truck size={14}/> قناة التسليم</h4>
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">الوسيلة</p><p className="font-black text-lg">{selectedOrder.shippingMethodName}</p></div>
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">بريد التسليم</p><p className="font-bold text-sm text-green-400">{selectedOrder.deliveryEmail}</p></div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-10">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><DollarSign size={14}/> التحليل المالي</h4>
                             <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 relative overflow-hidden">
                                <div className="relative z-10 space-y-6">
                                   <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground">الرصيد قبل</p>
                                      <p className="text-xl font-black">{formatUSD(selectedOrder.balanceBefore || 0)}</p>
                                   </div>
                                   <div className="flex justify-between items-end">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground">صافي المدفوع</p>
                                      <p className="text-4xl font-black text-primary">{formatUSD(selectedOrder.totalAmount || 0)}</p>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><Zap size={14}/> كود التسليم المستخرج</h4>
                             <div className="p-8 bg-zinc-900 border-2 border-dashed border-primary/40 rounded-[2.5rem] text-center">
                                <p className="text-[8px] text-muted-foreground uppercase font-black mb-4">Auto-Extracted Secret Key</p>
                                <p className="text-3xl font-black tracking-[0.2em] text-primary uppercase select-all">{selectedOrder.shippingCodeSent || "OUT_OF_STOCK"}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </ScrollArea>
              </div>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}
