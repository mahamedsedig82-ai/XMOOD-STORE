"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'];
    if (!loading) {
      if (!user) router.push('/login');
      else if (profile && !allowedRoles.includes(profile.role)) router.push('/'); 
    }
  }, [profile, loading, user, router]);

  if (!isClient || loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">تأمين الاتصال بمركز العمليات...</p>
    </div>
  );

  const mainSections = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm'] },
    { label: "طلبات العملاء", icon: ShoppingBag, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "مستودع الأصول", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "معرض الأعمال", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "خدمات متنوعة", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent'] },
  ];

  const businessSections = [
    { label: "السجل المالي", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "إعدادات المنصة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => (profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role)))).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-14 px-5 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-4 w-full">
            <item.icon size={20} />
            <span className="font-bold text-[12px] uppercase tracking-wider">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background" dir="rtl">
        <Sidebar className="border-l border-border bg-card/80 backdrop-blur-3xl" side="right">
          <SidebarHeader className="p-8 border-b text-center">
            <span className="decorative-logo block mb-3">مركز الإدارة</span>
            <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/20 text-primary px-4 py-1 rounded-full">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-6">
            <SidebarGroup className="mb-10">
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">إدارة العمليات</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(mainSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">الأدوات المركزية</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(businessSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-8 border-t bg-muted/30 space-y-4">
            <Button asChild variant="outline" className="w-full h-14 rounded-2xl text-xs font-bold uppercase gap-3 border-border">
              <Link href="/"><ArrowLeft size={16} /> العودة للموقع</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-14 rounded-2xl text-destructive font-bold text-xs gap-3 hover:bg-destructive/10">
              <LogOut size={16} /> تسجيل الخروج
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-6 md:p-12 animate-fade-in custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-32">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}