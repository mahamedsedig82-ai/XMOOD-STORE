
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, getDocs, limit, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Search, Star, Loader2, Zap, UserPlus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function AdminMiddlemanManagement() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingMiddleman, setEditingMiddleman] = useState<any>(null);

  const middlemenQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "in", ["middleman", "owner"]), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: middlemen, loading } = useCollection(middlemenQuery);

  const handleUpdateMiddleman = async () => {
    if (!editingMiddleman || !db) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "users", editingMiddleman.id), {
        middlemanInfo: editingMiddleman.middlemanInfo || { services: [], isAvailable: true },
        label: editingMiddleman.role === 'owner' ? 'المالك السيادي' : 'وسيط معتمد'
      });
      setEditingMiddleman(null);
      toast({ title: "تم تحديث البيانات", description: "تم تحديث مهام الوسيط بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث البيانات." });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleService = (service: string) => {
    const currentServices = editingMiddleman.middlemanInfo?.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s: string) => s !== service)
      : [...currentServices, service];
    
    setEditingMiddleman({
      ...editingMiddleman,
      middlemanInfo: {
        ...(editingMiddleman.middlemanInfo || {}),
        services: newServices
      }
    });
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">إدارة شؤون الوسطاء</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Elite Escrow & Logistics Management</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        <Card className="luxury-card border-none bg-zinc-950/60 overflow-hidden">
          <CardHeader className="p-10 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-4">
              <ShieldCheck className="text-primary" /> قائمة النخبة المعتمدة
            </CardTitle>
            <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black">{middlemen?.length || 0} ACTIVE AGENTS</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-right py-6 pr-10 font-black text-[9px] uppercase text-zinc-500">الوسيط</TableHead>
                  <TableHead className="text-right font-black text-[9px] uppercase text-zinc-500">المهام الموكلة</TableHead>
                  <TableHead className="text-right font-black text-[9px] uppercase text-zinc-500">الحالة</TableHead>
                  <TableHead className="text-center font-black text-[9px] uppercase text-zinc-500">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : middlemen?.map((m: any) => (
                  <TableRow key={m.id} className="hover:bg-primary/5 border-b border-white/5 transition-all">
                    <TableCell className="py-6 pr-10">
                      <div className="flex items-center gap-4">
                        <img src={m.photoURL || `https://picsum.photos/seed/${m.id}/100/100`} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                        <div>
                          <p className="font-bold text-white">{m.displayName}</p>
                          <p className="text-[9px] text-zinc-500 uppercase">{m.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {m.middlemanInfo?.services?.map((s: string) => (
                          <Badge key={s} className="bg-primary/10 text-primary border-primary/20 text-[7px] px-2 py-0.5 uppercase">
                            {s === 'escrow' ? 'الوساطة' : s === 'charging' ? 'شحن المحفظة' : s}
                          </Badge>
                        ))}
                        {(!m.middlemanInfo?.services || m.middlemanInfo.services.length === 0) && <span className="text-[10px] text-zinc-700">لم يتم تحديد مهام</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${m.middlemanInfo?.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className="text-[10px] font-bold text-zinc-400">{m.middlemanInfo?.isAvailable ? 'متاح للعمل' : 'غير متصل'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Button onClick={() => setEditingMiddleman(m)} variant="ghost" size="sm" className="h-10 px-6 rounded-xl border border-white/5 text-primary hover:bg-primary/10">تعديل المهام</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingMiddleman} onOpenChange={() => setEditingMiddleman(null)}>
         <DialogContent className="bg-zinc-950 border border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-3xl font-headline font-bold gold-text flex items-center gap-4">
                  <Zap size={28} /> تكليف مهام النخبة
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-8">
               <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <h4 className="font-bold text-lg">حالة الاتصال</h4>
                    <p className="text-xs text-zinc-500">تظهر للعملاء في صفحة الوساطة العامة.</p>
                  </div>
                  <Switch 
                    checked={editingMiddleman?.middlemanInfo?.isAvailable} 
                    onCheckedChange={(val) => setEditingMiddleman({...editingMiddleman, middlemanInfo: {...(editingMiddleman.middlemanInfo || {}), isAvailable: val}})}
                  />
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-primary uppercase pr-2">الخدمات المصرح بها</h4>
                  <div className="grid grid-cols-1 gap-4">
                     {[
                       { id: 'escrow', label: 'الوساطة في صفقات المجتمع', desc: 'تأمين الصفقات بين البائع والمشتري' },
                       { id: 'charging', label: 'شحن رصيد المحفظة للعملاء', desc: 'استقبال المبالغ وتحويل الرصيد سيادياً' }
                     ].map((service) => (
                       <div key={service.id} className="flex items-start gap-4 p-4 bg-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-800 transition-all" onClick={() => toggleService(service.id)}>
                          <Checkbox checked={editingMiddleman?.middlemanInfo?.services?.includes(service.id)} className="mt-1" />
                          <div>
                             <p className="font-bold text-sm">{service.label}</p>
                             <p className="text-[10px] text-zinc-500">{service.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase pr-3">ساعات العمل / ملاحظات</label>
                  <Input 
                    value={editingMiddleman?.middlemanInfo?.workHours || ""} 
                    onChange={e => setEditingMiddleman({...editingMiddleman, middlemanInfo: {...(editingMiddleman.middlemanInfo || {}), workHours: e.target.value}})}
                    placeholder="مثال: متاح من 4 مساءً حتى 11 مساءً" 
                    className="h-12 bg-zinc-900 border-none rounded-xl px-4" 
                  />
               </div>
            </div>
            <DialogFooter className="mt-10">
               <Button onClick={handleUpdateMiddleman} disabled={isProcessing} className="royal-button w-full h-16 text-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "حفظ التكليفات الجديدة"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
