"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, collection, query, where, serverTimestamp, getDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Truck, CheckCircle2, Wallet, Zap, PackageX } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { profile, user, isVerified } = useUser();
  const db = useFirestore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email && !deliveryEmail) setDeliveryEmail(user.email);
  }, [user, deliveryEmail]);

  useEffect(() => {
    const checkStock = async () => {
      if (!db || items.length === 0) return;
      const unavailable: string[] = [];
      for (const item of items) {
        const pSnap = await getDoc(doc(db, "products", item.id));
        if (pSnap.exists()) {
          const data = pSnap.data();
          const codes = (data.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
          if (codes.length < item.quantity) unavailable.push(item.name);
        }
      }
      setOutOfStockItems(unavailable);
    };
    checkStock();
  }, [db, items]);

  const shippingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "shipping_methods"), where("isActive", "==", true));
  }, [db]);
  const { data: shippingMethods } = useCollection(shippingQuery);

  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingMethods[0]);
    }
  }, [shippingMethods, selectedShipping]);

  const finalTotal = total + (selectedShipping?.extraFee || 0);
  const walletBalance = profile?.walletBalance || 0;
  const hasEnoughBalance = walletBalance >= finalTotal;

  const handleCompleteOrder = async () => {
    if (!user || !profile || !db || !isVerified) return;
    if (!selectedShipping || !hasEnoughBalance || outOfStockItems.length > 0) return;

    setIsProcessing(true);
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "الملف غير موجود";

        const currentBalance = userSnap.data().walletBalance || 0;
        if (currentBalance < finalTotal) throw "الرصيد لا يكفي";

        const allDeliveredCodes: string[] = [];

        for (const item of items) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await transaction.get(productRef);
          const pData = productSnap.data();
          const codes = (pData?.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
          
          if (codes.length < item.quantity) throw `نفد مخزون ${item.name}`;

          const extracted = codes.slice(0, item.quantity);
          allDeliveredCodes.push(...extracted);
          const remaining = codes.slice(item.quantity).join('\n');
          
          transaction.update(productRef, {
            shippingCodes: remaining,
            stock: Math.max(0, (pData?.stock || 0) - item.quantity),
            updatedAt: serverTimestamp()
          });
        }

        transaction.update(userRef, { walletBalance: currentBalance - finalTotal });

        transaction.set(doc(db, "orders", orderId), {
          id: orderId,
          userId: user.uid,
          userEmail: user.email,
          userName: profile.displayName,
          items,
          totalAmount: finalTotal,
          shippingMethodName: selectedShipping.name,
          deliveryEmail,
          status: 'completed',
          shippingCodeSent: allDeliveredCodes.join(' | '),
          createdAt: new Date().toISOString()
        });
      });

      clearCart();
      setSuccessOrderId(orderId);
      toast({ title: "تم الدفع بنجاح" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل العملية", description: String(e) });
    } finally {
      setIsProcessing(false);
    }
  };

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
       <Card className="max-w-md w-full p-10 text-center luxury-card">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">تمت العملية بنجاح</h2>
          <Button asChild className="royal-button w-full h-14"><Link href={`/orders/${successOrderId}`}>عرض القسيمة</Link></Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-32 max-w-5xl">
        <h1 className="text-4xl font-bold mb-12">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              {outOfStockItems.length > 0 && (
                 <div className="p-6 bg-red-500/10 border-2 border-red-500/20 rounded-2xl flex items-start gap-4">
                    <PackageX size={32} className="text-red-500 shrink-0" />
                    <div>
                       <h3 className="font-bold text-red-500">بعض المنتجات نفدت من المخزون</h3>
                       <p className="text-sm opacity-70">نفد: {outOfStockItems.join(", ")}</p>
                    </div>
                 </div>
              )}

              <section className="space-y-6">
                 <h3 className="text-xl font-bold flex items-center gap-2"><Truck size={20} className="text-primary" /> وسيلة التسليم</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shippingMethods?.map((m: any) => (
                      <div key={m.id} onClick={() => setSelectedShipping(m)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                         <h4 className="font-bold">{m.name}</h4>
                         <p className="text-xs text-muted-foreground mt-2">رسوم: +{formatUSD(m.extraFee)}</p>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-xl font-bold flex items-center gap-2">بريد التسليم</h3>
                 <Input value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)} placeholder="البريد الإلكتروني..." />
              </section>
           </div>

           <aside>
              <Card className="luxury-card p-8 bg-muted/10 sticky top-32">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap size={18} className="text-primary" /> ملخص الحساب</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end"><span className="text-sm">الإجمالي</span><span className="text-3xl font-bold text-primary">{formatUSD(finalTotal)}</span></div>
                    <div className="p-4 bg-background rounded-xl border flex items-center gap-4">
                       <Wallet className="text-primary" />
                       <div><p className="text-[10px] text-muted-foreground uppercase">رصيدك</p><p className={`font-bold ${hasEnoughBalance ? '' : 'text-red-500'}`}>{formatUSD(walletBalance)}</p></div>
                    </div>
                    <Button onClick={handleCompleteOrder} disabled={isProcessing || !items.length || !selectedShipping || !hasEnoughBalance || outOfStockItems.length > 0 || !isVerified} className="royal-button w-full h-16 text-lg">
                      {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد الدفع"}
                    </Button>
                 </div>
              </Card>
           </aside>
        </div>
      </div>
    </main>
  );
}