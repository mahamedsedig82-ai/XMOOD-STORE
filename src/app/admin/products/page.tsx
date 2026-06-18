
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
        toast({ title: "تمت معالجة الصورة" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل المعالجة" });
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
    // 🛡️ مزامنة المخزون إجبارياً مع عدد الأكواد لمنع خطأ "غير متوفر"
    const currentStock = codesList.length > 0 ? codesList.length : 0;
    
    const data = { 
      ...form, 
      price: Number(form.price), 
      stock: currentStock, 
      minStock: Number(form.minStock),
      status: currentStock > 0 ? 'active' : 'out_of_stock',
      updatedAt: serverTimestamp(),
      createdAt: form.createdAt || new Date().toISOString()
    };

    const action = editingId 
      ? updateDoc(doc(db, "products", editingId), data)
      : addDoc(collection(db, "products"), { ...data, createdAt: new Date().toISOString() });

    action.then(() => {
      toast({ title: editingId ? "تم التحديث السيادي" : "تم النشر في المستودع" });
      setIsOpen(false);
      resetForm();
    }).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: editingId ? `products/${editingId}` : 'products', 
        operation: editingId ? 'update' : 'create', 
        requestResourceData: data 
      }));
    }).finally(() => setIsProcessing(false));
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة من المستودع السيادي؟") || !db) return;
    const docRef = doc(db, "products", id);
    deleteDoc(docRef)
      .then(() => toast({ title: "تم الحذف بنجاح" }))
      .catch(async (e) => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })); });
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "0", minStock: "5", imageUrl: "", description: "", shippingCodes: "", highlights: "", isVisible: true, status: 'active' });
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
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [products, searchTerm]);

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-10 rounded-[3rem] border shadow-2xl">
        <div>
          <h1 className="text-5xl font-headline font-black gold-text">المستودع المركزي</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-[0.4em] text-[10px]">Strategic Asset Inventory</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-18 px-12 royal-button text-base shadow-2xl hover:scale-105 transition-transform"><Plus className="ml-3" size={24} /> تأسيس باقة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-card border-none rounded-[3.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh]">
            <DialogHeader><DialogTitle className="text-4xl font-black gold-text flex items-center gap-4 uppercase"><Box size={32} className="text-primary" /> إرساء أصول رقمية</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
              <div className="space-y-3"><label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">اسم الباقة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: 8100 UC ELITE" /></div>
              <div className="space-y-3"><label className="text-[10px] font-black text-primary uppercase pr-4 tracking-widest">التصنيف</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Gaming, Cards, Subscriptions..." /></div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase pr-4 flex justify-between"><span>القيمة (USD)</span><span className="text-zinc-400">≈ {formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span></label>
                <div className="relative"><DollarSign className="absolute right-5 top-1/2 -translate-y-1/2 text-primary" size={24} /><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-16 pr-14 text-2xl font-black text-primary gold-glow-border !bg-white/5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3"><label className="text-[10px] font-black text-zinc-500 uppercase pr-4">المخزون المتوفر</label><Input type="number" value={form.stock} readOnly className="opacity-50 cursor-not-allowed bg-muted" /></div>
                 <div className="space-y-3"><label className="text-[10px] font-black text-red-500 uppercase pr-4">تنبيه النقص</label><Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} className="!border-red-500/30" /></div>
              </div>
              <div className="col-span-full space-y-4">
                 <label className="text-[10px] font-black text-primary uppercase pr-4">صورة الهوية البصرية</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-40 bg-muted/30 border-2 border-dashed border-primary/20 rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="" /> : <div className="text-center"><Upload className="text-primary mx-auto mb-3" size={32} /><p className="text-[10px] font-black uppercase tracking-widest opacity-40">رفع من الاستوديو</p></div>}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>
              <div className="col-span-full space-y-3">
                 <label className="text-[10px] font-black text-primary uppercase pr-4 tracking-[0.2em]">أكواد التسليم الآلي (كود في كل سطر)</label>
                 <Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="min-h-[200px] font-mono text-sm text-primary bg-zinc-950 border-primary/20 leading-loose" placeholder="CODE-XM-8100-XXXXX..." />
                 <p className="text-[9px] text-zinc-500 font-bold">سيتم احتساب المخزون آلياً بناءً على عدد الأكواد أعلاه.</p>
              </div>
            </div>
            <DialogFooter className="mt-12"><Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-20 royal-button text-2xl shadow-2xl shadow-primary/30">{isProcessing ? <Loader2 className="animate-spin" /> : <><Zap size={24} className="ml-4" /> تأكيد ونشر الباقة في المستودع</>}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden bg-card/60 backdrop-blur-3xl">
        <CardHeader className="p-10 border-b border-border/50">
          <div className="relative w-full max-w-2xl group">
             <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-all" size={24} />
             <Input placeholder="بحث في الأصول المسجلة..." className="pr-16 h-16 bg-background rounded-2xl text-xl shadow-inner border-primary/10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="responsive-table">
            <TableHeader className="bg-muted/30"><TableRow><TableHead className="text-right py-10 pr-12 font-black text-[11px] uppercase tracking-widest text-zinc-500">الباقة والأصل</TableHead><TableHead className="text-right font-black text-[11px] uppercase tracking-widest text-zinc-500">القيمة</TableHead><TableHead className="text-right font-black text-[11px] uppercase tracking-widest text-zinc-500">المخزون</TableHead><TableHead className="text-center font-black text-[11px] uppercase tracking-widest text-zinc-500">الإجراءات</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-40"><Loader2 className="animate-spin text-primary mx-auto" size={80} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-60 text-zinc-400 font-black uppercase tracking-[0.6em] opacity-30 italic">No Assets Found</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 border-b border-border/30 transition-all group duration-500">
                  <TableCell className="py-10 pr-12" data-label="الباقة">
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                         <img src={p.imageUrl || "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png"} className="w-20 h-20 rounded-[1.75rem] object-cover border-2 border-primary/10 shadow-2xl group-hover:scale-110 transition-transform duration-700" alt="" />
                         <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-background ${p.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="flex flex-col"><span className="font-black text-xl text-foreground group-hover:gold-text transition-all leading-none mb-2">{p.name}</span><span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{p.category}</span></div>
                    </div>
                  </TableCell>
                  <TableCell data-label="القيمة" className="font-black text-primary text-3xl tracking-tighter">${p.price}</TableCell>
                  <TableCell data-label="المخزون"><Badge variant="outline" className={`rounded-full px-6 py-1.5 text-[11px] font-black uppercase tracking-widest ${p.stock <= (p.minStock || 5) ? 'text-red-500 border-red-500/20 bg-red-500/5 animate-pulse' : 'text-green-500 border-green-500/20 bg-green-500/5'}`}>{p.stock || 0} Unit</Badge></TableCell>
                  <TableCell className="text-center" data-label="التحكم">
                    <div className="flex justify-center gap-4">
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-primary hover:bg-primary/10 border border-primary/10" onClick={() => startEdit(p)}><Edit2 size={20} /></Button>
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-red-500 hover:bg-red-50 border border-red-500/10" onClick={() => handleDelete(p.id)}><Trash2 size={20} /></Button>
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
