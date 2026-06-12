"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, ArrowRightLeft, Trophy, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { query, collection, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
    toast({ title: "تم النسخ بنجاح", description: "معرفك الرقمي جاهز للتقديم للوكلاء." });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-primary" /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-black font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-primary/10 pb-12">
          <div>
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">Sovereign Asset Vault</Badge>
            <h1 className="text-6xl font-headline font-bold gold-text">المحفظة السيادية</h1>
            <p className="text-slate-500 text-lg mt-3 font-light">إدارة الأصول الرقمية، تحويلات P2P، وتتبع نظام الأفضلية.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button asChild className="h-20 px-12 royal-button text-xl">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-2" /> تحويل P2P</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 px-12 border-primary/20 text-primary rounded-3xl font-black text-lg bg-primary/5 hover:bg-primary/10">
              <Link href="/marketplace">سوق التداول</Link>
            </Button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <Card className="luxury-card border-none relative overflow-hidden p-4 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/60">الرصيد المتاح (USD)</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{formatUSD(balance)}</div>
              <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">{formatSDG(balance)}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden legendary-border p-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-4 text-primary">
                  <ShieldCheck size={32} />
                  <h3 className="text-2xl font-bold gold-text">بروتوكول الشحن المعتمد</h3>
               </div>
               <p className="text-slate-400 leading-relaxed font-light text-sm">
                  يتم شحن الرصيد حصرياً عبر شبكة الوكلاء المعتمدين. قم بتقديم معرفك الرقمي للوكيل وسيتم تحديث الخزانة فوراً.
               </p>
               <div className="flex items-center gap-6">
                  <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex flex-col items-center">
                     <span className="text-[10px] text-slate-500 font-black uppercase mb-1">نقاط الأفضلية</span>
                     <span className="text-2xl font-black text-primary">0</span>
                  </div>
                  <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex flex-col items-center">
                     <span className="text-[10px] text-slate-500 font-black uppercase mb-1">الرتبة</span>
                     <Badge className="bg-primary/10 text-primary border-primary/20">{profile?.label || "عضو"}</Badge>
                  </div>
               </div>
            </div>
            <div className="w-full md:w-auto space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Your Royal UID</p>
              <div className="flex items-center gap-4 bg-black/40 px-10 py-6 rounded-3xl border border-dashed border-primary/30 shadow-inner group cursor-pointer hover:border-primary transition-all" onClick={() => copyToClipboard(user?.uid || "")}>
                <span className="font-mono font-black text-3xl text-primary tracking-[0.2em]">{user?.uid?.substring(0, 10).toUpperCase()}</span>
                <Copy size={20} className="text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between bg-white/5">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <History size={28} className="text-primary" /> سجل التدفق المالي السيادي
            </CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest">Secured Blockchain Sync</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-right py-8 pr-10 font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">التوقيت</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">الإجراء</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">المبلغ</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-[0.3em] text-primary/40">بروتوكول التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-b border-white/5">
                    <TableCell className="py-10 pr-10 text-xs font-bold text-slate-500">
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full font-black text-[10px] uppercase ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {t.type === 'deposit' ? 'إيداع إداري' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء أصول'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black text-3xl ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-[10px] font-black uppercase leading-relaxed max-w-xs">
                      {t.description || "معتمد من النظام"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-40">
                      <div className="flex flex-col items-center gap-4 opacity-10">
                         <TrendingUp size={100} />
                         <p className="text-2xl font-black uppercase tracking-widest">No Transactions Registered</p>
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
