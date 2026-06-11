
"use client";

import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, updateDoc, addDoc, query, where, limit, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, Search, ArrowUpRight, ArrowDownLeft, Loader2, DollarSign } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

export default function AdminFinance() {
  const db = useFirestore();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearchUser = async () => {
    if (!searchEmail) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim()), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setTargetUser({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        toast({ title: "تم العثور على المستخدم", description: `المستخدم: ${querySnapshot.docs[0].data().displayName}` });
      } else {
        setTargetUser(null);
        toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على مستخدم" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ في البحث" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBalance = async (type: 'deposit' | 'withdrawal') => {
    if (!targetUser || !amount || isNaN(Number(amount))) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال مبلغ صحيح" });
      return;
    }

    setIsProcessing(true);
    const numAmount = Number(amount);
    const newBalance = type === 'deposit' 
      ? (targetUser.walletBalance || 0) + numAmount 
      : (targetUser.walletBalance || 0) - numAmount;

    try {
      await updateDoc(doc(db, "users", targetUser.id), { walletBalance: newBalance });
      await addDoc(collection(db, "users", targetUser.id, "transactions"), {
        type: type,
        amount: numAmount,
        description: `إدارة XMOOD: ${type === 'deposit' ? 'شحن رصيد' : 'خصم رصيد'}`,
        createdAt: new Date().toISOString()
      });

      toast({ title: "نجحت العملية", description: `الرصيد الجديد: ${formatUSD(newBalance)}` });
      setTargetUser({ ...targetUser, walletBalance: newBalance });
      setAmount("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الرصيد" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-4xl font-headline font-bold mb-2">الإدارة المالية الملكية</h1>
        <p className="text-muted-foreground">تحكم كامل في أرصدة المستخدمين والتحويلات المالية.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Wallet className="text-primary" /> تعديل رصيد المحفظة
            </CardTitle>
            <CardDescription className="text-slate-400">ابحث عن العميل بالبريد لتعديل رصيده فوراً.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="flex gap-4">
              <Input 
                placeholder="بريد العميل الإلكتروني..." 
                className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={handleSearchUser} disabled={isProcessing} className="h-16 w-16 rounded-2xl p-0">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={24} />}
              </Button>
            </div>

            {targetUser && (
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-primary/20 space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العميل المستهدف</p>
                      <h3 className="font-bold text-xl">{targetUser.displayName}</h3>
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الرصيد الحالي</p>
                      <p className="text-3xl font-black text-primary">{formatUSD(targetUser.walletBalance || 0)}</p>
                   </div>
                </div>

                <div className="space-y-6 pt-4 border-t">
                  <div className="relative">
                    <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                    <Input 
                      type="number" 
                      placeholder="المبلغ بالدولار (USD)" 
                      className="h-16 rounded-2xl bg-white pr-16 text-2xl font-black text-center shadow-sm"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Button 
                      onClick={() => handleUpdateBalance('deposit')}
                      disabled={isProcessing}
                      className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold gap-3 text-lg"
                    >
                      <ArrowUpRight size={20} /> شحن (إيداع)
                    </Button>
                    <Button 
                      onClick={() => handleUpdateBalance('withdrawal')}
                      disabled={isProcessing}
                      variant="destructive"
                      className="h-16 rounded-2xl font-bold gap-3 text-lg"
                    >
                      <ArrowDownLeft size={20} /> خصم (سحب)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-12 flex flex-col justify-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-headline font-bold text-primary">إحصائيات الإدارة</h2>
            <div className="space-y-6">
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">إجمالي أرصدة المستخدمين</p>
                 <p className="text-4xl font-black">$---,---</p>
               </div>
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">العمليات اليومية</p>
                 <p className="text-4xl font-black">---</p>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
