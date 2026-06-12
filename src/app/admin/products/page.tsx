"use client";

import { useState, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Key, Box, User } from "lucide-react";
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
    stock: "100",
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
        toast({ title: "تم التحديث الملكي", description: "تم تعديل السجلات الرقمية فوراً." });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم النشر بنجاح", description: "الباقة الأسطورية متاحة الآن للعملاء." });
      }
      setIsOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الإجراء", description: "تأكد من صلاحياتك واتصالك بالمنصة." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("هل تريد حذف هذه الباقة نهائياً من المستودع السيادي؟")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "تم حذف الأصل الرقمي" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "100", imageUrl: "https://picsum.photos/seed/xmood/800/600", description: "", shippingCodes: "", vendorId: "" });
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
          <h1 className="text-6xl font-headline font-bold gold-text">مستودع الأصول السيادية</h1>
          <p className="text-slate-500 mt-2 font-black uppercase tracking-[0.5em] text-xs">Sovereign Asset Registry</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-20 px-12 royal-button text-xl">
              <Plus className="ml-3" /> إضافة باقة ملكية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-black border-primary/20 rounded-[3rem] p-12 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-4xl font-bold flex items-center gap-4 gold-text">
                <Box size={32} className="text-primary" /> {editingId ? 'تعديل السجل الرقمي' : 'إنشاء باقة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-10 mt-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">اسم المنتج</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">الفئة</label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">السعر (USD)</label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">المخزون المتوفر</label>
                <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold" />
              </div>
              <div className="col-span-2 space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">الوكيل المسؤول (لخدمات التصميم والوساطة)</label>
                <Select value={form.vendorId} onValueChange={(val) => setForm({...form, vendorId: val})}>
                  <SelectTrigger className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold">
                    <SelectValue placeholder="اختر وكيلاً معتمداً..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10" dir="rtl">
                    <SelectItem value="none">بدون وكيل (إدارة عامة)</SelectItem>
                    {agents?.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">رابط الصورة (URL)</label>
                <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="h-16 rounded-2xl bg-zinc-900 border-none px-8 font-bold" />
              </div>
              <div className="col-span-2 space-y-4">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pr-4">أكواد الشحن والمفاتيح (كود في كل سطر)</label>
                <Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="min-h-[200px] rounded-[2rem] bg-zinc-900 border-none p-8 font-mono text-sm text-primary" placeholder="ضع الأكواد هنا للبيع الآلي..." />
              </div>
            </div>
            <DialogFooter className="mt-12">
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-20 royal-button text-2xl">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث السجلات' : 'نشر في المتجر الملكي'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none overflow-hidden legendary-border">
        <CardHeader className="p-12 pb-0 flex flex-row justify-between items-center bg-white/5">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 w-6 h-6" />
            <Input 
              placeholder="البحث في المستودع..." 
              className="pr-16 h-16 bg-black border-none rounded-2xl text-xl text-white shadow-inner"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 h-12 px-8 rounded-full font-black text-xs uppercase tracking-[0.3em]">
            Active Assets: {products.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 mt-8">
          <Table>
            <TableHeader className="bg-white/5 border-b border-primary/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right py-10 pr-12 font-black text-[10px] uppercase text-primary/60">المنتج</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-primary/60">القيمة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-primary/60">الوكيل</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase text-primary/60">المخزون</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase text-primary/60">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-32"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-60 text-primary/10 font-black text-4xl uppercase tracking-[0.4em]">The Vault is Empty</TableCell></TableRow>
              ) : filtered.map((p) => {
                const agent = agents?.find((a: any) => a.id === p.vendorId);
                return (
                  <TableRow key={p.id} className="hover:bg-primary/5 border-b border-primary/5 transition-all">
                    <TableCell className="py-10 pr-12">
                      <div className="flex items-center gap-8">
                        <img src={p.imageUrl} className="w-20 h-20 rounded-3xl object-cover shadow-2xl border border-primary/20" alt="" />
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-white">{p.name}</span>
                          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">{p.category}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-primary text-3xl">${p.price}</TableCell>
                    <TableCell>
                      {agent ? (
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-primary" />
                          <span className="text-xs font-bold text-slate-300">{agent.displayName}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="opacity-40">عام</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-black text-slate-500 text-xl">{p.stock}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-6">
                        <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl text-primary hover:bg-primary/10" onClick={() => startEdit(p)}><Edit2 size={24} /></Button>
                        <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(p.id)}><Trash2 size={24} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}