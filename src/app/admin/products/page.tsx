"use client";

import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Image as ImageIcon, Key } from "lucide-react";
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
    return onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [db]);

  const handleSubmit = async () => {
    if (!form.name || !form.price) return;
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
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الصلاحيات" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "تم الحذف" });
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
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">المستودع الرقمي</h1>
          <p className="text-muted-foreground mt-2">إدارة الباقات والمخزون المباشر.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20">
              <Plus className="ml-2" /> إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 border-white/10 rounded-[2.5rem] p-10 text-white">
            <DialogHeader><DialogTitle className="text-2xl font-bold">{editingId ? 'تعديل باقة' : 'إضافة باقة جديدة'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-2"><label className="text-xs font-bold opacity-50">الاسم</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-white/5 border-none h-12" /></div>
              <div className="space-y-2"><label className="text-xs font-bold opacity-50">الفئة</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-white/5 border-none h-12" /></div>
              <div className="space-y-2"><label className="text-xs font-bold opacity-50">السعر (USD)</label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-white/5 border-none h-12" /></div>
              <div className="space-y-2"><label className="text-xs font-bold opacity-50">المخزون</label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-white/5 border-none h-12" /></div>
              <div className="col-span-2 space-y-2"><label className="text-xs font-bold opacity-50">رابط الصورة</label><Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="bg-white/5 border-none h-12" /></div>
              <div className="col-span-2 space-y-2"><label className="text-xs font-bold opacity-50">أكواد الشحن (كود لكل سطر)</label><Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="bg-white/5 border-none min-h-[100px]" /></div>
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-14 bg-primary text-white font-bold text-lg">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث البيانات' : 'نشر الباقة الآن'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none">
        <CardHeader className="p-8 pb-0">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث عن باقة..." 
              className="pr-10 h-12 bg-white/5 border-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-b border-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-6 pr-10">المنتج</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">المخزون</TableHead>
                <TableHead className="text-right">الأكواد</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">لا توجد منتجات حالياً.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                  <TableCell className="py-6 pr-10 font-bold flex items-center gap-4">
                    <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-xl" alt="" />
                    {p.name}
                  </TableCell>
                  <TableCell className="font-black text-primary text-lg">${p.price}</TableCell>
                  <TableCell className="font-bold">{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      <Key size={12} className="ml-1" /> {p.shippingCodes?.split('\n').filter(Boolean).length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" className="text-blue-400" onClick={() => startEdit(p)}><Edit2 size={18} /></Button>
                      <Button size="icon" variant="ghost" className="text-red-400" onClick={() => handleDelete(p.id)}><Trash2 size={18} /></Button>
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
