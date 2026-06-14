"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Zap, Loader2, Save, Image as ImageIcon, Smartphone, Upload, Link as LinkIcon, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatSDG } from "@/lib/currency";

export default function AdminOtherServices() {
  const { profile } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

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
      if (file.size > 800000) {
        toast({
          variant: "destructive",
          title: "حجم الملف كبير",
          description: "يرجى اختيار صورة أصغر من 800 كيلوبايت لضمان استقرار النظام."
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.whatsapp || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم، السعر، ورقم الواتساب حقول إجبارية." });
      return;
    }
    setIsProcessing(true);
    const data = {
      ...form,
      price: Number(form.price),
      agentId: profile?.uid || "",
      updatedAt: serverTimestamp(),
    };

    if (editingId) {
      updateDoc(doc(db, "other_services", editingId), data)
        .then(() => {
          toast({ title: "تم التحديث بنجاح" });
          setIsOpen(false);
          resetForm();
        })
        .finally(() => setIsProcessing(false));
    } else {
      addDoc(collection(db, "other_services"), { ...data, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "تم إضافة الخدمة ونشرها" });
          setIsOpen(false);
          resetForm();
        })
        .finally(() => setIsProcessing(false));
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

  const handleDelete = (id: string) => {
    if (!confirm("هل تريد حذف هذه الخدمة نهائياً من السوق؟")) return;
    deleteDoc(doc(db, "other_services", id)).then(() => {
      toast({ title: "تم الحذف بنجاح" });
    });
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-10 rounded-[2rem] border shadow-sm">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold gold-text">إدارة سوق الخدمات</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2">Managed Services Inventory Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-14 px-8"><Plus size={20} className="ml-2" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/20 rounded-[2rem] max-w-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gold-text flex items-center gap-3">
                <Zap className="text-primary" size={24} /> {editingId ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground pr-2">اسم الخدمة</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl bg-background font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground pr-2">التصنيف</label>
                <Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="h-12 rounded-xl bg-background font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground pr-2 flex justify-between">
                   <span>السعر (USD)</span>
                   <span className="text-primary">يقابل: {formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span>
                </label>
                <div className="relative">
                   <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                   <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-12 rounded-xl bg-background pr-10 font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground pr-2"><Smartphone size={10} className="inline ml-1"/> واتساب التواصل</label>
                <Input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+966..." className="h-12 rounded-xl bg-background font-bold text-left" />
              </div>

              <div className="col-span-full space-y-3">
                 <label className="text-[10px] font-black text-muted-foreground uppercase pr-2">صورة الخدمة</label>
                 <Tabs defaultValue="url" className="w-full">
                    <TabsList className="bg-muted p-1 rounded-xl mb-3">
                       <TabsTrigger value="url" className="flex-1 gap-2"><LinkIcon size={12}/> رابط</TabsTrigger>
                       <TabsTrigger value="upload" className="flex-1 gap-2"><Upload size={12}/> رفع</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                       <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="h-12 bg-background rounded-xl" />
                    </TabsContent>
                    <TabsContent value="upload">
                       <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-12 bg-background rounded-xl pt-2.5 text-xs" />
                    </TabsContent>
                 </Tabs>
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground pr-2">وصف الخدمة</label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-xl bg-background min-h-[100px] p-4 text-sm" />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-14">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث الخدمة" : "نشر الخدمة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="luxury-card border-none bg-card shadow-sm overflow-hidden">
        <ScrollArea className="max-h-[600px] responsive-table">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right py-6 pr-8 font-black text-[10px] uppercase text-muted-foreground">الخدمة والناشر</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-muted-foreground">القيمة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-muted-foreground">الواتساب</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase text-muted-foreground">العمليات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : services?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-40 text-muted-foreground font-bold">لا توجد خدمات حالياً</TableCell></TableRow>
              ) : services?.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-primary/5 transition-all border-b border-border/50">
                  <TableCell className="py-6 pr-8" data-label="الخدمة">
                     <div className="flex items-center gap-4">
                        <img src={s.imageUrl || "https://picsum.photos/seed/service/100/100"} className="w-12 h-12 rounded-xl object-cover border shadow-sm" alt="" />
                        <div>
                           <p className="font-bold text-sm">{s.name}</p>
                           <p className="text-[9px] text-muted-foreground uppercase font-black">بواسطة: {s.agentName}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell data-label="السعر" className="font-black text-lg text-primary">{formatUSD(s.price)}</TableCell>
                  <TableCell data-label="واتساب" className="font-mono text-xs text-muted-foreground">{s.whatsapp}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-primary hover:bg-primary/10 border" onClick={() => startEdit(s)}><Edit2 size={14} /></Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 border" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
