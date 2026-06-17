"use client";

import { useState, useRef } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Upload, Star, Zap, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminShippingManager() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "", description: "", extraFee: "0", deliveryTime: "", badge: "", imageUrl: "", isActive: true
  });

  const shippingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "shipping_methods"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: methods, loading } = useCollection(shippingQuery);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          canvas.width = MAX_WIDTH;
          canvas.height = (img.height / img.width) * MAX_WIDTH;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
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
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !db) return;
    setIsProcessing(true);
    try {
      const data = { 
        ...form, 
        extraFee: Number(form.extraFee), 
        updatedAt: serverTimestamp() 
      };
      if (editingId) {
        await updateDoc(doc(db, "shipping_methods", editingId), data);
        toast({ title: "تم تحديث طريقة الشحن" });
      } else {
        await addDoc(collection(db, "shipping_methods"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم إضافة طريقة شحن جديدة" });
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", extraFee: "0", deliveryTime: "", badge: "", imageUrl: "", isActive: true });
    setEditingId(null);
  };

  const startEdit = (m: any) => {
    setForm({ 
      name: m.name, 
      description: m.description || "", 
      extraFee: m.extraFee.toString(), 
      deliveryTime: m.deliveryTime || "", 
      badge: m.badge || "", 
      imageUrl: m.imageUrl || "",
      isActive: m.isActive ?? true 
    });
    setEditingId(m.id);
    setIsOpen(true);
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-10">
        <div>
          <h1 className="text-4xl font-headline font-black gold-text">إدارة بروتوكولات الشحن</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Dynamic Logistics & Delivery Systems</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-10"><Plus size={24} className="ml-3" /> إضافة بروتوكول جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3rem] p-10 max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black gold-text flex items-center gap-4"><Truck size={28} /> {editingId ? 'تعديل بروتوكول الشحن' : 'تأسيس مسار شحن جديد'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3">اسم الوسيلة</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-bold" placeholder="مثال: الشحن الفوري" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3">رسوم إضافية (USD)</label>
                  <Input type="number" value={form.extraFee} onChange={e => setForm({...form, extraFee: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-bold" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3">مدة التسليم المتوقعة</label>
                  <Input value={form.deliveryTime} onChange={e => setForm({...form, deliveryTime: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-bold" placeholder="مثال: 5-15 دقيقة" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3">شارة مميزة (Badge)</label>
                  <Input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none px-6 font-bold" placeholder="الأكثر طلباً" />
               </div>
               <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3">وصف المسار</label>
                  <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-2xl bg-muted/40 border-none p-6 font-medium" />
               </div>
               <div className="col-span-full space-y-4">
                  <label className="text-[10px] font-black uppercase text-muted-foreground pr-3">صورة توضيحية</label>
                  <div onClick={() => fileInputRef.current?.click()} className="h-24 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover" alt="" /> : <Upload size={24} className="text-primary" />}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>
               </div>
               <div className="col-span-full flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="font-bold text-sm">تفعيل هذا المسار حالياً</span>
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({...form, isActive: v})} />
               </div>
            </div>
            <DialogFooter className="mt-10">
               <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-16 text-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث المسار السيادي" : "تأكيد وإطلاق المسار"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></div>
        ) : methods?.length === 0 ? (
          <Card className="col-span-full luxury-card border-dashed p-40 text-center opacity-30">
            <Truck size={100} className="mx-auto mb-8" />
            <p className="text-2xl font-black uppercase tracking-widest">لا توجد طرق شحن مسجلة</p>
          </Card>
        ) : (
          methods?.map((m: any) => (
            <Card key={m.id} className={`luxury-card p-8 border-none group ${!m.isActive ? 'opacity-50' : ''}`}>
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg">
                     {m.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover rounded-2xl" alt="" /> : <Truck size={32} />}
                  </div>
                  <div className="flex gap-2">
                     <Button size="icon" variant="ghost" onClick={() => startEdit(m)} className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"><Edit2 size={18} /></Button>
                     <Button size="icon" variant="ghost" onClick={() => confirm("حذف مسار الشحن؟") && deleteDoc(doc(db, "shipping_methods", m.id))} className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500"><Trash2 size={18} /></Button>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black">{m.name}</h3>
                    {m.badge && <Badge className="bg-primary text-black font-black text-[7px] uppercase">{m.badge}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{m.description}</p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">الرسوم</span>
                        <span className="font-black text-primary text-lg">+{m.extraFee}$</span>
                     </div>
                     <div className="flex flex-col text-left">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">المدة</span>
                        <span className="font-black text-foreground text-sm flex items-center gap-1 justify-end"><Clock size={12}/> {m.deliveryTime}</span>
                     </div>
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
