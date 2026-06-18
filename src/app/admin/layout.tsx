"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { 
  LogOut, ArrowRight, Terminal, BarChart3, ShieldCheck, Package, ClipboardList, Users, Wallet, ShieldAlert, ImageIcon, Zap, Loader2, GitBranch, ShoppingCart, LayoutGrid, Briefcase, Megaphone, Menu, X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { doc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user, isAdmin } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allSections = useMemo(() => [
    { label: "نظرة عامة", icon: BarChart3, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "المحتوى والهوية", icon: LayoutGrid, href: "/admin/content", roles: ['owner', 'admin', 'gm'] },
    { label: "الإعلانات والبنرات", icon: Megaphone, href: "/admin/ads", roles: ['owner', 'admin', 'gm'] },
    { label: "المخزون والمنتجات", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "سوق الخدمات", icon: Briefcase, href: "/admin/other-services", roles: ['owner', 'admin', 'gm'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/operations-log", roles: ['owner', 'admin', 'gm', 'support'] },
    { label: "نظام السلة", icon: ShoppingCart, href: "/admin/cart-system", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة المعرض", icon: ImageIcon, href: "/admin/designs", roles: ['owner', 'admin', 'gm', 'designer'] },
    { label: "إدارة الفروع", icon: GitBranch, href: "/admin/branches", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin', 'gm'] },
    { label: "المالية والبنك", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'gm', 'accountant'] },
    { label: "مركز الأمان", icon: ShieldAlert, href: "/admin/security", roles: ['owner', 'admin', 'gm'] },
    { label: "المساعد AI", icon: Zap, href: "/admin/ai", roles: ['owner', 'admin', 'gm'] },
  ], []);

  const visibleSections = useMemo(() => {
    if (!profile?.role) return [];
    return allSections.filter(item => 
      profile.role === 'owner' || profile.role === 'admin' || item.roles.includes(profile.role)
    );
  }, [profile, allSections]);

  useEffect(() => {
    if (isClient && !loading) {
      if (!user) {
        router.replace('/login');
      } else if (profile && !isAdmin) {
        router.replace('/');
      }
    }
  }, [loading, user, isAdmin, profile, isClient, router]);

  if (!isClient || loading || (user && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-5">
        <Loader2 className="animate-spin text-primary" size={60} />
        <p className="text-[11px] font-black uppercase tracking-[0.4em] gold-text animate-pulse">Securing Sovereign Access...</p>
      </div>
    );
  }

  if (!user || !isAdmin || !profile) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        {/* Desktop Sidebar - Ensured Visibility and Solid Layout */}
        <Sidebar className="border-l border-border bg-card/80 backdrop-blur-3xl hidden lg:flex shrink-0 shadow-2xl" side="right">
          <SidebarHeader className="p-10 border-b text-center flex flex-col items-center gap-6 bg-muted/10">
            <Link href="/" className="flex flex-col items-center transition-transform hover:scale-105">
               {config?.appearance?.logoUrl ? (
                 <img src={config.appearance.logoUrl} className="h-20 w-20 rounded-full object-cover shadow-xl border-4 border-primary/20" alt="Logo" />
               ) : (
                 <span className="handwritten-logo text-2xl" style={{ direction: 'ltr' }}>XMOOD STORE</span>
               )}
            </Link>
            <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/30 text-primary px-6 py-1.5 rounded-full tracking-widest bg-primary/5 shadow-sm">
              {profile?.label || "ADMIN ACCESS"}
            </Badge>
          </SidebarHeader>
          <SidebarContent className="p-8 overflow-y-auto custom-scrollbar text-right">
             <SidebarMenu className="gap-4">
               {visibleSections.map((item) => (
                 <SidebarMenuItem key={item.href}>
                   <SidebarMenuButton asChild isActive={pathname === item.href} className={`h-14 px-8 rounded-2xl transition-all duration-400 ${pathname === item.href ? 'bg-primary text-black shadow-2xl scale-[1.05]' : 'hover:bg-primary/10 text-foreground/70'}`}>
                     <Link href={item.href} className="flex flex-row-reverse items-center gap-5 w-full">
                       <item.icon size={22} className={pathname === item.href ? 'text-black' : 'text-primary'} />
                       <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                     </Link>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
             </SidebarMenu>
          </SidebarContent>
          <div className="p-8 border-t bg-muted/20 space-y-4">
            <Button asChild variant="outline" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase gap-4 border-primary/30 hover:bg-primary hover:text-black transition-all shadow-sm">
              <Link href="/"><ArrowRight size={16} className="rotate-0" /> العودة للمتجر</Link>
            </Button>
            <Button variant="ghost" onClick={logout} className="w-full h-12 rounded-2xl text-red-500 font-black text-[10px] uppercase gap-4 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={16} /> تسجيل الخروج
            </Button>
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen relative bg-background overflow-hidden">
          <header className="h-20 border-b flex items-center justify-between px-6 md:px-12 bg-background/90 backdrop-blur-2xl z-[150] shrink-0">
             <div className="flex items-center gap-5">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                   <Terminal size={22} />
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-sm font-black uppercase tracking-widest gold-text">وحدة التحكم السيادية</span>
                   <span className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.3em] mt-0.5 opacity-60">Sovereign Core OS 10.0</span>
                </div>
             </div>

             {/* Mobile Admin Trigger */}
             <div className="flex items-center gap-4 lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="rounded-xl bg-muted/50 border h-11 w-11">
                   {isMobileNavOpen ? <X size={24} className="text-primary" /> : <Menu size={24} />}
                </Button>
             </div>

             <div className="hidden lg:flex items-center gap-5">
                <div className="flex items-center gap-3 px-6 py-2 bg-green-500/5 rounded-full border border-green-500/10">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                   <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">System Active</span>
                </div>
                <Badge variant="outline" className="border-border text-muted-foreground text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">Verified Session</Badge>
                {/* Immediate Logout for Admins on Desktop header too */}
                <Button variant="ghost" size="icon" onClick={logout} className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-xl">
                   <LogOut size={18} />
                </Button>
             </div>
          </header>

          {/* Mobile Admin Menu Overlay */}
          <AnimatePresence>
            {isMobileNavOpen && (
               <>
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   onClick={() => setIsMobileNavOpen(false)}
                   className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md lg:hidden"
                 />
                 <motion.div 
                   initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
                   transition={{ type: "spring", damping: 30, stiffness: 200 }}
                   className="fixed top-20 right-0 z-[210] w-full h-[calc(100vh-80px)] bg-background border-b-4 border-primary/30 lg:hidden flex flex-col shadow-2xl overflow-hidden"
                 >
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-4 opacity-50">الأدوات الإدارية</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {visibleSections.map((item) => (
                             <Link 
                               key={item.href} 
                               href={item.href} 
                               onClick={() => setIsMobileNavOpen(false)}
                               className={`flex items-center gap-4 p-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${pathname === item.href ? 'bg-primary text-black shadow-lg' : 'bg-muted/40 text-foreground/70'}`}
                             >
                                <item.icon size={18} className={pathname === item.href ? 'text-black' : 'text-primary'} />
                                {item.label}
                             </Link>
                          ))}
                       </div>
                    </div>
                    <div className="flex-none p-8 border-t bg-muted/20 flex flex-col gap-4">
                       <Button asChild variant="outline" className="w-full h-14 rounded-xl font-black text-[10px] uppercase gap-4 border-primary/30">
                          <Link href="/"><ArrowRight size={18} /> العودة للمتجر</Link>
                       </Button>
                       <Button variant="ghost" onClick={() => { logout(); setIsMobileNavOpen(false); }} className="w-full h-14 rounded-xl text-red-500 font-black text-[10px] uppercase gap-4 bg-red-500/5">
                          <LogOut size={18} /> تسجيل الخروج الإداري
                       </Button>
                    </div>
                 </motion.div>
               </>
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-y-auto smooth-scroll custom-scrollbar px-4 md:px-16 py-12 pb-48 bg-background relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03),transparent_40%)] pointer-events-none" />
             <div className="max-w-6xl mx-auto text-right relative z-10">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={pathname} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }} 
                  transition={{ duration: 0.5, ease: "easeOut" }}
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