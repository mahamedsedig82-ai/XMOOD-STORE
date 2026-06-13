
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Zap, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function AdminOtherServices() {
  const { profile } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    agentName: "",
    type: "تقني",
    description: "",
    price: "",
    isAvailable: true
  });

  const servicesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "other_services"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: services, loading } = useCollection(servicesQuery);

  const handleSubmit = async () => {
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }
    setIsProcessing(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        agentId: profile?.uid || "",
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, "other_services", editingId), data);
      } else {
        await addDoc(collection(db, "other_services"), data);
      }
      setIsOpen(false);
      setEditingId(null);
      setForm({ name: "", agentName: "", type: "تقني", description: "", price: "", isAvailable: true });
      toast({ title: "تم الحفظ بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الخدمة؟")) return;
    try {
      await deleteDoc(doc(db, "other_services", id));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <div className="space-y-8 p-6" dir="rtl">
      <header className="flex justify-between items-center bg-card p-8 rounded-3xl border">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">إدارة الخدمات الأخرى</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Managed Extra Services</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="royal-button h-14"><Plus className="ml-2" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gold-text">بيانات الخدمة</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">اسم الخدمة</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">اسم الوكيل</label>
                <Input value={form.agentName} onChange={e => setForm({...form, agentName: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">السعر (USD)</label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">التصنيف</label>
                <Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">وصف الخدمة</label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-xl min-h-[100px]" />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-14">
                {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد النشر"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="luxury-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الخدمة</TableHead>
              <TableHead className="text-right">الوكيل</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
            ) : services?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-bold">{s.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.agentName}</TableCell>
                <TableCell className="font-black text-primary">${s.price}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
