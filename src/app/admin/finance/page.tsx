
"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, addDoc, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wallet, Search, RefreshCw, Loader2, History, Banknote, 
  Zap, DollarSign, TrendingUp, Landmark, ShieldCheck, ArrowUpRight 
} from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminFinanceCentralBank() {
  const db = useFirestore();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Central Settings
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);
  const [newRate, setNewRate] = useState("");

  // System Stats
  const usersRef = useMemoFirebase(() => collection(db, "users"), [db]);
  const ordersRef = useMemoFirebase(() => collection(db, "orders"), [db]);
  const { data: allUsers } = useCollection(usersRef);
  const { data: allOrders } = useCollection(ordersRef);

  const transQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(50));
  }, [db]);

  const { data: globalTransactions, loading: transLoading } = useCollection(transQuery);

  const stats = useMemo(() => {
    const floating = allUsers?.reduce((sum, u: any) => sum + (u.walletBalance || 0), 0) || 0;
    const profit = allOrders?.reduce((sum, o: any) => sum + (o.amount || 0), 0) || 0;
    return { floating, profit };
  }, [allUsers, allOrders]);

  const handleUpdateRate = () => {
    if (!newRate || !db) return;
    setIsProcessing(true);
    updateDoc(settingsRef, {
      "siteInfo.usdRate": Number(newRate),
      "siteInfo.lastRateUpdate": new Date().toISOString()
    }).then(() => {
      toast({ title: "تم تحديث سعر الصرف", description: "سيتم تطبيق السعر الجديد سيادياً على كافة الموقع." });
      setNewRate("");
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: settingsRef.path, operation: 'update' }));
    }).finally(() => setIsProcessing(false));
  };

  const handleSearch = async () => {
    if (!searchEmail || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setTargetUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ variant: "destructive", title: "خطأ", description: "المستخدم غير موجود في النظام." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateBalance = (type: 'deposit' | 'withdrawal') => {
    if (!targetUser || !amount || !db) return;
    setIsProcessing(true);
    const num = Number(amount);
    const newBalance = type === 'deposit' ? (targetUser.walletBalance || 0) + num : (targetUser.walletBalance || 0) - num;

    const userRef = doc(db, "users", targetUser.id);
    updateDoc(userRef, { walletBalance: newBalance })
      .then(() => {
        const transData = {
          userId: targetUser.id,
          amount: num,
          type,
          description: `إجراء إداري: ${type === 'deposit' ? 'إيداع رصيد معتمد' : 'خصم رصيد'}`,
          createdAt: new Date().toISOString()
        };
        addDoc(collection(db, "transactions"), transData);
        addDoc(collection(db, "users", targetUser.id, "transactions"), transData);
        
        setTargetUser({...targetUser, walletBalance: newBalance});
        toast({ title: "اكتمل الإجراء المالي", description: `الرصيد الجديد: ${formatUSD(newBalance)}` });
        setAmount("");
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userRef.path, operation: 'update' }));
      })
      .finally(() => setIsProcessing(false));
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-headline font-bold gold-text">الخزينة والبنك المركزي</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px] italic">Global Monetary & Treasury Command</p>
        </div>
        <div className="flex gap-4">
           <Badge variant="outline" className="border-green-500/20 text-green-500 px-6 py-2 rounded-full font-bold">MONETARY SYSTEM: ONLINE</Badge>
        </div>
      </header>

      {/* Treasury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="luxury-card border-none bg-primary text-black p-10 relative overflow-hidden">
           <Landmark className="absolute -right-10 -bottom-10 opacity-10 w-64 h-64" />
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">إجمالي السيولة العائمة (أرصدة الأعضاء)</p>
              <h2 className="text-6xl font-black tracking-tighter mb-4">{formatUSD(stats.floating)}</h2>
              <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                 <RefreshCw size={14} /> يتم التحديث لحظياً من قاعدة البيانات
              </div>
           </div>
        </Card>
        <Card className="luxury-card border-none bg-zinc-900 text-white p-10 relative overflow-hidden">
           <TrendingUp className="absolute -right-10 -bottom-10 opacity-10 w-64 h-64 text-primary" />
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-zinc-400">صافي التدفقات النقدية (المبيعات)</p>
              <h2 className="text-6xl font-black tracking-tighter mb-4 text-primary">{formatUSD(stats.profit)}</h2>
              <p className="text-xs font-bold text-zinc-500">إجمالي المبيعات المكتملة عبر المنصة</p>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-10 lg:col-span-1">
          {/* USD Rate Control */}
          <Card className="luxury-card border-none bg-primary/5">
            <CardHeader className="p-8 border-b border-primary/10">
              <CardTitle className="flex items-center gap-4 text-xl font-bold">
                <DollarSign className="text-primary" /> سعر الصرف السيادي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">السعر الحالي (SDG)</p>
                  <p className="text-4xl font-black text-primary">{config?.siteInfo?.usdRate || "---"}</p>
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">آخر تحديث</p>
                  <p className="text-[10px] font-bold">{config?.siteInfo?.lastRateUpdate ? new Date(config.siteInfo.lastRateUpdate).toLocaleDateString('ar-EG') : '---'}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-primary/10 space-y-4">
                <Input 
                  type="number" 
                  placeholder="أدخل السعر الجديد..." 
                  value={newRate}
                  onChange={e => setNewRate(e.target.value)}
                  className="bg-background border-primary/20 h-12 rounded-xl text-center font-bold"
                />
                <Button onClick={handleUpdateRate} disabled={isProcessing} className="w-full h-12 royal-button">
                   تحديث سعر الصرف
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manual Deposit */}
          <Card className="luxury-card border-none bg-card/60 backdrop-blur-xl">
            <CardHeader className="p-8 bg-muted/20 border-b">
              <CardTitle className="flex items-center gap-4 text-xl font-bold">
                <Banknote className="text-primary" /> إيداع رصيد يدوي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex gap-3">
                <Input 
                  placeholder="بريد العضو..." 
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  className="bg-muted/30 border-none h-14 rounded-xl px-6 font-bold"
                />
                <Button onClick={handleSearch} disabled={isProcessing} className="h-14 w-14 rounded-xl p-0 bg-primary text-black">
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Search size={22} />}
                </Button>
              </div>

              {targetUser && (
                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6 animate-fade-up">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{targetUser.displayName}</h3>
                    <p className="font-black text-xl text-primary">{formatUSD(targetUser.walletBalance || 0)}</p>
                  </div>
                  
                  <Input type="number" placeholder="المبلغ (USD)..." value={amount} onChange={e => setAmount(e.target.value)} className="h-14 text-center text-2xl font-black bg-background border-primary/20 rounded-xl" />

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => handleUpdateBalance('deposit')} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white font-black h-12 rounded-xl">إيداع</Button>
                    <Button onClick={() => handleUpdateBalance('withdrawal')} disabled={isProcessing} variant="destructive" className="font-black h-12 rounded-xl">خصم</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="luxury-card border-none lg:col-span-2 overflow-hidden bg-card/60 backdrop-blur-xl">
          <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-4 text-xl font-bold">
              <History className="text-primary" /> دفتر الأستاذ المالي
            </CardTitle>
            <Badge variant="outline" className="text-muted-foreground uppercase text-[8px] font-black px-4">Live Master Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[700px]">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="text-right py-6 pr-10 font-black text-[9px] uppercase">التوقيت</TableHead>
                    <TableHead className="text-right font-black text-[9px] uppercase">التفاصيل</TableHead>
                    <TableHead className="text-right font-black text-[9px] uppercase">النوع</TableHead>
                    <TableHead className="text-left pl-10 font-black text-[9px] uppercase">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : globalTransactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-40 font-bold opacity-30">لا توجد سجلات مالية</TableCell></TableRow>
                  ) : globalTransactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 border-border transition-all">
                      <TableCell className="py-6 pr-10">
                        <span className="text-xs font-bold block">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span className="text-[8px] text-muted-foreground uppercase">{new Date(t.createdAt).toLocaleTimeString('ar-EG')}</span>
                      </TableCell>
                      <TableCell>
                         <p className="text-[10px] font-mono font-bold uppercase">{t.userId?.substring(0,12)}...</p>
                         <p className="text-[8px] text-muted-foreground italic truncate max-w-[150px]">{t.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full text-[8px] font-black uppercase px-3 ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                          {t.type === 'deposit' ? 'إيداع' : 'سحب/شراء'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-left pl-10 font-black text-xl ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
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

