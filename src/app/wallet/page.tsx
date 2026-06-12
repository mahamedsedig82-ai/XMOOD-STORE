"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, History, Copy, Loader2, Send, Users, ArrowRightLeft } from "lucide-react";
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
    toast({ title: "تم النسخ", description: "تم نسخ المعرف الخاص بك بنجاح" });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary" /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-slate-950 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-6xl font-headline font-bold gold-text">الخزينة الملكية</h1>
            <p className="text-slate-400 text-lg mt-2">إدارة السيولة والتحويلات الآمنة في منصة XMOOD.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button asChild className="h-16 px-10 royal-button flex-1 md:flex-none text-lg">
              <Link href="/wallet/transfer"><ArrowRightLeft className="ml-2" /> تحويل رصيد P2P</Link>
            </Button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <Card className="luxury-card p-2 overflow-hidden relative border-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] rounded-full"></div>
            <CardHeader className="p-10 pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">الرصيد المتاح</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="text-6xl font-black text-white mb-2">{formatUSD(balance)}</div>
              <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">{formatSDG(balance)}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 luxury-card border-none overflow-hidden">
            <CardHeader className="p-10 border-b border-white/5 bg-white/5">
              <CardTitle className="text-2xl font-bold flex items-center gap-4">
                <ShieldCheck className="text-primary" /> بروتوكول شحن الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-white">تنبيه إداري:</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    شحن الرصيد يتم <span className="text-primary font-black underline">حصرياً عبر الوكلاء المعتمدين</span>. قدم معرفك الرقمي للوكيل ليتم شحن حسابك فوراً.
                  </p>
                </div>
                <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-primary/20 text-primary font-bold hover:bg-primary/10">
                  <Link href="/marketplace"><Users className="ml-2" /> قائمة الوكلاء</Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pr-4">المعرف الرقمي الخاص بك (USER ID)</p>
                <div className="flex items-center justify-between bg-black/40 px-8 py-6 rounded-3xl border border-dashed border-primary/40 group">
                  <span className="font-mono font-black text-3xl text-primary tracking-[0.2em]">{user?.uid?.substring(0, 14).toUpperCase() || "---"}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(user?.uid || "")} className="text-slate-500 hover:text-primary transition-all">
                    <Copy size={24} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="luxury-card border-none overflow-hidden">
          <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <History size={28} className="text-primary" /> سجل التدفق المالي اللحظي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right py-8 pr-10 font-black uppercase text-[10px] tracking-widest text-slate-500">التاريخ</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-500">النوع</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-500">القيمة</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-500">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-white/5 transition-all border-b border-white/5">
                    <TableCell className="py-8 pr-10 text-xs font-bold text-slate-500">
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <div className={`px-4 py-2 rounded-full inline-flex font-black text-[10px] uppercase border ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'}`}>
                        {t.type === 'deposit' ? 'إيداع إداري' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء باقة'}
                      </div>
                    </TableCell>
                    <TableCell className={`font-black text-xl ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-slate-400 text-[10px] font-black uppercase leading-relaxed">
                      {t.description || "عملية معتمدة من نظام XMOOD"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-32 text-slate-600 font-bold text-lg italic opacity-40">
                      لا توجد عمليات مسجلة في خزنتك حتى الآن.
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
