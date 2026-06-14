"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Monitor, Image as ImageIcon
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
      <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl" />
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Authenticating Operations Command...</p>
    </div>
  );

  const mainSections = [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "المساعد الذكي", icon: Cpu, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm'] },
    { label: "طلبات العملاء", icon: ShoppingBag, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "معرض الأعمال", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "خدمات أخرى", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent'] },
  ];

  const businessSections = [
    { label: "السجل المالي", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "الهوية والمحتوى", icon: Monitor, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => (profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role)))).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-14 px-6 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-5 w-full">
            <item.icon size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background" dir="rtl">
        <Sidebar className="border-l border-border bg-card/95 backdrop-blur-3xl" side="right">
          <SidebarHeader className="p-10 border-b text-center">
            <span className="handwritten-logo block mb-3 text-4xl">XMOOD STORE</span>
            <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/20 text-primary px-4 py-1.5 rounded-full tracking-widest">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-8">
            <SidebarGroup className="mb-12">
               <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-black uppercase text-muted-foreground tracking-[0.3em]">إدارة العمليات</SidebarGroupLabel>
               <SidebarMenu className="gap-3">{renderMenuItems(mainSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-black uppercase text-muted-foreground tracking-[0.3em]">إدارة الموقع المركزي</SidebarGroupLabel>
               <SidebarMenu className="gap-3">{renderMenuItems(businessSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-10 border-t bg-muted/30 space-y-4">
            <Button asChild variant="outline" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase gap-3 border-border bg-background hover:bg-muted">
              <Link href="/"><ArrowLeft size={16} /> العودة للواجهة</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-14 rounded-2xl text-destructive font-black text-[10px] uppercase gap-3 hover:bg-destructive/10">
              <LogOut size={16} /> تسجيل الخروج
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-6 md:p-16 animate-fade-in custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-40">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
