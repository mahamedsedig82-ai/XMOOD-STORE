"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreVertical, Edit2, Trash2, ImageIcon, Loader2, RefreshCcw, Key, Package, Layers, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminProducts() {
  const db = useFirestore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [currentProduct, setCurrentProduct] = useState({
    id: "",
    name: "",
    price: "",
    stock: "100",
    category: "شحن ألعاب",
    imageUrl: "https://picsum.photos/seed/ff-main/800/600",
    description: "",
    shippingCodes: "" 
  });

  // REAL-TIME LISTENER: الضمان النهائي لمزامنة البيانات
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setLoading(false);
    }, (err) => {
      console.error("Snapshot Error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const handleAddProduct = async () => {
    if (!currentProduct.name || !currentProduct.price) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء الاسم والسعر" });
      return;
    }
    setIsProcessing(true);
    const productData = {
      name: currentProduct.name,
      price: Number(currentProduct.price),
      stock: Number(currentProduct.stock),
      category: currentProduct.category,
      imageUrl: currentProduct.imageUrl,
      description: currentProduct.description || "",
      shippingCodes: currentProduct.shippingCodes || "",
      status: Number(currentProduct.stock) > 0 ? "active" : "out_of_stock",
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "products"), productData);
      toast({ title: "تم النشر بنجاح", description: "المنتج متاح الآن لجميع المستخدمين" });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'products',
        operation: 'create',
        requestResourceData: productData
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!currentProduct.id) return;
    setIsProcessing(true);
    const productRef = doc(db, "products", currentProduct.id);
    const updateData = {
      name: currentProduct.name,
      price: Number(currentProduct.price),
      stock: Number(currentProduct.stock),
      category: currentProduct.category,
      imageUrl: currentProduct.imageUrl,
      description: currentProduct.description || "",
      shippingCodes: currentProduct.shippingCodes || "",
      status: Number(currentProduct.stock) > 0 ? "active" : "out_of_stock",
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(productRef, updateData);
      toast({ title: "تم تحديث البيانات", description: "تم حفظ التغييرات فوراً في قاعدة البيانات" });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: productRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("سيتم حذف المنتج وأكواد الشحن نهائياً، هل أنت متأكد؟")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "تم الحذف", description: "تمت إزالة المنتج من المتجر" });
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف" });
    }
  };

  const resetForm = () => {
    setCurrentProduct({
      id: "",
      name: "",
      price: "",
      stock: "100",
      category: "شحن ألعاب",
      imageUrl: "https://picsum.photos/seed/ff-main/800/600",
      description: "",
      shippingCodes: ""
    });
  };

  const openEditDialog = (product: any) => {
    setCurrentProduct({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      description: product.description || "",
      shippingCodes: product.shippingCodes || ""
    });
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 h-px bg-primary"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Master Inventory Control</span>
          </div>
          <h1 className="text-5xl font-headline font-bold">المستودع الملكي الرقمي</h1>
          <p className="text-muted-foreground text-lg font-light mt-2">إدارة الباقات، المخزون، وأكواد الشحن الفوري بكل احترافية.</p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="h-20 px-12 bg-slate-900 hover:bg-primary text-white font-bold rounded-[2rem] transition-all shadow-2xl shadow-primary/10 text-lg">
                <Plus size={24} className="ml-3" /> إضافة باقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] rounded-[4rem] p-12 border-none shadow-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-4xl font-headline font-bold mb-8 text-right flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Plus size={28} />
                  </div>
                  إنشاء منتج جديد
                </DialogTitle>
              </DialogHeader>
              <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
              <DialogFooter className="mt-12">
                <Button onClick={handleAddProduct} disabled={isProcessing} className="h-20 w-full rounded-3xl bg-primary text-white font-bold text-2xl shadow-xl hover:scale-[1.02] transition-transform">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "نشر المنتج في المتجر فوراً"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white luxury-card">
        <CardHeader className="bg-slate-50/50 p-10 border-b">
          <div className="relative max-w-2xl">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <Input 
              placeholder="ابحث عن باقة، خدمة، أو كود معين..." 
              className="pr-16 h-16 rounded-2xl bg-white border-none shadow-inner text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right py-8 pr-12 font-black text-[10px] uppercase tracking-widest">المنتج والخدمة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">الفئة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">السعر الملكي</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">المخزون</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">أكواد الشحن</TableHead>
                <TableHead className="text-center w-[200px] font-black text-[10px] uppercase tracking-widest">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-32"><Loader2 className="animate-spin mx-auto text-primary w-16 h-16" /></TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-32 text-muted-foreground text-2xl font-light">لا توجد منتجات مسجلة حالياً في المستودع.</TableCell></TableRow>
              ) : filteredProducts.map((product: any) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group">
                  <TableCell className="py-8 pr-12">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500">
                         <img src={product.imageUrl} className="object-cover w-full h-full" alt="" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 text-lg">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-black">ID: {product.id.substring(0,10)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-primary px-4 py-1.5 font-bold">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary text-2xl">${product.price}</TableCell>
                  <TableCell className="font-bold text-lg">{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none flex w-fit gap-2 items-center font-black px-4 py-1.5 rounded-full">
                       <Key size={14} /> {product.shippingCodes?.split('\n').filter(Boolean).length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-3">
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-blue-50 text-blue-600 shadow-sm" onClick={() => openEditDialog(product)}>
                          <Edit2 size={20} />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-red-50 text-red-600 shadow-sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 size={20} />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[4rem] p-12 border-none shadow-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-headline font-bold mb-8 text-right flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900/10 rounded-2xl flex items-center justify-center text-slate-900">
                <Edit2 size={28} />
              </div>
              تعديل بيانات المنتج
            </DialogTitle>
          </DialogHeader>
          <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
          <DialogFooter className="mt-12">
            <Button onClick={handleUpdateProduct} disabled={isProcessing} className="h-20 w-full rounded-3xl bg-slate-900 text-white font-bold text-2xl shadow-xl hover:bg-primary transition-all">
              {isProcessing ? <Loader2 className="animate-spin" /> : "حفظ وتطبيق التغييرات فوراً"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ currentProduct, setCurrentProduct }: { currentProduct: any, setCurrentProduct: any }) {
  return (
    <div className="grid gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="font-black text-xs uppercase tracking-widest text-slate-400 pr-4">اسم الباقة أو الخدمة</Label>
          <Input 
            value={currentProduct.name}
            onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
            className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg" 
          />
        </div>
        <div className="space-y-3">
          <Label className="font-black text-xs uppercase tracking-widest text-slate-400 pr-4">فئة المنتج</Label>
          <select 
            value={currentProduct.category}
            onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
            className="w-full h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg appearance-none cursor-pointer"
          >
            <option>شحن ألعاب</option>
            <option>حسابات ألعاب</option>
            <option>خدمات رقمية</option>
            <option>خدمات تصميم</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="font-black text-xs uppercase tracking-widest text-slate-400 pr-4">السعر الملكي (USD)</Label>
          <Input 
            type="number"
            value={currentProduct.price}
            onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
            className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-black text-2xl text-primary" 
          />
        </div>
        <div className="space-y-3">
          <Label className="font-black text-xs uppercase tracking-widest text-slate-400 pr-4">المخزون الظاهري</Label>
          <Input 
            type="number"
            value={currentProduct.stock}
            onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
            className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold text-lg" 
          />
        </div>
      </div>
      <div className="space-y-3">
        <Label className="font-black text-xs uppercase tracking-widest text-slate-400 pr-4">قائمة أكواد الشحن (كود واحد في كل سطر)</Label>
        <Textarea 
          value={currentProduct.shippingCodes}
          onChange={(e) => setCurrentProduct({...currentProduct, shippingCodes: e.target.value})}
          placeholder="XMOOD-XXXX-XXXX-XXXX..."
          className="min-h-[180px] rounded-[2rem] bg-slate-50 border-none px-8 py-6 font-mono text-sm shadow-inner"
        />
        <p className="text-[10px] text-muted-foreground pr-4 italic">سيقوم النظام بتسليم هذه الأكواد آلياً عند كل عملية شراء ناجحة.</p>
      </div>
      <div className="space-y-3">
        <Label className="font-black text-xs uppercase tracking-widest text-slate-400 pr-4">رابط الصورة (URL)</Label>
        <Input 
          value={currentProduct.imageUrl}
          onChange={(e) => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
          className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold" 
        />
      </div>
    </div>
  );
}