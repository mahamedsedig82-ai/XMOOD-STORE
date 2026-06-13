"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, ShieldCheck, LogOut, ArrowLeft, Zap, ShoppingBag, MessageSquare
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
    const allowedRoles = ['owner', 'admin', 'gm', 'community_admin', 'community_mod', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'];
    if (!loading) {
      if (!user) router.push('/login');
      else if (profile && !allowedRoles.includes(profile.role)) router.push('/'); 
    }
  }, [profile, loading, user, router]);

  if (!isClient || loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">تأمين الاتصال بالمركز...</p>
    </div>
  );

  const mainSections = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة المجتمع", icon: MessageSquare, href: "/admin/community", roles: ['owner', 'admin', 'community_admin', 'community_mod'] },
    { label: "طلبات العملاء", icon: ShoppingBag, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "مستودع الأصول", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "إدارة الوكلاء", icon: ShieldCheck, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "معرض الأعمال", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "خدمات أخرى", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent'] },
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
          className={`h-14 px-5 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-4 w-full">
            <item.icon size={20} />
            <span className="font-black text-[12px] uppercase tracking-wider">{item.label}</span>
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
            <Badge variant="outline" className="text-[10px] uppercase font-black border-primary/20 text-primary px-4 py-1 rounded-full">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-6">
            <SidebarGroup className="mb-10">
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">إدارة العمليات</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(mainSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">الأدوات المركزية</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(businessSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-8 border-t bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
            <Button asChild variant="outline" className="w-full h-14 rounded-2xl text-xs font-black uppercase gap-3 border-zinc-200 dark:border-zinc-800">
              <Link href="/"><ArrowLeft size={16} /> العودة للموقع</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-14 rounded-2xl text-red-500 font-black text-xs gap-3 hover:bg-red-50 dark:hover:bg-red-950/20">
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