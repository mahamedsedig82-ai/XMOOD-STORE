"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, Terminal, Image as ImageIcon, ClipboardList, ShieldAlert, Layers, Menu, X, BarChart3, Database
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

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
    { label: "الأقسام", icon: Layers, href: "/admin/categories", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "المخزون والمنتجات", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager', 'support'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "المالية والبنك", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "محتوى الموقع", icon: Database, href: "/admin/content", roles: ['owner', 'admin', 'gm'] },
    { label: "الوكلاء", icon: ShieldAlert, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "التصاميم", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'designer'] },
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black gap-8" dir="rtl">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <h2 className="text-xl font-black gold-text uppercase tracking-widest animate-pulse">تأمين الوصول السيادي</h2>
      </div>
    );
  }

  if (!user || !isAdmin || !profile) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-black overflow-hidden" dir="rtl">
        {/* Modern Sidebar */}
        <Sidebar className="border-l border-border bg-white dark:bg-zinc-950 hidden lg:flex shrink-0" side="right">
          <SidebarHeader className="p-10 border-b text-center">
            <span className="handwritten-logo block mb-4 text-4xl">XMOOD</span>
            <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/30 text-primary px-5 py-1 rounded-full bg-primary/5">
              {profile?.label || "ADMIN ACCESS"}
            </Badge>
          </SidebarHeader>
          <SidebarContent className="p-6 overflow-y-auto">
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-black uppercase text-muted-foreground tracking-[0.3em]">
                 التحكم المركزي
               </SidebarGroupLabel>
               <SidebarMenu className="gap-3">
                 {visibleSections.map((item) => (
                   <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton 
                       asChild 
                       isActive={pathname === item.href}
                       className={`h-14 px-6 rounded-2xl transition-all duration-500 ${pathname === item.href ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-primary/5 text-slate-500'}`}
                     >
                       <Link href={item.href} className="flex flex-row-reverse items-center gap-5 w-full">
                         <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-primary'} />
                         <span className="font-black text-[11px] uppercase tracking-wider">{item.label}</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 ))}
               </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-8 border-t bg-slate-50 dark:bg-white/5 space-y-4">
            <Button asChild variant="outline" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase gap-4 border-slate-200">
              <Link href="/"><ArrowLeft size={16} /> العودة للمتجر</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-12 rounded-2xl text-red-500 font-black text-[10px] uppercase gap-4 hover:bg-red-50">
              <LogOut size={16} /> خروج آمن
            </Button>
          </div>
        </Sidebar>

        {/* Main Command Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          <header className="h-24 border-b flex items-center justify-between px-10 bg-white/80 dark:bg-black/80 backdrop-blur-3xl sticky top-0 z-[60] shrink-0">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                   <Terminal size={28} />
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">وحدة التحكم السيادية</span>
                   <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Master Command Portal</span>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black px-5 py-2 rounded-full hidden sm:block tracking-widest uppercase">System Secured</Badge>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
             </div>
          </header>

          <main className="flex-1 overflow-y-auto scroll-smooth relative bg-slate-50 dark:bg-white/5">
            <div className="p-10 md:p-16 max-w-7xl mx-auto pb-40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-white/95 dark:bg-black/95 backdrop-blur-3xl border-t z-[100] flex items-center justify-around px-4 shadow-2xl">
             {visibleSections.slice(0, 4).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex flex-col items-center justify-center gap-2 transition-all flex-1 h-full ${pathname === item.href ? 'text-primary' : 'text-slate-400'}`}
                >
                   <div className={`p-3 rounded-2xl transition-all duration-500 ${pathname === item.href ? 'bg-primary/10 shadow-sm' : ''}`}>
                      <item.icon size={22} className={pathname === item.href ? 'drop-shadow-sm' : 'opacity-60'} />
                   </div>
                   <span className={`text-[8px] font-black uppercase tracking-widest text-center truncate w-full px-1 ${pathname === item.href ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
                </Link>
             ))}
             <Sheet dir="rtl">
                <SheetTrigger asChild>
                   <button className="flex flex-col items-center justify-center gap-2 flex-1 h-full text-slate-400 opacity-60">
                      <div className="p-3 rounded-2xl hover:bg-muted transition-colors"><Menu size={22} /></div>
                      <span className="text-[8px] font-black uppercase tracking-widest">القائمة</span>
                   </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[3rem] p-0 border-none bg-white dark:bg-zinc-950 shadow-2xl h-[85vh]">
                   <SheetHeader className="p-10 border-b text-center bg-slate-50 dark:bg-white/5">
                      <SheetTitle className="handwritten-logo text-4xl text-right">XMOOD COMMAND</SheetTitle>
                      <Badge className="mt-6 bg-primary text-white border-none px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                         {profile?.label || "ADMIN"} ACCESS
                      </Badge>
                   </SheetHeader>
                   <div className="p-10 h-full pb-40 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-6">
                         {visibleSections.map((item) => (
                            <SheetClose asChild key={item.href}>
                               <Link 
                                 href={item.href} 
                                 className={`flex flex-col items-center gap-4 p-8 rounded-[2rem] transition-all border ${pathname === item.href ? 'bg-primary text-white border-primary shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-slate-200 text-slate-500'}`}
                               >
                                  <item.icon size={28} className={pathname === item.href ? 'text-white' : 'text-primary'} />
                                  <span className="font-black text-[10px] uppercase text-center tracking-widest">{item.label}</span>
                               </Link>
                            </SheetClose>
                         ))}
                      </div>
                   </div>
                </SheetContent>
             </Sheet>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
}
