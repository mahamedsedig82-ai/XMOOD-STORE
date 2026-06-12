
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore } from "@/firebase";
import { doc, runTransaction, collection, query, where, getDocs, limit } from "firebase/firestore";
import { ArrowRightLeft, Search, Loader2, DollarSign, ShieldAlert, CheckCircle2, User } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      const q = query(collection(db, "users"), where("uid", "==", targetId.trim().toUpperCase()), limit(1));
      // Try exact match then maybe first chars
      let snap = await getDocs(q);
      
      if (snap.empty) {
        // Fallback search
        const q2 = query(collection(db, "users"), where("email", "==", targetId.trim().toLowerCase()), limit(1));
        snap = await getDocs(q2);
      }

      if (!snap.empty) {
        const found = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (found.id === user?.uid) {
          toast({ variant: "destructive", title: "تنبيه", description: "لا يمكنك التحويل لحسابك الشخصي." });
        } else {
          setTargetUser(found);
          setStep(2);
        }
      } else {
        toast({ variant: "destructive", title: "فشل البحث", description: "لم نجد مستخدماً بهذا المعرف." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء البحث." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!profile || !targetUser || !amount || isNaN(Number(amount)) || !db) return;
    const numAmount = Number(amount);
    
    if (numAmount <= 0) {
      toast({ variant: "destructive", title: "قيمة غير صالحة", description: "يرجى إدخال مبلغ صحيح." });
      return;
    }
    if (profile.walletBalance < numAmount) {
      toast({ variant: "destructive", title: "عذراً", description: "رصيدك الحالي لا يكفي لإتمام التحويل." });
      return;
    }

    setIsProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, "users", profile.uid);
        const receiverRef = doc(db, "users", targetUser.id);
        
        const senderSnap = await transaction.get(senderRef);
        const receiverSnap = await transaction.get(receiverRef);
        
        if (!senderSnap.exists() || !receiverSnap.exists()) throw "Profile missing";
        
        const newSenderBalance = (senderSnap.data().walletBalance || 0) - numAmount;
        const newReceiverBalance = (receiverSnap.data().walletBalance || 0) + numAmount;
        
        transaction.update(senderRef, { walletBalance: newSenderBalance });
        transaction.update(receiverRef, { walletBalance: newReceiverBalance });
        
        transaction.set(doc(collection(db, "users", profile.uid, "transactions")), {
          type: 'transfer_send',
          amount: numAmount,
          targetUserId: targetUser.id,
          targetUserName: targetUser.displayName,
          targetUserPhoto: targetUser.photoURL || "",
          description: `تحويل مرسل إلى ${targetUser.displayName}`,
          createdAt: new Date().toISOString()
        });
        
        transaction.set(doc(collection(db, "users", targetUser.id, "transactions")), {
          type: 'transfer_receive',
          amount: numAmount,
          senderUserId: profile.uid,
          senderUserName: profile.displayName,
          senderUserPhoto: profile.photoURL || "",
          description: `تحويل مستلم من ${profile.displayName}`,
          createdAt: new Date().toISOString()
        });
      });

      setStep(3);
      toast({ title: "اكتمل التحويل", description: "تم إرسال المبلغ بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحويل", description: "حدث خطأ غير متوقع." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-2xl border border-white/5 bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="p-12 text-center bg-slate-950">
            <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl">
               <ArrowRightLeft size={36} className="text-black" />
            </div>
            <CardTitle className="text-4xl font-headline font-bold gold-text">تحويل فوري</CardTitle>
            <CardDescription className="text-slate-400 mt-2">أرسل الرصيد لأصدقائك أو شركائك في ثوانٍ معدودة وبأمان تام.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-12">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pr-4">أدخل معرف المستلم أو بريده</label>
                  <div className="flex gap-4">
                    <Input 
                      placeholder="User ID أو البريد الإلكتروني..." 
                      className="h-20 rounded-2xl bg-white/5 border-none px-8 font-bold text-xl text-primary"
                      value={targetId}
                      onChange={e => setTargetId(e.target.value)}
                    />
                    <Button onClick={handleSearch} disabled={isProcessing} className="h-20 w-20 rounded-2xl bg-primary text-black p-0 shrink-0">
                      {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={28} />}
                    </Button>
                  </div>
                </div>
                <div className="p-8 bg-blue-500/5 rounded-3xl border border-blue-500/20 flex gap-6">
                   <User className="text-blue-500 shrink-0" size={32} />
                   <p className="text-xs text-blue-200 leading-relaxed font-medium">
                     تنبيه: تأكد دائماً من معرف المستلم قبل إرسال الرصيد. عمليات التحويل تتم في الوقت الفعلي ولا يمكن التراجع عنها.
                   </p>
                </div>
              </div>
            )}

            {step === 2 && targetUser && (
              <div className="space-y-10 animate-fade-in">
                 <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20 border-2 border-primary/30">
                        <AvatarImage src={targetUser.photoURL} />
                        <AvatarFallback className="bg-slate-800 text-primary font-bold">{targetUser.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase mb-1">المستلم</p>
                        <h4 className="font-bold text-2xl text-white">{targetUser.displayName}</h4>
                        <p className="text-xs opacity-40 font-mono uppercase">{targetUser.uid?.substring(0, 16)}...</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-slate-500 hover:text-white" onClick={() => setStep(1)}>تغيير</Button>
                 </div>

                 <div className="space-y-4">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pr-4 text-center block">المبلغ المراد إرساله (USD)</label>
                   <div className="relative">
                      <DollarSign className="absolute right-8 top-1/2 -translate-y-1/2 text-primary" size={32} />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="h-24 rounded-[2.5rem] bg-white/5 border-none text-5xl font-black text-center text-white pr-20"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                      />
                   </div>
                   <div className="flex justify-between px-6">
                      <span className="text-xs font-bold text-zinc-500">رصيدك المتوفر</span>
                      <span className="text-xs font-bold text-primary">{formatUSD(profile?.walletBalance || 0)}</span>
                   </div>
                 </div>

                 <Button 
                   onClick={handleTransfer} 
                   disabled={isProcessing} 
                   className="w-full h-20 royal-button text-2xl"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" /> : "تأكيد التحويل الآن"}
                 </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-10 animate-fade-in space-y-8">
                 <div className="w-32 h-32 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                    <CheckCircle2 size={64} />
                 </div>
                 <h2 className="text-4xl font-headline font-bold gold-text">تم التحويل بنجاح!</h2>
                 <p className="text-slate-400 text-lg">تم إرسال {formatUSD(Number(amount))} إلى {targetUser.displayName}.</p>
                 <Button asChild className="w-full h-16 rounded-2xl bg-white text-black font-bold text-xl hover:bg-slate-200">
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
