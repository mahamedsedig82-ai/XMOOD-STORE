
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, limit, getDocs, doc, updateDoc, addDoc, runTransaction } from "firebase/firestore";
import { ArrowRightLeft, Search, Loader2, DollarSign, ShieldAlert, CheckCircle2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TransferPage() {
  const { profile, user } = useUser();
  const db = useFirestore();
  
  const [targetId, setTargetId] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const handleSearchRecipient = async () => {
    if (!targetId || !db) return;
    setIsProcessing(true);
    try {
      // البحث بالـ UID أو البريد
      const q = query(collection(db, "users"), where("uid", ">=", targetId.substring(0, 10)), limit(5));
      const querySnapshot = await getDocs(q);
      
      const found = querySnapshot.docs.find(d => d.id === targetId || d.data().uid.startsWith(targetId));
      
      if (found) {
        if (found.id === user?.uid) {
          toast({ variant: "destructive", title: "خطأ", description: "لا يمكنك التحويل لنفسك" });
        } else {
          setTargetUser({ id: found.id, ...found.data() });
          setStep(2);
        }
      } else {
        toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على مستخدم بهذا المعرف" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ في البحث" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!profile || !targetUser || !amount || isNaN(Number(amount)) || !db) return;
    
    const numAmount = Number(amount);
    if (numAmount <= 0) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال مبلغ صحيح" });
      return;
    }
    
    if (profile.walletBalance < numAmount) {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "ليس لديك رصيد كافٍ لإتمام التحويل" });
      return;
    }

    setIsProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const senderDoc = doc(db, "users", profile.uid);
        const receiverDoc = doc(db, "users", targetUser.id);
        
        const senderSnap = await transaction.get(senderDoc);
        const receiverSnap = await transaction.get(receiverDoc);
        
        if (!senderSnap.exists() || !receiverSnap.exists()) throw "User not found";
        
        const senderBalance = senderSnap.data().walletBalance;
        if (senderBalance < numAmount) throw "Insufficient balance";
        
        transaction.update(senderDoc, { walletBalance: senderBalance - numAmount });
        transaction.update(receiverDoc, { walletBalance: (receiverSnap.data().walletBalance || 0) + numAmount });
        
        // سجل العملية للمرسل
        const senderTrans = doc(collection(db, "users", profile.uid, "transactions"));
        transaction.set(senderTrans, {
          type: 'transfer_send',
          targetUserId: targetUser.id,
          amount: numAmount,
          description: `تحويل مرسل إلى ${targetUser.displayName}`,
          createdAt: new Date().toISOString(),
          status: 'success'
        });
        
        // سجل العملية للمستقبل
        const receiverTrans = doc(collection(db, "users", targetUser.id, "transactions"));
        transaction.set(receiverTrans, {
          type: 'transfer_receive',
          senderUserId: profile.uid,
          amount: numAmount,
          description: `تحويل مستلم من ${profile.displayName}`,
          createdAt: new Date().toISOString(),
          status: 'success'
        });
      });

      setStep(3);
      toast({ title: "تم التحويل بنجاح", description: `تم إرسال ${formatUSD(numAmount)} إلى ${targetUser.displayName}` });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحويل", description: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-xl border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl">
               <ArrowRightLeft size={32} />
            </div>
            <CardTitle className="text-3xl font-headline font-bold">تحويل الرصيد (P2P)</CardTitle>
            <CardDescription className="text-slate-400 mt-2">حوّل الأموال فوراً وبأمان تام إلى أي مستخدم في XMOOD.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-12">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-4">أدخل معرف المستلم (User ID)</label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="UID: مثلاً ABC123..." 
                      className="h-16 rounded-2xl bg-slate-50 border-none px-8 text-lg font-bold"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                    />
                    <Button onClick={handleSearchRecipient} disabled={isProcessing} className="h-16 w-16 rounded-2xl p-0 shrink-0">
                      {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                    </Button>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                   <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                   <p className="text-xs text-amber-800 leading-relaxed">يرجى التأكد من المعرف جيداً. عمليات التحويل بين المستخدمين فورية ولا يمكن استردادها إلا بموافقة الطرف الآخر أو عبر الإدارة.</p>
                </div>
              </div>
            )}

            {step === 2 && targetUser && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-slate-50 p-6 rounded-3xl border flex items-center justify-between">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">المستلم</p>
                       <h4 className="font-bold text-lg">{targetUser.displayName}</h4>
                       <p className="text-[10px] text-muted-foreground">{targetUser.email}</p>
                    </div>
                    <Button variant="ghost" className="text-primary text-xs font-bold" onClick={() => setStep(1)}>تغيير</Button>
                 </div>

                 <div className="space-y-4">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest pr-4">المبلغ المراد تحويله (USD)</label>
                   <div className="relative">
                      <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-primary" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="h-20 rounded-[2rem] bg-slate-50 border-none text-4xl font-black text-center pr-14"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                   </div>
                   <p className="text-center text-xs text-muted-foreground">رصيدك الحالي: {formatUSD(profile?.walletBalance || 0)}</p>
                 </div>

                 <Button 
                   onClick={handleTransfer} 
                   disabled={isProcessing} 
                   className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl"
                 >
                   {isProcessing ? <Loader2 className="animate-spin ml-2" /> : <ArrowRightLeft className="ml-2" />} تأكيد عملية التحويل الآن
                 </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-10 animate-fade-in space-y-6">
                 <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                 </div>
                 <h2 className="text-2xl font-bold">تم إرسال الأموال!</h2>
                 <p className="text-muted-foreground">تم تحويل {formatUSD(Number(amount))} بنجاح إلى حساب {targetUser.displayName}.</p>
                 <Button asChild className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">
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
