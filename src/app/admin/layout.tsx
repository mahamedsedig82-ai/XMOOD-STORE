
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Terminal, Image as ImageIcon, ClipboardList, ShieldAlert, Menu, X
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // بروتوكول الحماية ومنع الطرد المتسرع
  useEffect(() => {
    if (isClient && !loading) {
      if (!user) {
        router.replace('/login');
      } else if (profile && !isAdmin) {
        router.replace('/');
      }
    }
  }, [loading, user, isAdmin, profile, isClient, router]);

  // مصفوفة الأقسام مع التحديد الصارم للأدوار
  const allSections = useMemo(() => [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "مساعد الإدارة AI", icon: Cpu, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm', 'community_mod'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "سوق الخدمات", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'gm', 'agent', 'middleman', 'designer'] },
    { label: "إدارة الوكلاء", icon: Users, href: "/admin/middleman", roles: ['owner', 'admin', 'gm', 'agent', 'middleman'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager', 'support'] },
    { label: "المالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "أدوات التصميم", icon: Palette, href: "/admin/design-tools", roles: ['owner', 'admin', 'designer'] },
    { label: "معرض أعمالي", icon: ImageIcon, href: "/admin/designs", roles: ['owner', 'admin', 'designer'] },
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
    if (loading || !profile) return true;
    if (pathname === "/admin") return true;
    return profile.role === 'owner' || profile.role === 'admin' || visibleSections.some(s => s.href === pathname);
  }, [profile, loading, pathname, visibleSections]);

  if (!isClient || loading || (user && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-8" dir="rtl">
        <div className="relative">
          <div className="w-24 h-24 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_20px_var(--primary)]" />
          </div>
        </div>
        <div className="text-center space-y-3">
           <h2 className="text-xl font-black gold-text uppercase tracking-widest animate-pulse">تأمين الوصول التخصصي</h2>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-60">Sovereign Gate v10.0</p>
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
        <h2 className="text-4xl font-black mb-4 gold-text">وصول محدود للتخصص</h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg font-medium">
          عذراً، هذا القسم يقع خارج نطاق مهامك المعتمدة حالياً. يرجى استخدام الأدوات المتاحة لك فقط.
        </p>
        <Button asChild className="mt-12 royal-button px-16 h-16 text-lg">
          <Link href="/admin">العودة لمهامي</Link>
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

        <main className="flex-1 overflow-hidden flex flex-col relative">
          
          {/* Main Header */}
          <header className="h-20 md:h-24 border-b flex items-center justify-between px-6 md:px-12 bg-background/90 backdrop-blur-xl z-[60] sticky top-0">
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
                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] md:text-xs font-black px-4 py-1.5 rounded-full hidden sm:block">Sovereign Auth</Badge>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
             </div>
          </header>

          {/* Viewport */}
          <div className="flex-1 overflow-y-auto p-4 md:p-14 custom-scrollbar pb-32">
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

          {/* Fixed Bottom Navigation (Mobile Specialist Hub) */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-card/95 backdrop-blur-2xl border-t z-[100] flex items-center justify-around px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pointer-events-auto">
             {visibleSections.slice(0, 4).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex flex-col items-center justify-center gap-1.5 transition-all flex-1 h-full relative pointer-events-auto ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}
                >
                   <div className={`p-2.5 rounded-xl transition-all ${pathname === item.href ? 'bg-primary/10 shadow-lg' : ''}`}>
                      <item.icon size={22} className={pathname === item.href ? 'drop-shadow-[0_0_8px_var(--primary)]' : 'opacity-60'} />
                   </div>
                   <span className={`text-[8px] font-black uppercase tracking-widest text-center truncate w-full px-1 ${pathname === item.href ? 'opacity-100' : 'opacity-50'}`}>{item.label}</span>
                   {pathname === item.href && (
                     <motion.div 
                       layoutId="bottom-nav-indicator" 
                       className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_var(--primary)]" 
                     />
                   )}
                </Link>
             ))}
             {/* Mobile Menu Button for extra links */}
             <Sheet dir="rtl">
                <SheetTrigger asChild>
                   <button className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full text-muted-foreground opacity-60 pointer-events-auto">
                      <div className="p-2.5 rounded-xl hover:bg-muted">
                        <Menu size={22} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest">المزيد</span>
                   </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[3rem] p-0 border-none bg-background shadow-2xl h-[75vh]">
                   <SheetHeader className="p-8 border-b text-center bg-muted/5">
                      <div className="flex justify-between items-center mb-4">
                         <span className="handwritten-logo text-3xl">XMOOD ADMIN</span>
                         <SheetClose asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-red-500"><X size={24}/></Button>
                         </SheetClose>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none px-6 py-1 rounded-full text-[10px] font-black uppercase">
                         {profile?.label || profile?.role}
                      </Badge>
                   </SheetHeader>
                   <ScrollArea className="p-6 h-full pb-32">
                      <div className="space-y-3">
                         {visibleSections.map((item) => (
                            <SheetClose asChild key={item.href}>
                               <Link 
                                 href={item.href} 
                                 className={`flex flex-row-reverse items-center justify-between p-5 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-muted/30 font-bold text-muted-foreground'}`}
                               >
                                  <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-primary'} />
                                  <span className="font-black text-xs uppercase">{item.label}</span>
                               </Link>
                            </SheetClose>
                         ))}
                      </div>
                      <div className="mt-8 space-y-3">
                         <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-black text-[11px] uppercase gap-3">
                           <Link href="/"><ArrowLeft size={16} /> المتجر الرئيسي</Link>
                         </Button>
                         <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-14 rounded-2xl text-red-500 font-black text-[11px] uppercase gap-3 hover:bg-red-50">
                           <LogOut size={16} /> تسجيل الخروج
                         </Button>
                      </div>
                   </ScrollArea>
                </SheetContent>
             </Sheet>
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
}
