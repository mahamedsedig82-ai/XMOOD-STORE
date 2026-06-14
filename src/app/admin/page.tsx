
"use client";

import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Package, 
  ArrowUpRight, 
  BarChart3, 
  Activity,
  Zap,
  ShoppingBag,
  ShieldCheck,
  Award,
  AlertCircle,
  Terminal,
  Cpu
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDashboardSovereign() {
  const { profile } = useUser();
  const db = useFirestore();
  
  const ordersRef = useMemoFirebase(() => query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10)), [db]);
  const transactionsRef = useMemoFirebase(() => query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(10)), [db]);
  const usersRef = useMemoFirebase(() => query(collection(db, "users"), limit(100)), [db]);

  const { data: recentOrders } = useCollection(ordersRef);
  const { data: recentTransactions } = useCollection(transactionsRef);
  const { data: users } = useCollection(usersRef);

  const revenueData = [
    { name: 'Week 1', value: 4500 },
    { name: 'Week 2', value: 3800 },
    { name: 'Week 3', value: 5200 },
    { name: 'Week 4', value: 8900 },
    { name: 'Week 5', value: 7600 },
    { name: 'Week 6', value: 12400 },
  ];

  const stats = [
    { label: "إيرادات النظام", val: "$154,200", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "قاعدة المستخدمين", val: users?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "طلبات ناجحة", val: "1,420", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "كفاءة العمليات", val: "99.9%", icon: Zap, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
               Enterprise Monitoring Active
             </Badge>
             <Badge variant="outline" className="border-primary/20 text-primary px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
               ADMIN: {profile?.displayName}
             </Badge>
          </div>
          <h1 className="text-5xl font-headline font-black gold-text">مركز العمليات المركزي</h1>
          <p className="text-muted-foreground font-medium text-lg italic">متابعة الأداء اللحظي والكفاءة التشغيلية للمنصة.</p>
        </div>
        <div className="flex items-center gap-6 bg-card p-6 rounded-[2.5rem] border border-border shadow-2xl">
           <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-xl">
              <Activity size={32} />
           </div>
           <div>
             <span className="text-[10px] font-black text-muted-foreground block uppercase tracking-widest">حالة الخوادم</span>
             <span className="text-xl font-black text-green-500">OPTIMAL</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="luxury-card border-none p-8 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-32 h-32 ${stat.bg} blur-[80px] rounded-full opacity-40 group-hover:opacity-100 transition-all`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl shadow-lg border border-white/5`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</span>
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter">{stat.val}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 luxury-card p-10 bg-card/60 backdrop-blur-xl border-none">
          <CardHeader className="p-0 mb-10 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-4">
              <BarChart3 className="text-primary" /> نمو الأصول الرقمية
            </CardTitle>
            <Badge variant="outline" className="border-border text-muted-foreground font-black text-[9px] uppercase tracking-widest">Global Analytics</Badge>
          </CardHeader>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis dataKey="name" stroke="currentColor" opacity={0.3} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" opacity={0.3} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1.5rem' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-8">
           <Card className="luxury-card p-10 bg-primary/5 flex flex-col justify-between border-none">
              <div>
                 <Cpu className="text-primary mb-8" size={64} />
                 <h3 className="text-2xl font-black mb-4">المراقب الذكي AI</h3>
                 <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                   نلاحظ استقراراً تاماً في نظام المحفظة. معدل التحويلات اليومي ارتفع بنسبة 12% مقارنة بالأسبوع الماضي. كافة العمليات آمنة.
                 </p>
              </div>
              <div className="mt-10 pt-10 border-t border-border">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">سلامة البيانات</span>
                    <span className="text-primary font-black text-xl">100%</span>
                 </div>
                 <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full rounded-full shadow-[0_0_10px_var(--primary)]" />
                 </div>
              </div>
           </Card>

           <Card className="luxury-card p-8 bg-red-500/5 border-red-500/10 border-none">
              <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <AlertCircle size={16} /> تنبيهات النظام
              </h4>
              <div className="space-y-4">
                 <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <Terminal size={14} className="text-zinc-500 mt-1" />
                    <p className="text-[10px] font-medium leading-relaxed">
                       لا توجد أخطاء برمجية مسجلة في آخر 24 ساعة. النظام يعمل بكفاءة قصوى.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="luxury-card border-none p-0 overflow-hidden bg-card/60 shadow-xl">
           <CardHeader className="p-8 bg-muted/20 border-b flex flex-row items-center justify-between">
             <CardTitle className="text-xl font-black flex items-center gap-4 uppercase tracking-tighter">
               <ArrowUpRight className="text-green-500" /> أحدث العمليات المالية
             </CardTitle>
             <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase">Live Ledger</Badge>
           </CardHeader>
           <ScrollArea className="max-h-[500px]">
              <Table>
                <TableBody>
                  {recentTransactions?.map((t: any) => (
                    <TableRow key={t.id} className="hover:bg-primary/5 transition-all border-border">
                      <TableCell className="pr-10 py-6">
                        <span className="text-[10px] font-black text-muted-foreground block">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span className="text-[8px] text-primary font-bold uppercase">{t.type}</span>
                      </TableCell>
                      <TableCell className="font-bold text-sm">{t.description}</TableCell>
                      <TableCell className={`text-left pl-10 font-black text-lg ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                        {formatUSD(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </ScrollArea>
        </Card>

        <Card className="luxury-card border-none p-0 overflow-hidden bg-card/60 shadow-xl">
           <CardHeader className="p-8 bg-muted/20 border-b flex flex-row items-center justify-between">
             <CardTitle className="text-xl font-black flex items-center gap-4 uppercase tracking-tighter">
               <ShoppingBag className="text-primary" /> مبيعات الخدمات الأخيرة
             </CardTitle>
             <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase">Global Sales</Badge>
           </CardHeader>
           <ScrollArea className="max-h-[500px]">
              <Table>
                <TableBody>
                  {recentOrders?.map((o: any) => (
                    <TableRow key={o.id} className="hover:bg-primary/5 transition-all border-border">
                      <TableCell className="pr-10 py-6">
                        <span className="text-sm font-black block">{o.productName}</span>
                        <span className="text-[9px] text-muted-foreground font-mono uppercase">{o.id}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border text-[9px] font-black text-muted-foreground uppercase px-4">{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-left pl-10 font-black text-lg text-primary">
                        {formatUSD(o.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
