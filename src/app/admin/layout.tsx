
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, Cpu, Terminal, Image as ImageIcon, ClipboardList, ShieldAlert, Menu, X, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user, isAdmin } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsMounted] = useState(false);
  const [gateVersion, setGateVersion] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // تفعيل النص بعد التحميل لمنع خطأ Hydration
    setGateVersion("Sovereign Gate v12.0");
  }, []);

  const allSections = useMemo(() => [
    { label: "أدوات التصميم", icon: Palette, href: "/admin/design-tools", roles: ['owner', 'admin', 'designer'] },
    { label: "معرض أعمالي", icon: ImageIcon, href: "/admin/designs", roles: ['owner', 'admin', 'designer'] },
    { label: "إدارة الوكلاء", icon: Users, href: "/admin/middleman", roles: ['owner', 'admin', 'gm', 'agent', 'middleman'] },
    { label: "سوق الخدمات", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'gm', 'agent', 'middleman', 'designer'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager', 'support', 'agent'] },
    { label: "الخزينة والمالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "إعدادات المنصة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ], []);

  const visibleSections = useMemo(() => {
    if (!profile?.role) return [];
    return allSections.filter(item => 
      profile.role === 'owner' || profile.role === 'admin' || item.roles.includes(profile.role)
    );
  }, [profile, allSections]);

  const isPathAllowed = useMemo(() => {
    if (!isClient || loading || !profile) return true;
    if (pathname === "/admin") return isAdmin;
    return profile.role === 'owner' || profile.role === 'admin' || visibleSections.some(s => s.href === pathname);
  }, [profile, loading, pathname, visibleSections, isAdmin, isClient]);

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-8" dir="rtl">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <h2 className="text-xl font-black gold-text uppercase tracking-widest animate-pulse">تأمين الوصول التخصصي</h2>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-60">
             {gateVersion || "Authenticating Protocol..."}
           </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin || !profile) return null;

  if (!isPathAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-background" dir="rtl">
        <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-2xl">
           <ShieldAlert size={48} />
        </div>
        <h2 className="text-4xl font-black mb-4 gold-text">وصول متخصص محدود</h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg font-medium">
          عذراً سيادة {profile.label}، هذا القسم يقع خارج نطاق مهامك المعتمدة.
        </p>
        <Button asChild className="mt-12 royal-button px-16 h-16 text-lg">
          <Link href={visibleSections[0]?.href || "/admin"}>العودة لمهامي</Link>
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        {/* Desktop Sidebar */}
        <Sidebar className="border-l border-border bg-card hidden lg:flex" side="right">
          <SidebarHeader className="p-10 border-b text-center">
            <span className="handwritten-logo block mb-3 text-3xl">XMOOD ADMIN</span>
            <Badge variant="outline" className="text-[10px] uppercase font-black border-primary/30 text-primary px-4 py-1 rounded-full bg-primary/5">
              {profile?.label || profile?.role}
            </Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-5">
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                 مهامك التخصصية
               </SidebarGroupLabel>
               <SidebarMenu className="gap-2.5">
                 {visibleSections.map((item) => (
                   <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton 
                       asChild 
                       isActive={pathname === item.href}
                       className={`h-14 px-6 rounded-2xl transition-all duration-300 ${pathname === item.href ? 'bg-primary text-primary-foreground shadow-xl' : 'hover:bg-primary/10 text-muted-foreground'}`}
                     >
                       <Link href={item.href} className="flex flex-row-reverse items-center gap-5 w-full">
                         <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-primary'} />
                         <span className="font-black text-xs uppercase tracking-wider">{item.label}</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 ))}
               </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-8 border-t bg-muted/5 space-y-4">
            <Button asChild variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase gap-3 border-border hover:bg-card">
              <Link href="/"><ArrowLeft size={16} /> المتجر العام</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-12 rounded-xl text-red-500 font-black text-[10px] uppercase gap-3 hover:bg-red-500/10">
              <LogOut size={16} /> خروج آمن
            </Button>
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-background">
          <header className="h-20 md:h-24 border-b flex items-center justify-between px-6 md:px-12 bg-background/90 backdrop-blur-xl sticky top-0 z-[60] shrink-0">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                      <Terminal size={22} />
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">وحدة التحكم</span>
                      <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">{profile?.label || profile?.role} Active</span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] md:text-xs font-black px-4 py-1.5 rounded-full hidden sm:block">Identity Confirmed</Badge>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
             </div>
          </header>

          <div className="p-4 md:p-14 pb-48 lg:pb-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Bottom Navigation - High Priority Z-Index */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-card/95 backdrop-blur-3xl border-t z-[160] flex items-center justify-around px-4 shadow-[0_-15px_50px_rgba(0,0,0,0.3)] pointer-events-auto">
             {visibleSections.slice(0, 4).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex flex-col items-center justify-center gap-2 transition-all flex-1 h-full relative z-[170] pointer-events-auto ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}
                >
                   <div className={`p-3 rounded-2xl transition-all duration-500 ${pathname === item.href ? 'bg-primary/15 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : ''}`}>
                      <item.icon size={24} className={pathname === item.href ? 'drop-shadow-[0_0_10px_var(--primary)]' : 'opacity-70'} />
                   </div>
                   <span className={`text-[9px] font-black uppercase tracking-widest text-center truncate w-full px-1 ${pathname === item.href ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                </Link>
             ))}
             
             <Sheet dir="rtl">
                <SheetTrigger asChild>
                   <button className="flex flex-col items-center justify-center gap-2 flex-1 h-full text-muted-foreground opacity-70 pointer-events-auto relative z-[170]">
                      <div className="p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                        <Menu size={24} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">المزيد</span>
                   </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[3.5rem] p-0 border-none bg-background shadow-2xl h-[85vh] z-[200]">
                   <SheetHeader className="p-10 border-b text-center bg-muted/5">
                      <div className="flex justify-between items-center mb-6">
                         <SheetTitle className="handwritten-logo text-4xl text-right block">XMOOD ADMIN</SheetTitle>
                         <SheetClose asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10"><X size={28}/></Button>
                         </SheetClose>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none px-8 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
                         {profile?.label || profile?.role} ACCESS
                      </Badge>
                   </SheetHeader>
                   <div className="p-8 h-full pb-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                         {visibleSections.map((item) => (
                            <SheetClose asChild key={item.href}>
                               <Link 
                                 href={item.href} 
                                 className={`flex flex-col items-center gap-4 p-6 rounded-3xl transition-all border ${pathname === item.href ? 'bg-primary text-white border-primary shadow-2xl' : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted'}`}
                               >
                                  <item.icon size={26} className={pathname === item.href ? 'text-white' : 'text-primary'} />
                                  <span className="font-black text-[10px] uppercase text-center">{item.label}</span>
                               </Link>
                            </SheetClose>
                         ))}
                      </div>
                      <div className="mt-12 space-y-4">
                         <Button asChild variant="outline" className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase gap-4 border-border/60 hover:bg-card">
                           <Link href="/"><ArrowLeft size={18} /> العودة للمتجر</Link>
                         </Button>
                         <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-16 rounded-[1.5rem] text-red-500 font-black text-xs uppercase gap-4 hover:bg-red-500/5">
                           <LogOut size={18} /> خروج آمن
                         </Button>
                      </div>
                   </div>
                </SheetContent>
             </Sheet>
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
}
