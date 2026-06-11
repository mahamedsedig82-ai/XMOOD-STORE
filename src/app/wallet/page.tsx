"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Copy, Loader2, ShieldCheck, Users } from "lucide-react";
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

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-slate-50 font-body" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-5xl font-headline font-bold mb-3">الخزينة الرقمية</h1>
          <p className="text-muted-foreground text-lg">إدارة الرصيد الملكي والتحويلات الآمنة في XMOOD STORE.</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
            <CardHeader className="p-10 pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">الرصيد المتاح</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="text-5xl font-black text-white mb-2">{formatUSD(balance)}</div>
              <div className="text-lg font-bold text-slate-400">{formatSDG(balance)}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden luxury-card">
            <CardHeader className="p-10 border-b bg-slate-50/50">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                بروتوكول شحن الرصيد <ShieldCheck className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="bg-primary/5 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 border border-primary/10">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">تنبيه هام:</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    شحن الرصيد يتم <span className="text-primary font-black underline">حصرياً عبر الوكلاء المعتمدين</span>. 
                    قدم المعرف الخاص بك للوكيل ليقوم بشحن حسابك فوراً.
                  </p>
                </div>
                <Button asChild className="h-14 px-8 rounded-xl bg-slate-950 text-white font-bold hover:bg-primary">
                  <Link href="/marketplace?tab=agents"><Users className="ml-2" /> قائمة الوكلاء</Link>
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">معرف الحساب (USER ID)</p>
                  <div className="flex items-center justify-between bg-slate-50 px-6 py-4 rounded-xl border border-dashed border-primary/30">
                    <span className="font-mono font-black text-2xl text-primary tracking-widest">{user?.uid?.substring(0, 12).toUpperCase() || "---"}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(user?.uid || "")} className="text-slate-400 hover:text-primary">
                      <Copy size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <History size={24} className="text-primary" /> سجل التدفق المالي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right py-6 pr-10 font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">نوع المعاملة</TableHead>
                  <TableHead className="text-right font-bold">القيمة</TableHead>
                  <TableHead className="text-right font-bold">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-slate-50 transition-colors border-b">
                    <TableCell className="py-6 pr-10 text-xs font-medium text-slate-500">
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full font-bold ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'deposit' ? 'إيداع' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-black text-lg ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] font-bold">
                      {t.description || "معاملة نظام XMOOD"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-24 text-muted-foreground font-light text-xl">لا توجد عمليات مسجلة.</TableCell>
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
