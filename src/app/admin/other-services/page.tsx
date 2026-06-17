"use client";

import { useState, useMemo, useRef } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Zap, Loader2, Upload, DollarSign, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";
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

  const handleSubmit = () => {
    if (!form.name || !form.price || !db) return;
    setIsProcessing(true);
    const data = { 
      ...form, 
      price: Number(form.price), 
      agentId: profile?.uid || "", 
      updatedAt: serverTimestamp() 
    };

    if (editingId) {
      const serviceRef = doc(db, "other_services", editingId);
      updateDoc(serviceRef, data)
        .then(() => { toast({ title: "تم التحديث" }); setIsOpen(false); resetForm(); })
        .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: serviceRef.path, operation: 'update' })))
        .finally(() => setIsProcessing(false));
    } else {
      addDoc(collection(db, "other_services"), { ...data, createdAt: serverTimestamp() })
        .then(() => { toast({ title: "تم النشر" }); setIsOpen(false); resetForm(); })
        .finally(() => setIsProcessing(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!db || !confirm("حذف هذه الخدمة نهائياً؟")) return;
    setIsProcessing(true);
    deleteDoc(doc(db, "other_services", id))
      .then(() => toast({ title: "تم الحذف" }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `other_services/${id}`, operation: 'delete' })))
      .finally(() => setIsProcessing(false));
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
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-card/60 p-8 rounded-[2.5rem] border">
        <h1 className="text-4xl font-headline font-black gold-text">إدارة سوق الخدمات</h1>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="royal-button h-16 px-12 text-lg"><Plus size={24} className="ml-3" /> إضافة خدمة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-none rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-3xl font-black gold-text">{editingId ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}</DialogTitle></DialogHeader>
            <div className="space-y-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-3">اسم الخدمة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-3">السعر (USD)</label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              </div>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="وصف الخدمة..." />
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleSubmit} disabled={isProcessing} className="royal-button w-full h-16">{isProcessing ? <Loader2 className="animate-spin" /> : "حفظ الخدمة السيادية"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={60} /></div>
        ) : services?.map((s: any) => (
          <Card key={s.id} className="luxury-card border-none flex flex-col group h-full">
             <div className="relative aspect-video overflow-hidden">
                <img src={s.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <Badge className="absolute top-4 right-4 bg-primary text-black font-black uppercase text-[8px] px-4 py-1 rounded-full">{s.type}</Badge>
             </div>
             <CardContent className="p-8 flex-1">
                <h3 className="font-black text-2xl mb-4 line-clamp-1 group-hover:gold-text transition-colors">{s.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6 h-10">{s.description}</p>
                <div className="flex justify-between items-center pt-6 border-t">
                   <span className="font-black text-2xl text-primary">{formatUSD(s.price)}</span>
                   <span className="text-[8px] font-black text-zinc-500 uppercase">{s.agentName}</span>
                </div>
             </CardContent>
             
             {/* ISOLATED ADMIN BAR - ALWAYS VISIBLE OUTSIDE CONTENT */}
             <div className="p-5 bg-muted/30 border-t flex gap-4 mt-auto">
                <Button onClick={() => startEdit(s)} variant="outline" className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase gap-2 border-primary/20 text-primary hover:bg-primary/5"><Edit2 size={16} /> تعديل</Button>
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
