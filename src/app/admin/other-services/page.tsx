"use client";

import { useState, useMemo, useRef } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Zap, Loader2, Save, Image as ImageIcon, Smartphone, Upload, Link as LinkIcon, DollarSign, UserCheck } from "lucide-react";
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
    if (['owner', 'admin', 'gm'].includes(profile.role)) return allServices;
    return allServices.filter((s: any) => s.agentId === profile.uid);
  }, [allServices, profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        setForm({ ...form, imageUrl: event.target?.result as string });
        setIsProcessing(false);
        toast({ title: "تم تجهيز صورة الخدمة" });
      };
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
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: serviceRef.path, operation: 'update' }));
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

  const handleDelete = (id: string) => {
    if (!db || !confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) return;
    const serviceRef = doc(db, "other_services", id);
    setIsProcessing(true);
    deleteDoc(serviceRef)
      .then(() => {
        toast({ title: "تم حذف الخدمة بنجاح" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: serviceRef.path, operation: 'delete' }));
      })
      .finally(() => setIsProcessing(false));
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
    <div className="space-y-12 animate-fade-in pb-32" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card/60 backdrop-blur-xl p-8 rounded-[2.5rem] border shadow-sm">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black gold-text leading-tight">إدارة سوق الخدمات</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2 italic opacity-60">Managed Services Inventory Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-lg shadow-xl shadow-primary/20"><Plus size={24} className="ml-3" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-none rounded-[3rem] max-w-2xl p-10 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black gold-text flex items-center gap-4"><Zap className="text-primary" size={28} /> {editingId ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3"><label className="text-[10px] font-black uppercase text-primary pr-4">اسم الخدمة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14" /></div>
                 <div className="space-y-3"><label className="text-[10px] font-black uppercase text-primary pr-4">التصنيف</label><Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="h-14" /></div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-primary pr-4 flex justify-between"><span>السعر (USD)</span><span className="text-zinc-500">{formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span></label>
                    <div className="relative"><DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={20} /><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-14 pr-12 text-xl text-primary font-black" /></div>
                 </div>
                 <div className="space-y-3"><label className="text-[10px] font-black uppercase text-primary pr-4">واتساب التواصل</label><Input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+966..." className="h-14 font-mono" /></div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-primary pr-4">صورة الخدمة</label>
                <div onClick={() => fileInputRef.current?.click()} className="h-24 bg-muted/40 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden group">
                  {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover group-hover:scale-105 transition-transform" alt="Preview" /> : <div className="flex flex-col items-center gap-2"><Upload size={24} className="text-primary" /><span className="text-[9px] font-bold uppercase opacity-60">رفع صورة احترافية</span></div>}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="space-y-3"><label className="text-[10px] font-black uppercase text-primary pr-4">وصف الخدمة الكامل</label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="min-h-[150px]" /></div>
            </div>
            <DialogFooter className="mt-12"><Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-18 text-xl">{isProcessing ? <Loader2 className="animate-spin" /> : editingId ? "تحديث الخدمة السيادية" : "نشر الخدمة في السوق"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center flex flex-col items-center gap-6"><Loader2 className="animate-spin text-primary" size={80} /><p className="font-black text-zinc-500 uppercase tracking-[0.4em] text-[10px]">Loading Service Assets...</p></div>
        ) : services?.length === 0 ? (
          <div className="col-span-full py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center justify-center"><Zap size={100} className="mb-6 text-muted-foreground" /><p className="font-black text-2xl uppercase tracking-widest">المستودع فارغ حالياً</p></div>
        ) : services?.map((s: any) => (
          <Card key={s.id} className="luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl flex flex-col group overflow-hidden h-full border-2 border-transparent hover:border-primary/20">
             <div className="relative aspect-video overflow-hidden">
                <img src={s.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                <Badge className="absolute top-4 right-4 bg-primary text-black font-black text-[9px] uppercase px-5 py-1.5 rounded-full shadow-2xl">{s.type}</Badge>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
             </div>
             <CardContent className="p-8 flex-1 flex flex-col space-y-6">
                <div className="space-y-2">
                   <h3 className="font-black text-2xl line-clamp-1 group-hover:gold-text transition-colors" title={s.name}>{s.name}</h3>
                   <p className="text-[10px] text-muted-foreground flex items-center gap-2 font-bold uppercase tracking-widest"><UserCheck size={14} className="text-primary" /> {s.agentName || "وكيل معتمد"}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-medium h-15 opacity-80">{s.description}</p>
                <div className="flex justify-between items-center pt-6 border-t border-border/50 mt-auto">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-500 uppercase mb-1">صافي القيمة</span>
                      <span className="font-black text-3xl text-primary tracking-tighter leading-none">{formatUSD(s.price)}</span>
                   </div>
                   <div className="text-left">
                      <span className="text-[8px] font-black text-zinc-500 uppercase mb-1">قناة التواصل</span>
                      <p className="font-mono text-[10px] font-bold opacity-60">{s.whatsapp}</p>
                   </div>
                </div>
             </CardContent>
             
             {/* Admin Actions - Strictly Isolated in Bottom Bar */}
             <div className="p-6 bg-muted/30 border-t flex gap-4 mt-auto">
                <Button onClick={() => startEdit(s)} variant="outline" className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase gap-3 border-primary/20 text-primary hover:bg-primary/5 transition-all"><Edit2 size={18} /> تعديل البيانات</Button>
                <Button onClick={() => handleDelete(s.id)} disabled={isProcessing} variant="destructive" className="w-14 h-14 rounded-2xl p-0 shadow-xl shadow-red-500/10 hover:scale-105 transition-transform">{isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 size={24} />}</Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
