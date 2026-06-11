"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore } from "@/firebase";
import { doc, runTransaction, collection, query, where, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { ArrowRightLeft, Search, Loader2, DollarSign, ShieldAlert, CheckCircle2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function TransferPage() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const [targetId, setTargetId] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const handleSearch = async () => {
    if (!targetId || !db) return;
    setIsProcessing(true);
    try {
      // البحث بالـ UID أولاً
      const q = query(collection(db, "users"), where("uid", "==", targetId.trim()), limit(1));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const found = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (found.id === user?.uid) {
          toast({ variant: "destructive", title: "خطأ", description: "لا يمكنك التحويل لنفسك" });
        } else {
          setTargetUser(found);
          setStep(2);
        }
      } else {
        toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على مستخدم بهذا المعرف" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ في البحث" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!profile || !targetUser || !amount || isNaN(Number(amount)) || !db) return;
    const numAmount = Number(amount);
    
    if (numAmount <= 0) {
      toast({ variant: "destructive", title: "خطأ", description: "أدخل مبلغاً صحيحاً" });
      return;
    }
    if (profile.walletBalance < numAmount) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "محفظتك لا تغطي هذا المبلغ" });
      return;
    }

    setIsProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, "users", profile.uid);
        const receiverRef = doc(db, "users", targetUser.id);
        
        const senderSnap = await transaction.get(senderRef);
        const receiverSnap = await transaction.get(receiverRef);
        
        if (!senderSnap.exists() || !receiverSnap.exists()) throw "User document missing";
        
        const newSenderBalance = (senderSnap.data().walletBalance || 0) - numAmount;
        const newReceiverBalance = (receiverSnap.data().walletBalance || 0) + numAmount;
        
        transaction.update(senderRef, { walletBalance: newSenderBalance });
        transaction.update(receiverRef, { walletBalance: newReceiverBalance });
        
        // سجل العملية للمرسل
        transaction.set(doc(collection(db, "users", profile.uid, "transactions")), {
          type: 'transfer_send',
          amount: numAmount,
          targetUserId: targetUser.id,
          description: `تحويل مرسل إلى ${targetUser.displayName}`,
          createdAt: new Date().toISOString()
        });
        
        // سجل العملية للمستقبل
        transaction.set(doc(collection(db, "users", targetUser.id, "transactions")), {
          type: 'transfer_receive',
          amount: numAmount,
          senderUserId: profile.uid,
          description: `تحويل مستلم من ${profile.displayName}`,
          createdAt: new Date().toISOString()
        });
      });

      setStep(3);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحويل", description: "حدث خطأ غير متوقع" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-xl border border-white/5 bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-12 text-center bg-slate-950">
            <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/20">
               <ArrowRightLeft size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold gold-text">تحويل الرصيد الملكي</CardTitle>
            <CardDescription className="text-slate-400 mt-2">حوّل أموالك فوراً إلى أي حساب في XMOOD عبر المعرف الرقمي.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-12">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">أدخل معرف المستلم (USER ID)</label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="مثلاً: ABC123XYZ..." 
                      className="h-16 rounded-2xl bg-white/5 border-none px-8 font-bold text-lg"
                      value={targetId}
                      onChange={e => setTargetId(e.target.value)}
                    />
                    <Button onClick={handleSearch} disabled={isProcessing} className="h-16 w-16 rounded-2xl p-0 shrink-0">
                      {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                    </Button>
                  </div>
                </div>
                <div className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-4">
                   <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                   <p className="text-[10px] text-amber-200 leading-relaxed uppercase font-black">تحذير: عمليات التحويل نهائية ولا يمكن التراجع عنها. تأكد من هوية المستلم جيداً.</p>
                </div>
              </div>
            )}

            {step === 2 && targetUser && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white/5 p-8 rounded-3xl border border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-primary uppercase mb-1">المستلم الموثوق</p>
                       <h4 className="font-bold text-xl">{targetUser.displayName}</h4>
                       <p className="text-xs opacity-50">{targetUser.email}</p>
                    </div>
                    <Button variant="ghost" className="text-slate-400 text-xs" onClick={() => setStep(1)}>تغيير</Button>
                 </div>

                 <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">المبلغ المراد إرساله (USD)</label>
                   <div className="relative">
                      <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-primary" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="h-20 rounded-[2rem] bg-white/5 border-none text-4xl font-black text-center pr-14"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                      />
                   </div>
                   <p className="text-center text-xs text-muted-foreground">رصيدك الحالي: <span className="text-primary">{formatUSD(profile?.walletBalance || 0)}</span></p>
                 </div>

                 <Button 
                   onClick={handleTransfer} 
                   disabled={isProcessing} 
                   className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/10"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد التحويل الفوري"}
                 </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-10 animate-fade-in space-y-6">
                 <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                 </div>
                 <h2 className="text-3xl font-bold">نجحت العملية!</h2>
                 <p className="text-slate-400">تم تحويل {formatUSD(Number(amount))} بنجاح إلى حساب {targetUser.displayName}.</p>
                 <Button asChild className="w-full h-14 rounded-2xl bg-white text-black font-bold">
                    <Link href="/wallet">العودة للمحفظة</Link>
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
