"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Loader2, Search, Box, Upload, Link as LinkIcon, DollarSign, Info, Sparkles, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSDG } from "@/lib/currency";
import { Switch } from "@/components/ui/switch";

export default function AdminProducts() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "شحن ألعاب",
    stock: "0",
    minStock: "5",
    imageUrl: "",
    description: "",
    shippingCodes: "",
    highlights: "",
    isVisible: true,
    status: 'active' as 'active' | 'out_of_stock' | 'low_stock' | 'paused'
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
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
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
        toast({ title: "تم معالجة الصورة وتجهيزها للرفع" });
      } catch (err) {
        toast({ variant: "destructive", title: "فشل معالجة الصورة" });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !db) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الاسم والسعر على الأقل." });
      return;
    }
    setIsProcessing(true);
    
    const codesList = form.shippingCodes.split('\n').filter(c => c.trim() !== "");
    const currentStock = codesList.length > 0 ? codesList.length : Number(form.stock);
    const minS = Number(form.minStock);
    
    let calculatedStatus: any = 'active';
    if (currentStock <= 0) calculatedStatus = 'out_of_stock';
    else if (currentStock <= minS) calculatedStatus = 'low_stock';

    const data = { 
      ...form, 
      price: Number(form.price), 
      stock: currentStock, 
      minStock: minS,
      status: form.status === 'paused' ? 'paused' : calculatedStatus,
      updatedAt: serverTimestamp() 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), data);
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تم النشر في المتجر" });
      }
      setIsOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
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
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "شحن ألعاب", stock: "0", minStock: "5", imageUrl: "", description: "", shippingCodes: "", highlights: "", isVisible: true, status: 'active' });
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    setForm({ 
      name: p.name, 
      price: p.price.toString(), 
      category: p.category, 
      stock: p.stock.toString(), 
      minStock: (p.minStock || 5).toString(),
      imageUrl: p.imageUrl || "", 
      description: p.description || "", 
      shippingCodes: p.shippingCodes || "", 
      highlights: p.highlights || "",
      isVisible: p.isVisible ?? true,
      status: p.status || 'active'
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const filtered = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(search));
  }, [products, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-[2rem] border">
        <div>
          <h1 className="text-4xl font-headline font-bold gold-text">إدارة الخدمات والخزينة</h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Digital Assets & Inventory Guard</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 royal-button text-[10px] uppercase"><Plus className="ml-2" size={16} /> إضافة باقة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-zinc-950 border-primary/20 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
               <DialogTitle className="text-2xl font-bold flex items-center gap-4 gold-text uppercase">
                  <Box size={24} className="text-primary" /> {editingId ? 'تعديل بيانات الباقة' : 'تأسيس باقة إلكترونية'}
               </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">اسم الباقة</label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl bg-zinc-900 border-none px-6 font-bold" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">التصنيف الرئيسي</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-12 rounded-xl bg-zinc-900 border-none px-6 font-bold" /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase pr-2 flex justify-between"><span>السعر (USD)</span><span className="text-primary">يقابل: {formatSDG(Number(form.price) || 0, config?.siteInfo?.usdRate || 5400)}</span></label>
                <div className="relative"><DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={18} /><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-12 rounded-xl bg-zinc-900 border-none pr-12 pl-6 font-black text-lg text-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">المخزون الحالي</label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="h-12 rounded-xl bg-zinc-900 border-none px-6 font-bold" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-bold text-red-500 uppercase pr-2">الحد الأدنى</label><Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} className="h-12 rounded-xl bg-zinc-900 border-none px-6 font-bold text-red-500" /></div>
              </div>
              
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-6 rounded-3xl border border-white/10">
                 <div className="flex items-center justify-between">
                    <div><p className="font-bold text-sm">عرض في المتجر</p><p className="text-[10px] text-zinc-500">إظهار أو إخفاء الباقة تماماً عن العملاء.</p></div>
                    <Switch checked={form.isVisible} onCheckedChange={(v) => setForm({...form, isVisible: v})} />
                 </div>
                 <div className="flex items-center justify-between">
                    <div><p className="font-bold text-sm">إيقاف البيع مؤقتاً</p><p className="text-[10px] text-zinc-500">منع الشراء مع بقاء الباقة ظاهرة.</p></div>
                    <Switch checked={form.status === 'paused'} onCheckedChange={(v) => setForm({...form, status: v ? 'paused' : 'active'})} />
                 </div>
              </div>

              <div className="col-span-full space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">مميزات الباقة (كل ميزة في سطر)</label><Textarea value={form.highlights} onChange={e => setForm({...form, highlights: e.target.value})} className="min-h-[80px] rounded-xl bg-zinc-900 border-none p-4 text-xs font-bold" placeholder="تسليم فوري&#10;دعم 24 ساعة..." /></div>
              
              <div className="col-span-full space-y-4">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase pr-2">صورة الباقة</label>
                 <div onClick={() => fileInputRef.current?.click()} className="h-24 bg-zinc-900 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all overflow-hidden">
                    {form.imageUrl ? <img src={form.imageUrl} className="h-full w-full object-cover" alt="" /> : <Upload className="text-primary" />}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
              </div>

              <div className="col-span-full space-y-2"><label className="text-[10px] font-bold text-primary uppercase pr-2">أكواد التسليم الفوري (كود في كل سطر)</label><Textarea value={form.shippingCodes} onChange={e => setForm({...form, shippingCodes: e.target.value})} className="min-h-[120px] rounded-2xl bg-zinc-900 border-none p-6 font-mono text-xs text-primary" placeholder="CODE-12345&#10;CODE-67890..." /></div>
            </div>
            <DialogFooter className="mt-10"><Button onClick={handleSubmit} disabled={isProcessing} className="w-full h-16 royal-button text-sm uppercase">{isProcessing ? <Loader2 className="animate-spin" /> : editingId ? 'تحديث بيانات الباقة' : 'تأكيد ونشر الباقة'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="luxury-card border-none bg-zinc-950/40 shadow-2xl overflow-hidden">
        <CardHeader className="p-10 pb-0 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:max-w-xl"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/40 w-4 h-4" /><Input placeholder="البحث في المستودع الاستراتيجي..." className="pr-12 h-12 bg-black border-none rounded-xl text-base" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-6 py-2 rounded-full tracking-widest">{filtered.length} ACTIVE ASSETS</Badge>
        </CardHeader>
        <CardContent className="p-0 mt-10 overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5"><TableRow><TableHead className="text-right py-6 pr-10 font-black text-[9px] uppercase text-zinc-500">الباقة والتصنيف</TableHead><TableHead className="text-right font-black text-[9px] uppercase text-zinc-500">القيمة</TableHead><TableHead className="text-right font-black text-[9px] uppercase text-zinc-500">حالة المخزون</TableHead><TableHead className="text-center font-black text-[9px] uppercase text-zinc-500">التحكم</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold">لا توجد نتائج</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 border-b border-white/5 transition-all group">
                  <TableCell className="py-6 pr-10" data-label="الباقة">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 overflow-hidden rounded-[1rem] shadow-lg border border-white/5 shrink-0">
                        <img src={p.imageUrl || "https://picsum.photos/seed/p/200/200"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-white text-sm group-hover:gold-text transition-colors">{p.name}</span>
                           {!p.isVisible && <EyeOff size={12} className="text-red-500" />}
                        </div>
                        <span className="text-[8px] text-primary/60 font-black uppercase">{p.category}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell data-label="القيمة" className="font-black text-primary text-lg tracking-tighter">${p.price}</TableCell>
                  <TableCell data-label="المخزون">
                    <div className="flex flex-col gap-1">
                       <Badge variant="outline" className={`border-zinc-800 text-[10px] w-fit ${p.stock <= p.minStock ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                          {p.stock} Units
                       </Badge>
                       <span className="text-[7px] font-black uppercase text-zinc-500 pr-1">Status: {p.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-3">
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-primary hover:bg-primary/10 border border-white/5" onClick={() => startEdit(p)}><Edit2 size={14} /></Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-500/10 border border-white/5" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
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
