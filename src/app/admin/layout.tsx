
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ShieldCheck, 
  Wallet, 
  Settings, 
  ArrowRight, 
  Coins, 
  LifeBuoy, 
  Activity, 
  UserCheck, 
  Lock
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <ShieldCheck className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const menuItems = [
    { label: "الإحصائيات", icon: LayoutDashboard, href: "/admin" },
    { label: "إدارة المنتجات", icon: Package, href: "/admin/products" },
    { label: "طلبات الشحن", icon: ShoppingCart, href: "/admin/orders" },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users" },
    { label: "المركز المالي", icon: Wallet, href: "/admin/finance" },
    { label: "سوق التداول P2P", icon: UserCheck, href: "/admin/marketplace" },
    { label: "أسعار الصرف", icon: Coins, href: "/admin/exchange" },
    { label: "الدعم الفني", icon: LifeBuoy, href: "/admin/support" },
    { label: "سجلات الأمان", icon: Lock, href: "/admin/security" },
    { label: "إعدادات المتجر", icon: Settings, href: "/admin/settings" },
    { label: "إدارة الوكلاء", icon: Activity, href: "/admin/agents" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 font-body" dir="rtl">
        <Sidebar className="border-l bg-white shadow-xl" side="right">
          <SidebarHeader className="p-8 border-b bg-slate-900 text-white">
            <Link href="/" className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <span className="font-handwriting text-3xl font-bold text-primary">XMOOD Admin</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Master Control Panel</p>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4 bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-4 text-[10px] font-black uppercase tracking-widest opacity-40">أقسام الإدارة الشاملة</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className="justify-start gap-3 h-12 px-5 rounded-2xl hover:bg-slate-50 transition-all data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-primary' : 'text-slate-400'}`} />
                        <span className={`text-sm ${pathname === item.href ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-8 px-4 border-t">
               <Button asChild variant="ghost" className="w-full justify-start gap-4 text-slate-400 hover:text-primary rounded-2xl h-14">
                  <Link href="/">
                    <ArrowRight className="w-6 h-6" />
                    <span className="font-bold text-base">الخروج للمتجر</span>
                  </Link>
               </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
