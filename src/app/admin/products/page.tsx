"use client";

import { useState, useRef, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Box, Upload, DollarSign, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatSDG } from "@/lib/currency";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminProducts() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"));
  }, [db]);

  const { data: products, loading } = useCollection(productsQuery);

  const [form, setForm] = useState({
    name: "", price: "", category: "شحن ألعاب", stock: "0", minStock: "5", imageUrl: "", description: "", shippingCodes: "", status: 'active'
  });

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
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
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
        toast({ title: "تمت معالجة الصورة بنجاح" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }
    
    setIsProcessing(true);
    const codesList = form.shippingCodes.split('\n').filter(c => c.trim() !== "");
    const currentStock = codesList.length;
    
    const data = { 
      ...form, 
      price: Number(form.price), 
      stock: currentStock, 
      minStock: Number(form.minStock),
      status: currentStock > 0 ? 'active' : 'out_of_stock',
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      const productRef = doc(db, "products", editingId);
      updateDoc(productRef, data)
        .then(() => {
          toast({ title: "تم التحديث بنجاح" });
          setIsOpen(false);
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: productRef.path,
            operation: 'update',
            requestResourceData: data
          }));
        })
        .finally(() => setIsProcessing(false));
    } else {
      addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "تم النشر في المستودع" });
          setIsOpen(false);
          resetForm();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'products',
            operation: 'create',
            requestResourceData: data
          }));
        })
        .finally(() => setIsProcessing(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!id || !db) return;
    if (!window.confirm("🛑 حذف نهائي للباقة؟")) return;
    
    const docRef = doc(db, "products", id);
    deleteDoc(docRef)
      .then(() => toast({ title: "تم الحذف من المستودع" }))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "0", minStock: "5", imageUrl: "", description: "", shippingCodes: "", status: 'active' });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setForm({ 
      ...p, 
      price: p.price.toString(), 
      stock: (p.stock || 0).toString(), 
      minStock: (p.minStock || 5).toString(),
      shippingCodes: p.shippingCodes || ""
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    return products
      .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a: any, b: any) => {
        const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
        const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
  }, [products, searchTerm]);

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-2xl">
        <div>
          <h1 className="text-3xl md:text-5xl font-black gold-text">المستودع المركزي</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px]">Strategic Asset Inventory</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-14 md:h-18 px-10 md:px-12 royal-button shadow-2xl"><Plus className="ml-3" size={24} /> تأسيس باقة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-card border-none rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-2xl md:text-4xl font-black gold-text flex items-center gap-4"><Box size={32} /> إرساء أصول رقمية</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-8 md:mt-12">
              <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-4">اسم الباقة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-primary uppercase pr-4">التصنيف</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase pr-4">القيمة (USD)</label>
                <div className="relative"><DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={20} /><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="pr-12 text-xl font-black" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase pr-4">المخزون</label><Input type="number" value={form.shippingCodes.split('\n').filter(c=>c.trim()).length} readOnly className="opacity-50" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-red-500 uppercase pr-4">تنبيه النقص</label><Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} /></div>
              </div>
              <div className="col-span-full space-y-4">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">الصورة</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-32 bg-muted/30 border-2 border-dashed border-primary/20 rounded-[1.5rem] flex items-center justify-center cursor-pointer overflow-hidden">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover" alt="" /> : <Upload className="text-primary opacity-40" size={32} />}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="col-span-full space-y-2">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">أكواد التسليم الآلي</label>
                 <Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="min-h-[150px] font-mono text-sm bg-zinc-950" />
              </div>
            </div>
            <DialogFooter className="mt-8"><Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-16 md:h-20 royal-button text-xl md:text-2xl">{isProcessing ? <Loader2 className="animate-spin" /> : "تنفيذ ونشر الأصول"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none overflow-hidden bg-card/60 backdrop-blur-3xl shadow-xl">
        <CardHeader className="p-6 md:p-10 border-b">
          <div className="relative w-full max-w-2xl">
             <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
             <Input placeholder="بحث..." className="pr-14 h-14 bg-background rounded-2xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="responsive-table">
            <TableHeader className="bg-muted/30"><TableRow><TableHead className="text-right py-8 pr-10 font-black text-[10px] uppercase">الباقة</TableHead><TableHead className="text-right font-black text-[10px] uppercase">القيمة</TableHead><TableHead className="text-right font-black text-[10px] uppercase">المخزون</TableHead><TableHead className="text-center font-black text-[10px] uppercase">التحكم</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin text-primary mx-auto" size={40} /></TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 border-b group">
                  <TableCell className="py-6 pr-10">
                    <div className="flex items-center gap-4">
                      <img src={p.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="" />
                      <div className="flex flex-col"><span className="font-black text-lg group-hover:gold-text transition-colors">{p.name}</span><span className="text-[9px] text-primary font-black uppercase">{p.category}</span></div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary text-xl tracking-tighter">${p.price}</TableCell>
                  <TableCell><Badge variant="outline" className={`rounded-full px-4 py-0.5 text-[9px] font-black uppercase ${p.stock <= (p.minStock || 5) ? 'text-red-500 bg-red-500/5' : 'text-green-500 bg-green-500/5'}`}>{p.stock || 0}</Badge></TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-3">
                       <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 border border-primary/10" onClick={() => startEdit(p)}><Edit2 size={16} /></Button>
                       <button onClick={() => handleDelete(p.id)} className="h-10 w-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer active:scale-90"><Trash2 size={16} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
