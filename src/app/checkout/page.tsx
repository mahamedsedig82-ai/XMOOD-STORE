
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, runTransaction, collection, query, where, serverTimestamp } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Truck, CheckCircle2, Wallet, Mail, Zap, ArrowLeft, AlertCircle } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { profile, user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    if (user?.email && !deliveryEmail) setDeliveryEmail(user.email);
  }, [user, deliveryEmail]);

  const shippingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "shipping_methods"), where("isActive", "==", true));
  }, [db]);
  const { data: shippingMethods, loading: shippingLoading } = useCollection(shippingQuery);

  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingMethods[0]);
    }
  }, [shippingMethods, selectedShipping]);

  const finalTotal = total + (selectedShipping?.extraFee || 0);
  const walletBalance = profile?.walletBalance || 0;
  const hasEnoughBalance = walletBalance >= finalTotal;

  const canPay = items.length > 0 && 
                 !!selectedShipping && 
                 hasEnoughBalance && 
                 !isProcessing && 
                 !userLoading && 
                 deliveryEmail.includes("@");

  const handleCompleteOrder = async () => {
    if (!user || !profile || !db) return;
    if (!selectedShipping) return toast({ variant: "destructive", title: "يرجى اختيار وسيلة تسليم" });
    if (!hasEnoughBalance) return toast({ variant: "destructive", title: "الرصيد غير كافٍ" });

    setIsProcessing(true);
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "Profile missing";

        const currentBalance = userSnap.data().walletBalance || 0;
        if (currentBalance < finalTotal) throw "Insufficient balance";

        const allDeliveredCodes: string[] = [];
        let finalStatus: 'completed' | 'pending_stock' = 'completed';

        for (const item of items) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) throw `Product ${item.name} not found`;
          
          const pData = productSnap.data();
          const codes = (pData.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
          
          if (codes.length < item.quantity) {
             finalStatus = 'pending_stock';
             transaction.update(productRef, { 
               stock: Math.max(0, (pData.stock || 0) - item.quantity),
               updatedAt: serverTimestamp() 
             });
          } else {
             const extracted = codes.slice(0, item.quantity);
             allDeliveredCodes.push(...extracted);
             const remaining = codes.slice(item.quantity).join('\n');
             transaction.update(productRef, {
               shippingCodes: remaining,
               stock: Math.max(0, (pData.stock || 0) - item.quantity),
               updatedAt: serverTimestamp()
             });
          }
        }

        const balanceAfter = currentBalance - finalTotal;
        transaction.update(userRef, { walletBalance: balanceAfter });

        transaction.set(doc(db, "orders", orderId), {
          id: orderId,
          userId: user.uid,
          userEmail: user.email,
          userName: profile.displayName,
          items,
          totalAmount: finalTotal,
          shippingMethodName: selectedShipping.name,
          deliveryEmail,
          status: finalStatus,
          shippingCodeSent: allDeliveredCodes.join(' | '),
          balanceBefore: currentBalance,
          balanceAfter: balanceAfter,
          createdAt: new Date().toISOString()
        });

        const transData = {
          userId: user.uid,
          amount: finalTotal,
          type: 'purchase',
          description: `شراء أصول رقمية [${items.length}]`,
          orderId,
          createdAt: new Date().toISOString()
        };
        transaction.set(doc(collection(db, "users", user.uid, "transactions")), transData);
        transaction.set(doc(collection(db, "transactions")), transData);
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

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
       <Card className="max-w-lg w-full p-8 md:p-16 text-center luxury-card border-none bg-card shadow-2xl">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-8 animate-bounce" />
          <h2 className="text-3xl md:text-5xl font-black gold-text mb-6">{config?.cartLabels?.successMsg || "تم التسليم بنجاح!"}</h2>
          <p className="text-muted-foreground mb-10">المرجع: <span className="font-mono text-primary font-bold">{successOrderId}</span></p>
          <Button asChild className="royal-button w-full h-16 text-lg">
             <Link href={`/orders/${successOrderId}`}>فتح القسيمة <ArrowLeft className="mr-2" /></Link>
          </Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-32 max-w-7xl">
        <header className="mb-12 md:mb-24 border-r-8 border-primary pr-10 text-right">
           <h1 className="text-4xl md:text-7xl font-headline font-black gold-text">{config?.cartLabels?.checkoutTitle || "تأكيد الاستحواذ"}</h1>
           <p className="text-muted-foreground uppercase tracking-widest text-[10px] md:text-sm mt-2">Automated Settlement Protocol</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              <section className="space-y-8">
                 <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4"><Truck size={24} className="text-primary" /> مسار التسليم</h3>
                 {shippingLoading ? (
                   <Loader2 className="animate-spin text-primary" />
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {shippingMethods?.map((m: any) => (
                        <div key={m.id} onClick={() => setSelectedShipping(m)} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-border bg-card'}`}>
                           <h4 className="font-black text-xl mb-1">{m.name}</h4>
                           <p className="text-xs text-muted-foreground mb-4">{m.description}</p>
                           <div className="flex justify-between items-center pt-4 border-t">
                              <span className="font-black text-primary">+{formatUSD(m.extraFee)}</span>
                              <Badge variant="outline" className="text-[8px] uppercase">{m.deliveryTime}</Badge>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </section>

              <section className="space-y-8">
                 <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4"><Mail size={24} className="text-primary" /> بروتوكول الاستقبال</h3>
                 <Card className="luxury-card p-6 md:p-10 border-none bg-card/60 space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-primary pr-3">بريد التسليم الرقمي</Label>
                       <Input value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)} className="h-16 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-primary/20 px-6 font-bold text-lg" placeholder="name@example.com" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-primary pr-3">ملاحظات إضافية</Label>
                       <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="rounded-2xl bg-white dark:bg-zinc-950 border-2 border-primary/20 p-6 font-bold" placeholder="أي تعليمات خاصة؟" />
                    </div>
                 </Card>
              </section>
           </div>

           <aside>
              <Card className="luxury-card p-8 md:p-12 bg-primary/5 border-primary/20 sticky top-32">
                 <h3 className="text-2xl font-black mb-8 border-b pb-4 flex items-center gap-3"><Zap size={20} className="text-primary" /> ملخص الحساب</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between text-muted-foreground font-black text-xs uppercase"><span>قيمة الأصول</span><span>{formatUSD(total)}</span></div>
                    <div className="flex justify-between text-muted-foreground font-black text-xs uppercase"><span>لوجستيات الشحن</span><span>{formatUSD(selectedShipping?.extraFee || 0)}</span></div>
                    <div className="h-px bg-primary/10 my-4" />
                    <div className="flex justify-between items-end"><span className="font-black text-xs text-primary">الإجمالي</span><span className="text-4xl md:text-6xl font-black gold-text tracking-tighter">{formatUSD(finalTotal)}</span></div>
                    
                    <div className="p-6 bg-zinc-900 rounded-[2rem] text-white mt-8 border border-white/5">
                       <div className="flex items-center gap-4">
                          <Wallet size={24} className="text-primary" />
                          <div><p className="text-[8px] text-zinc-500 uppercase font-black">رصيدك</p><p className={`font-black text-xl ${hasEnoughBalance ? 'text-white' : 'text-red-500'}`}>{formatUSD(walletBalance)}</p></div>
                       </div>
                    </div>

                    <Button onClick={handleCompleteOrder} disabled={!canPay} className="royal-button w-full h-20 text-xl shadow-xl mt-8">
                      {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد الدفع الفوري"}
                    </Button>
                 </div>
              </Card>
           </aside>
        </div>
      </div>
    </main>
  );
}
