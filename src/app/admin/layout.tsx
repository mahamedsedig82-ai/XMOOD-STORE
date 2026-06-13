
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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
    </div>
  );

  const mainSections = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة المجتمع", icon: MessageSquare, href: "/admin/community", roles: ['owner', 'admin', 'community_admin', 'community_mod'] },
    { label: "الطلبات", icon: ShoppingBag, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "المستودع", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "الوكلاء", icon: ShieldCheck, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "معرض التصاميم", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
  ];

  const businessSections = [
    { label: "الخزانة المالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "إدارة المستخدمين", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "إعدادات المنصة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => (profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role)))).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-12 px-4 rounded-xl transition-all ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-3 w-full">
            <item.icon size={18} />
            <span className="font-bold text-xs">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background" dir="rtl">
        <Sidebar className="border-l border-white/5 bg-zinc-950/80 backdrop-blur-xl" side="right">
          <SidebarHeader className="p-8 border-b border-white/5 text-center">
            <span className="decorative-logo block mb-1">XMOOD PRO</span>
            <Badge variant="outline" className="text-[7px] uppercase tracking-widest border-primary/20 text-primary px-3">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-4">
            <SidebarGroup className="mb-6">
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[7px] font-black uppercase text-zinc-500 tracking-[0.2em]">العمليات والرقابة</SidebarGroupLabel>
               <SidebarMenu className="gap-1">{renderMenuItems(mainSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[7px] font-black uppercase text-zinc-500 tracking-[0.2em]">الإدارة والأصول</SidebarGroupLabel>
               <SidebarMenu className="gap-1">{renderMenuItems(businessSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-4 border-t border-white/5 bg-zinc-950 space-y-2">
            <Button asChild variant="outline" className="w-full h-10 rounded-xl text-[10px] gap-2 border-white/10 hover:bg-white/5">
              <Link href="/"><ArrowLeft size={14} /> الرجوع للموقع</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-10 rounded-xl text-red-500 font-bold text-[10px] gap-2 hover:bg-red-500/10">
              <LogOut size={14} /> خروج آمن
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-10 animate-fade-up scroll-smooth">
          <div className="max-w-[1400px] mx-auto pb-20">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
