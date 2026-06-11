"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Info, Copy, Loader2, ShieldCheck, Users } from "lucide-react";
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

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-[#FAFAFA]" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <header className="mb-12 text-right">
          <div className="flex items-center justify-end gap-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Secure Financial Hub</span>
            <div className="w-8 h-px bg-primary/30"></div>
          </div>
          <h1 className="text-5xl font-headline font-bold mb-3">الخزينة الرقمية</h1>
          <p className="text-muted-foreground text-lg font-light">إدارة الرصيد الملكي والتحويلات الآمنة في XMOOD STORE.</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* رصيد المحفظة الفاخر */}
          <Card className="border-none shadow-2xl rounded-[3.5rem] bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <CardHeader className="p-10 pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">الرصيد المتاح حالياً</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="text-6xl font-black text-white mb-2 tracking-tighter">{formatUSD(balance)}</div>
              <div className="text-lg font-bold text-slate-400 mb-8">{formatSDG(balance)}</div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-black">حالة المحفظة</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-green-500 font-black uppercase">Active & Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات الشحن والوكلاء */}
          <Card className="lg:col-span-2 border-none shadow-xl rounded-[3.5rem] bg-white overflow-hidden luxury-card">
            <CardHeader className="p-10 border-b bg-slate-50/50">
              <CardTitle className="text-2xl font-bold flex items-center justify-end gap-3">
                بروتوكول شحن الرصيد <ShieldCheck className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-right">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">تنبيه ملكي هام:</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    شحن رصيد المحفظة يتم <span className="text-primary font-black underline">حصرياً عبر الوكلاء المعتمدين</span> لضمان الأمان المالي. 
                    كل ما عليك هو اختيار وكيل، تحويل المبلغ له، وتقديم "المعرف" الخاص بك ليقوم بشحن حسابك فوراً.
                  </p>
                </div>
                <Button asChild className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-primary transition-all shrink-0 shadow-lg">
                  <Link href="/marketplace?tab=agents"><Users className="ml-2" /> قائمة الوكلاء المعتمدين</Link>
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
                 <div className="text-right flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">معرف الحساب الشخصي (YOUR ID)</p>
                    <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-dashed border-primary/30 group">
                      <span className="font-mono font-black text-2xl text-primary tracking-[0.2em]">{user?.uid?.substring(0, 12).toUpperCase() || "---"}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-full hover:bg-primary/10 text-slate-300 hover:text-primary transition-all"
                        onClick={() => copyToClipboard(user?.uid || "")}
                      >
                        <Copy size={18} />
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3">انسخ هذا المعرف وأرسله للوكيل المعتمد ليقوم بتمويل حسابك.</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* سجل العمليات الفاخر */}
        <Card className="border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white">
          <CardHeader className="p-10 border-b flex flex-row items-center justify-between bg-slate-50/50">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <History size={28} className="text-primary" /> سجل التدفق المالي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right py-8 pr-10 font-black text-[10px] uppercase tracking-widest">تاريخ العملية</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">نوع المعاملة</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">القيمة (USD)</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest">تفاصيل السجل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-primary w-12 h-12" /></TableCell></TableRow>
                ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-slate-50 transition-colors border-b last:border-0 group">
                    <TableCell className="py-8 pr-10 text-xs font-medium text-slate-500">
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                           {t.type === 'deposit' || t.type === 'transfer_receive' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        </div>
                        <span className="text-xs font-black">
                          {t.type === 'deposit' ? 'إيداع إداري' : t.type === 'transfer_send' ? 'تحويل مرسل' : t.type === 'transfer_receive' ? 'تحويل مستلم' : 'شراء منتج'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`font-black text-lg ${t.type === 'deposit' || t.type === 'transfer_receive' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'deposit' || t.type === 'transfer_receive' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] font-bold uppercase">
                      {t.description || "معاملة نظام XMOOD"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-32 text-muted-foreground font-light text-xl">لا توجد عمليات مسجلة في التاريخ المالي.</TableCell>
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