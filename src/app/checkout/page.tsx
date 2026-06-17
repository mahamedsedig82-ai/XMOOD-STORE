"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, runTransaction, collection, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Truck, CheckCircle2, Wallet, Mail, MessageSquare } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { profile, user, isVerified } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

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

        const currentBalance = userSnap.data().walletBalance || 0;
        if (currentBalance < finalTotal) throw "Insufficient Balance";

        // 1. DEDUCT BALANCE
        transaction.update(userRef, { walletBalance: currentBalance - finalTotal });

        // 2. CREATE ORDER
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
          status: 'processing',
          deliveryStatus: 'preparing',
          createdAt: new Date().toISOString()
        });

        // 3. LOG TRANSACTION
        transaction.set(doc(collection(db, "users", user.uid, "transactions")), {
          type: 'purchase',
          amount: finalTotal,
          description: `شراء سيادي: ${items.length} منتجات عبر السلة`,
          orderId,
          createdAt: new Date().toISOString()
        });
      });

      clearCart();
      setSuccessOrderId(orderId);
      toast({ title: "اكتمل البروتوكول المالي", description: "تم استلام طلبك بنجاح وجاري التحضير." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل المعالجة", description: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (successOrderId) return (
    <main className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
       <Card className="max-w-md w-full p-12 text-center luxury-card border-none bg-card/60 backdrop-blur-xl shadow-2xl">
          <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
             <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black gold-text mb-4">تم تأكيد الاستحواذ!</h2>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            تم تسجيل طلبك رقم <span className="font-mono text-primary font-black">{successOrderId}</span> بنجاح. يمكنك الآن عرض القسيمة الرسمية.
          </p>
          <Button asChild className="royal-button w-full h-16 text-lg">
             <a href={`/orders/${successOrderId}`}>عرض قسيمة العملية</a>
          </Button>
       </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-background pb-40" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-7xl">
        <header className="mb-16 border-r-8 border-primary pr-8">
           <h1 className="text-4xl md:text-6xl font-headline font-black gold-text">مراجعة وتأكيد البروتوكول</h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2">Secure Financial Settlement Hub</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-10">
              <Card className="luxury-card p-10 border-none bg-card/40 backdrop-blur-xl">
                 <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Truck className="text-primary" /> اختيار وسيلة الشحن والتسليم</h3>
                 {shippingLoading ? <Loader2 className="animate-spin mx-auto text-primary" /> : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {shippingMethods?.map((m: any) => (
                        <div 
                          key={m.id} 
                          onClick={() => setSelectedShipping(m)}
                          className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedShipping?.id === m.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-border/50 hover:border-primary/20'}`}
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center border shadow-sm">
                                 {m.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Truck size={20} />}
                              </div>
                              {m.badge && <Badge className="bg-primary text-black font-black text-[7px] uppercase">{m.badge}</Badge>}
                           </div>
                           <h4 className="font-black text-lg mb-1">{m.name}</h4>
                           <p className="text-[10px] text-muted-foreground font-medium line-clamp-2">{m.description}</p>
                           <div className="mt-4 flex justify-between items-center pt-4 border-t border-border/50">
                              <span className="font-black text-primary">+{m.extraFee}$</span>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Loader2 size={10} className="animate-pulse" /> {m.deliveryTime}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </Card>

              <Card className="luxury-card p-10 border-none bg-card/40 backdrop-blur-xl space-y-8">
                 <h3 className="text-xl font-black flex items-center gap-3"><Mail className="text-primary" /> معلومات الاستلام والملاحظات</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase pr-3">بريد التسليم (سيرسل عليه الكود/الرابط)</label>
                       <Input value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)} className="h-14 rounded-2xl bg-muted/20 border-none px-6 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase pr-3">ملاحظات إضافية للمنفذ</label>
                       <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="rounded-3xl bg-muted/20 border-none p-6 font-medium" placeholder="هل هناك تفاصيل تقنية تريد إيضاحها؟" />
                    </div>
                 </div>
              </Card>
           </div>

           <div className="space-y-8">
              <Card className="luxury-card p-10 bg-primary/5 border-primary/20 sticky top-32">
                 <h3 className="text-xl font-black mb-8 border-b pb-4">تصفية الحساب</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between text-muted-foreground font-bold">
                       <span>قيمة المنتجات</span>
                       <span>{formatUSD(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-bold">
                       <span>رسوم الشحن</span>
                       <span>{formatUSD(selectedShipping?.extraFee || 0)}</span>
                    </div>
                    <div className="h-px bg-border/50 my-6" />
                    <div className="flex justify-between items-end">
                       <span className="font-black text-sm uppercase">المطلوب دفعه</span>
                       <span className="text-4xl font-black gold-text tracking-tighter">{formatUSD(finalTotal)}</span>
                    </div>
                    
                    <div className="p-6 bg-zinc-900 rounded-[2rem] text-white mt-10">
                       <div className="flex items-center gap-4 mb-4">
                          <Wallet size={20} className="text-primary" />
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-zinc-500 uppercase">رصيدك الحالي</span>
                             <span className="font-black text-xl text-primary">{formatUSD(profile?.walletBalance || 0)}</span>
                          </div>
                       </div>
                       {profile && profile.walletBalance < finalTotal && (
                         <Badge variant="destructive" className="w-full justify-center h-10 rounded-xl font-black text-[9px] uppercase">رصيدك لا يكفي - يرجى الشحن</Badge>
                       )}
                    </div>

                    <Button 
                      onClick={handleCompleteOrder} 
                      disabled={isProcessing || !selectedShipping || (profile?.walletBalance || 0) < finalTotal}
                      className="royal-button w-full h-18 text-xl shadow-2xl mt-8"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="ml-3" /> تأكيد وخصم فوري</>}
                    </Button>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </main>
  );
}
