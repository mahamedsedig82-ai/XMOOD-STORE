"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Zap, AlertCircle, Edit, CheckCircle, Loader2, Lock } from "lucide-react";
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
      <Card className={`luxury-card overflow-hidden group flex flex-col ${isOutOfStock ? 'opacity-70 grayscale-[0.5]' : ''}`}>
        <CardHeader className="p-0 relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <Image 
            src={product.imageUrl || "https://picsum.photos/seed/product/400/225"} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
          {isAdmin && (
            <Button asChild variant="secondary" className="absolute top-4 left-4 h-10 w-10 rounded-2xl p-0 shadow-2xl z-20 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-border/50">
              <Link href={`/admin/products`}>
                <Edit size={18} className="text-primary" />
              </Link>
            </Button>
          )}
          <Badge className={`absolute top-4 right-4 font-black text-[10px] px-4 py-1.5 rounded-full border-none shadow-2xl uppercase tracking-widest ${isOutOfStock ? 'bg-zinc-600 text-white' : 'bg-primary text-black'}`}>
            {isOutOfStock ? 'نفد المخزون' : 'باقة معتمدة'}
          </Badge>
        </CardHeader>
        
        <CardContent className="p-8 text-right flex-1 flex flex-col">
          <div className="flex flex-col gap-2 mb-6">
            <span className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.3em]">{product.category}</span>
            <CardTitle className="text-2xl font-bold leading-tight group-hover:gold-text transition-colors">
              {product.name}
            </CardTitle>
          </div>
          
          <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
            <div className="flex flex-col">
              <span className="font-black text-3xl text-primary tracking-tighter">{formatUSD(product.price)}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{formatSDG(product.price)}</span>
            </div>
            <div className="bg-primary/5 text-primary p-4 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all border border-primary/10">
               {!isVerified && user ? <Lock size={22} /> : <Zap size={24} className="animate-pulse" />}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0">
          <Button 
            onClick={handlePurchase}
            disabled={isOutOfStock || isProcessing}
            className={`w-full h-16 rounded-2xl transition-all shadow-xl ${
              isOutOfStock 
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed border-none' 
              : 'royal-button'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : !isVerified && user ? (
              <><Lock size={20} className="ml-3" /> تفعيل الحساب مطلوب</>
            ) : isOutOfStock ? (
              <><AlertCircle size={20} className="ml-3" /> الباقة غير متوفرة</>
            ) : (
              <><ShoppingBag size={20} className="ml-3" /> شراء الباقة الآن</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!voucher} onOpenChange={() => setVoucher(null)}>
        <DialogContent className="max-w-md bg-card border-none rounded-[3rem] p-10 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <DialogTitle className="text-3xl font-black text-center mb-2">تمت العملية بنجاح</DialogTitle>
            <DialogDescription className="text-center text-zinc-500 font-medium">إليك كود تفعيل الخدمة الخاص بك، يرجى حفظه فوراً:</DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-8">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-[2rem] border-2 border-dashed border-primary/40 text-center shadow-inner">
              <div className="text-3xl font-black text-foreground tracking-[0.2em] select-all uppercase">
                {voucher?.code}
              </div>
            </div>
            <Button onClick={() => setVoucher(null)} className="w-full h-16 rounded-2xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black text-lg shadow-xl uppercase tracking-widest">إتمام المهمة</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}