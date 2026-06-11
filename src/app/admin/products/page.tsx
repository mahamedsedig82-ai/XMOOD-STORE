"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, Loader2, Key, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirestore } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

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
    if (!currentProduct.name || !currentProduct.price) return;
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
      toast({ title: "تم الإضافة بنجاح" });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ في الصلاحيات" });
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
      toast({ title: "تم التحديث بنجاح" });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    deleteDoc(doc(db, "products", id));
    toast({ title: "تم الحذف" });
  };

  const resetForm = () => {
    setCurrentProduct({
      id: "", name: "", price: "", stock: "100", category: "شحن ألعاب",
      imageUrl: "https://picsum.photos/seed/ff-main/800/600", description: "", shippingCodes: ""
    });
  };

  const openEditDialog = (product: any) => {
    setCurrentProduct({
      id: product.id, name: product.name, price: product.price.toString(),
      stock: product.stock.toString(), category: product.category,
      imageUrl: product.imageUrl, description: product.description || "",
      shippingCodes: product.shippingCodes || ""
    });
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">المستودع الرقمي</h1>
          <p className="text-muted-foreground mt-2">إدارة الباقات والمخزون وأكواد الشحن الفوري.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 bg-slate-950 text-white font-bold rounded-2xl">
              <Plus size={20} className="ml-2" /> إضافة باقة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-10" dir="rtl">
            <DialogHeader><DialogTitle className="text-2xl font-bold mb-6">إنشاء منتج جديد</DialogTitle></DialogHeader>
            <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
            <DialogFooter className="mt-8">
              <Button onClick={handleAddProduct} disabled={isProcessing} className="h-14 w-full rounded-xl bg-primary text-white font-bold">
                {isProcessing ? <Loader2 className="animate-spin" /> : "نشر المنتج فوراً"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 p-8">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث عن باقة..." 
              className="pr-10 h-12 rounded-xl border-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
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
              ) : filteredProducts.map((product: any) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50 border-b last:border-0">
                  <TableCell className="py-6 pr-10">
                    <div className="flex items-center gap-4">
                      <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <span className="font-bold">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary">${product.price}</TableCell>
                  <TableCell className="font-bold">{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-600 font-bold">
                       <Key size={12} className="ml-1" /> {product.shippingCodes?.split('\n').filter(Boolean).length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                       <Button size="icon" variant="ghost" className="h-10 w-10 text-blue-600" onClick={() => openEditDialog(product)}>
                          <Edit2 size={16} />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-10 w-10 text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 size={16} />
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
          <DialogHeader><DialogTitle className="text-2xl font-bold mb-6">تعديل المنتج</DialogTitle></DialogHeader>
          <ProductForm currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
          <DialogFooter className="mt-8">
            <Button onClick={handleUpdateProduct} disabled={isProcessing} className="h-14 w-full rounded-xl bg-slate-950 text-white font-bold">
              {isProcessing ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ currentProduct, setCurrentProduct }: { currentProduct: any, setCurrentProduct: any }) {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اسم الباقة</Label>
          <Input value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} className="h-12 bg-slate-50" />
        </div>
        <div className="space-y-2">
          <Label>الفئة</Label>
          <select value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-bold">
            <option>شحن ألعاب</option>
            <option>حسابات ألعاب</option>
            <option>خدمات رقمية</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>السعر (USD)</Label>
          <Input type="number" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})} className="h-12 bg-slate-50" />
        </div>
        <div className="space-y-2">
          <Label>المخزون</Label>
          <Input type="number" value={currentProduct.stock} onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})} className="h-12 bg-slate-50" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>أكواد الشحن (كود في كل سطر)</Label>
        <Textarea value={currentProduct.shippingCodes} onChange={(e) => setCurrentProduct({...currentProduct, shippingCodes: e.target.value})} className="min-h-[120px] bg-slate-50" />
      </div>
      <div className="space-y-2">
        <Label>رابط الصورة</Label>
        <Input value={currentProduct.imageUrl} onChange={(e) => setCurrentProduct({...currentProduct, imageUrl: e.target.value})} className="h-12 bg-slate-50" />
      </div>
    </div>
  );
}
