
"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc, updateDoc, addDoc, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, Search, ArrowUpRight, ArrowDownLeft, Loader2, DollarSign, History, RefreshCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminFinance() {
  const db = useFirestore();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const globalTransQuery = useMemo(() => query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(20)), [db]);
  const { data: globalTransactions, loading: transLoading } = useCollection(globalTransQuery);

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
        toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على مستخدم بهذا البريد" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ في عملية البحث" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBalance = (type: 'deposit' | 'withdrawal' | 'refund') => {
    if (!targetUser || !amount || isNaN(Number(amount))) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال مبلغ مالي صحيح" });
      return;
    }

    setIsProcessing(true);
    const numAmount = Number(amount);
    const newBalance = type === 'deposit' 
      ? (targetUser.walletBalance || 0) + numAmount 
      : (targetUser.walletBalance || 0) - numAmount;

    const userRef = doc(db, "users", targetUser.id);
    
    // تنفيذ التحديث
    updateDoc(userRef, { walletBalance: newBalance })
      .then(() => {
        const transData = {
          userId: targetUser.id,
          type: type,
          amount: numAmount,
          description: `إدارة XMOOD: ${type === 'deposit' ? 'شحن رصيد إداري' : type === 'refund' ? 'استرداد مبلغ' : 'خصم إداري'}`,
          createdAt: new Date().toISOString(),
          status: 'success'
        };

        // إضافة العمليات للسجلات دون انتظار
        addDoc(collection(db, "users", targetUser.id, "transactions"), transData);
        addDoc(collection(db, "transactions"), transData);

        toast({ title: "نجحت العملية", description: `الرصيد الجديد للعميل: ${formatUSD(newBalance)}` });
        setTargetUser({ ...targetUser, walletBalance: newBalance });
        setAmount("");
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { walletBalance: newBalance }
        }));
      })
      .finally(() => setIsProcessing(false));
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">المركز المالي الملكي</h1>
          <p className="text-muted-foreground text-lg">تحكم مطلق في السيولة، مراقبة التحويلات، ومعالجة الاسترداد.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Wallet className="text-primary" /> تعديل الأرصدة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="flex gap-3">
              <Input 
                placeholder="بريد العميل..." 
                className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-bold"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={handleSearchUser} disabled={isProcessing} className="h-16 w-16 rounded-2xl p-0 shrink-0">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={24} />}
              </Button>
            </div>

            {targetUser && (
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-primary/20 space-y-6 animate-fade-in">
                <div className="flex justify-between items-start">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العميل</p>
                      <h3 className="font-bold text-xl">{targetUser.displayName}</h3>
                      <Badge variant="outline" className="mt-1">{targetUser.role === 'admin' ? 'مدير' : targetUser.role === 'agent' ? 'وكيل' : 'عضو'}</Badge>
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الرصيد</p>
                      <p className="text-3xl font-black text-primary">{formatUSD(targetUser.walletBalance || 0)}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="relative">
                    <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="h-16 rounded-2xl bg-white pr-16 text-3xl font-black text-center shadow-sm"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleUpdateBalance('deposit')}
                        disabled={isProcessing}
                        className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                      >
                        <ArrowUpRight size={18} /> شحن
                      </Button>
                      <Button 
                        onClick={() => handleUpdateBalance('withdrawal')}
                        disabled={isProcessing}
                        variant="destructive"
                        className="h-14 rounded-2xl font-bold gap-2"
                      >
                        <ArrowDownLeft size={18} /> خصم
                      </Button>
                    </div>
                    <Button 
                      onClick={() => handleUpdateBalance('refund')}
                      disabled={isProcessing}
                      variant="outline"
                      className="h-14 rounded-2xl border-primary text-primary hover:bg-primary/5 font-bold gap-2"
                    >
                      <RefreshCcw size={18} /> استرداد (Refund)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="p-10 border-b">
            <CardTitle className="text-2xl flex items-center gap-3">
              <History className="text-primary" /> تتبع التدفقات المالية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right py-6 pr-10 font-black text-[10px] uppercase">التاريخ</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">المستخدم</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">النوع</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">جاري تحميل السجلات...</TableCell></TableRow>
                ) : globalTransactions?.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/50">
                    <TableCell className="py-6 pr-10 text-xs font-medium text-slate-500">
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm">UID: {t.userId.substring(0,8)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full font-bold text-[10px] ${
                        t.type === 'deposit' ? 'text-green-600 bg-green-50' : 
                        t.type === 'refund' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
                      }`}>
                        {t.type === 'deposit' ? 'إيداع' : t.type === 'purchase' ? 'شراء' : t.type === 'refund' ? 'استرداد' : 'سحب'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black ${t.type === 'deposit' || t.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'deposit' || t.type === 'refund' ? '+' : '-'}{formatUSD(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
