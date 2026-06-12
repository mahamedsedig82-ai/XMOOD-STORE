
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Box, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProducts() {
  const db = useFirestore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: agents } = useCollection(query(collection(db, "users"), where("role", "==", "agent")));

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "شحن ألعاب",
    stock: "0",
    imageUrl: "https://picsum.photos/seed/xmood/800/600",
    description: "",
    shippingCodes: "",
    vendorId: ""
  });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const handleSubmit = async () => {
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الاسم والسعر على الأقل." });
      return;
    }
    setIsProcessing(true);
    
    // حساب المخزون بناءً على عدد الأكواد إذا كانت متوفرة
    const codesList = form.shippingCodes.split('\n').filter(c => c.trim() !== "");
    const calculatedStock = codesList.length > 0 ? codesList.length : Number(form.stock);

    const data = {
      ...form,
      price: Number(form.price),
      stock: calculatedStock,
      updatedAt: serverTimestamp(),
      status: calculatedStock > 0 ? 'active' : 'out_of_stock'
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), data);
        toast({ title: "تم التحديث", description: "تم تعديل بيانات المنتج بنجاح." });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم النشر", description: "المنتج متاح الآن في المتجر." });
      }
      setIsOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الإجراء", description: "حدث خطأ أثناء حفظ البيانات." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("هل تريد حذف هذا المنتج نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "0", imageUrl: "https://picsum.photos/seed/xmood/800/600", description: "", shippingCodes: "", vendorId: "" });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setForm({
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      stock: p.stock.toString(),
      imageUrl: p.imageUrl,
      description: p.description || "",
      shippingCodes: p.shippingCodes || "",
      vendorId: p.vendorId || ""
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">مستودع المنتجات الرقمية</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-xs">Digital Asset Management</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 royal-button text-lg">
              <Plus className="ml-3" /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-black border-primary/20 rounded-[3rem] p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center gap-4 gold-text">
                <Box size={28} className="text-primary" /> {editingId ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">اسم المنتج</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">الفئة</label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">السعر (USD)</label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">المخزون (اختياري إذا وجدت أكواد)</label>
                <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">رابط الصورة</label>
                <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="h-14 rounded-2xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">أكواد التسليم الآلي (ضع كود في كل سطر)</label>
                <Textarea 
                  value={form.shippingCodes} 
                  onChange={e => setForm({...form, shippingCodes: e.target.value})} 
                  className="min-h-[150px] rounded-[2rem] bg-zinc-900 border-none p-6 font-mono text-sm text-primary" 
                  placeholder="سيتم تسليم هذه الأكواد تلقائياً للعملاء بالترتيب..." 
                />
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-16 royal-button text-xl">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث البيانات' : 'حفظ ونشر المنتج'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none overflow-hidden">
        <CardHeader className="p-10 pb-0 flex flex-row justify-between items-center bg-white/5">
          <div className="relative max-w-lg flex-1">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" />
            <Input 
              placeholder="البحث في المستودع..." 
              className="pr-14 h-14 bg-black border-none rounded-xl text-lg text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          <Table>
            <TableHeader className="bg-white/5 border-b border-primary/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-8 pr-10 font-bold text-[10px] uppercase text-zinc-500">المنتج</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase text-zinc-500">السعر</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase text-zinc-500">المخزون</TableHead>
                <TableHead className="text-center font-bold text-[10px] uppercase text-zinc-500">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-40 text-zinc-700 font-bold uppercase tracking-widest">No Products Found</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 border-b border-white/5 transition-all">
                  <TableCell className="py-8 pr-10">
                    <div className="flex items-center gap-6">
                      <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover shadow-xl border border-white/5" alt="" />
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white">{p.name}</span>
                        <span className="text-[9px] text-primary/60 font-bold uppercase">{p.category}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary text-xl">${p.price}</TableCell>
                  <TableCell className="font-bold text-zinc-400">{p.stock}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-4">
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-primary hover:bg-primary/10" onClick={() => startEdit(p)}><Edit2 size={20} /></Button>
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(p.id)}><Trash2 size={20} /></Button>
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
