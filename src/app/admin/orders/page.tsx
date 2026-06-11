
"use client";

import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

export default function AdminOrders() {
  const db = useFirestore();
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const { data: orders, loading } = useCollection(ordersQuery);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus, updatedAt: new Date().toISOString() });
      toast({ title: "تم التحديث", description: `حالة الطلب الآن: ${newStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث حالة الطلب" });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-3xl font-headline font-bold mb-1">طلبات العملاء</h1>
        <p className="text-muted-foreground text-sm">متابعة وتنفيذ طلبات الشحن والخدمات الرقمية.</p>
      </header>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-right font-bold text-xs py-4 uppercase">المعرف</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">المنتج</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">المبلغ</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">تاريخ الطلب</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">الحالة</TableHead>
                <TableHead className="text-center font-bold text-xs uppercase">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">جاري تحميل الطلبات...</TableCell></TableRow>
              ) : orders?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">لا توجد طلبات حالياً</TableCell></TableRow>
              ) : orders?.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-5">
                    <span className="font-mono text-[10px] text-primary bg-primary/5 px-2 py-1 rounded-md">{order.id.substring(0,8).toUpperCase()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.productName}</span>
                      <span className="text-[10px] text-muted-foreground">UID: {order.userId.substring(0,10)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-900">{formatUSD(order.amount)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full font-bold text-[10px] ${
                      order.status === 'completed' ? 'border-green-200 text-green-600 bg-green-50' : 
                      order.status === 'cancelled' ? 'border-red-200 text-red-600 bg-red-50' : 
                      'border-amber-200 text-amber-600 bg-amber-50'
                    }`}>
                      {order.status === 'completed' ? 'مكتمل' : order.status === 'processing' ? 'قيد التنفيذ' : 'معلق'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl text-green-600 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                      >
                        <CheckCircle2 size={18} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      >
                        <XCircle size={18} />
                      </Button>
                    </div>
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
