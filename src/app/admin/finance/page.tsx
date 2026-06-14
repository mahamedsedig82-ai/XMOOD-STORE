
"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, addDoc, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, Search, RefreshCw, ArrowUpRight, ArrowDownLeft, Loader2, History, Banknote } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminFinanceCentralBank() {
  const db = useFirestore();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const transQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(50));
  }, [db]);

  const { data: globalTransactions, loading: transLoading } = useCollection(transQuery);

  const handleSearch = async () => {
    if (!searchEmail || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setTargetUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ variant: "destructive", title: "خطأ", description: "المستخدم غير موجود في النظام المعتمد." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBalance = async (type: 'deposit' | 'withdrawal') => {
    if (!targetUser || !amount || !db) return;
    setIsProcessing(true);
    const num = Number(amount);
    const newBalance = type === 'deposit' ? (targetUser.walletBalance || 0) + num : (targetUser.walletBalance || 0) - num;

    try {
      await updateDoc(doc(db, "users", targetUser.id), { walletBalance: newBalance });
      
      const transData = {
        userId: targetUser.id,
        amount: num,
        type,
        description: `إجراء إداري: ${type === 'deposit' ? 'إيداع رصيد معتمد' : 'خصم رصيد'}`,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "transactions"), transData);
      await addDoc(collection(db, "users", targetUser.id, "transactions"), transData);
      
      setTargetUser({...targetUser, walletBalance: newBalance});
      toast({ title: "اكتمل الإجراء المالي", description: `الرصيد الجديد: ${formatUSD(newBalance)}` });
      setAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل العملية", description: "تأكد من صلاحيات الوصول المالي." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">البنك المركزي XMOOD</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-xs italic">Professional Monetary Control Hub</p>
        </div>
        <div className="flex gap-4">
           <Badge variant="outline" className="border-green-500/20 text-green-500 px-6 py-2 rounded-full font-bold">SYSTEM STATUS: ACTIVE</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="luxury-card border-none lg:col-span-1 bg-card/60 backdrop-blur-xl">
          <CardHeader className="p-8 bg-muted/20 border-b">
            <CardTitle className="flex items-center gap-4 text-xl font-bold">
              <Banknote className="text-primary" /> تسوية الأرصدة المعتمدة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex gap-3">
              <Input 
                placeholder="البريد الإلكتروني للعضو..." 
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                className="bg-muted/30 border-none h-14 rounded-xl px-6 font-bold"
              />
              <Button onClick={handleSearch} disabled={isProcessing} className="h-14 w-14 rounded-xl p-0 bg-primary text-black">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={22} />}
              </Button>
            </div>

            {targetUser && (
              <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-8 animate-fade-up">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">العضو المكتشف</p>
                    <h3 className="font-bold text-xl">{targetUser.displayName}</h3>
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">الرصيد الحالي</p>
                    <p className="font-black text-2xl text-primary">{formatUSD(targetUser.walletBalance || 0)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                   <label className="text-[9px] font-black text-primary uppercase pr-2">المبلغ المراد تسويته (USD)</label>
                   <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="h-16 text-center text-3xl font-black bg-background border-primary/20 rounded-2xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleUpdateBalance('deposit')} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white font-black h-14 rounded-xl shadow-xl shadow-green-600/10"><ArrowUpRight size={18} className="ml-2" /> إيداع</Button>
                  <Button onClick={() => handleUpdateBalance('withdrawal')} disabled={isProcessing} variant="destructive" className="font-black h-14 rounded-xl shadow-xl shadow-red-600/10"><ArrowDownLeft size={18} className="ml-2" /> خصم</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="luxury-card border-none lg:col-span-2 overflow-hidden bg-card/60 backdrop-blur-xl">
          <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-4 text-xl font-bold">
              <History className="text-primary" /> سجل التدفقات المالية الموحد
            </CardTitle>
            <Badge variant="outline" className="text-muted-foreground uppercase text-[8px] font-black tracking-widest px-4">Live Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <Table className="responsive-table">
                <TableHeader className="bg-muted/40 sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-right py-6 pr-10 font-black text-[9px] uppercase">التوقيت</TableHead>
                    <TableHead className="text-right font-black text-[9px] uppercase">المعرف</TableHead>
                    <TableHead className="text-right font-black text-[9px] uppercase">النوع</TableHead>
                    <TableHead className="text-left pl-10 font-black text-[9px] uppercase">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : globalTransactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-40 font-bold opacity-30">لا توجد سجلات مالية بعد</TableCell></TableRow>
                  ) : globalTransactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 border-border transition-all">
                      <TableCell className="py-6 pr-10" data-label="التوقيت">
                        <span className="text-xs font-bold block">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">{new Date(t.createdAt).toLocaleTimeString('ar-EG')}</span>
                      </TableCell>
                      <TableCell data-label="المعرف">
                         <p className="text-[10px] font-mono font-bold uppercase">{t.userId?.substring(0,12)}...</p>
                         <p className="text-[8px] text-muted-foreground italic truncate max-w-[150px]">{t.description}</p>
                      </TableCell>
                      <TableCell data-label="النوع">
                        <Badge variant="outline" className={`rounded-full text-[8px] font-black uppercase px-3 ${t.type === 'deposit' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                          {t.type === 'deposit' ? 'إيداع مركزي' : 'سحب / شراء'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-left pl-10 font-black text-xl tracking-tighter ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`} data-label="المبلغ">
                        {t.type === 'deposit' ? '+' : '-'}{formatUSD(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
