
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, Wallet, TrendingUp, Package, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const stats = [
    { label: "إجمالي المبيعات", val: "$12,450", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "الطلبات الجديدة", val: "24", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "المستخدمين", val: "1,200", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "المنتجات النشطة", val: "45", icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-headline font-bold mb-2">لوحة التحكم الإدارية</h1>
        <p className="text-muted-foreground">مرحباً بك، إليك نظرة سريعة على أداء XMOOD STORE اليوم.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { user: "أحمد علي", product: "UC PUBG 6000", price: "$99.99", status: "completed" },
                  { user: "سارة محمد", product: "حساب Valorant", price: "$250.00", status: "processing" },
                  { user: "خالد محمود", product: "بوستر متجر", price: "$15.00", status: "waiting_payment" },
                ].map((order, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{order.user}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.price}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'completed' ? 'default' : 'outline'} className="rounded-full">
                        {order.status === 'completed' ? 'مكتمل' : order.status === 'processing' ? 'قيد التنفيذ' : 'انتظار الدفع'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle size={20} /> تنبيهات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">الوكلاء</p>
              <p className="text-sm">توجد 3 طلبات إيداع معلقة تحتاج مراجعة.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">المخزون</p>
              <p className="text-sm">نفذ مخزون "بطاقات جوجل بلاي 50$".</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
