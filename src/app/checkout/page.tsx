
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
import { Loader2, Truck, CheckCircle2, Wallet, Zap, PackageX, ArrowRight, ShieldCheck, AlertCircle, MailWarning } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { profile, user, isVerified, loading: userLoading } = useUser();
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
        try {
          const pSnap = await getDoc(doc(db, "products", item.id));
          if (pSnap.exists()) {
            const data = pSnap.data();
            const codes = (data.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
            if (codes.length < item.quantity) unavailable.push(item.name);
          }
        } catch (e) {
          console.error("Stock Check Error:", e);
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
    if (!user || !profile || !db) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى تسجيل الدخول أولاً." });
      return;
    }

    if (!isVerified) {
      toast({ variant: "destructive", title: "الحساب غير موثق", description: "يرجى تفعيل بريدك الإلكتروني لتتمكن من الشراء." });
      return;
    }
    
    if (outOfStockItems.length > 0) {
      toast({ variant: "destructive", title: "نفد المخزون", description: `عذراً، ${outOfStockItems[0]} غير متوفر حالياً بالكمية المطلوبة.` });
      return;
    }

    if (!hasEnoughBalance) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن محفظتك للمتابعة." });
      return;
    }

    setIsProcessing(true);
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "الملف الشخصي غير موجود";

        const currentBalance = userSnap.data().walletBalance || 0;
        if (currentBalance < finalTotal) throw "عذراً، الرصيد لا يكفي لإتمام العملية.";

        const allDeliveredCodes: string[] = [];

        for (const item of items) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await transaction.get(productRef);
          const pData = productSnap.data();
          const codes = (pData?.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
          
          if (codes.length < item.quantity) throw `عذراً، نفد مخزون ${item.name} أثناء المعالجة.`;

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
          balanceBefore: currentBalance,
          balanceAfter: currentBalance - finalTotal,
          shippingMethodName: selectedShipping.name,
          shippingFee: selectedShipping.extraFee || 0,
          deliveryEmail,
          status: 'completed',
          shippingCodeSent: allDeliveredCodes.join(' | '),
          createdAt: new Date().toISOString()
        });

        // تسجيل العملية في السجل المالي للمستخدم
        transaction.set(doc(collection(db, "users", user.uid, "transactions")), {
          type: 'purchase',
          amount: finalTotal,
          description: `شراء أصول رقمية: ${items[0].name}${items.length > 1 ? '...' : ''}`,
          orderId,
          createdAt: new Date().toISOString()
        });
      });

      clearCart();
      setSuccessOrderId(orderId);
      toast({ title: "تم الاستحواذ بنجاح", description: "تم خصم المبلغ وتسليم الأكواد." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل العملية", description: String(e) });
    } finally {
      setIsProcessing(false);
    }
  };

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
       <Card className="max-w-md w-full p-12 text-center luxury-card border-none shadow-2xl">
          <CheckCircle2 size={80} className="text-green-500 mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl font-headline font-black mb-4">تمت العملية بنجاح</h2>
          <p className="text-muted-foreground mb-10 font-medium leading-relaxed">تم خصم المبلغ من محفظتك وتجهيز القسيمة الرقمية الخاصة بك.</p>
          <Button asChild className="royal-button w-full h-16 text-lg shadow-xl"><Link href={`/orders/${successOrderId}`}>عرض واستلام القسيمة</Link></Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-32" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-32 max-w-6xl">
        <header className="mb-16">
          <Badge className="bg-primary/10 text-primary mb-4 px-6 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Sovereign Gateway</Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-black gold-text tracking-tighter">إتمام الاستحواذ</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
           <div className="lg:col-span-2 space-y-16">
              {!isVerified && user && (
                <div className="p-8 bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-[2rem] flex items-start gap-6 animate-fade-in">
                   <MailWarning size={40} className="text-amber-500 shrink-0" />
                   <div>
                      <h3 className="font-black text-xl text-amber-500">تنبيه: الحساب غير موثق</h3>
                      <p className="text-sm opacity-70 font-medium mb-4">يجب عليك تفعيل بريدك الإلكتروني لتتمكن من إتمام عمليات الشراء.</p>
                      <Button asChild variant="outline" className="h-10 rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500/5">
                         <Link href="/verify-email?waiting=true">انتقل لصفحة التوثيق</Link>
                      </Button>
                   </div>
                </div>
              )}

              {outOfStockItems.length > 0 && (
                 <div className="p-8 bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-[2rem] flex items-start gap-6 animate-pulse">
                    <PackageX size={40} className="text-red-500 shrink-0" />
                    <div>
                       <h3 className="font-black text-xl text-red-500">عذراً: نفد المخزون</h3>
                       <p className="text-sm opacity-70 font-medium">بعض الأصول المختارة لم تعد متوفرة حالياً: {outOfStockItems.join(", ")}</p>
                    </div>
                 </div>
              )}

              <section className="space-y-8">
                 <h3 className="text-2xl font-black flex items-center gap-4 border-r-4 border-primary pr-6"><Truck size={28} className="text-primary" /> قناة التسليم</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {shippingMethods?.map((m: any) => (
                      <div key={m.id} onClick={() => setSelectedShipping(m)} className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-border hover:border-primary/30'}`}>
                         <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl group-hover:text-primary transition-colors">{m.name}</h4>
                            <Zap size={16} className={selectedShipping?.id === m.id ? 'text-primary' : 'opacity-0'} />
                         </div>
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">رسوم القناة: +{formatUSD(m.extraFee)}</p>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-8">
                 <h3 className="text-2xl font-black flex items-center gap-4 border-r-4 border-primary pr-6">بريد استلام الأكواد</h3>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary pr-4">سيتم إرسال أكواد التفعيل لهذا البريد</Label>
                    <Input 
                      value={deliveryEmail} 
                      onChange={e => setDeliveryEmail(e.target.value)} 
                      placeholder="أدخل البريد لاستقبال الكود..." 
                      className="h-18 rounded-3xl shadow-xl border-2 border-primary/20"
                    />
                 </div>
              </section>
           </div>

           <aside>
              <Card className="luxury-card p-10 bg-primary/5 border-primary/20 sticky top-32 shadow-2xl">
                 <h3 className="text-2xl font-black mb-10 flex items-center gap-4 gold-text"><Wallet size={24} /> المحفظة المركزية</h3>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-muted-foreground uppercase">إجمالي المستحق</span>
                       <span className="text-4xl font-black text-primary tracking-tighter">{formatUSD(finalTotal)}</span>
                    </div>
                    
                    <div className="p-6 bg-background rounded-3xl border-2 border-primary/10 flex items-center justify-between shadow-inner">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ShieldCheck size={20}/></div>
                          <div><p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">الرصيد المتاح</p><p className={`font-black text-xl tracking-tighter ${hasEnoughBalance ? 'text-foreground' : 'text-red-500'}`}>{formatUSD(walletBalance)}</p></div>
                       </div>
                    </div>

                    {!hasEnoughBalance && user && (
                       <div className="space-y-3">
                         <p className="text-[10px] text-red-500 font-black text-center uppercase tracking-widest animate-pulse">رصيدك لا يكفي لإتمام العملية</p>
                         <Button asChild variant="outline" className="w-full h-12 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/5">
                            <Link href="/wallet">اشحن محفظتك الآن</Link>
                         </Button>
                       </div>
                    )}

                    <Button 
                      onClick={handleCompleteOrder} 
                      disabled={isProcessing || !items.length || !selectedShipping || !hasEnoughBalance || outOfStockItems.length > 0 || !isVerified} 
                      className="royal-button w-full h-20 text-xl shadow-xl"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد الاستحواذ الآلي"}
                    </Button>
                    
                    <div className="text-center pt-4">
                       <Link href="/store" className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.3em] transition-all">العودة للمستودع</Link>
                    </div>
                 </div>
              </Card>
           </aside>
        </div>
      </div>
    </main>
  );
}
