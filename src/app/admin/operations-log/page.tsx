
"use client";

import { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, History, CheckCircle2, User, 
  TrendingUp, Clock, Image as ImageIcon, Loader2, 
  Search, Filter, Calendar, DollarSign, Zap, 
  FileText, Truck, Mail, Tag, ArrowRightLeft, 
  ChevronRight, MoreVertical, XCircle, AlertCircle,
  Eye, RefreshCw, Smartphone
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

  // Fetch all orders for comprehensive logging
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(500));
  }, [db]);

  const { data: orders, loading } = useCollection(ordersQuery);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (!orders) return { revenue: 0, completed: 0, processing: 0, total: 0, cancelled: 0 };
    return orders.reduce((acc: any, order: any) => {
      acc.total += 1;
      if (order.status === 'completed') {
        acc.completed += 1;
        acc.revenue += (order.totalAmount || order.amount || 0);
      } else if (order.status === 'processing') {
        acc.processing += 1;
      } else if (order.status === 'cancelled') {
        acc.cancelled += 1;
      }
      return acc;
    }, { revenue: 0, completed: 0, processing: 0, total: 0, cancelled: 0 });
  }, [orders]);

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) => {
      const matchesSearch = 
        o.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      
      // Time Filtering
      let matchesTime = true;
      if (timeFilter !== "all") {
        const orderDate = new Date(o.createdAt);
        const now = new Date();
        if (timeFilter === "today") {
          matchesTime = orderDate.toDateString() === now.toDateString();
        } else if (timeFilter === "week") {
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
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
        modifiedBy: "Master Admin" 
      });
      toast({ title: "تم تحديث حالة الطلب سيادياً" });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b pb-12">
        <div className="text-right space-y-3">
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">مركز العمليات الموحد</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Real-time Order Intelligence & Monetary Tracking</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
           <Card className="p-4 luxury-card border-none bg-primary/5 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">الإيرادات</p>
              <p className="text-xl font-black text-primary">{formatUSD(stats.revenue)}</p>
           </Card>
           <Card className="p-4 luxury-card border-none bg-green-500/5 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">مكتمل</p>
              <p className="text-xl font-black text-green-500">{stats.completed}</p>
           </Card>
           <Card className="p-4 luxury-card border-none bg-amber-500/5 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">قيد التنفيذ</p>
              <p className="text-xl font-black text-amber-500">{stats.processing}</p>
           </Card>
           <Card className="p-4 luxury-card border-none bg-muted/20 text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">المعاملات</p>
              <p className="text-xl font-black">{stats.total}</p>
           </Card>
        </div>
      </header>

      {/* Filters & Search */}
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
               <SelectItem value="completed">مكتملة</SelectItem>
               <SelectItem value="processing">قيد التنفيذ</SelectItem>
               <SelectItem value="cancelled">ملغاة</SelectItem>
            </SelectContent>
         </Select>
         <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-14 rounded-2xl bg-background border-none font-bold">
               <SelectValue placeholder="تصفية حسب الزمن" />
            </SelectTrigger>
            <SelectContent dir="rtl">
               <SelectItem value="all">كل الأوقات</SelectItem>
               <SelectItem value="today">طلبات اليوم</SelectItem>
               <SelectItem value="week">هذا الأسبوع</SelectItem>
               <SelectItem value="month">هذا الشهر</SelectItem>
            </SelectContent>
         </Select>
      </section>

      {/* Main Log Table */}
      <Card className="luxury-card border-none bg-card/40 overflow-hidden shadow-2xl">
         <ScrollArea className="max-h-[700px] overflow-x-auto responsive-table">
            <Table>
               <TableHeader className="bg-muted/30 sticky top-0 z-20">
                  <TableRow>
                     <TableHead className="text-right py-6 pr-10 font-black uppercase text-[10px]">العملية والمشتري</TableHead>
                     <TableHead className="text-right font-black uppercase text-[10px]">المنتج / الخدمة</TableHead>
                     <TableHead className="text-right font-black uppercase text-[10px]">الحالة</TableHead>
                     <TableHead className="text-right font-black uppercase text-[10px]">القيمة</TableHead>
                     <TableHead className="text-center font-black uppercase text-[10px]">التفاصيل</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={50} /></TableCell></TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-40 opacity-30 italic">لا توجد عمليات مطابقة للبحث حالياً</TableCell></TableRow>
                  ) : filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-primary/5 transition-all border-b border-border/30">
                       <TableCell className="py-6 pr-10" data-label="المشتري">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-zinc-400 border shadow-sm">
                                <User size={18} />
                             </div>
                             <div>
                                <p className="font-bold text-sm truncate max-w-[150px]">{order.userName}</p>
                                <p className="text-[8px] font-mono text-primary uppercase tracking-tighter">ID: {order.id}</p>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell data-label="المنتج">
                          <p className="font-bold text-xs">{order.productName || order.items?.[0]?.name || "باقة متنوعة"}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                       </TableCell>
                       <TableCell data-label="الحالة">
                          <Badge className={`rounded-full px-4 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                            order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {order.status}
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

      {/* Detailed Order View Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
         <DialogContent className="max-w-4xl bg-zinc-950 border-primary/20 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl text-white">
            {selectedOrder && (
              <div className="flex flex-col h-full max-h-[90vh]">
                 <div className="p-8 md:p-12 bg-gradient-to-br from-zinc-900 to-black border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                       <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em]">Official Sovereign Record</Badge>
                       <h2 className="text-3xl md:text-5xl font-headline font-black gold-text">تفاصيل العملية الذكية</h2>
                       <div className="flex items-center gap-4 text-xs font-mono opacity-50">
                          <span className="flex items-center gap-2"><Tag size={12}/> REF: {selectedOrder.id}</span>
                          <span className="flex items-center gap-2"><Clock size={12}/> {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}</span>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <Button onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white font-black h-14 px-8 rounded-2xl shadow-lg shadow-green-600/10">اكتمال التنفيذ</Button>
                       <Button onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')} variant="destructive" className="font-black h-14 px-8 rounded-2xl shadow-lg shadow-red-600/10">إلغاء العملية</Button>
                    </div>
                 </div>

                 <ScrollArea className="flex-1 p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       {/* Section 1: Customer & Delivery */}
                       <div className="space-y-10">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><User size={14}/> بيانات المستحوذ والاتصال</h4>
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">الاسم الرسمي</p><p className="font-black text-lg">{selectedOrder.userName}</p></div>
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">البريد الإلكتروني</p><p className="font-bold text-sm text-zinc-300">{selectedOrder.userEmail}</p></div>
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">معرف العميل (UID)</p><p className="font-mono text-xs text-primary">{selectedOrder.userId}</p></div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><Truck size={14}/> لوجستيات التسليم والشحن</h4>
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">وسيلة الشحن</p><p className="font-black text-lg">{selectedOrder.shippingMethodName}</p></div>
                                <div><p className="text-[8px] text-muted-foreground uppercase font-black">بريد التسليم المعتمد</p><p className="font-bold text-sm text-green-400">{selectedOrder.deliveryEmail || "نفس بريد الحساب"}</p></div>
                                {selectedOrder.notes && <div><p className="text-[8px] text-muted-foreground uppercase font-black">ملاحظات العميل</p><p className="text-xs italic opacity-70">"{selectedOrder.notes}"</p></div>}
                             </div>
                          </div>
                       </div>

                       {/* Section 2: Financial & Assets */}
                       <div className="space-y-10">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><DollarSign size={14}/> التحليل المالي للعملية</h4>
                             <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
                                <div className="relative z-10 space-y-6">
                                   <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground">إجمالي المبلغ المخصوم</p>
                                      <p className="text-5xl font-black tracking-tighter gold-text">{formatUSD(selectedOrder.totalAmount || selectedOrder.amount || 0)}</p>
                                   </div>
                                   <div className="grid grid-cols-2 gap-6">
                                      <div><p className="text-[8px] text-muted-foreground uppercase font-black mb-1">رسوم الشحن</p><p className="font-black text-lg">{formatUSD(selectedOrder.shippingFee || 0)}</p></div>
                                      <div><p className="text-[8px] text-muted-foreground uppercase font-black mb-1">المجموع الفرعي</p><p className="font-black text-lg">{formatUSD(selectedOrder.subtotal || 0)}</p></div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3"><Zap size={14}/> كود التسليم / الشحن</h4>
                             <div className="p-8 bg-zinc-900 border-2 border-dashed border-primary/40 rounded-[2.5rem] text-center">
                                <p className="text-[8px] text-muted-foreground uppercase font-black mb-4">Activation / Shipping Key</p>
                                <p className="text-3xl font-black tracking-[0.2em] text-primary uppercase select-all">{selectedOrder.shippingCodeSent || "PENDING_DELIVERY"}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </ScrollArea>

                 <div className="p-8 bg-black/40 border-t border-white/5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">Generated via XMOOD Sovereign Operations Engine v4.0</p>
                 </div>
              </div>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}

