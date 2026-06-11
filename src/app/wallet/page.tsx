"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser } from "@/firebase";
import { formatUSD, formatSDG } from "@/lib/currency";

export default function WalletPage() {
  const { profile, loading } = useUser();

  const transactions = [
    { id: 't1', type: 'deposit', amount: 50.00, date: '2023-11-21', status: 'completed', agent: 'أبو فهد' },
    { id: 't2', type: 'purchase', amount: 12.50, date: '2023-11-20', status: 'completed', product: 'PUBG UC' },
  ];

  if (loading) return null;

  const balance = profile?.walletBalance || 0;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10 text-right">
          <h1 className="text-3xl font-headline font-bold mb-2">المحفظة الرقمية</h1>
          <p className="text-muted-foreground">إدارة رصيدك وعملياتك المالية في إكسيجو</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main Balance Card */}
          <Card className="border shadow-sm bg-white overflow-hidden text-right">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">الرصيد المتاح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">{formatUSD(balance)}</div>
              <div className="text-sm font-medium text-muted-foreground mb-4">{formatSDG(balance)}</div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">حالة الحساب</span>
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">نشط</span>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Info Card */}
          <Card className="lg:col-span-2 border bg-muted/20 text-right">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-end gap-2">
                شحن الرصيد <Info size={18} className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                يتم شحن الرصيد حصرياً عبر الوكلاء المعتمدين خارج الموقع. اختر وكيلاً من القائمة في الصفحة الرئيسية، قم بتحويل المبلغ له، ثم قدم له "ID المستخدم" الخاص بك لتحديث رصيدك فوراً.
              </p>
              <div className="flex flex-row-reverse items-center justify-between gap-4">
                <Button className="bg-primary text-white font-bold text-sm px-8 h-11 rounded-full">
                  تواصل مع وكيل
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">ID المستخدم الخاص بك</span>
                  <span className="font-mono font-bold text-lg text-foreground">{profile?.uid?.substring(0, 8).toUpperCase() || "---"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row-reverse items-center justify-between border-b bg-muted/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <History size={20} className="text-primary" /> سجل العمليات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-right font-bold text-xs uppercase">التاريخ</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">النوع</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">المبلغ (USD)</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">المبلغ (SDG)</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="text-xs">{t.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2 text-xs font-bold">
                        {t.type === 'deposit' ? 'إيداع' : 'شراء'}
                        {t.type === 'deposit' ? 
                          <ArrowUpCircle className="text-green-500" size={16} /> : 
                          <ArrowDownCircle className="text-red-500" size={16} />
                        }
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-sm">
                      {t.type === 'deposit' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.type === 'deposit' ? `+${formatSDG(t.amount)}` : `-${formatSDG(t.amount)}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] font-medium">
                      {t.type === 'deposit' ? `عبر الوكيل: ${t.agent}` : `منتج: ${t.product}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}