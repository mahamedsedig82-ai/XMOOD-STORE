
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Monitor, Bot, Terminal, BarChart
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
      <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl" />
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Authenticating Operational Command...</p>
    </div>
  );

  const mainSections = [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "المساعد الذكي Pro", icon: Cpu, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "معرض الأعمال", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "خدمات أخرى", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent'] },
  ];

  const monitoringSections = [
    { label: "المركز المالي", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "الهوية والتحكم", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => (profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role)))).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-12 px-4 rounded-xl transition-all ${pathname === item.href ? 'bg-primary text-black shadow-lg' : 'hover:bg-primary/10 text-muted-foreground'}`}
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
      <div className="flex h-screen w-full bg-background" dir="rtl">
        <Sidebar className="border-l border-border bg-card/50 backdrop-blur-xl" side="right">
          <SidebarHeader className="p-8 border-b text-center">
            <span className="handwritten-logo block mb-3 text-3xl">XMOOD STORE</span>
            <Badge variant="outline" className="text-[8px] uppercase font-black border-primary/20 text-primary px-4 py-1 rounded-full tracking-widest">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-6">
            <SidebarGroup className="mb-10">
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">العمليات</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(mainSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">التحكم المركزي</SidebarGroupLabel>
               <SidebarMenu className="gap-2">{renderMenuItems(monitoringSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-6 border-t bg-muted/20 space-y-3">
            <Button asChild variant="outline" className="w-full h-12 rounded-xl text-[9px] font-black uppercase gap-3 border-border hover:bg-muted">
              <Link href="/"><ArrowLeft size={14} /> الواجهة الرئيسية</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-12 rounded-xl text-red-500 font-black text-[9px] uppercase gap-3 hover:bg-red-500/10">
              <LogOut size={14} /> خروج نهائي
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-hidden flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-20">
             <div className="flex items-center gap-4">
                <Terminal size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Command Hub</span>
             </div>
             <div className="flex items-center gap-4">
                <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black px-4">SECURE</Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto pb-40"
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
