"use client";

import { useState, useRef } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Plus, Trash2, Edit2, Loader2, Upload, ExternalLink, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminAdsManager() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "", link: "", imageUrl: "", isActive: true, position: "hero"
  });

  const adsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "banners"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: ads, loading } = useCollection(adsQuery);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
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
        toast({ title: "تم تجهيز الإعلان بنجاح" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.imageUrl || !db) {
      toast({ variant: "destructive", title: "يرجى رفع صورة الإعلان" });
      return;
    }
    setIsProcessing(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "banners", editingId), data);
        toast({ title: "تم تحديث الإعلان بنجاح" });
      } else {
        await addDoc(collection(db, "banners"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم نشر الإعلان الجديد" });
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", link: "", imageUrl: "", isActive: true, position: "hero" });
    setEditingId(null);
  };

  const startEdit = (ad: any) => {
    setForm({ title: ad.title || "", link: ad.link || "", imageUrl: ad.imageUrl || "", isActive: ad.isActive ?? true, position: ad.position || "hero" });
    setEditingId(ad.id);
    setIsOpen(true);
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b pb-10">
        <div>
          <h1 className="text-4xl font-headline font-black gold-text">إدارة الإعلانات والبنرات</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Visual Campaigns & Promo Logistics</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-base"><Plus size={24} className="ml-3" /> إضافة بنر جديد</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3rem] p-10 max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><Megaphone size={28} /> {editingId ? 'تعديل الإعلان' : 'إرساء حملة إعلانية'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">عنوان الحملة (اختياري)</label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">رابط التوجيه (Target Link)</label>
                  <Input value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="h-14 rounded-2xl bg-muted/40 border-none font-mono text-xs" placeholder="/store or https://..." />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-primary pr-3 tracking-widest">الصورة الإعلانية (1920x600 ينصح به)</label>
                  <div onClick={() => fileInputRef.current?.click()} className="h-56 bg-muted/40 border-2 border-dashed border-primary/20 rounded-[2.5rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover" alt="" /> : <div className="text-center opacity-40"><Upload size={40} className="mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-widest">رفع البنر من الاستوديو</p></div>}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="font-bold text-sm">تفعيل الإعلان فوراً</span>
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({...form, isActive: v})} />
               </div>
            </div>
            <DialogFooter className="mt-12">
               <Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-18 text-xl">
                  {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث الحملة" : "إطلاق الحملة الإعلانية"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={60} /></div>
        ) : ads?.length === 0 ? (
          <Card className="col-span-full luxury-card border-dashed p-40 text-center opacity-30">
            <Megaphone size={100} className="mx-auto mb-8" />
            <p className="text-2xl font-black uppercase tracking-widest">لا توجد حملات نشطة حالياً</p>
          </Card>
        ) : (
          ads?.map((ad: any) => (
            <Card key={ad.id} className={`luxury-card p-6 border-none flex flex-col gap-6 group ${!ad.isActive ? 'opacity-50' : ''}`}>
               <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl">
                  <img src={ad.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="" />
                  <Badge className="absolute top-4 right-4 bg-primary text-black font-black text-[7px] uppercase tracking-widest shadow-xl">H-CAMPAIGN</Badge>
               </div>
               <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-xl font-black">{ad.title || "بدون عنوان"}</h3>
                    <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[200px] mt-1">{ad.link || "لا يوجد رابط"}</p>
                  </div>
                  <div className="flex gap-2">
                     <Button size="icon" variant="ghost" onClick={() => startEdit(ad)} className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"><Edit2 size={18} /></Button>
                     <Button size="icon" variant="ghost" onClick={() => confirm("حذف هذا البنر نهائياً؟") && deleteDoc(doc(db, "banners", ad.id))} className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500"><Trash2 size={18} /></Button>
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}