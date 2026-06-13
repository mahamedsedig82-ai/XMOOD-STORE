
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
  Award
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

export default function AdminDashboardSovereign() {
  const { profile } = useUser();
  const db = useFirestore();
  
  const ordersRef = useMemoFirebase(() => query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(8)), [db]);
  const transactionsRef = useMemoFirebase(() => query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(8)), [db]);
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
    { label: "قاعدة النخبة", val: users?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "طلبات مكتملة", val: "1,420", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "نشاط النظام", val: "99.9%", icon: Zap, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-12 animate-fade-in text-white" dir="rtl">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Badge className="bg-red-600/20 text-red-500 border-red-600/30 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
               Sovereign Intel Active
             </Badge>
             <Badge variant="outline" className="border-primary/20 text-primary px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
               ROLE: {profile?.role}
             </Badge>
          </div>
          <h1 className="text-6xl font-headline font-bold gold-text leading-tight">مركز القيادة الاستراتيجي</h1>
          <p className="text-zinc-500 font-medium text-lg">مرحباً بك، سيادة {profile?.displayName}. إليك تقرير الكفاءة التشغيلية.</p>
        </div>
        <div className="flex items-center gap-6 bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
           <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-xl">
              <Activity size={32} />
           </div>
           <div>
             <span className="text-[10px] font-black text-zinc-500 block uppercase tracking-widest">حالة النظام</span>
             <span className="text-xl font-black text-white">مستقر ومثالي</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="luxury-card border-none p-8 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-32 h-32 ${stat.bg} blur-[80px] rounded-full opacity-40 group-hover:opacity-100 transition-all`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">{stat.label}</span>
            </div>
            <div className="text-4xl font-black gold-text tracking-tighter">{stat.val}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 luxury-card border-none p-10 bg-zinc-950/60">
          <CardHeader className="p-0 mb-10 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <BarChart3 className="text-red-500" /> نمو الأصول الرقمية
            </CardTitle>
            <Badge variant="outline" className="border-white/10 text-zinc-600 font-black">LAST 30 DAYS</Badge>
          </CardHeader>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '1.5rem', padding: '1rem' }}
                  itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="luxury-card border-none p-10 bg-primary/5 flex flex-col justify-between">
           <div>
              <Award className="text-primary mb-8" size={64} />
              <h3 className="text-3xl font-bold mb-4">نصيحة القيادة AI</h3>
              <p className="text-zinc-400 text-lg leading-relaxed font-light">
                نلاحظ زيادة بنسبة 24% في نشاط "المجتمع". ننصح بزيادة عدد الوسطاء المعتمدين لضمان سرعة إغلاق الصفقات والحفاظ على سمعة النظام.
              </p>
           </div>
           <div className="mt-10 pt-10 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-bold text-zinc-500 uppercase">كفاءة التشغيل</span>
                 <span className="text-primary font-black text-xl">94%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[94%] rounded-full shadow-[0_0_10px_#d4af37]" />
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="luxury-card border-none p-0 overflow-hidden bg-zinc-950/60">
           <CardHeader className="p-8 bg-white/5 border-b border-white/5">
             <CardTitle className="text-xl font-bold flex items-center gap-4">
               <ArrowUpRight className="text-green-500" /> أحدث التدفقات المالية
             </CardTitle>
           </CardHeader>
           <Table>
             <TableBody>
               {recentTransactions?.map((t: any) => (
                 <TableRow key={t.id} className="hover:bg-primary/5 border-white/5 transition-all">
                   <TableCell className="pr-10 py-6">
                     <span className="text-xs font-bold text-zinc-400 block">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                     <span className="text-[9px] text-zinc-600 font-bold uppercase">{t.type}</span>
                   </TableCell>
                   <TableCell className="font-bold text-base">{t.description}</TableCell>
                   <TableCell className={`text-left pl-10 font-black text-xl ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                     {formatUSD(t.amount)}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </Card>

        <Card className="luxury-card border-none p-0 overflow-hidden bg-zinc-950/60">
           <CardHeader className="p-8 bg-white/5 border-b border-white/5">
             <CardTitle className="text-xl font-bold flex items-center gap-4">
               <ShoppingBag className="text-amber-500" /> مبيعات المتجر الأخيرة
             </CardTitle>
           </CardHeader>
           <Table>
             <TableBody>
               {recentOrders?.map((o: any) => (
                 <TableRow key={o.id} className="hover:bg-primary/5 border-white/5 transition-all">
                   <TableCell className="pr-10 py-6">
                     <span className="text-base font-bold text-white block">{o.productName}</span>
                     <span className="text-[9px] text-zinc-600 font-mono uppercase">{o.id}</span>
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline" className="border-zinc-800 text-[9px] font-black text-zinc-500 uppercase px-4">{o.status}</Badge>
                   </TableCell>
                   <TableCell className="text-left pl-10 font-black text-xl text-primary">
                     {formatUSD(o.amount)}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </Card>
      </div>
    </div>
  );
}
