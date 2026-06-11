
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WalletPage() {
  const transactions = [
    { id: 't1', type: 'deposit', amount: 500, date: '2023-11-21', status: 'completed', agent: 'أبو فهد' },
    { id: 't2', type: 'purchase', amount: 50, date: '2023-11-20', status: 'completed', product: 'PUBG UC' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-headline font-bold mb-8">المحفظة الرقمية</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-primary text-primary-foreground shadow-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 -translate-y-1/4 translate-x-1/4">
               <Wallet size={200} />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-light uppercase tracking-widest opacity-80">الرصيد الكلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2">$450.00</div>
              <p className="text-xs opacity-70">جاهز للاستخدام داخل المنصة</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-dashed border-2 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">كيفية شحن الرصيد؟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                يتم شحن الرصيد حصرياً عبر الوكلاء المعتمدين خارج الموقع. اختر وكيلاً، قم بتحويل المبلغ له، ثم قدم له "ID المستخدم" الخاص بك لتحديث رصيدك فوراً.
              </p>
              <div className="flex gap-4">
                <Button className="bg-accent text-accent-foreground font-bold">تواصل مع وكيل</Button>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase">ID المستخدم</span>
                  <span className="font-mono font-bold">#EX-998877</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> سجل العمليات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">القيمة</TableHead>
                  <TableHead className="text-right">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {t.type === 'deposit' ? 
                          <ArrowUpCircle className="text-green-500 w-4 h-4" /> : 
                          <ArrowDownCircle className="text-red-500 w-4 h-4" />
                        }
                        {t.type === 'deposit' ? 'إيداع' : 'شراء'}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {t.type === 'deposit' ? `+$${t.amount}` : `-$${t.amount}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
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
