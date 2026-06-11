
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreVertical, Edit2, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold mb-1">إدارة المنتجات والمخزون</h1>
          <p className="text-muted-foreground text-sm">أضف باقات شحن جديدة أو عدل الأسعار والمخزون الحالي.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl gap-2 h-14 px-8 shadow-lg shadow-primary/20 font-bold">
              <Plus size={20} /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right text-2xl font-bold">بيانات المنتج الجديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2 text-right">
                <Label className="font-bold text-xs uppercase opacity-60 pr-2">اسم المنتج / الباقة</Label>
                <Input placeholder="مثال: Free Fire 100 Diamonds" className="h-12 rounded-2xl bg-slate-50 border-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 text-right">
                  <Label className="font-bold text-xs uppercase opacity-60 pr-2">السعر (USD)</Label>
                  <Input type="number" placeholder="1.20" className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
                <div className="grid gap-2 text-right">
                  <Label className="font-bold text-xs uppercase opacity-60 pr-2">الكمية بالمخزون</Label>
                  <Input type="number" placeholder="100" className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
              </div>
              <div className="grid gap-2 text-right">
                <Label className="font-bold text-xs uppercase opacity-60 pr-2">رابط الصورة</Label>
                <div className="relative">
                  <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input placeholder="https://..." className="pr-12 h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-start gap-2">
              <Button type="submit" className="h-14 rounded-2xl bg-primary text-white font-bold w-full">حفظ المنتج</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-6 border-b">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث باسم المنتج أو الفئة..." 
              className="pr-10 h-12 rounded-2xl bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-right font-bold text-xs uppercase py-4">المنتج</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">الفئة</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">السعر</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">المخزون</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase">الحالة</TableHead>
                <TableHead className="text-center w-[100px] font-bold text-xs uppercase">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STORE_PRODUCTS.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden relative shrink-0">
                         {product.imageUrl ? (
                           <img src={product.imageUrl} className="object-cover w-full h-full" alt="" />
                         ) : (
                           <div className="flex items-center justify-center h-full text-slate-300"><Package size={20} /></div>
                         )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{product.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-md font-bold text-[10px] bg-primary/5 text-primary border-none">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary">${product.price}</TableCell>
                  <TableCell className="font-mono">{product.stock}</TableCell>
                  <TableCell>
                    <Badge className={`${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border-none rounded-full font-bold text-[10px]`}>
                      {product.stock > 0 ? 'نشط' : 'نافذ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-2xl border-none shadow-2xl p-2">
                        <DropdownMenuItem className="gap-3 p-3 cursor-pointer rounded-xl font-bold text-xs focus:bg-slate-50">
                          <Edit2 size={14} className="text-blue-600" /> تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-3 p-3 cursor-pointer text-destructive focus:bg-destructive/5 rounded-xl font-bold text-xs">
                          <Trash2 size={14} /> حذف المنتج
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
    </div>
  );
}
