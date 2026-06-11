"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, addDoc, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Search, RefreshCw, ArrowUpRight, ArrowDownLeft, Loader2, History } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminFinance() {
  const db = useFirestore();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const transQuery = useMemo(() => query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(20)), [db]);
  const { data: globalTransactions, loading: transLoading } = useCollection(transQuery);

  const handleSearch = async () => {
    if (!searchEmail) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setTargetUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ variant: "destructive", title: "خطأ", description: "المستخدم غير موجود" });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBalance = async (type: 'deposit' | 'withdrawal') => {
    if (!targetUser || !amount) return;
    setIsProcessing(true);
    const num = Number(amount);
    const newBalance = type === 'deposit' ? (targetUser.walletBalance || 0) + num : (targetUser.walletBalance || 0) - num;

    try {
      await updateDoc(doc(db, "users", targetUser.id), { walletBalance: newBalance });
      const transData = {
        userId: targetUser.id,
        amount: num,
        type,
        description: `إجراء إداري: ${type === 'deposit' ? 'شحن رصيد' : 'خصم رصيد'}`,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "transactions"), transData);
      await addDoc(collection(db, "users", targetUser.id, "transactions"), transData);
      
      setTargetUser({...targetUser, walletBalance: newBalance});
      toast({ title: "تم التحديث", description: `الرصيد الجديد: ${formatUSD(newBalance)}` });
      setAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الرصيد" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header>
        <h1 className="text-4xl font-headline font-bold gold-text">البنك المركزي XMOOD</h1>
        <p className="text-muted-foreground mt-2">تحكم مطلق في السيولة، مراقبة التحويلات، وإصدار الاستردادات.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="luxury-card border-none lg:col-span-1">
          <CardHeader className="p-8 bg-white/5">
            <CardTitle className="flex items-center gap-3">
              <Wallet className="text-primary" /> تعديل رصيد مستخدم
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex gap-2">
              <Input 
                placeholder="بريد المستخدم..." 
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                className="bg-white/5 border-none h-12"
              />
              <Button onClick={handleSearch} disabled={isProcessing} className="h-12 w-12 p-0"><Search size={18} /></Button>
            </div>

            {targetUser && (
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs opacity-50">المستخدم</p>
                    <h3 className="font-bold">{targetUser.displayName}</h3>
                  </div>
                  <div className="text-left">
                    <p className="text-xs opacity-50">الرصيد الحالي</p>
                    <p className="font-black text-primary">{formatUSD(targetUser.walletBalance || 0)}</p>
                  </div>
                </div>
                <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="h-14 text-center text-2xl font-black bg-slate-900 border-primary/20" />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleUpdateBalance('deposit')} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white font-bold h-12"><ArrowUpRight size={18} /> شحن</Button>
                  <Button onClick={() => handleUpdateBalance('withdrawal')} disabled={isProcessing} variant="destructive" className="font-bold h-12"><ArrowDownLeft size={18} /> خصم</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="luxury-card border-none lg:col-span-2 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="flex items-center gap-3">
              <History className="text-primary" /> سجل التدفقات المالية الشامل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right py-6 pr-10">التاريخ</TableHead>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">العملية</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : globalTransactions?.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-white/5 border-b border-white/5">
                    <TableCell className="py-5 pr-10 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString('ar-EG')}</TableCell>
                    <TableCell className="font-bold text-xs uppercase">{t.userId.substring(0,8)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'deposit' ? 'إيداع إداري' : 'سحب/شراء'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' ? '+' : '-'}{formatUSD(t.amount)}
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
