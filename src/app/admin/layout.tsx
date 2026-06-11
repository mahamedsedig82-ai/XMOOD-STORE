"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Users, LifeBuoy, ShieldCheck, Wallet, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const pathname = usePathname();

  if (!loading && profile?.role !== 'admin') {
    redirect('/');
  }

  const menuItems = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
    { label: "إدارة المنتجات", icon: Package, href: "/admin/products" },
    { label: "الطلبات", icon: ShoppingCart, href: "/admin/orders" },
    { label: "المستخدمون", icon: Users, href: "/admin/users" },
    { label: "الوكلاء", icon: Wallet, href: "/admin/agents" },
    { label: "الوساطة", icon: LifeBuoy, href: "/admin/escrow" },
    { label: "المنتدى", icon: MessageSquare, href: "/admin/forum" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/10 font-body" dir="rtl">
        <Sidebar className="border-l" side="right">
          <SidebarHeader className="p-6 border-b">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-headline font-bold text-xl text-primary">XMOOD</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right">القائمة الرئيسية</SidebarGroupLabel>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className="justify-start gap-3 hover:bg-primary/10 transition-colors"
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <div className="mt-auto pt-4 border-t">
               <SidebarMenuButton asChild className="justify-start gap-3 text-muted-foreground">
                  <Link href="/">
                    <ArrowRight className="w-5 h-5" />
                    <span>العودة للموقع</span>
                  </Link>
               </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
