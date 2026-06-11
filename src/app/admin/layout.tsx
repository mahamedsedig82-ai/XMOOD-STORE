
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Users, ShieldCheck, Wallet, Settings, ArrowRight } from "lucide-react";
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
      // إذا لم يكن مديراً، يعود للرئيسية
      // ملاحظة: يمكنك مؤقتاً إزالة هذا الشرط إذا أردت الدخول قبل تعيين رتبتك
      // router.push('/'); 
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <ShieldCheck className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  // في الإنتاج، سنفعل هذا الشرط
  // if (profile?.role !== 'admin') return null;

  const menuItems = [
    { label: "الإحصائيات", icon: LayoutDashboard, href: "/admin" },
    { label: "إدارة المنتجات", icon: Package, href: "/admin/products" },
    { label: "طلبات العملاء", icon: ShoppingCart, href: "/admin/orders" },
    { label: "المستخدمين", icon: Users, href: "/admin/users" },
    { label: "الوكلاء والمالية", icon: Wallet, href: "/admin/finance" },
    { label: "إعدادات المتجر", icon: Settings, href: "/admin/settings" },
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
              <span className="font-handwriting text-2xl font-bold text-primary">XMOOD Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-2">القائمة الإدارية</SidebarGroupLabel>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className="justify-start gap-3 h-11 px-4 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-4 h-4 ${pathname === item.href ? 'text-primary' : 'text-slate-400'}`} />
                        <span className={pathname === item.href ? 'font-bold text-primary' : ''}>{item.label}</span>
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
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
