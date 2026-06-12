
"use client";

import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BarChart3, 
  Activity,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";

export default function AdminDashboardPRO() {
  const db = useFirestore();
  
  // Queries for real-time analysis
  const ordersRef = useMemoFirebase(() => query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5)), [db]);
  const transactionsRef = useMemoFirebase(() => query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(5)), [db]);
  const productsRef = useMemoFirebase(() => collection(db, "products"), [db]);
  const usersRef = useMemoFirebase(() => collection(db, "users"), [db]);

  const { data: recentOrders } = useCollection(ordersRef);
  const { data: recentTransactions } = useCollection(transactionsRef);
  const { data: allProducts } = useCollection(productsRef);
  const { data: allUsers } = useCollection(usersRef);

  // Mock data for charts (In production, these would be derived from aggregations)
  const revenueData = [
    { name: 'يناير', value: 4000 },
    { name: 'فبراير', value: 3000 },
    { name: 'مارس', value: 5000 },
    { name: 'أبريل', value: 8000 },
    { name: 'مايو', value: 7000 },
    { name: 'يونيو', value: 12000 },
  ];

  const categoryData = [
    { name: 'شحن ألعاب', value: 45 },
    { name: 'حسابات', value: 25 },
    { name: 'تصميم', value: 20 },
    { name: 'وساطة', value: 10 },
  ];

  const stats = [
    { label: "إجمالي المبيعات", val: "$154,200", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "المستخدمين النشطين", val: allUsers?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "سيولة المحافظ", val: "$42,500", icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "إجمالي المنتجات", val: allProducts?.length || 0, icon: Package, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const COLORS = ['#d4af37', '#dc2626', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-10 animate-fade-in text-white" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
          <Badge className="bg-red-600/20 text-red-500 border-red-600/30 mb-4 px-6 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            XMOOD PRO MAX ANALYTICS
          </Badge>
          <h1 className="text-5xl font-headline font-bold gold-text">مركز التحليل الشامل</h1>
          <p className="text-zinc-500 mt-2 font-medium">مرحباً بك مجدداً. إليك تقرير الأداء اللحظي للمتجر.</p>
        </div>
        <div className="flex gap-4">
           <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 flex items-center gap-4 shadow-xl">
              <Activity className="text-green-500 animate-pulse" size={24} />
              <div>
                <span className="text-[10px] font-bold text-zinc-500 block">حالة النظام</span>
                <span className="text-xs font-bold text-white">مستقر ومثالي</span>
              </div>
           </div>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="luxury-card border-none p-6 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-all`} />
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-black gold-text">{stat.val}</div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 luxury-card border-none p-8">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <BarChart3 className="text-red-500" /> نمو الإيرادات الشهري
            </CardTitle>
            <Badge variant="outline" className="border-white/10 text-zinc-500">آخر 6 أشهر</Badge>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '1rem' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="luxury-card border-none p-8 bg-zinc-950/40">
           <CardHeader className="p-0 mb-8">
             <CardTitle className="text-xl font-bold">توزيع المنتجات</CardTitle>
           </CardHeader>
           <div className="space-y-6">
              {categoryData.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-400">{cat.name}</span>
                    <span className="text-primary">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${cat.value}%`, backgroundColor: COLORS[i] }} 
                    />
                  </div>
                </div>
              ))}
           </div>
           <div className="mt-12 p-6 bg-red-600/5 rounded-2xl border border-red-600/10">
              <Zap className="text-red-500 mb-2" size={24} />
              <p className="text-xs font-bold text-zinc-300">نصيحة الذكاء الاصطناعي</p>
              <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                بناءً على تحليلاتنا، قسم "شحن الألعاب" يحقق أعلى معدل نمو. ننصح بزيادة العروض في هذا القسم لتنشيط السيولة.
              </p>
           </div>
        </Card>
      </div>

      {/* Transactions & Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="luxury-card border-none p-0 overflow-hidden">
           <CardHeader className="p-8 bg-white/5 border-b border-white/5">
             <CardTitle className="text-lg font-bold flex items-center gap-3">
               <ArrowUpRight className="text-green-500" /> أحدث العمليات المالية
             </CardTitle>
           </CardHeader>
           <Table>
             <TableBody>
               {recentTransactions?.map((t: any) => (
                 <TableRow key={t.id} className="hover:bg-white/5 border-white/5">
                   <TableCell className="pr-8">
                     <span className="text-xs font-bold text-zinc-400 block">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</span>
                     <span className="text-[10px] text-zinc-600 uppercase">{t.type}</span>
                   </TableCell>
                   <TableCell className="font-bold">{t.description}</TableCell>
                   <TableCell className={`text-left pl-8 font-black ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                     {formatUSD(t.amount)}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </Card>

        <Card className="luxury-card border-none p-0 overflow-hidden">
           <CardHeader className="p-8 bg-white/5 border-b border-white/5">
             <CardTitle className="text-lg font-bold flex items-center gap-3">
               <Package className="text-amber-500" /> طلبات الشراء الأخيرة
             </CardTitle>
           </CardHeader>
           <Table>
             <TableBody>
               {recentOrders?.map((o: any) => (
                 <TableRow key={o.id} className="hover:bg-white/5 border-white/5">
                   <TableCell className="pr-8">
                     <span className="text-xs font-bold">{o.productName}</span>
                   </TableCell>
                   <TableCell>
                     <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-500">{o.status}</Badge>
                   </TableCell>
                   <TableCell className="text-left pl-8 font-bold text-primary">
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

