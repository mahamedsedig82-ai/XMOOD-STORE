"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, Wallet, TrendingUp, Package, AlertCircle, ShieldCheck, Cpu } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";

export default function AdminDashboard() {
  const stats = [
    { label: "السيولة الإجمالية", val: "$1,240,450", icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
    { label: "طلبات قيد التنفيذ", val: "24", icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "الأعضاء النشطين", val: "1,200", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "باقات المستودع", val: "45", icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-12 animate-fade-in text-white" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/10 pb-12">
        <div>
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-8 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.5em]">System Overview Protocol</Badge>
          <h1 className="text-5xl font-headline font-bold gold-text">مركز القيادة المركزية</h1>
          <p className="text-slate-500 text-lg mt-2 font-light">مرحباً بك مجدداً، القائد الأعلى. إليك حالة الإمبراطورية اللحظية.</p>
        </div>
        <div className="flex gap-4">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                 <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-500">النظام آمن ومستقر</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="luxury-card border-none overflow-hidden relative group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 p-8">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{stat.label}</CardTitle>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl border border-white/5`}>
                <stat.icon size={20} />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-4xl font-black gold-text tracking-tighter">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 luxury-card border-none overflow-hidden p-0">
          <CardHeader className="p-10 border-b border-white/5 bg-white/5">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
               <TrendingUp className="text-primary" /> أحدث تحركات الخزانة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-right py-6 pr-10 font-black text-[10px] uppercase text-primary/40">العميل</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase text-primary/40">المنتج</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase text-primary/40">المبلغ</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase text-primary/40">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { user: "أحمد علي", product: "UC PUBG 6000", price: "$99.99", status: "completed" },
                  { user: "سارة محمد", product: "حساب Valorant", price: "$250.00", status: "processing" },
                  { user: "خالد محمود", product: "بوستر متجر", price: "$15.00", status: "waiting_payment" },
                ].map((order, i) => (
                  <TableRow key={i} className="hover:bg-white/5 border-b border-white/5">
                    <TableCell className="py-6 pr-10 font-bold text-lg">{order.user}</TableCell>
                    <TableCell className="text-slate-400 font-bold">{order.product}</TableCell>
                    <TableCell className="font-black text-primary text-xl">{order.price}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-full font-black text-[10px] uppercase ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {order.status === 'completed' ? 'مكتمل' : order.status === 'processing' ? 'قيد التنفيذ' : 'انتظار الدفع'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="luxury-card border-none bg-primary/5 relative overflow-hidden p-10 legendary-border flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
          <div>
            <CardHeader className="p-0 mb-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-4 gold-text">
                <Cpu size={32} /> بروتوكولات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="bg-black/60 p-6 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Security Alert</p>
                <p className="text-sm font-bold leading-relaxed text-slate-300">توجد 3 طلبات إيداع معلقة تحتاج مراجعة فورية.</p>
              </div>
              <div className="bg-black/60 p-6 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Inventory Sync</p>
                <p className="text-sm font-bold leading-relaxed text-slate-300">نفذ مخزون "بطاقات جوجل بلاي 50$" في القسم الرئيسي.</p>
              </div>
            </CardContent>
          </div>
          <div className="pt-10">
             <Button className="w-full h-14 royal-button text-lg">فتح معالج الـ AI</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}