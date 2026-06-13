
"use client";

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, User, ExternalLink, ShieldCheck, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function DesignManagementPRO() {
  const { profile } = useUser();
  const db = useFirestore();
  const [designerWhatsapp, setDesignerWhatsapp] = useState("");
  
  const requestsQuery = useMemoFirebase(() => query(collection(db, "design_requests"), orderBy("createdAt", "desc")), [db]);
  const { data: requests, loading } = useCollection(requestsQuery);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "design_requests", id), { 
        status, 
        assignedTo: profile?.uid,
        designerPhone: designerWhatsapp || profile?.phoneNumber || ""
      });
      toast({ title: "تم التحديث", description: `الحالة الجديدة: ${status}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل التحديث." });
    }
  };

  const getWhatsappLink = (req: any) => {
    const text = `مرحباً، أنا المصمم من متجر XMOOD. بخصوص طلبك لخدمة: ${req.designType}.
الوصف: ${req.description}
الألوان: ${req.colors}
المقاسات: ${req.dimensions}
رقم الطلب: ${req.id.substring(0,8)}`;
    
    return `https://wa.me/${req.customerPhone || ""}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white gold-text">إدارة تدفق التصاميم</h1>
          <p className="text-zinc-500">متابعة طلبات العملاء وتوجيهها للمصممين.</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary uppercase pr-2">رقم واتساب المصمم (للتواصل)</label>
              <Input 
                value={designerWhatsapp} 
                onChange={e => setDesignerWhatsapp(e.target.value)} 
                placeholder="أدخل رقمك هنا..." 
                className="h-12 bg-white/5 border-primary/20 w-64"
              />
           </div>
        </div>
      </header>

      <Card className="luxury-card overflow-hidden border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-6 font-bold text-zinc-500 uppercase text-[10px]">العميل / التواصل</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 uppercase text-[10px]">نوع الخدمة</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 uppercase text-[10px]">التفاصيل</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 uppercase text-[10px]">الحالة</TableHead>
                <TableHead className="text-center font-bold text-zinc-500 uppercase text-[10px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20">جاري تحميل الطلبات...</TableCell></TableRow>
              ) : requests?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-zinc-600">لا توجد طلبات حالياً</TableRow>
              ) : requests?.map((req: any) => (
                <TableRow key={req.id} className="hover:bg-primary/5 transition-colors border-b border-white/5">
                  <TableCell className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{req.customerName}</span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Phone size={10} /> {req.customerPhone || 'بدون رقم'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">{req.designType}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-zinc-400 line-clamp-1">{req.description}</p>
                    <span className="text-[9px] text-zinc-600">الألوان: {req.colors}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full ${
                      req.status === 'completed' ? 'text-green-500 border-green-500/20' : 
                      req.status === 'pending' ? 'text-amber-500 border-amber-500/20' : 'text-blue-500 border-blue-500/20'
                    }`}>
                      {req.status === 'pending' ? 'قيد الانتظار' : req.status === 'completed' ? 'مكتمل' : 'جاري التنفيذ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      {req.customerPhone && (
                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-green-500 hover:bg-green-500/10">
                          <a href={getWhatsappLink(req)} target="_blank" rel="noopener noreferrer">
                            <MessageSquare size={18} />
                          </a>
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleUpdateStatus(req.id, req.status === 'pending' ? 'drafting' : 'completed')}
                        className="h-10 px-4 royal-button text-[10px]"
                      >
                        {req.status === 'pending' ? 'استلام الطلب' : 'إتمام الطلب'}
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
