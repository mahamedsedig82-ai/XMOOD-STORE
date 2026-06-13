
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Zap, Loader2, Save, Image as ImageIcon, Smartphone, Eye, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminOtherServices() {
  const { profile } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    agentName: profile?.displayName || "",
    whatsapp: profile?.phoneNumber || "",
    imageUrl: "",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.whatsapp || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم، السعر، ورقم الواتساب حقول إجبارية." });
      return;
    }
    setIsProcessing(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        agentId: profile?.uid || "",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "other_services", editingId), data);
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addDoc(collection(db, "other_services"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم إضافة الخدمة ونشرها" });
      }
      setIsOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", agentName: profile?.displayName || "", whatsapp: profile?.phoneNumber || "", imageUrl: "", type: "تقني", description: "", price: "", isAvailable: true });
    setEditingId(null);
  };

  const startEdit = (s: any) => {
    setForm({
      name: s.name,
      agentName: s.agentName,
      whatsapp: s.whatsapp,
      imageUrl: s.imageUrl || "",
      type: s.type,
      description: s.description,
      price: s.price.toString(),
      isAvailable: s.isAvailable
    });
    setEditingId(s.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الخدمة نهائياً من السوق؟")) return;
    try {
      await deleteDoc(doc(db, "other_services", id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <div className="space-y-12" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-zinc-950 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">إدارة سوق الخدمات</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Elite Managed Services Marketplace Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-lg shadow-primary/20"><Plus size={24} className="ml-3" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-primary/20 rounded-[3rem] max-w-4xl p-12 max-h-[90vh] overflow-y-auto custom-scrollbar text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold gold-text flex items-center gap-4">
                <Zap className="text-primary" size={32} /> {editingId ? 'تعديل بيانات الخدمة' : 'إنشاء خدمة احترافية'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest">اسم الخدمة</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest">التصنيف</label>
                <Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest">السعر (USD)</label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-black text-primary text-xl" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest flex items-center gap-2"><Smartphone size={12}/> واتساب التواصل</label>
                <Input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+966..." className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold text-left" />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4">
                 <label className="text-[10px] font-black text-zinc-500 uppercase pr-4 tracking-widest">إدارة صور الخدمة</label>
                 <Tabs defaultValue="url" className="w-full">
                    <TabsList className="bg-zinc-900 p-1 rounded-xl mb-4">
                       <TabsTrigger value="url" className="flex-1 gap-2"><LinkIcon size={14}/> رابط خارجي</TabsTrigger>
                       <TabsTrigger value="upload" className="flex-1 gap-2"><Upload size={14}/> رفع من الجهاز</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                       <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="h-14 bg-zinc-900 border-none rounded-xl px-6" />
                    </TabsContent>
                    <TabsContent value="upload">
                       <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-14 bg-zinc-900 border-none pt-4" />
                    </TabsContent>
                 </Tabs>
                 {form.imageUrl && (
                   <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-primary/20 shadow-2xl">
                      <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute top-4 left-4 bg-black/60 px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">Image Preview</div>
                   </div>
                 )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 pr-4 tracking-widest">وصف تفصيلي</label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-3xl bg-zinc-900 border-none min-h-[150px] p-6 font-bold leading-relaxed" />
              </div>
            </div>
            <DialogFooter className="mt-12">
              <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-18 text-xl">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث وحفظ التغييرات" : "نشر الخدمة في السوق"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="luxury-card border-none overflow-hidden shadow-2xl bg-zinc-950/40">
        <Table>
          <TableHeader className="bg-white/5 border-b border-white/5">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right py-8 pr-12 font-black text-[10px] uppercase tracking-widest text-zinc-500">الخدمة والناشر</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-zinc-500">القيمة</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-zinc-500">الواتساب</TableHead>
              <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-zinc-500">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
            ) : services?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-40 text-muted-foreground font-bold uppercase tracking-widest">No Services Found</TableCell></TableRow>
            ) : services?.map((s: any) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                <TableCell className="py-8 pr-12">
                   <div className="flex items-center gap-6">
                      <img src={s.imageUrl || "https://picsum.photos/seed/service/200/200"} className="w-16 h-16 rounded-2xl object-cover border border-white/5 shadow-2xl" alt="" />
                      <div>
                         <p className="font-bold text-xl text-white group-hover:gold-text">{s.name}</p>
                         <p className="text-[10px] text-zinc-500 font-black uppercase mt-1">بواسطة: {s.agentName}</p>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="font-black text-2xl text-primary tracking-tighter">${s.price}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-zinc-400">{s.whatsapp}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-4">
                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-primary hover:bg-primary/10 border border-white/5" onClick={() => startEdit(s)}><Edit2 size={20} /></Button>
                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-500/10 border border-white/5" onClick={() => handleDelete(s.id)}><Trash2 size={20} /></Button>
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
