"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, Send, Users, ArrowRightLeft, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import Link from "next/link";

export default function WalletPage() {
  const { profile, user, loading: userLoading } = useUser();
  const db = useFirestore();

  const transactionsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: transactions, loading: transLoading } = useCollection(transactionsQuery);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ الملكي", description: "معرفك الرقمي جاهز للتقديم للوكلاء." });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-primary" /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h1 className="text-6xl font-headline font-bold gold-text">الخزانة الملكية</h1>
            <p className="text-slate-400 text-lg mt-3">إدارة السيولة، تحويلات P2P، وتتبع نقاط الأفضلية.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button asChild className="h-16 px-10 royal-button flex-1 md:flex-none text-lg">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-2" /> تحويل رصيد P2P</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 border-primary/20 text-primary rounded-3xl font-bold flex-1 md:flex-none">
              <Link href="/marketplace">السوق المفتوح</Link>
            </Button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          
          {/* Balance Card */}
          <Card className="luxury-card border-none relative overflow-hidden group p-2">
            <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 blur-[100px] rounded-full transition-all group-hover:bg-primary/20"></div>
            <CardHeader className="p-10 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">الرصيد السيادي</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="text-7xl font-black text-white mb-3 tracking-tighter">{formatUSD(balance)}</div>
              <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">{formatSDG(balance)}</div>
            </CardContent>
          </Card>

          {/* Points & Protocol */}
          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden legendary-border">
            <CardHeader className="p-10 border-b border-white/5 bg-white/5 flex flex-row justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center gap-4 gold-text">
                <ShieldCheck className="text-primary" /> بروتوكول الشحن والشفافية
              </CardTitle>
              <div className="flex items-center gap-3 bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                <Trophy size={16} className="text-primary" />
                <span className="text-xs font-black text-primary uppercase">Points: 0</span>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
              <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 gold-text">تنبيه الإدارة العليا:</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">
                    شحن الرصيد يتم <span className="text-primary font-black underline">حصرياً وعبر الوكلاء المعتمدين</span>. قم بتقديم المعرف الرقمي الخاص بك (USER ID) للوكيل وسيتم تحديث محفظتك في أجزاء من الثانية.
                  </p>
                </div>
                <div className="w-full md:w-auto space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">معرفك الرقمي الملكي</p>
                  <div className="flex items-center gap-4 bg-black/60 px-8 py-5 rounded-3xl border border-dashed border-primary/30">
                    <span className="font-mono font-black text-2xl text-primary tracking-widest">{user?.uid?.substring(0, 12).toUpperCase()}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(user?.uid || "")} className="text-primary hover:bg-primary/10">
                      <Copy size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="luxury-card border-none overflow-hidden">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <History size={28} className="text-primary" /> سجل التدفق المالي السيادي
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest">Immutable Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right py-8 pr-10 font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">توقيت العملية</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">نوع الإجراء</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">القيمة</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">بروتوكول التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                    <TableCell className="py-8 pr-10 text-xs font-bold text-slate-500">
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <div className={`px-4 py-2 rounded-full inline-flex font-black text-[10px] uppercase border ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'}`}>
                        {t.type === 'deposit' ? 'إيداع إداري' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء باقة'}
                      </div>
                    </TableCell>
                    <TableCell className={`font-black text-2xl ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-[10px] font-black uppercase leading-relaxed max-w-xs">
                      {t.description || "عملية معتمدة من نظام XMOOD السيادي"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-40">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                         <Star size={80} className="text-primary" />
                         <p className="text-2xl font-black uppercase tracking-widest text-primary">No Activity Logged</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}