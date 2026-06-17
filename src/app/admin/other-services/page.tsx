
"use client";

import { useState, useMemo, useRef } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Zap, Loader2, Save, Image as ImageIcon, Smartphone, Upload, Link as LinkIcon, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSDG, formatUSD } from "@/lib/currency";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminOtherServices() {
  const { profile } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const [form, setForm] = useState({
    name: "", agentName: profile?.displayName || "", whatsapp: profile?.phoneNumber || "", imageUrl: "", type: "تقني", description: "", price: "", isAvailable: true
  });

  const servicesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "other_services"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: allServices, loading } = useCollection(servicesQuery);

  const services = useMemo(() => {
    if (!allServices || !profile) return [];
    // الملاك والمدراء يرون كل شيء، الوكلاء يرون خدماتهم فقط
    if (['owner', 'admin', 'gm'].includes(profile.role)) return allServices;
    return allServices.filter((s: any) => s.agentId === profile.uid);
  }, [allServices, profile]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const b64 = await compressImage(file);
        setForm({ ...form, imageUrl: b64 });
        toast({ title: "تم تجهيز صورة الخدمة" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.whatsapp || !db) return;
    setIsProcessing(true);
    const data = { 
      ...form, 
      price: Number(form.price), 
      agentId: profile?.uid || "", 
      agentName: profile?.displayName || form.agentName, 
      updatedAt: serverTimestamp() 
    };

    if (editingId) {
      const serviceRef = doc(db, "other_services", editingId);
      updateDoc(serviceRef, data)
        .then(() => { 
          toast({ title: "تم التحديث بنجاح" }); 
          setIsOpen(false); 
          resetForm(); 
        })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: serviceRef.path, operation: 'update', requestResourceData: data }));
        })
        .finally(() => setIsProcessing(false));
    } else {
      addDoc(collection(db, "other_services"), { ...data, createdAt: serverTimestamp() })
        .then(() => { 
          toast({ title: "تم إضافة الخدمة ونشرها" }); 
          setIsOpen(false); 
          resetForm(); 
        })
        .catch(() => toast({ variant: "destructive", title: "خطأ", description: "فشل الإضافة، تأكد من حجم الصور." }))
        .finally(() => setIsProcessing(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!db || !confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) return;
    const serviceRef = doc(db, "other_services", id);
    deleteDoc(serviceRef)
      .then(() => {
        toast({ title: "تم حذف الخدمة من السوق" });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: serviceRef.path, operation: 'delete' }));
      });
  };

  const resetForm = () => {
    setForm({ name: "", agentName: profile?.displayName || "", whatsapp: profile?.phoneNumber || "", imageUrl: "", type: "تقني", description: "", price: "", isAvailable: true });
    setEditingId(null);
  };

  const startEdit = (s: any) => {
    setForm({ name: s.name, agentName: s.agentName, whatsapp: s.whatsapp, imageUrl: s.imageUrl || "", type: s.type, description: s.description, price: s.price.toString(), isAvailable: s.isAvailable });
    setEditingId(s.id); 
    setIsOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-10 rounded-[2.5rem] border shadow-sm">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-black gold-text">إدارة سوق الخدمات</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2">Managed Services Inventory Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-14 px-8"><Plus size={20} className="ml-2" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/20 rounded-[2rem] max-w-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gold-text flex items-center gap-3"><Zap className="text-primary" size={24} /> {editingId ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase pr-2">اسم الخدمة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl bg-muted/40 border-none font-bold px-4" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase pr-2">التصنيف</label><Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="h-12 rounded-xl bg-muted/40 border-none font-bold px-4" /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase pr-2 flex justify-between">
                  <span>السعر (USD)</span>
                  <span className="text-primary">{formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-12 rounded-xl bg-muted/40 border-none pr-10 font-bold px-4" />
                </div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase pr-2">واتساب التواصل</label><Input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+966..." className="h-12 rounded-xl bg-muted/40 border-none font-bold text-left px-4" /></div>
              <div className="col-span-full space-y-3">
                <label className="text-[10px] font-black uppercase pr-2">صورة الخدمة</label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="bg-muted p-1 rounded-xl mb-3">
                    <TabsTrigger value="upload" className="flex-1 gap-2"><Upload size={12}/> رفع من المعرض</TabsTrigger>
                    <TabsTrigger value="url" className="flex-1 gap-2"><LinkIcon size={12}/> رابط</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div onClick={() => fileInputRef.current?.click()} className="h-12 bg-muted/20 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all">
                      <span className="text-[10px] font-bold text-primary flex items-center gap-2"><Upload size={14} /> اختر ملف صورة</span>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                  </TabsContent>
                  <TabsContent value="url">
                    <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="h-12 bg-muted/40 border-none rounded-xl px-4" />
                  </TabsContent>
                </Tabs>
              </div>
              {form.imageUrl && <div className="col-span-full rounded-xl overflow-hidden aspect-video border border-primary/10 shadow-lg"><img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" /></div>}
              <div className="col-span-full space-y-2"><label className="text-[10px] font-black uppercase pr-2">وصف الخدمة</label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-xl bg-muted/40 border-none min-h-[120px] p-4 text-sm font-medium" /></div>
            </div>
            <DialogFooter className="mt-8"><Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-14">{isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث الخدمة السيادية" : "نشر الخدمة في السوق"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
        <ScrollArea className="max-h-[800px] overflow-x-auto responsive-table">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-20">
              <TableRow>
                <TableHead className="text-right py-6 pr-8 font-black text-[10px] uppercase">الخدمة والناشر</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">القيمة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">الواتساب</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase">العمليات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
              ) : services?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-40 text-muted-foreground font-black uppercase tracking-widest opacity-30">لا توجد خدمات مسجلة</TableCell></TableRow>
              ) : services?.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-primary/5 transition-all border-b border-border/30 group">
                  <TableCell className="py-6 pr-8" data-label="الخدمة">
                    <div className="flex items-center gap-4">
                      <img src={s.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-12 h-12 rounded-xl object-cover border shadow-sm shrink-0" alt="" />
                      <div className="max-w-[200px] md:max-w-[300px]">
                        <p className="font-black text-sm truncate group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">بواسطة: {s.agentName || "وكيل معتمد"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell data-label="السعر" className="font-black text-lg text-primary tracking-tighter">{formatUSD(s.price)}</TableCell>
                  <TableCell data-label="واتساب" className="font-mono text-xs text-muted-foreground font-bold">{s.whatsapp}</TableCell>
                  <TableCell className="text-center" data-label="التحكم">
                    <div className="flex justify-center gap-3">
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 border border-primary/10" onClick={() => startEdit(s)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50 border border-red-100" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-center gap-6 animate-fade-up">
         <AlertCircle className="text-blue-500 shrink-0" size={32} />
         <p className="text-sm text-blue-200/60 leading-relaxed font-medium">
            <b>نصيحة إدارية:</b> إذا واجهت مشكلة في حذف خدمة معينة، تأكد أنك تملك صلاحية "المالك" أو "المدير". الخدمات التي تحتوي على صور ضخمة قد تستغرق ثوانٍ إضافية للمعالجة؛ لا تقم بتحديث الصفحة أثناء الحذف.
         </p>
      </div>
    </div>
  );
}
