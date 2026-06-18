"use client";

import { useState, useMemo, useRef } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Zap, Loader2, Upload, DollarSign, UserCheck, ShieldCheck, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";

export default function AdminOtherServices() {
  const { profile } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
          const MAX_WIDTH = 600;
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
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "يرجى إكمال البيانات" });
      return;
    }
    setIsProcessing(true);
    const data = { 
      ...form, 
      price: Number(form.price), 
      agentId: profile?.uid || "", 
      updatedAt: serverTimestamp() 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "other_services", editingId), data);
        toast({ title: "تم تحديث الخدمة" });
      } else {
        await addDoc(collection(db, "other_services"), { ...data, createdAt: new Date().toISOString() });
        toast({ title: "تم إضافة الخدمة بنجاح" });
      }
      setIsOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في العملية" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه الخدمة نهائياً؟")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "other_services", id));
      toast({ title: "تم الحذف بنجاح" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", agentName: profile?.displayName || "", whatsapp: profile?.phoneNumber || "", imageUrl: "", type: "تقني", description: "", price: "", isAvailable: true });
    setEditingId(null);
  };

  const startEdit = (s: any) => {
    setForm({ ...s, price: s.price.toString() });
    setEditingId(s.id); 
    setIsOpen(true);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-card/60 p-8 rounded-[2.5rem] border shadow-xl">
        <div>
           <h1 className="text-4xl font-headline font-black gold-text">إدارة سوق الخدمات</h1>
           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Professional Solutions Manager</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-lg shadow-xl"><Plus size={24} className="ml-3" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-none rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <DialogHeader><DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><Briefcase size={28} /> {editingId ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}</DialogTitle></DialogHeader>
            <div className="space-y-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-3">اسم الخدمة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="تصميم، شحن، برمجة..." /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-3">السعر (USD)</label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-primary uppercase pr-3">صورة الخدمة</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-32 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover" alt="" /> : <div className="text-center"><Upload className="text-primary mx-auto mb-2" /><p className="text-[10px] font-black opacity-30">رفع من الاستوديو</p></div>}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-3">وصف الخدمة</label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="شرح مفصل للخدمة المقدمة..." /></div>
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-16 text-xl shadow-xl">{isProcessing ? <Loader2 className="animate-spin" /> : <><Zap size={20} className="ml-2" /> حفظ وإطلاق الخدمة</>}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={60} /></div>
        ) : services?.length === 0 ? (
          <div className="col-span-full py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
             <Briefcase size={100} className="text-muted-foreground mb-6" />
             <p className="text-xl font-black uppercase tracking-widest">لا توجد خدمات مسجلة حالياً</p>
          </div>
        ) : services?.map((s: any) => (
          <Card key={s.id} className="luxury-card border-none flex flex-col group h-full shadow-lg">
             <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={s.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <Badge className="absolute top-4 right-4 bg-primary text-black font-black uppercase text-[8px] px-4 py-1 rounded-full">{s.type}</Badge>
             </div>
             <CardContent className="p-8 flex-1 flex flex-col">
                <h3 className="font-black text-2xl mb-4 line-clamp-1 group-hover:gold-text transition-colors">{s.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6 h-14 overflow-hidden">{s.description}</p>
                <div className="mt-auto pt-6 border-t flex justify-between items-center">
                   <span className="font-black text-2xl text-primary">{formatUSD(s.price)}</span>
                   <span className="text-[8px] font-black text-zinc-500 uppercase">{s.agentName}</span>
                </div>
             </CardContent>
             <div className="p-5 bg-muted/30 border-t flex gap-4 mt-auto">
                <Button onClick={() => startEdit(s)} variant="outline" className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm"><Edit2 size={16} /> تعديل</Button>
                <Button onClick={() => handleDelete(s.id)} disabled={isProcessing} variant="destructive" className="w-12 h-12 rounded-xl p-0 shadow-xl shadow-red-500/10">
                   {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={20} />}
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}