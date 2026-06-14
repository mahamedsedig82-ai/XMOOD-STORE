"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Zap, AlertCircle, Edit, CheckCircle, Loader2 } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
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

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);
  const currentRate = config?.siteInfo?.usdRate || 5400;

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
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    runTransaction(db, async (transaction) => {
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

      return selectedCode;
    }).then((code) => {
      setVoucher({ id: orderId, code: code as string });
      toast({ title: "تم الشراء بنجاح", description: "تم استخراج كود التفعيل الخاص بك." });
    }).catch((e: any) => {
      toast({ variant: "destructive", title: "فشل العملية", description: e.message || "حدث خطأ أثناء معالجة الطلب." });
    }).finally(() => {
      setIsProcessing(false);
    });
  };

  return (
    <>
      <Card className={`luxury-card flex flex-col group h-full ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}>
        <CardHeader className="p-0 relative aspect-video bg-muted overflow-hidden">
          <Image 
            src={product.imageUrl || "https://picsum.photos/seed/product/600/400"} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <Badge className={`absolute top-3 right-3 font-black text-[8px] px-3 py-1 rounded-full border-none shadow-2xl uppercase tracking-widest ${isOutOfStock ? 'bg-zinc-600 text-white' : 'bg-primary text-black'}`}>
            {isOutOfStock ? 'نفد المخزون' : 'باقة معتمدة'}
          </Badge>

          {isAdmin && (
            <Button asChild variant="secondary" className="absolute top-3 left-3 h-8 w-8 rounded-lg p-0 glass-morphism z-20">
              <Link href={`/admin/products`}><Edit size={14} className="text-primary" /></Link>
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="mb-4">
            <span className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em] block mb-1">{product.category}</span>
            <CardTitle className="text-lg md:text-xl font-bold group-hover:gold-text transition-colors leading-tight line-clamp-2">
              {product.name}
            </CardTitle>
          </div>
          
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <div className="flex flex-col">
              <span className="font-black text-xl text-primary tracking-tighter">{formatUSD(product.price)}</span>
              <span className="text-[8px] text-muted-foreground font-black uppercase">{formatSDG(product.price, currentRate)}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
               <Zap size={16} className={!isOutOfStock ? "animate-pulse" : ""} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button 
            onClick={handlePurchase}
            disabled={isOutOfStock || isProcessing}
            className={`w-full h-12 rounded-xl transition-all shadow-xl text-[10px] font-bold uppercase tracking-widest ${
              isOutOfStock 
              ? 'bg-muted text-muted-foreground cursor-not-allowed border-none' 
              : 'royal-button'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isOutOfStock ? (
              <><AlertCircle size={14} className="ml-2" /> غير متوفر</>
            ) : (
              <><ShoppingBag size={14} className="ml-2" /> اطلب الآن</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!voucher} onOpenChange={() => setVoucher(null)}>
        <DialogContent className="max-w-md bg-card border-none rounded-[2rem] p-10 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black mb-1">تم تأكيد الطلب</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs font-medium">إليك كود التفعيل المخصص لك، يرجى حفظه فوراً:</DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            <div className="bg-muted/50 p-6 rounded-2xl border-2 border-dashed border-primary/30 text-center">
              <div className="text-2xl font-black tracking-[0.2em] select-all uppercase gold-text">
                {voucher?.code}
              </div>
            </div>
            <Button onClick={() => setVoucher(null)} className="royal-button w-full h-14 text-sm uppercase">العودة للمتجر</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}