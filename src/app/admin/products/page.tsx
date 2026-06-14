
"use client";

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Box, Image as ImageIcon, Upload, Link as LinkIcon, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatSDG } from "@/lib/currency";

export default function AdminProducts() {
  const db = useFirestore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Settings for dynamic rate display
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
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

    const targetCollection = collection(db, "products");
    
    if (editingId) {
      const docRef = doc(db, "products", editingId);
      updateDoc(docRef, data)
        .then(() => {
          toast({ title: "تم التحديث بنجاح" });
          setIsOpen(false);
          resetForm();
        })
        .finally(() => setIsProcessing(false));
    } else {
      addDoc(targetCollection, { ...data, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "تم النشر في المتجر" });
          setIsOpen(false);
          resetForm();
        })
        .finally(() => setIsProcessing(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!db || !confirm("هل تريد حذف هذا المنتج نهائياً؟")) return;
    const docRef = doc(db, "products", id);
    deleteDoc(docRef).then(() => {
      toast({ title: "تم الحذف بنجاح" });
    });
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
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">مستودع الأصول الرقمية</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Digital Asset Inventory Control</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 royal-button text-sm">
              <Plus className="ml-2" /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-zinc-950 border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center gap-4 gold-text">
                <Box size={32} className="text-primary" /> {editingId ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">اسم المنتج</label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-14 rounded-xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">الفئة</label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-14 rounded-xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3 flex justify-between">
                   <span>السعر بالدولار (USD)</span>
                   <span className="text-zinc-500">يقابل: {formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                  <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-14 rounded-xl bg-zinc-900 border-none pr-12 pl-6 font-black text-xl text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">المخزون الاحتياطي</label>
                <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="h-14 rounded-xl bg-zinc-900 border-none px-6 font-bold" />
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-4">
                 <label className="text-[10px] font-bold text-primary uppercase pr-3">صورة المنتج</label>
                 <Tabs defaultValue="url" className="w-full">
                    <TabsList className="bg-zinc-900 p-1 rounded-xl mb-4">
                       <TabsTrigger value="url" className="flex-1 gap-2"><LinkIcon size={14}/> رابط</TabsTrigger>
                       <TabsTrigger value="upload" className="flex-1 gap-2"><Upload size={14}/> رفع ملف</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                       <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="h-14 bg-zinc-900 border-none rounded-xl" />
                    </TabsContent>
                    <TabsContent value="upload">
                       <Input type="file" accept="image/*" onChange={handleImageUpload} className="h-14 bg-zinc-900 border-none pt-4" />
                    </TabsContent>
                 </Tabs>
                 {form.imageUrl && (
                   <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-primary/20">
                      <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                   </div>
                 )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase pr-3">أكواد التسليم الفوري (كود في كل سطر)</label>
                <Textarea 
                  value={form.shippingCodes} 
                  onChange={e => setForm({...form, shippingCodes: e.target.value})} 
                  className="min-h-[120px] rounded-[2rem] bg-zinc-900 border-none p-6 font-mono text-sm text-primary" 
                  placeholder="CODE-1..." 
                />
              </div>
            </div>
            <DialogFooter className="mt-12">
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-18 royal-button text-xl">
                {isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث المنتج' : 'تأكيد ونشر المنتج'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none overflow-hidden bg-zinc-950/40 shadow-2xl">
        <CardHeader className="p-10 pb-0 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" />
            <Input 
              placeholder="البحث في المستودع..." 
              className="pr-14 h-14 bg-black border-none rounded-2xl text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest">{filtered.length} ACTIVE ASSETS</Badge>
        </CardHeader>
        <CardContent className="p-0 mt-10">
          <ScrollArea className="max-h-[800px]">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right py-8 pr-12 font-black text-[10px] uppercase text-zinc-500">المنتج والتصنيف</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase text-zinc-500">القيمة</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase text-zinc-500">المخزون</TableHead>
                  <TableHead className="text-center font-black text-[10px] uppercase text-zinc-500">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-40"><Loader2 className="animate-spin mx-auto text-primary" size={40}/></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-40 text-muted-foreground font-bold">لا توجد منتجات مطابقة</TableCell></TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-primary/5 border-b border-white/5 transition-all group">
                    <TableCell className="py-8 pr-12" data-label="المنتج">
                      <div className="flex items-center gap-6">
                        <img src={p.imageUrl || "https://picsum.photos/seed/p/200/200"} className="w-16 h-16 rounded-2xl object-cover shadow-2xl border border-white/5" alt="" />
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-white group-hover:gold-text">{p.name}</span>
                          <span className="text-[10px] text-primary/60 font-black uppercase mt-1">{p.category}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-primary text-2xl tracking-tighter" data-label="السعر">${p.price}</TableCell>
                    <TableCell className="font-black text-zinc-400" data-label="المخزون">
                       <Badge variant="outline" className={`border-zinc-800 ${p.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell className="text-center" data-label="الإجراءات">
                      <div className="flex justify-center gap-4 px-6">
                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-primary hover:bg-primary/10 border border-white/5" onClick={() => startEdit(p)}><Edit2 size={20} /></Button>
                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-500/10 border border-white/5" onClick={() => handleDelete(p.id)}><Trash2 size={20} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
