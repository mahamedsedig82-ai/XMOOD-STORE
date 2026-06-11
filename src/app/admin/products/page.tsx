
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreVertical, Edit2, Trash2, ImageIcon, Loader2, RefreshCcw, Key, Package, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCollection, useFirestore } from "@/firebase";
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

  // Real-time listener for instant updates
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
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
    <div className="space-y-10 animate-royal-fade" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold gold-gradient bg-clip-text text-transparent">المستودع الملكي الرقمي</h1>
          <p className="text-muted-foreground">تحكم كامل في الباقات، الأسعار، وأكواد الشحن الفوري.</p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="h-14 px-10 bg-slate-950 hover:bg-primary text-white font-bold rounded-2xl transition-all shadow-xl">
                <Plus size={20} className="ml-2" /> إضافة باقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-10" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold mb-6 text-right">إنشاء منتج جديد</DialogTitle>
              </DialogHeader>
              <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
              <DialogFooter className="mt-8">
                <Button onClick={handleAddProduct} disabled={isProcessing} className="h-16 w-full rounded-2xl bg-primary text-white font-bold text-xl shadow-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "نشر المنتج فوراً"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 p-8 border-b">
          <div className="relative max-w-xl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="ابحث عن باقة أو خدمة..." 
              className="pr-12 h-14 rounded-2xl bg-white border-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-right py-6 pr-10">المنتج</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">المخزون</TableHead>
                <TableHead className="text-right">الأكواد</TableHead>
                <TableHead className="text-center w-[150px]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary w-12 h-12" /></TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-24 text-muted-foreground text-lg">لا توجد منتجات حالياً</TableCell></TableRow>
              ) : filteredProducts.map((product: any) => (
                <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-6 pr-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shadow-inner shrink-0">
                         <img src={product.imageUrl} className="object-cover w-full h-full" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground tracking-widest uppercase">{product.id.substring(0,8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-primary px-3 py-1">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary text-xl">${product.price}</TableCell>
                  <TableCell className="font-bold">{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none flex w-fit gap-1 items-center font-bold">
                       <Key size={12} /> {product.shippingCodes?.split('\n').filter(Boolean).length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                       <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-50 text-blue-600" onClick={() => openEditDialog(product)}>
                          <Edit2 size={18} />
                       </Button>
                       <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-50 text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 size={18} />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-10" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-6 text-right">تعديل المنتج</DialogTitle>
          </DialogHeader>
          <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
          <DialogFooter className="mt-8">
            <Button onClick={handleUpdateProduct} disabled={isProcessing} className="h-16 w-full rounded-2xl bg-slate-900 text-white font-bold text-xl shadow-lg hover:bg-primary">
              {isProcessing ? <Loader2 className="animate-spin" /> : "حفظ كافة التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ currentProduct, setCurrentProduct }: { currentProduct: any, setCurrentProduct: any }) {
  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-bold pr-2">اسم الباقة</Label>
          <Input 
            value={currentProduct.name}
            onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold pr-2">الفئة</Label>
          <select 
            value={currentProduct.category}
            onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
            className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold appearance-none cursor-pointer"
          >
            <option>شحن ألعاب</option>
            <option>حسابات ألعاب</option>
            <option>خدمات رقمية</option>
            <option>خدمات تصميم</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-bold pr-2">السعر (USD)</Label>
          <Input 
            type="number"
            value={currentProduct.price}
            onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold pr-2">المخزون المتوفر</Label>
          <Input 
            type="number"
            value={currentProduct.stock}
            onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-bold pr-2">أكواد الشحن (كود في كل سطر)</Label>
        <Textarea 
          value={currentProduct.shippingCodes}
          onChange={(e) => setCurrentProduct({...currentProduct, shippingCodes: e.target.value})}
          placeholder="XMOOD-XXXX-XXXX..."
          className="min-h-[120px] rounded-3xl bg-slate-50 border-none px-6 py-4 font-mono text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="font-bold pr-2">رابط الصورة</Label>
        <Input 
          value={currentProduct.imageUrl}
          onChange={(e) => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
          className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
        />
      </div>
    </div>
  );
}
