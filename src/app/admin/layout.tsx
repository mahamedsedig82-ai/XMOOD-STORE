"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { 
  LogOut, ArrowLeft, Terminal, BarChart3, ShieldCheck, Package, ClipboardList, Users, Wallet, ShieldAlert, Image as ImageIcon, Zap, Loader2, GitBranch, ShoppingCart, LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { doc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user, isAdmin } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsMounted] = useState(false);

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
    { label: "المخزون والمنتجات", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'gm', 'store_manager'] },
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
          <SidebarHeader className="p-8 border-b text-center flex flex-col items-center gap-4">
            <Link href="/" className="flex flex-col items-center group">
               {config?.appearance?.logoUrl ? (
                 <img src={config.appearance.logoUrl} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" style={{ borderRadius: '1rem' }} alt="Logo" />
               ) : (
                 <span className="handwritten-logo text-3xl">XMOOD <span>PRO</span></span>
               )}
            </Link>
            <Badge variant="outline" className="text-[8px] uppercase font-black border-primary/30 text-primary px-4 py-0.5 rounded-full">
              {profile?.label || "ADMIN ACCESS"}
            </Badge>
          </SidebarHeader>
          <SidebarContent className="p-4 overflow-y-auto custom-scrollbar text-right">
             <SidebarMenu className="gap-2">
               {visibleSections.map((item) => (
                 <SidebarMenuItem key={item.href}>
                   <SidebarMenuButton 
                     asChild 
                     isActive={pathname === item.href}
                     className={`h-12 px-5 rounded-xl transition-all duration-300 ${pathname === item.href ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-primary/5 text-muted-foreground'}`}
                   >
                     <Link href={item.href} className="flex flex-row-reverse items-center gap-4 w-full">
                       <item.icon size={18} className={pathname === item.href ? 'text-black' : 'text-primary'} />
                       <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                     </Link>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
             </SidebarMenu>
          </SidebarContent>
          <div className="p-6 border-t bg-muted/20 space-y-3">
            <Button asChild variant="outline" className="w-full h-11 rounded-xl text-[9px] font-black uppercase gap-3 border-primary/20">
              <Link href="/"><ArrowLeft size={14} /> المتجر</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-11 rounded-xl text-red-500 font-black text-[9px] uppercase gap-3">
              <LogOut size={14} /> خروج
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 h-screen relative bg-background overflow-hidden">
          <header className="h-20 border-b flex items-center justify-between px-6 md:px-10 bg-background/90 backdrop-blur-xl z-[60] shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                   <Terminal size={20} />
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-xs font-black uppercase tracking-widest">وحدة التحكم</span>
                   <span className="text-[7px] text-muted-foreground uppercase font-bold tracking-[0.2em] opacity-60">Sovereign Engine</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-black px-4 py-1.5 rounded-full uppercase shadow-sm">Secure Connection</Badge>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
             </div>
          </header>

          <main className="flex-1 overflow-y-auto smooth-scroll custom-scrollbar px-4 md:px-12 py-10 pb-32 bg-background">
            <div className="max-w-6xl mx-auto text-right">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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