"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Monitor, Bot, Terminal, BarChart, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verifying Operational Access...</p>
    </div>
  );

  const adminSections = [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "مساعد الإدارة AI", icon: Cpu, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "خدمات أخرى", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent'] },
  ];

  const toolsSections = [
    { label: "الخزينة والمالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "أدوات التصميم", icon: Palette, href: "/admin/design-tools", roles: ['owner', 'admin', 'design_manager'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "إعدادات المنصة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => (profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role)))).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-11 px-4 rounded-xl transition-all ${pathname === item.href ? 'bg-primary text-white shadow-md' : 'hover:bg-primary/5 text-muted-foreground'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-3 w-full">
            <item.icon size={16} />
            <span className="font-bold text-[10px] uppercase tracking-wider">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background" dir="rtl">
        <Sidebar className="border-l border-border bg-card" side="right">
          <SidebarHeader className="p-8 border-b text-center">
            <span className="handwritten-logo block mb-2 text-2xl">XMOOD STORE</span>
            <Badge variant="outline" className="text-[8px] uppercase font-bold border-primary/20 text-primary px-3 py-0.5 rounded-full">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-4">
            <SidebarGroup className="mb-6">
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">العمليات المركزية</SidebarGroupLabel>
               <SidebarMenu className="gap-1">{renderMenuItems(adminSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">الأدوات والتحكم</SidebarGroupLabel>
               <SidebarMenu className="gap-1">{renderMenuItems(toolsSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-4 border-t bg-muted/5 space-y-2">
            <Button asChild variant="outline" className="w-full h-10 rounded-xl text-[9px] font-black uppercase gap-2 border-border">
              <Link href="/"><ArrowLeft size={14} /> الواجهة العامة</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-10 rounded-xl text-red-500 font-black text-[9px] uppercase gap-2 hover:bg-red-500/5">
              <LogOut size={14} /> خروج سيادي
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-hidden flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-20">
             <div className="flex items-center gap-3">
                <Terminal size={14} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Admin Command Console</span>
             </div>
             <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-black px-3">PROTECTED</Badge>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
             </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto pb-20"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
