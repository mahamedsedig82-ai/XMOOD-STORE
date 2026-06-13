"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Zap, AlertCircle, Edit, CheckCircle, Download, Share2, Loader2, Lock } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";
import { useUser, useFirestore } from "@/firebase";
import { doc, runTransaction, collection } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { profile, user, isVerified } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucher, setVoucher] = useState<{ id: string, code: string } | null>(null);

  const isOutOfStock = product.status === 'out_of_stock' || product.stock <= 0;
  const isAdmin = ['owner', 'admin'].includes(profile?.role || '');

  const handlePurchase = async () => {
    if (!user || !profile || !db) {
      toast({ variant: "destructive", title: "تنبيه", description: "يجب تسجيل الدخول أولاً للمتابعة." });
      return;
    }

    if (!isVerified) {
      toast({ variant: "destructive", title: "حساب غير مفعل", description: "يرجى تفعيل البريد الإلكتروني لتتمكن من الشراء." });
      return;
    }

    if (profile.walletBalance < product.price) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "رصيدك الحالي لا يغطي قيمة هذه الباقة." });
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const productRef = doc(db, "products", product.id);
        
        const userSnap = await transaction.get(userRef);
        const prodSnap = await transaction.get(productRef);
        
        if (!userSnap.exists() || !prodSnap.exists()) throw new Error("بيانات غير متوفرة");
        
        const currentProdData = prodSnap.data();
        const codes = (currentProdData.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
        
        if (codes.length === 0 && currentProdData.stock > 0) {
          throw new Error("عذراً، لا توجد أكواد متوفرة حالياً لهذه الباقة.");
        }

        const selectedCode = codes[0] || "AUTO-GEN-" + orderId;
        const remainingCodes = codes.slice(1).join('\n');
        
        const newBalance = (userSnap.data().walletBalance || 0) - product.price;
        const newStock = Math.max(0, (currentProdData.stock || 0) - 1);

        transaction.update(userRef, { walletBalance: newBalance });
        transaction.update(productRef, { 
          stock: newStock,
          shippingCodes: remainingCodes,
          status: newStock <= 0 ? 'out_of_stock' : currentProdData.status
        });

        transaction.set(doc(db, "orders", orderId), {
          userId: user.uid,
          userEmail: user.email,
          productId: product.id,
          productName: product.name,
          amount: product.price,
          status: 'completed',
          shippingCodeSent: selectedCode,
          createdAt: new Date().toISOString()
        });

        transaction.set(doc(collection(db, "users", user.uid, "transactions")), {
          type: 'purchase',
          amount: product.price,
          description: `شراء باقة: ${product.name}`,
          createdAt: new Date().toISOString()
        });

        transaction.set(doc(collection(db, "transactions")), {
          userId: user.uid,
          amount: -product.price,
          type: 'purchase',
          description: `عملية شراء: ${product.name} بواسطة ${profile.displayName}`,
          createdAt: new Date().toISOString()
        });

        return selectedCode;
      }).then((code) => {
        setVoucher({ id: orderId, code: code as string });
        toast({ title: "تم الشراء بنجاح", description: "تم استخراج كود التفعيل الخاص بك." });
      });

    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل العملية", description: e.message || "حدث خطأ أثناء معالجة الطلب." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className={`group overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col ${isOutOfStock ? 'opacity-70' : ''}`}>
        <CardHeader className="p-0 relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image 
            src={product.imageUrl || "https://picsum.photos/seed/product/400/225"} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {isAdmin && (
            <Button asChild variant="secondary" className="absolute top-3 left-3 h-8 w-8 rounded-lg p-0 shadow-md z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
              <Link href={`/admin/products`}>
                <Edit size={14} className="text-primary" />
              </Link>
            </Button>
          )}
          <Badge className={`absolute top-3 right-3 font-bold text-[10px] px-3 py-1 rounded-full border-none shadow-md ${isOutOfStock ? 'bg-zinc-500 text-white' : 'bg-primary text-white'}`}>
            {isOutOfStock ? 'نفد المخزون' : 'باقة معتمدة'}
          </Badge>
        </CardHeader>
        
        <CardContent className="p-6 text-right flex-1 flex flex-col">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{product.category}</span>
            <CardTitle className="text-lg font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
          </div>
          
          <div className="mt-auto pt-4 flex items-center justify-between border-t">
            <div className="flex flex-col">
              <span className="font-bold text-xl text-primary">{formatUSD(product.price)}</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase">{formatSDG(product.price)}</span>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
               {!isVerified && user ? <Lock size={16} /> : <Zap size={18} />}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button 
            onClick={handlePurchase}
            disabled={isOutOfStock || isProcessing}
            className={`w-full font-bold h-12 rounded-xl transition-all ${
              isOutOfStock 
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
              : 'royal-button'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : !isVerified && user ? (
              <><Lock size={16} className="ml-2" /> فعل حسابك للشراء</>
            ) : isOutOfStock ? (
              <><AlertCircle size={16} className="ml-2" /> غير متوفر</>
            ) : (
              <><ShoppingBag size={16} className="ml-2" /> شراء الآن</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!voucher} onOpenChange={() => setVoucher(null)}>
        <DialogContent className="max-w-md bg-card border-none rounded-2xl p-8 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">تمت العملية بنجاح</DialogTitle>
            <DialogDescription className="text-center">إليك كود تفعيل الخدمة الخاص بك:</DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl border border-dashed border-primary/40 text-center">
              <div className="text-2xl font-bold text-foreground tracking-widest select-all uppercase">
                {voucher?.code}
              </div>
            </div>
            <Button onClick={() => setVoucher(null)} className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold">إغلاق</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
