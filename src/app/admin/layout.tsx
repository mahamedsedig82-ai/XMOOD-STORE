"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Terminal, Menu
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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isClient) {
      const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'];
      
      if (!user) {
        setIsAuthorized(false);
        router.push('/login');
      } else if (profile && allowedRoles.includes(profile.role)) {
        setIsAuthorized(true);
      } else if (profile) {
        setIsAuthorized(false);
        router.push('/');
      }
    }
  }, [profile, loading, user, router, isClient]);

  if (!isClient || loading || isAuthorized === null) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse text-center px-6">تحميل مركز العمليات السيادي...</p>
    </div>
  );

  if (isAuthorized === false) return null;

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
          className={`h-12 px-5 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/5 text-muted-foreground'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-4 w-full">
            <item.icon size={18} />
            <span className="font-bold text-[11px] uppercase tracking-wider">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-border bg-card hidden md:flex" side="right">
          <SidebarHeader className="p-8 border-b text-center">
            <span className="handwritten-logo block mb-2 text-2xl">XMOOD STORE</span>
            <Badge variant="outline" className="text-[8px] uppercase font-bold border-primary/20 text-primary px-3 py-0.5 rounded-full">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-4">
            <SidebarGroup className="mb-6">
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">العمليات المركزية</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(adminSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">الأدوات والتحكم</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(toolsSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-6 border-t bg-muted/5 space-y-3">
            <Button asChild variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase gap-2 border-border">
              <Link href="/"><ArrowLeft size={16} /> الواجهة العامة</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-11 rounded-xl text-red-500 font-black text-[10px] uppercase gap-2 hover:bg-red-500/5">
              <LogOut size={16} /> خروج سيادي
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-hidden flex flex-col relative">
          <header className="h-16 md:h-20 border-b flex items-center justify-between px-6 md:px-10 bg-background/80 backdrop-blur-md z-40 sticky top-0">
             <div className="flex items-center gap-4">
                <div className="md:hidden">
                   {/* Mobile Menu Trigger Placeholder or integrated inside layout */}
                   <Terminal size={18} className="text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">مركز التحكم</span>
                   <span className="text-[8px] text-muted-foreground uppercase">Sovereign Admin Console</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] md:text-[10px] font-black px-4 py-1 rounded-full">ACTIVE SECURE</Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto pb-24"
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
