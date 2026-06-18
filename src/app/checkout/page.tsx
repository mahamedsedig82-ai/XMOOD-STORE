"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, runTransaction, collection, query, where, serverTimestamp, getDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Truck, CheckCircle2, Wallet, Mail, Zap, ArrowLeft, PackageX, ShieldAlert } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * 🛡️ صفحة الدفع والاستحواذ السيادي.
 * تم تحصينها بدرع فحص المخزون ومنع التجاوزات المالية.
 */
export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { profile, user, loading: userLoading, isVerified } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    if (user?.email && !deliveryEmail) setDeliveryEmail(user.email);
  }, [user, deliveryEmail]);

  // 🛡️ درع فحص المخزون الفوري
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
  const isEverythingInStock = outOfStockItems.length === 0;

  const handleCompleteOrder = async () => {
    if (!user || !profile || !db || !isVerified) return;
    if (!selectedShipping || !hasEnoughBalance || !isEverythingInStock) return;

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
      toast({ title: config?.cartLabels?.successMsg || "تم الاستحواذ بنجاح!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل العملية", description: String(e) });
    } finally {
      setIsProcessing(false);
    }
  };

  if (user && !isVerified) {
     return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
           <Navbar />
           <Card className="max-w-lg w-full p-16 text-center luxury-card border-none bg-card shadow-2xl">
              <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-8" />
              <h2 className="text-3xl font-black mb-4">التوثيق مطلوب</h2>
              <Button asChild className="royal-button w-full h-16"><Link href="/verify-email?waiting=true">تفعيل الحساب الآن</Link></Button>
           </Card>
        </main>
     );
  }

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
       <Card className="max-w-lg w-full p-8 md:p-16 text-center luxury-card border-none bg-card shadow-2xl">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-black gold-text mb-6">تم التسليم!</h2>
          <Button asChild className="royal-button w-full h-16"><Link href={`/orders/${successOrderId}`}>فتح القسيمة <ArrowLeft className="mr-3" /></Link></Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-32 max-w-7xl">
        <header className="mb-12 border-r-8 border-primary pr-10 text-right">
           <h1 className="text-4xl md:text-7xl font-headline font-black gold-text leading-tight">{config?.cartLabels?.checkoutTitle || "تأكيد الاستحواذ"}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              {outOfStockItems.length > 0 && (
                 <div className="p-8 bg-red-500/10 border-2 border-red-500/20 rounded-[2.5rem] flex items-start gap-6">
                    <PackageX size={48} className="text-red-500 shrink-0" />
                    <div>
                       <h3 className="text-2xl font-black text-red-500 mb-2">توقف إجباري: نفاد المخزون</h3>
                       <p className="text-sm font-bold text-zinc-400">المنتجات التالية نفدت: {outOfStockItems.join(", ")}</p>
                    </div>
                 </div>
              )}

              <section className="space-y-8">
                 <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4"><Truck size={24} className="text-primary" /> مسار التسليم</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shippingMethods?.map((m: any) => (
                      <div key={m.id} onClick={() => setSelectedShipping(m)} className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                         <h4 className="font-black text-2xl">{m.name}</h4>
                         <div className="flex justify-between items-center pt-6 border-t mt-4">
                            <span className="font-black text-2xl text-primary">+{formatUSD(m.extraFee)}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-8">
                 <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4"><Mail size={24} className="text-primary" /> بروتوكول الاستقبال</h3>
                 <Input value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)} className="h-16 rounded-2xl" placeholder="name@example.com" />
              </section>
           </div>

           <aside>
              <Card className="luxury-card p-8 md:p-12 bg-primary/5 border-primary/20 sticky top-32">
                 <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><Zap size={20} className="text-primary animate-pulse" /> ملخص الحساب</h3>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end"><span className="font-black text-xs text-primary uppercase">الإجمالي النهائي</span><span className="text-4xl md:text-6xl font-black gold-text tracking-tighter">{formatUSD(finalTotal)}</span></div>
                    <div className="p-8 bg-zinc-950 rounded-[2.5rem] mt-10 border-2 border-primary/30">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Wallet size={28} /></div>
                          <div><p className="text-[9px] text-zinc-500 uppercase font-black">رصيدك</p><p className={`font-black text-2xl ${hasEnoughBalance ? 'text-white' : 'text-red-500'}`}>{formatUSD(walletBalance)}</p></div>
                       </div>
                    </div>
                    <Button onClick={handleCompleteOrder} disabled={isProcessing || !items.length || !selectedShipping || !hasEnoughBalance || outOfStockItems.length > 0 || !isVerified} className="royal-button w-full h-24 text-2xl mt-10">
                      {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد الدفع السيادي"}
                    </Button>
                 </div>
              </Card>
           </aside>
        </div>
      </div>
    </main>
  );
}
