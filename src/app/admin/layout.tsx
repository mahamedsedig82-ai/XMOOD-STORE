"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { 
  LogOut, ArrowLeft, Terminal, BarChart3, ShieldCheck, Briefcase, Package, ClipboardList, Users, Wallet, ShieldAlert, Settings, Image as ImageIcon, Zap, Loader2, Palette, Globe, History, GitBranch, Layers, ShoppingCart, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user, isAdmin } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allSections = useMemo(() => [
    { label: "نظرة عامة", icon: BarChart3, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "المخزون والمنتجات", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/operations-log", roles: ['owner', 'admin', 'gm', 'support'] },
    { label: "نظام السلة والدفع", icon: ShoppingCart, href: "/admin/cart-system", roles: ['owner', 'admin', 'gm'] },
    { label: "سوق الخدمات", icon: Briefcase, href: "/admin/other-services", roles: ['owner', 'admin', 'gm', 'agent'] },
    { label: "إدارة المعرض", icon: ImageIcon, href: "/admin/designs", roles: ['owner', 'admin', 'gm', 'designer'] },
    { label: "إدارة الوكلاء", icon: ShieldCheck, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة الفروع", icon: GitBranch, href: "/admin/branches", roles: ['owner', 'admin', 'gm'] },
    { label: "الهيكل التنظيمي", icon: Layers, href: "/admin/categories", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin', 'gm'] },
    { label: "المالية والبنك", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'gm', 'accountant'] },
    { label: "الإعدادات الشاملة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin', 'gm'] },
    { label: "مركز الأمان", icon: ShieldAlert, href: "/admin/security", roles: ['owner', 'admin', 'gm'] },
    { label: "المساعد الإداري AI", icon: Zap, href: "/admin/ai", roles: ['owner', 'admin', 'gm'] },
  ], []);

  const visibleSections = useMemo(() => {
    if (!profile?.role) return [];
    return allSections.filter(item => 
      profile.role === 'owner' || profile.role === 'admin' || item.roles.includes(profile.role)
    );
  }, [profile, allSections]);

  useEffect(() => {
    if (isClient && !loading) {
      if (!user) router.replace('/login');
      else if (profile && !isAdmin) router.replace('/');
    }
  }, [loading, user, isAdmin, profile, isClient, router]);

  if (!isClient || loading || (user && !profile)) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-background"><Loader2 className="animate-spin text-primary" size={60} /></div>;
  }

  if (!user || !isAdmin || !profile) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-border bg-card hidden lg:flex shrink-0 shadow-2xl" side="right">
          <SidebarHeader className="p-10 border-b text-center">
            <span className="handwritten-logo block mb-4 text-4xl">XMOOD</span>
            <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/30 text-primary px-5 py-1 rounded-full">
              {profile?.label || "ADMIN ACCESS"}
            </Badge>
          </SidebarHeader>
          <SidebarContent className="p-6 overflow-y-auto smooth-scroll custom-scrollbar text-right">
             <SidebarMenu className="gap-3">
               {visibleSections.map((item) => (
                 <SidebarMenuItem key={item.href}>
                   <SidebarMenuButton 
                     asChild 
                     isActive={pathname === item.href}
                     className={`h-14 px-6 rounded-2xl transition-all duration-300 ${pathname === item.href ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-primary/5 text-muted-foreground'}`}
                   >
                     <Link href={item.href} className="flex flex-row-reverse items-center gap-5 w-full">
                       <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-primary'} />
                       <span className="font-black text-[11px] uppercase tracking-wider">{item.label}</span>
                     </Link>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
             </SidebarMenu>
          </SidebarContent>
          <div className="p-8 border-t bg-muted/20 space-y-4">
            <Button asChild variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase gap-4 border-primary/20">
              <Link href="/"><ArrowLeft size={16} /> العودة للمتجر</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-12 rounded-xl text-red-500 font-black text-[10px] uppercase gap-4">
              <LogOut size={16} /> خروج آمن
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 h-screen relative bg-background overflow-hidden">
          <header className="h-24 border-b flex items-center justify-between px-6 md:px-10 bg-background/90 backdrop-blur-xl z-[60] shrink-0">
             <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                   <Terminal size={24} />
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-xs md:text-sm font-black uppercase tracking-widest">وحدة التحكم السيادية</span>
                   <span className="text-[7px] md:text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Master Command Pro</span>
                </div>
             </div>
             <div className="flex items-center gap-3 md:gap-6">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black px-5 py-2 rounded-full tracking-widest uppercase shadow-sm">System Secured</Badge>
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
             </div>
          </header>

          <main className="flex-1 overflow-y-auto smooth-scroll custom-scrollbar px-4 md:px-16 py-12 pb-32 bg-background">
            <div className="max-w-7xl mx-auto text-right">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}