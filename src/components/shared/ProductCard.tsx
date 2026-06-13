
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
      toast({ variant: "destructive", title: "حساب غير مفعل", description: "يرجى تفعيل بريدك الإلكتروني لتتمكن من الشراء." });
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
        toast({ title: "تم الشراء بنجاح", description: "تم استخراج قسيمة التفعيل الخاصة بك." });
      });

    } catch (e: any) {
      console.error(e);
      toast({ variant: "destructive", title: "فشل العملية", description: e.message || "حدث خطأ أثناء معالجة الطلب." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className={`group overflow-hidden border-none bg-zinc-950 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-[2.5rem] flex flex-col border border-white/5 ${isOutOfStock ? 'opacity-75' : ''}`}>
        <CardHeader className="p-0 relative aspect-square overflow-hidden bg-zinc-900">
          <Image 
            src={product.imageUrl} 
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 ${!isOutOfStock ? 'group-hover:scale-110' : ''}`}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
          
          {isAdmin && (
            <Button asChild variant="secondary" className="absolute top-5 left-5 h-12 w-12 rounded-2xl p-0 shadow-2xl z-20 hover:scale-110 transition-transform bg-black/60 border border-white/10 backdrop-blur-md">
              <Link href={`/admin/products`}>
                <Edit size={20} className="text-primary" />
              </Link>
            </Button>
          )}

          <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
            <Badge className={`font-black text-[10px] px-5 py-1.5 rounded-full border-none shadow-2xl ${isOutOfStock ? 'bg-zinc-800 text-zinc-500' : 'bg-primary text-black'}`}>
              {isOutOfStock ? 'نفد المخزون' : 'باقة حصرية'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 text-right flex-1 flex flex-col">
          <div className="flex flex-col gap-2 mb-6">
            <span className="text-[10px] uppercase font-black text-primary/60 tracking-[0.3em]">{product.category}</span>
            <CardTitle className="text-2xl font-headline font-bold line-clamp-2 leading-tight group-hover:gold-text transition-all min-h-[4rem]">
              {product.name}
            </CardTitle>
          </div>
          
          <div className="mt-auto pt-6 flex flex-row-reverse items-center justify-between border-t border-white/5">
            <div className="flex flex-col items-end">
              <span className="font-black text-3xl text-primary tracking-tighter">{formatUSD(product.price)}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{formatSDG(product.price)}</span>
            </div>
            <div className="bg-primary/5 text-primary p-3.5 rounded-2xl border border-primary/10 group-hover:bg-primary group-hover:text-black transition-all">
               {!isVerified && user ? <Lock size={20} className="text-red-500" /> : <Zap size={24} />}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0">
          <Button 
            onClick={handlePurchase}
            disabled={isOutOfStock || isProcessing}
            className={`w-full font-black h-16 rounded-2xl shadow-2xl transition-all text-lg ${
              isOutOfStock 
              ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5' 
              : 'royal-button'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : !isVerified && user ? (
              <><Lock size={20} className="ml-3" /> فعل بريدك للشراء</>
            ) : isOutOfStock ? (
              <><AlertCircle size={20} className="ml-3" /> غير متوفر</>
            ) : (
              <><ShoppingBag size={20} className="ml-3" /> شراء الآن</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!voucher} onOpenChange={() => setVoucher(null)}>
        <DialogContent className="max-w-md bg-zinc-950 border-primary/30 rounded-[3rem] p-10 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          <DialogHeader className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <CheckCircle size={48} className="text-primary" />
            </div>
            <DialogTitle className="text-3xl font-headline font-bold gold-text text-center">قسيمة التفعيل</DialogTitle>
          </DialogHeader>

          <div className="mt-8 space-y-6 relative">
            <div className="bg-white/5 p-8 rounded-3xl border border-dashed border-primary/40 text-center">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4">كود التفعيل / المفتاح</p>
              <div className="text-3xl font-black text-white tracking-widest bg-black/60 p-4 rounded-xl border border-white/5 shadow-inner select-all">
                {voucher?.code}
              </div>
            </div>
            <Button onClick={() => setVoucher(null)} className="w-full h-14 rounded-2xl bg-white text-black font-black">إغلاق</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
