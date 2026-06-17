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
    if (!hasEnoughBalance) return toast({ variant: "destructive", title: "الرصيد غير كافٍ لإتمام العملية" });

    setIsProcessing(true);
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "خطأ في ملف العميل السيادي";

        const currentBalance = userSnap.data().walletBalance || 0;
        if (currentBalance < finalTotal) throw "الرصيد المتاح غير كافٍ للعملية";

        const allDeliveredCodes: string[] = [];
        let finalStatus: 'completed' | 'pending_stock' = 'completed';
        let finalDeliveryStatus: 'delivered' | 'preparing' = 'delivered';

        // معالجة كافة المنتجات في السلة (دعم المشتريات المتعددة)
        for (const item of items) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) throw `المنتج [${item.name}] غير متاح حالياً`;
          
          const pData = productSnap.data();
          const codes = (pData.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
          
          if (codes.length < item.quantity) {
             // إذا لم تتوفر الأكواد، يتم تحويل الطلب لحالة الانتظار
             finalStatus = 'pending_stock';
             finalDeliveryStatus = 'preparing';
             transaction.update(productRef, { 
               stock: Math.max(0, (pData.stock || 0) - item.quantity),
               updatedAt: serverTimestamp() 
             });
          } else {
             // سحب الأكواد المطلوبة وتحديث المخزون
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
        transaction.update(userRef, { 
          walletBalance: balanceAfter,
          completedDeals: (userSnap.data().completedDeals || 0) + items.length
        });

        transaction.set(doc(db, "orders", orderId), {
          id: orderId,
          userId: user.uid,
          userEmail: user.email,
          userName: profile.displayName,
          items,
          subtotal: total,
          shippingFee: selectedShipping.extraFee,
          totalAmount: finalTotal,
          shippingMethodName: selectedShipping.name,
          deliveryEmail,
          notes,
          status: finalStatus,
          deliveryStatus: finalDeliveryStatus,
          shippingCodeSent: allDeliveredCodes.join(' | '),
          balanceBefore: currentBalance,
          balanceAfter: balanceAfter,
          createdAt: new Date().toISOString()
        });

        const transData = {
          userId: user.uid,
          amount: finalTotal,
          type: 'purchase',
          description: items.length > 1 ? `استحواذ متعدد [${items.length} أصول]` : `استحواذ: ${items[0].name}`,
          orderId,
          balanceBefore: currentBalance,
          balanceAfter,
          createdAt: new Date().toISOString()
        };
        
        transaction.set(doc(collection(db, "users", user.uid, "transactions")), transData);
        transaction.set(doc(collection(db, "transactions")), transData);
      });

      clearCart();
      setSuccessOrderId(orderId);
      toast({ title: config?.cartLabels?.successMsg || "تم الاستحواذ بنجاح!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل البروتوكول المالي", description: String(e) });
    } finally {
      setIsProcessing(false);
    }
  };

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in" dir="rtl">
       <Card className="max-w-lg w-full p-8 md:p-16 text-center luxury-card border-none bg-card shadow-2xl">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10">
             <CheckCircle2 size={40} className="md:w-14 md:h-14 animate-bounce" />
          </div>
          <h2 className="text-2xl md:text-5xl font-black gold-text mb-4 md:mb-6">{config?.cartLabels?.successMsg || "تم التسليم بنجاح!"}</h2>
          <p className="text-muted-foreground text-sm md:text-lg font-medium mb-10 leading-relaxed">
            رقم المرجع السيادي: <span className="font-mono text-primary font-black">{successOrderId}</span>
          </p>
          <Button asChild className="royal-button w-full h-14 md:h-18 text-base md:text-xl">
             <a href={`/orders/${successOrderId}`}>فتح القسيمة الرقمية <ArrowLeft className="mr-2" /></a>
          </Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-32 md:pb-40" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-32 max-w-7xl">
        <header className="mb-10 md:mb-24 border-r-4 md:border-r-8 border-primary pr-6 md:pr-10 text-right">
           <h1 className="text-3xl md:text-7xl font-headline font-black gold-text leading-tight">{config?.cartLabels?.checkoutTitle || "تأكيد الاستحواذ الآلي"}</h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[8px] md:text-sm mt-1 md:mt-3 italic">Automated Settlement Protocol</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
           <div className="lg:col-span-2 space-y-10 md:space-y-16">
              <section className="space-y-6 md:space-y-8">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                       <Truck size={20} />
                    </div>
                    <h3 className="text-xl md:text-3xl font-black">مسار التسليم المعتمد</h3>
                 </div>
                 
                 {shippingLoading ? (
                   <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {shippingMethods?.map((m: any) => (
                        <div 
                          key={m.id} 
                          onClick={() => setSelectedShipping(m)}
                          className={`p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 relative group overflow-hidden ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5 shadow-xl scale-[1.02]' : 'border-border/40 bg-card/40 hover:border-primary/30'}`}
                        >
                           <div className="flex justify-between items-start mb-4 md:mb-6">
                              <div className="w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl flex items-center justify-center border shadow-lg group-hover:scale-110 transition-transform">
                                 {m.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover rounded-xl" alt="" /> : <Truck size={20} />}
                              </div>
                              {m.badge && <Badge className="bg-primary text-black font-black text-[7px] px-3 py-1 rounded-full uppercase tracking-widest">{m.badge}</Badge>}
                           </div>
                           <h4 className="font-black text-lg md:text-2xl mb-1">{m.name}</h4>
                           <p className="text-[10px] md:text-sm text-muted-foreground font-medium leading-relaxed">{m.description}</p>
                           <div className="mt-4 flex justify-between items-end pt-4 border-t border-border/50">
                              <div className="flex flex-col">
                                 <span className="text-[7px] font-black text-muted-foreground uppercase">رسوم إضافية</span>
                                 <span className="font-black text-primary text-base md:text-xl">+{formatUSD(m.extraFee)}</span>
                              </div>
                              <span className="text-[8px] md:text-[10px] font-black text-foreground uppercase bg-muted/50 px-3 py-1 rounded-full flex items-center gap-1.5">
                                 <Zap size={10} className="text-primary animate-pulse" /> {m.deliveryTime}
                              </span>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </section>

              <section className="space-y-6 md:space-y-8">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                       <Mail size={20} />
                    </div>
                    <h3 className="text-xl md:text-3xl font-black">بروتوكول الاستقبال</h3>
                 </div>
                 <Card className="luxury-card p-6 md:p-12 border-none bg-card/60 backdrop-blur-xl space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[9px] md:text-xs font-black text-primary uppercase pr-3 tracking-widest">بريد التسليم الرقمي</Label>
                       <Input 
                         value={deliveryEmail} 
                         onChange={e => setDeliveryEmail(e.target.value)} 
                         className="h-14 md:h-20 rounded-xl md:rounded-[1.5rem] bg-white dark:bg-zinc-950 border-2 border-primary/20 px-6 md:px-8 font-black text-lg md:text-2xl shadow-inner text-foreground focus:ring-2 focus:ring-primary/40" 
                         placeholder="name@example.com"
                       />
                       <p className="text-[9px] text-muted-foreground font-medium pr-3">سيتم إرسال كود التفعيل وتفاصيل المستودع لهذا البريد فوراً.</p>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[9px] md:text-xs font-black text-primary uppercase pr-3 tracking-widest">توجيهات إضافية (اختياري)</Label>
                       <Textarea 
                         value={notes} 
                         onChange={e => setNotes(e.target.value)} 
                         className="rounded-xl md:rounded-[2rem] bg-white dark:bg-zinc-950 border-2 border-primary/20 p-5 md:p-8 font-bold text-sm md:text-lg min-h-[120px] shadow-inner text-foreground focus:ring-2 focus:ring-primary/40" 
                         placeholder="أدخل أي ملاحظات خاصة بتنفيذ الطلب..." 
                       />
                    </div>
                 </Card>
              </section>
           </div>

           <aside className="space-y-8">
              <Card className="luxury-card p-8 md:p-12 bg-primary/5 border-primary/20 sticky top-28 md:top-32 shadow-2xl">
                 <h3 className="text-lg md:text-2xl font-black mb-8 border-b border-primary/10 pb-4 flex items-center gap-3">
                    <Zap className="text-primary" size={20} /> تصفية الحساب
                 </h3>
                 <div className="space-y-6">
                    <div className="flex justify-between text-muted-foreground font-black text-[10px] md:text-base uppercase tracking-wider">
                       <span>قيمة الأصول</span>
                       <span>{formatUSD(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-black text-[10px] md:text-base uppercase tracking-wider">
                       <span>لوجستيات الشحن</span>
                       <span>{formatUSD(selectedShipping?.extraFee || 0)}</span>
                    </div>
                    <div className="h-px bg-primary/10 my-4" />
                    <div className="flex justify-between items-end">
                       <span className="font-black text-[9px] md:text-sm uppercase tracking-[0.2em] text-primary">الإجمالي النهائي</span>
                       <div className="text-right">
                          <span className="text-3xl md:text-6xl font-black gold-text tracking-tighter leading-none">{formatUSD(finalTotal)}</span>
                       </div>
                    </div>
                    
                    <div className="p-6 md:p-8 bg-zinc-900 rounded-2xl md:rounded-[2.5rem] text-white mt-8 shadow-inner border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-[40px] rounded-full" />
                       <div className="flex items-center gap-4 md:gap-6 relative z-10">
                          <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl flex items-center justify-center text-primary border border-white/5">
                             <Wallet size={20} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[8px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest">رصيدك المتاح</span>
                             <span className={`font-black text-xl md:text-3xl tracking-tighter transition-colors ${hasEnoughBalance ? 'text-primary' : 'text-red-500'}`}>
                                {formatUSD(walletBalance)}
                             </span>
                          </div>
                       </div>
                    </div>

                    {!hasEnoughBalance && !userLoading && (
                       <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 mt-4">
                          <AlertCircle size={18} className="text-red-500 shrink-0" />
                          <p className="text-[9px] font-black text-red-500 uppercase leading-relaxed">الرصيد السيادي غير كافٍ. يرجى الشحن للمتابعة.</p>
                       </div>
                    )}

                    <Button 
                      onClick={handleCompleteOrder} 
                      disabled={!canPay}
                      className={`royal-button w-full h-16 md:h-24 text-base md:text-3xl shadow-primary/30 mt-8 group ${!canPay ? 'opacity-50 grayscale' : ''}`}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <><ShieldCheck className="ml-2 md:ml-4 group-hover:scale-110 transition-transform" size={24} /> تأكيد الدفع الفوري</>
                      )}
                    </Button>
                    
                    <p className="text-[7px] text-center text-muted-foreground uppercase font-black tracking-[0.3em] mt-6 opacity-60">Sovereign Cloud Engine Protocol</p>
                 </div>
              </Card>
           </aside>
        </div>
      </div>
    </main>
  );
}