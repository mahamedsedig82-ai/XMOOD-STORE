"use client";

import { useState, useRef, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
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
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: products, loading } = useCollection(productsQuery);

  const [form, setForm] = useState({
    name: "", price: "", category: "شحن ألعاب", stock: "0", minStock: "5", imageUrl: "", description: "", shippingCodes: "", highlights: "", isVisible: true, status: 'active'
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
          canvas.width = MAX_WIDTH;
          canvas.height = (img.height / img.width) * MAX_WIDTH;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
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
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }
    setIsProcessing(true);
    
    const codesList = form.shippingCodes.split('\n').filter(c => c.trim() !== "");
    const currentStock = codesList.length > 0 ? codesList.length : Number(form.stock);
    
    const data = { 
      ...form, 
      price: Number(form.price), 
      stock: currentStock, 
      minStock: Number(form.minStock),
      updatedAt: serverTimestamp() 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), data);
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: new Date().toISOString() });
        toast({ title: "تم النشر في المتجر" });
      }
      setIsOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه الباقة نهائياً؟")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "تم الحذف بنجاح" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "0", minStock: "5", imageUrl: "", description: "", shippingCodes: "", highlights: "", isVisible: true, status: 'active' });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setForm({ 
      ...p, 
      price: p.price.toString(), 
      stock: p.stock.toString(), 
      minStock: (p.minStock || 5).toString(),
      shippingCodes: p.shippingCodes || ""
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-[2rem] border shadow-xl">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">المخزون والمنتجات</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Digital Assets Management</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 royal-button text-[10px] uppercase shadow-xl"><Plus className="ml-2" size={20} /> إضافة باقة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-card border-none rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-3xl font-black gold-text flex items-center gap-4 uppercase"><Box size={28} className="text-primary" /> {editingId ? 'تعديل الباقة' : 'تأسيس باقة جديدة'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">اسم الباقة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: 8100 UC" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">التصنيف</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="شحن ألعاب، بطاقات..." /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase pr-2 flex justify-between"><span>السعر (USD)</span><span className="text-primary">يقابل: {formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span></label>
                <div className="relative"><DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={20} /><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-14 pr-12 text-primary font-black" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">المخزون اليدوي</label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
                 <div className="space-y-2"><label className="text-[10px] font-bold text-red-500 uppercase pr-2">الحد الأدنى</label><Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} className="text-red-500" /></div>
              </div>
              <div className="col-span-full space-y-4">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">صورة المنتج (رفع من الهاتف)</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-32 bg-muted/40 border-2 border-dashed border-primary/20 rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover" alt="" /> : <div className="text-center"><Upload className="text-primary mx-auto mb-2" /><p className="text-[10px] font-black opacity-30">اضغط للاختيار</p></div>}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="col-span-full space-y-2"><label className="text-[10px] font-bold text-primary uppercase pr-2">أكواد التسليم الفوري (كود في كل سطر)</label><Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="min-h-[150px] font-mono text-xs text-primary" placeholder="CODE-ABC-123..." /></div>
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-18 royal-button text-xl shadow-xl">{isProcessing ? <Loader2 className="animate-spin" /> : <><Zap size={20} className="ml-2" /> تأكيد ونشر الباقة</>}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none shadow-2xl overflow-hidden bg-card/60 backdrop-blur-xl">
        <CardHeader className="p-10 pb-0">
          <div className="relative w-full md:max-w-xl"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" /><Input placeholder="البحث في المستودع..." className="pr-14 h-14 bg-background border-none rounded-2xl text-lg shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        </CardHeader>
        <CardContent className="p-0 mt-10 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30"><TableRow><TableHead className="text-right py-8 pr-10 font-black text-[10px] uppercase text-zinc-500">الباقة</TableHead><TableHead className="text-right font-black text-[10px] uppercase text-zinc-500">القيمة</TableHead><TableHead className="text-right font-black text-[10px] uppercase text-zinc-500">المخزون</TableHead><TableHead className="text-center font-black text-[10px] uppercase text-zinc-500">التحكم</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={50} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-40 text-muted-foreground font-bold">لم يتم العثور على باقات</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 border-b border-border/30 transition-all">
                  <TableCell className="py-8 pr-10">
                    <div className="flex items-center gap-4">
                      <img src={p.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-16 h-16 rounded-[1.5rem] object-cover border shadow-md" alt="" />
                      <div className="flex flex-col"><span className="font-black text-lg text-foreground">{p.name}</span><span className="text-[9px] text-primary font-black uppercase tracking-widest">{p.category}</span></div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary text-2xl tracking-tighter">${p.price}</TableCell>
                  <TableCell><Badge variant="outline" className={`rounded-full px-4 py-1 text-[10px] font-black ${p.stock <= (p.minStock || 5) ? 'text-red-500 border-red-500/20 bg-red-500/5 animate-pulse' : 'text-green-500 border-green-500/20 bg-green-500/5'}`}>{p.stock} Unit</Badge></TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-4"><Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-primary hover:bg-primary/10 shadow-sm border" onClick={() => startEdit(p)}><Edit2 size={18} /></Button><Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-50 shadow-sm border" onClick={() => handleDelete(p.id)}><Trash2 size={18} /></Button></div>
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