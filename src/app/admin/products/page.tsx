
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreVertical, Edit2, Trash2, ImageIcon, Loader2, RefreshCcw, Key, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminProducts() {
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc")), [db]);
  const { data: dbProducts, loading } = useCollection(productsQuery);
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

  const handleAddProduct = () => {
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

    addDoc(collection(db, "products"), productData)
      .then(() => {
        toast({ title: "تمت الإضافة", description: "تم نشر المنتج بنجاح في المتجر" });
        setIsAddDialogOpen(false);
        resetForm();
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: productData
        }));
      })
      .finally(() => setIsProcessing(false));
  };

  const handleUpdateProduct = () => {
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

    updateDoc(productRef, updateData)
      .then(() => {
        toast({ title: "تم التحديث", description: "تم حفظ التغييرات بنجاح" });
        setIsEditDialogOpen(false);
        resetForm();
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      })
      .finally(() => setIsProcessing(false));
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
    const productRef = doc(db, "products", id);
    deleteDoc(productRef)
      .then(() => {
        toast({ title: "تم الحذف", description: "تمت إزالة المنتج من المتجر" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: productRef.path,
          operation: 'delete'
        }));
      });
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

  const handleSeedData = async () => {
    setIsProcessing(true);
    try {
      for (const p of STORE_PRODUCTS) {
        await addDoc(collection(db, "products"), { 
          ...p, 
          createdAt: new Date().toISOString(),
          status: p.stock > 0 ? 'active' : 'out_of_stock',
          shippingCodes: "XMOOD-TEST-CODE-1\nXMOOD-TEST-CODE-2"
        });
      }
      toast({ title: "تمت التهيئة", description: "تمت إضافة المنتجات الافتراضية بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تهيئة البيانات" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = dbProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2 gold-gradient-text">إدارة المخزون والأكواد</h1>
          <p className="text-muted-foreground text-sm">تحكم شامل في الباقات، الأسعار، وأكواد الشحن الفوري لكل عنصر.</p>
        </div>
        
        <div className="flex gap-3">
          {dbProducts.length === 0 && !loading && (
            <Button variant="outline" onClick={handleSeedData} disabled={isProcessing} className="rounded-2xl h-14 px-6 border-dashed border-primary/40 text-primary">
              {isProcessing ? <Loader2 className="animate-spin" /> : <RefreshCcw className="ml-2" />} استيراد المنتجات
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="royal-button h-14 px-8 shadow-2xl shadow-primary/20">
                <Plus size={20} className="ml-2" /> إضافة باقة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right text-3xl font-bold mb-4">إنشاء منتج جديد</DialogTitle>
              </DialogHeader>
              <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
              <DialogFooter className="mt-6">
                <Button onClick={handleAddProduct} disabled={isProcessing} className="h-16 rounded-2xl bg-primary text-white font-bold w-full text-lg">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "نشر المنتج الآن"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="luxury-card rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-8 border-b">
          <div className="relative max-w-xl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="ابحث عن باقة..." 
              className="pr-12 h-14 rounded-2xl bg-white border-slate-200 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-right font-black text-[10px] uppercase py-6 pr-8">المنتج</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">الفئة</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">السعر</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">المخزون</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase">الأكواد</TableHead>
                <TableHead className="text-center w-[120px] font-black text-[10px] uppercase">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary w-10 h-10" /></TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-bold">لا توجد منتجات مطابقة للبحث</TableCell></TableRow>
              ) : filteredProducts.map((product: any) => (
                <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-5 pr-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner">
                         <img src={product.imageUrl} className="object-cover w-full h-full" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-slate-900">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.id.substring(0,8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-lg font-bold text-[10px] bg-primary/5 text-primary border-none px-3 py-1">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary text-lg">${product.price}</TableCell>
                  <TableCell className="font-mono text-sm">{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Key size={14} className="text-amber-500" />
                       <span className="text-xs font-bold text-slate-500">{product.shippingCodes?.split('\n').filter(Boolean).length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl border-none shadow-2xl p-2" dir="rtl">
                        <DropdownMenuItem onClick={() => openEditDialog(product)} className="gap-3 p-3 cursor-pointer rounded-xl font-bold text-sm focus:bg-primary/5 focus:text-primary justify-end">
                          تعديل المنتج والأكواد <Edit2 size={16} />
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="gap-3 p-3 cursor-pointer text-destructive focus:bg-destructive/5 rounded-xl font-bold text-sm justify-end"
                        >
                          حذف نهائي <Trash2 size={16} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-3xl font-bold mb-4">تحديث بيانات المنتج</DialogTitle>
          </DialogHeader>
          <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
          <DialogFooter className="mt-6">
            <Button onClick={handleUpdateProduct} disabled={isProcessing} className="h-16 rounded-2xl bg-slate-900 text-white font-bold w-full text-lg">
              {isProcessing ? <Loader2 className="animate-spin" /> : "حفظ كافة التعديلات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ currentProduct, setCurrentProduct }: { currentProduct: any, setCurrentProduct: any }) {
  return (
    <div className="grid gap-6 py-4">
      <div className="space-y-2 text-right">
        <Label className="font-black text-[10px] uppercase opacity-40 pr-2">اسم الباقة</Label>
        <Input 
          value={currentProduct.name}
          onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
          placeholder="مثال: Free Fire 2180 Diamonds" 
          className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-right">
          <Label className="font-black text-[10px] uppercase opacity-40 pr-2">السعر (USD)</Label>
          <Input 
            type="number" 
            value={currentProduct.price}
            onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
            placeholder="1.20" 
            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" 
          />
        </div>
        <div className="space-y-2 text-right">
          <Label className="font-black text-[10px] uppercase opacity-40 pr-2">الكمية (المخزون)</Label>
          <Input 
            type="number" 
            value={currentProduct.stock}
            onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
            placeholder="100" 
            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" 
          />
        </div>
      </div>
      <div className="space-y-2 text-right">
        <Label className="font-black text-[10px] uppercase opacity-40 pr-2">أكواد الشحن (ضع كل كود في سطر منفصل)</Label>
        <Textarea 
          value={currentProduct.shippingCodes}
          onChange={(e) => setCurrentProduct({...currentProduct, shippingCodes: e.target.value})}
          placeholder="XMOOD-XXXX-XXXX&#10;XMOOD-YYYY-YYYY"
          className="min-h-[150px] rounded-2xl bg-slate-50 border-none px-6 py-4 font-mono text-xs leading-relaxed"
        />
      </div>
      <div className="space-y-2 text-right">
        <Label className="font-black text-[10px] uppercase opacity-40 pr-2">تصنيف الخدمة</Label>
        <select 
          value={currentProduct.category}
          onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
          className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
        >
          <option value="شحن ألعاب">شحن ألعاب</option>
          <option value="حسابات ألعاب">حسابات ألعاب</option>
          <option value="خدمات رقمية">خدمات رقمية</option>
          <option value="خدمات تصميم">خدمات تصميم</option>
          <option value="وساطة وخدمات خاصة">وساطة وخدمات خاصة</option>
        </select>
      </div>
      <div className="space-y-2 text-right">
        <Label className="font-black text-[10px] uppercase opacity-40 pr-2">رابط صورة المنتج (URL)</Label>
        <div className="relative">
          <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <Input 
            value={currentProduct.imageUrl}
            onChange={(e) => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
            placeholder="https://..." 
            className="pr-14 h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
          />
        </div>
      </div>
    </div>
  );
}
