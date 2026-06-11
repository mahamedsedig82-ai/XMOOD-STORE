
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Users, LifeBuoy, ShieldCheck, Wallet, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/10">
        <Sidebar className="border-l">
          <SidebarHeader className="p-6 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary w-8 h-8" />
              <span className="font-headline font-bold text-xl">لوحة الإدارة</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>الرئيسية</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive><LayoutDashboard /> لوحة التحكم</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton><Package /> إدارة المخزون</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton><ShoppingCart /> الطلبات</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>المستخدمون والمالية</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton><Users /> المستخدمون</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton><Wallet /> الوكلاء والمحافظ</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton><LifeBuoy /> الوساطة</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>المجتمع</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton><MessageSquare /> المنتدى والتقييمات</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-y-auto p-12">
          <header className="mb-12 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-2">مرحباً أيها المدير</h1>
              <p className="text-muted-foreground">نظرة عامة على حالة النظام الاقتصادي للمنصة</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
               <div className="text-right">
                 <p className="text-[10px] text-muted-foreground uppercase">إجمالي مبيعات اليوم</p>
                 <p className="text-2xl font-bold text-primary">$1,250.00</p>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "إجمالي المستخدمين", val: "1,245", color: "blue" },
              { label: "طلبات معلقة", val: "14", color: "orange" },
              { label: "عمليات وساطة", val: "8", color: "green" },
              { label: "تقييمات جديدة", val: "32", color: "purple" },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-light text-muted-foreground uppercase">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.val}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="bg-white border mb-8 p-1 rounded-xl">
              <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">أحدث الطلبات</TabsTrigger>
              <TabsTrigger value="p2p" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">نشاط السوق</TabsTrigger>
              <TabsTrigger value="agents" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">إيداعات الوكلاء</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="p-8 text-center text-muted-foreground">
                    <p>لا توجد طلبات معلقة حالياً. جميع العمليات مستقرة.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
}
