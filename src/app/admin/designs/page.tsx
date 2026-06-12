
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand2, Clock, CheckCircle, ExternalLink, User, MessageCircle, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatUSD } from "@/lib/currency";

export default function DesignManagementPRO() {
  const db = useFirestore();
  const requestsQuery = useMemoFirebase(() => query(collection(db, "design_requests"), orderBy("createdAt", "desc")), [db]);
  const { data: requests, loading } = useCollection(requestsQuery);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "design_requests", id), { status });
      toast({ title: "تم تحديث الحالة", description: `الطلب الآن في وضع: ${status}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل التحديث." });
    }
  };

  return (
    <div className="space-y-10 animate-fade-up" dir="rtl">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">إدارة تدفق التصاميم</h1>
          <p className="text-slate-500">متابعة الطلبات، تعيين المصممين، واعتماد الملفات النهائية.</p>
        </div>
        <div className="bg-primary/10 px-6 py-2 rounded-full border border-primary/20 text-primary font-bold text-sm">
          إجمالي الطلبات: {requests?.length || 0}
        </div>
      </header>

      <Card className="luxury-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right py-6 font-black text-[10px] uppercase">العميل</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">نوع التصميم</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">تاريخ الطلب</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">الحالة</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20">جاري تحميل البيانات السيادية...</TableCell></TableRow>
              ) : requests?.map((req: any) => (
                <TableRow key={req.id} className="hover:bg-primary/5 transition-colors border-b border-slate-100">
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{req.customerName}</span>
                        <span className="text-[10px] opacity-50">{req.customerEmail}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary uppercase">{req.designType}</TableCell>
                  <TableCell className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full font-bold px-4 ${
                      req.status === 'completed' ? 'bg-green-50 text-green-600' : 
                      req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {req.status === 'pending' ? 'قيد الانتظار' : req.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary"><MessageCircle size={18} /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary"><FileDown size={18} /></Button>
                      <Button 
                        onClick={() => handleUpdateStatus(req.id, req.status === 'pending' ? 'drafting' : 'completed')}
                        className="h-10 px-4 royal-button text-[10px]"
                      >
                        تغيير الحالة
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
