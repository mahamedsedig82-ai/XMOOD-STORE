
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Box, Image as ImageIcon } from "lucide-react";
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
    stock: "0",
    imageUrl: "",
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
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الاسم والسعر على الأقل." });
      return;
    }
    setIsProcessing(true);
    
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
        toast({ title: "تم التحديث" });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم النشر" });
      }
      setIsOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الإجراء" });
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
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "0", imageUrl: "", description: "", shippingCodes: "" });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setForm({
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      stock: p.stock.toString(),
      imageUrl: p.imageUrl || "",
      description: p.description || "",
      shippingCodes: p.shippingCodes || ""
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-headline font-bold gold-text">مستودع الأصول</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[9px] md:text-xs">Digital Asset Management</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-14 md:h-16 px-8 md:px-10 royal-button text-sm md:text-lg w-full md:w-auto">
              <Plus className="ml-2" /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-black border-primary/20 rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-bold flex items-center gap-4 gold-text">
                <Box size={24} className="text-primary" /> {editingId ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-2">اسم المنتج</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 md:h-14 rounded-xl bg-zinc-900 border-none px-4 md:px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-2">الفئة</label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-12 md:h-14 rounded-xl bg-zinc-900 border-none px-4 md:px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-2">السعر (USD)</label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-12 md:h-14 rounded-xl bg-zinc-900 border-none px-4 md:px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-2">المخزون (يدوي)</label>
                <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="h-12 md:h-14 rounded-xl bg-zinc-900 border-none px-4 md:px-6 font-bold" />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-2">رابط الصورة الخارجية</label>
                <div className="flex gap-4">
                  <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="h-12 md:h-14 rounded-xl bg-zinc-900 border-none px-4 md:px-6 font-bold flex-1" />
                  {form.imageUrl && (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-primary/20">
                      <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-2">أكواد التسليم الآلي (كود في كل سطر)</label>
                <Textarea 
                  value={form.shippingCodes} 
                  onChange={e => setForm({...form, shippingCodes: e.target.value})} 
                  className="min-h-[120px] rounded-xl md:rounded-[2rem] bg-zinc-900 border-none p-4 md:p-6 font-mono text-sm text-primary" 
                  placeholder="ضع الأكواد هنا..." 
                />
              </div>
            </div>
            <DialogFooter className="mt-8 md:mt-10">
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-14 md:h-16 royal-button text-base md:text-xl">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث البيانات' : 'حفظ ونشر المنتج'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none overflow-hidden">
        <CardHeader className="p-6 md:p-10 pb-0 flex flex-col md:flex-row justify-between items-center bg-white/5 gap-4">
          <div className="relative w-full md:max-w-lg">
            <Search className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-primary/40 w-4 h-4 md:w-5 md:h-5" />
            <Input 
              placeholder="البحث في المستودع..." 
              className="pr-10 md:pr-14 h-12 md:h-14 bg-black border-none rounded-xl text-sm md:text-lg text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase px-4 py-1">{filtered.length} ITEMS</Badge>
        </CardHeader>
        <CardContent className="p-0 mt-6 overflow-x-auto custom-scrollbar">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-white/5 border-b border-primary/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-6 md:py-8 pr-6 md:pr-10 font-bold text-[9px] md:text-[10px] uppercase text-zinc-500">المنتج</TableHead>
                <TableHead className="text-right font-bold text-[9px] md:text-[10px] uppercase text-zinc-500">السعر</TableHead>
                <TableHead className="text-right font-bold text-[9px] md:text-[10px] uppercase text-zinc-500">المخزون</TableHead>
                <TableHead className="text-center font-bold text-[9px] md:text-[10px] uppercase text-zinc-500">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 border-b border-white/5 transition-all">
                  <TableCell className="py-6 md:py-8 pr-6 md:pr-10">
                    <div className="flex items-center gap-4 md:gap-6">
                      <img src={p.imageUrl || "https://picsum.photos/seed/p/100/100"} className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-xl border border-white/5" alt="" />
                      <div className="flex flex-col">
                        <span className="text-sm md:text-lg font-bold text-white line-clamp-1">{p.name}</span>
                        <span className="text-[8px] md:text-[9px] text-primary/60 font-bold uppercase">{p.category}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary text-base md:text-xl">${p.price}</TableCell>
                  <TableCell className="font-bold text-zinc-400">{p.stock}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2 md:gap-4 px-4">
                      <Button size="icon" variant="ghost" className="h-10 w-10 md:h-12 md:w-12 rounded-xl text-primary hover:bg-primary/10" onClick={() => startEdit(p)}><Edit2 size={18} /></Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 md:h-12 md:w-12 rounded-xl text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(p.id)}><Trash2 size={18} /></Button>
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
