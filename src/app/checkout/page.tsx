"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, collection, query, where, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Truck, CheckCircle2, Wallet, Mail, Zap } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDoc } from "@/firebase";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { profile, user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const shippingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "shipping_methods"), where("isActive", "==", true));
  }, [db]);
  const { data: shippingMethods, loading: shippingLoading } = useCollection(shippingQuery);

  const finalTotal = total + (selectedShipping?.extraFee || 0);

  const handleCompleteOrder = async () => {
    if (!user || !profile || !db) return;
    if (!selectedShipping) return toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار طريقة شحن أولاً." });
    if (profile.walletBalance < finalTotal) return toast({ variant: "destructive", title: "عذراً", description: "رصيدك غير كافٍ لإتمام هذه العملية." });

    setIsProcessing(true);
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "Profile Error";

        const balanceBefore = userSnap.data().walletBalance || 0;
        if (balanceBefore < finalTotal) throw "Insufficient Balance";

        // Logic for first item delivery (Main Focus)
        const mainItem = items[0];
        const productRef = doc(db, "products", mainItem.id);
        const productSnap = await transaction.get(productRef);
        
        let deliveredCode = "";
        let finalStatus: any = 'completed';
        let finalDeliveryStatus: any = 'delivered';

        if (productSnap.exists()) {
          const productData = productSnap.data();
          const codes = (productData.shippingCodes || "").split('\n').filter((c: string) => c.trim() !== "");
          
          if (codes.length > 0) {
            deliveredCode = codes[0]; 
            const remainingCodes = codes.slice(1).join('\n');
            transaction.update(productRef, {
              shippingCodes: remainingCodes,
              stock: Math.max(0, (productData.stock || 0) - 1),
              updatedAt: serverTimestamp()
            });
          } else {
            finalStatus = 'pending_stock';
            finalDeliveryStatus = 'preparing';
            if ((productData.stock || 0) > 0) {
              transaction.update(productRef, { stock: (productData.stock - 1) });
            }
          }
        }

        const balanceAfter = balanceBefore - finalTotal;
        transaction.update(userRef, { 
          walletBalance: balanceAfter,
          completedDeals: (userSnap.data().completedDeals || 0) + 1
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
          shippingCodeSent: deliveredCode,
          balanceBefore,
          balanceAfter,
          createdAt: new Date().toISOString()
        });

        transaction.set(doc(collection(db, "users", user.uid, "transactions")), {
          type: 'purchase',
          amount: finalTotal,
          description: `شراء آلي: ${mainItem.name}`,
          orderId,
          balanceBefore,
          balanceAfter,
          createdAt: new Date().toISOString()
        });

        transaction.set(doc(collection(db, "transactions")), {
          userId: user.uid,
          amount: finalTotal,
          type: 'purchase',
          description: `عملية شراء ناجحة - ${mainItem.name}`,
          createdAt: new Date().toISOString()
        });
      });

      clearCart();
      setSuccessOrderId(orderId);
      toast({ title: "اكتملت العملية آلياً" });
    } catch (e: any) {
      console.error("Order Error:", e);
      toast({ variant: "destructive", title: "فشل المعالجة", description: e === "Insufficient Balance" ? "رصيدك غير كافٍ" : "حدث خطأ فني." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
       <Card className="max-w-md w-full p-8 md:p-12 text-center luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
             <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black gold-text mb-4">{config?.cartLabels?.successMsg || "تم التسليم بنجاح!"}</h2>
          <p className="text-muted-foreground text-sm md:text-base font-medium mb-10 leading-relaxed">
            تمت معالجة طلبك <span className="font-mono text-primary font-black">{successOrderId}</span> وتسليمه آلياً.
          </p>
          <Button asChild className="royal-button w-full h-14 md:h-16 text-lg">
             <a href={`/orders/${successOrderId}`}>عرض القسيمة والكود</a>
          </Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-40" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-32 max-w-7xl">
        <header className="mb-12 md:mb-16 border-r-0 md:border-r-8 border-primary pr-0 md:pr-8 text-center md:text-right">
           <h1 className="text-3xl md:text-6xl font-headline font-black gold-text">{config?.cartLabels?.checkoutTitle || "تأكيد الاستحواذ الآلي"}</h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-2">Automated Digital Asset Delivery</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
           <div className="lg:col-span-2 space-y-8 md:space-y-10">
              <Card className="luxury-card p-6 md:p-10 border-none bg-card/40 backdrop-blur-xl">
                 <h3 className="text-lg md:text-xl font-black mb-8 flex items-center gap-3"><Truck className="text-primary" /> مسار التسليم</h3>
                 {shippingLoading ? <Loader2 className="animate-spin mx-auto text-primary" /> : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {shippingMethods?.map((m: any) => (
                        <div 
                          key={m.id} 
                          onClick={() => setSelectedShipping(m)}
                          className={`p-5 md:p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-border/50 hover:border-primary/20'}`}
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-card rounded-xl flex items-center justify-center border shadow-sm shrink-0">
                                 {m.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Truck size={18} />}
                              </div>
                              {m.badge && <Badge className="bg-primary text-black font-black text-[7px] px-3 py-1 rounded-full uppercase">{m.badge}</Badge>}
                           </div>
                           <h4 className="font-black text-base md:text-lg mb-1">{m.name}</h4>
                           <p className="text-[10px] text-muted-foreground font-medium line-clamp-2">{m.description}</p>
                           <div className="mt-4 flex justify-between items-center pt-4 border-t border-border/50">
                              <span className="font-black text-primary text-sm md:text-base">+{m.extraFee}$</span>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Zap size={10} className="text-primary animate-pulse" /> {m.deliveryTime}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </Card>

              <Card className="luxury-card p-6 md:p-10 border-none bg-card/40 backdrop-blur-xl space-y-8">
                 <h3 className="text-lg md:text-xl font-black flex items-center gap-3"><Mail className="text-primary" /> تأكيد بيانات الاستلام</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase pr-3">بريد التسليم (سيرسل عليه الكود احتياطياً)</label>
                       <Input value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)} className="h-12 md:h-14 rounded-2xl bg-muted/20 border-none px-6 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase pr-3">ملاحظات إضافية</label>
                       <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="rounded-3xl bg-muted/20 border-none p-4 md:p-6 font-medium text-xs md:text-sm" placeholder="أي معلومات تريد إيضاحها للنظام..." />
                    </div>
                 </div>
              </Card>
           </div>

           <div className="space-y-8">
              <Card className="luxury-card p-8 md:p-10 bg-primary/5 border-primary/20 sticky top-32">
                 <h3 className="text-lg md:text-xl font-black mb-8 border-b pb-4">تصفية الحساب</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between text-muted-foreground font-bold text-xs md:text-sm">
                       <span>قيمة المقتنيات</span>
                       <span>{formatUSD(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-bold text-xs md:text-sm">
                       <span>رسوم الخدمة</span>
                       <span>{formatUSD(selectedShipping?.extraFee || 0)}</span>
                    </div>
                    <div className="h-px bg-border/50 my-4" />
                    <div className="flex justify-between items-end">
                       <span className="font-black text-[10px] md:text-sm uppercase">الإجمالي النهائي</span>
                       <span className="text-3xl md:text-4xl font-black gold-text tracking-tighter">{formatUSD(finalTotal)}</span>
                    </div>
                    
                    <div className="p-5 md:p-6 bg-zinc-900 rounded-[2rem] text-white mt-8">
                       <div className="flex items-center gap-4">
                          <Wallet size={18} className="text-primary" />
                          <div className="flex flex-col">
                             <span className="text-[8px] text-zinc-500 uppercase">رصيدك السيادي</span>
                             <span className="font-black text-lg text-primary">{formatUSD(profile?.walletBalance || 0)}</span>
                          </div>
                       </div>
                    </div>

                    <Button 
                      onClick={handleCompleteOrder} 
                      disabled={isProcessing || !selectedShipping || (profile?.walletBalance || 0) < finalTotal}
                      className="royal-button w-full h-16 md:h-18 text-lg md:text-xl shadow-2xl mt-6"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="ml-3" /> تأكيد الدفع الفوري</>}
                    </Button>
                    <p className="text-[8px] text-center text-muted-foreground mt-4 uppercase font-black">يتم التسليم آلياً فور الضغط على الزر</p>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </main>
  );
}