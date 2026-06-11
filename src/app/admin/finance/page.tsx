
"use client";

import { useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc, addDoc, query, orderBy, limit, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Search, ArrowUpRight, ArrowDownLeft, Loader2, Send, History } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

export default function AdminFinance() {
  const db = useFirestore();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("شحن رصيد - إدارة XMOOD");
  const [isProcessing, setIsProcessing] = useState(false);

  // البحث عن مستخدم بالبريد الإلكتروني
  const handleSearchUser = async () => {
    if (!searchEmail) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.toLowerCase()), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setTargetUser({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        toast({ title: "تم العثور على المستخدم", description: `المستخدم: ${querySnapshot.docs[0].data().displayName}` });
      } else {
        setTargetUser(null);
        toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على مستخدم بهذا البريد" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء البحث" });
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
      // 1. تحديث رصيد المستخدم
      await updateDoc(doc(db, "users", targetUser.id), {
        walletBalance: newBalance
      });

      // 2. إضافة عملية للسجل
      await addDoc(collection(db, "users", targetUser.id, "transactions"), {
        type: type,
        amount: numAmount,
        description: description,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      toast({ title: "تمت العملية بنجاح", description: `الرصيد الجديد: ${formatUSD(newBalance)}` });
      setTargetUser({ ...targetUser, walletBalance: newBalance });
      setAmount("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الرصيد" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-3xl font-headline font-bold mb-1">الإدارة المالية</h1>
        <p className="text-muted-foreground">تحويل الأموال، شحن المحافظ، ومراجعة سجل العمليات.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* التحويل والشحن */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="text-primary" /> شحن / خصم رصيد
            </CardTitle>
            <CardDescription>ابحث عن المستخدم بالبريد الإلكتروني للتحكم في رصيده.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex gap-2">
              <Input 
                placeholder="البريد الإلكتروني للعميل..." 
                className="h-12 rounded-2xl bg-slate-50 border-none"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={handleSearchUser} disabled={isProcessing} className="h-12 w-12 rounded-2xl p-0">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              </Button>
            </div>

            {targetUser && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-primary/20 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                   <div className="text-right">
                      <p className="text-xs font-bold text-muted-foreground uppercase">المستخدم الحالي</p>
                      <h3 className="font-bold text-lg">{targetUser.displayName}</h3>
                      <p className="text-xs text-primary font-mono">{targetUser.uid}</p>
                   </div>
                   <div className="text-left">
                      <p className="text-xs font-bold text-muted-foreground uppercase">الرصيد الحالي</p>
                      <p className="text-2xl font-black text-primary">{formatUSD(targetUser.walletBalance || 0)}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Input 
                    type="number" 
                    placeholder="المبلغ بالدولار (USD)" 
                    className="h-14 rounded-2xl bg-white text-center text-xl font-bold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Input 
                    placeholder="سبب العملية (اختياري)..." 
                    className="h-12 rounded-2xl bg-white"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleUpdateBalance('deposit')}
                      disabled={isProcessing}
                      className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                    >
                      <ArrowUpRight size={18} /> شحن (إيداع)
                    </Button>
                    <Button 
                      onClick={() => handleUpdateBalance('withdrawal')}
                      disabled={isProcessing}
                      variant="destructive"
                      className="h-14 rounded-2xl font-bold gap-2"
                    >
                      <ArrowDownLeft size={18} /> خصم (سحب)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات سريعة */}
        <div className="space-y-6">
           <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-8">
              <h3 className="text-sm font-bold opacity-60 uppercase mb-4 tracking-widest">إرشادات الإدارة</h3>
              <ul className="space-y-4 text-sm font-light">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>تتم كافة العمليات بالدولار الأمريكي (USD) وتتحول تلقائياً في واجهة العميل.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>كل عملية شحن يتم توثيقها فوراً في سجل العميل كمرجع قانوني.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p>يرجى التأكد من "معرف العميل" قبل إتمام عمليات المبالغ الكبيرة.</p>
                </li>
              </ul>
           </Card>

           <Card className="border-none shadow-sm rounded-3xl p-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">سعر الصرف الحالي</p>
                <p className="text-2xl font-bold text-slate-900">1 USD = 5400 SDG</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Send size={24} />
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
