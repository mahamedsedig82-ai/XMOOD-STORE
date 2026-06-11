"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Users, LifeBuoy, ShieldCheck, Wallet, MessageSquare, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      router.push('/');
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <ShieldCheck className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-sm font-bold text-slate-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  const menuItems = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
    { label: "المنتجات", icon: Package, href: "/admin/products" },
    { label: "الطلبات", icon: ShoppingCart, href: "/admin/orders" },
    { label: "المستخدمين", icon: Users, href: "/admin/users" },
    { label: "الوكلاء", icon: Wallet, href: "/admin/agents" },
    { label: "الوساطة", icon: LifeBuoy, href: "/admin/escrow" },
    { label: "الإعدادات", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 font-body" dir="rtl">
        <Sidebar className="border-l bg-white" side="right">
          <SidebarHeader className="p-6 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
                <ShieldCheck size={20} />
              </div>
              <span className="font-headline font-bold text-xl text-primary">XMOOD Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-2">النظام العام</SidebarGroupLabel>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className="justify-start gap-3 h-11 px-4 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-4 h-4 ${pathname === item.href ? 'text-primary' : 'text-slate-400'}`} />
                        <span className={pathname === item.href ? 'font-bold' : ''}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-6 px-4">
               <Button asChild variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-primary rounded-xl">
                  <Link href="/">
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة للمتجر</span>
                  </Link>
               </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}