"use client";

import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Image as ImageIcon, Key, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminProducts() {
  const db = useFirestore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "شحن ألعاب",
    stock: "100",
    imageUrl: "https://picsum.photos/seed/xmood/800/600",
    description: "",
    shippingCodes: ""
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
    if (!form.name || !form.price || !db) return;
    setIsProcessing(true);
    
    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      updatedAt: serverTimestamp(),
      status: Number(form.stock) > 0 ? 'active' : 'out_of_stock'
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), data);
        toast({ title: "تم التحديث بنجاح", description: "تم تعديل بيانات الباقة في الخادم." });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تمت الإضافة بنجاح", description: "الباقة الآن متاحة للعملاء في المتجر." });
      }
      setIsOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في الصلاحيات", description: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "100", imageUrl: "https://picsum.photos/seed/xmood/800/600", description: "", shippingCodes: "" });
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
      shippingCodes: p.shippingCodes || ""
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">المستودع المركزي</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Inventory & Digital Keys Protocol</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 royal-button text-lg">
              <Plus className="ml-2" /> إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-slate-900 border-white/10 rounded-[3rem] p-12 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="text-primary" /> {editingId ? 'تعديل بيانات الباقة' : 'باقة رقمية جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">اسم الباقة</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الفئة</label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">السعر (USD)</label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl px-6 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المخزون المتوفر</label>
                <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl px-6 font-bold" />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رابط الصورة الملكي</label>
                <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl px-6 font-bold" />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أكواد الشحن (كود واحد في كل سطر)</label>
                <Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="bg-white/5 border-none min-h-[150px] rounded-3xl p-6 font-mono text-xs" placeholder="ضع هنا الأكواد ليتم تسليمها آلياً..." />
              </div>
            </div>
            <DialogFooter className="mt-12">
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-16 royal-button text-xl">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث قاعدة البيانات' : 'نشر الباقة في المتجر الآن'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none">
        <CardHeader className="p-10 pb-0">
          <div className="relative max-w-lg">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <Input 
              placeholder="ابحث عن باقة في المستودع..." 
              className="pr-14 h-16 bg-white/5 border-none rounded-2xl text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-8">
          <Table>
            <TableHeader className="border-b border-white/5 bg-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-8 pr-10 font-black text-[10px] uppercase tracking-widest text-slate-500">الباقة الرقمية</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500">السعر</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500">المخزون</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500">الأكواد</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-500">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-32 text-slate-600 font-bold italic">لا توجد منتجات مسجلة حالياً. ابدأ بإضافة الباقة الأولى.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-white/5 border-b border-white/5 transition-all">
                  <TableCell className="py-8 pr-10 font-bold flex items-center gap-6">
                    <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" alt="" />
                    <div className="flex flex-col">
                      <span className="text-lg">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{p.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary text-2xl">${p.price}</TableCell>
                  <TableCell className="font-black text-slate-300">{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 text-primary py-1 px-4 rounded-full font-black text-[10px]">
                      <Key size={12} className="ml-2" /> {p.shippingCodes?.split('\n').filter(Boolean).length || 0} مفتاح
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-4">
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-blue-400 hover:bg-blue-400/10" onClick={() => startEdit(p)}><Edit2 size={20} /></Button>
                      <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-red-400 hover:bg-red-400/10" onClick={() => handleDelete(p.id)}><Trash2 size={20} /></Button>
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
