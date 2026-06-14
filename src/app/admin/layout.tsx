
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Terminal, Image as ImageIcon, ClipboardList, ShieldAlert
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
  const { profile, loading, user, isAdmin } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // بروتوكول الحماية ومنع الطرد الخاطئ - ننتظر بيقين تام
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_20px_var(--primary)]" />
          </div>
        </div>
        <div className="text-center space-y-3">
           <h2 className="text-xl font-black gold-text uppercase tracking-widest animate-pulse">جاري التحقق من الهوية السيادية</h2>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-60">Staff Access Protocol v5.0</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin || !profile) return null;

  // تعريف كافة الأقسام مع تحديد الأدوار المسموح لها بالوصول لكل قسم
  const allSections = [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm', 'designer', 'agent', 'middleman', 'store_manager', 'accountant', 'support'] },
    { label: "مساعد الإدارة AI", icon: Cpu, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm', 'community_mod'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "سوق الخدمات", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent', 'middleman', 'designer', 'support'] },
    { label: "إدارة الوكلاء", icon: Users, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager', 'designer', 'agent', 'support'] },
    { label: "المالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "أدوات التصميم", icon: Palette, href: "/admin/design-tools", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "معرض أعمالي", icon: ImageIcon, href: "/admin/designs", roles: ['owner', 'designer'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "إعدادات المنصة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  // تصفية القائمة الجانبية بناءً على رتبة المستخدم الحالية
  const visibleSections = allSections.filter(item => 
    profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role))
  );

  // التحقق من صلاحية المسار الحالي
  const currentSection = allSections.find(s => s.href === pathname);
  const isPathAllowed = !currentSection || profile?.role === 'owner' || (profile?.role && currentSection.roles.includes(profile.role));

  // إذا كان المستخدم يحاول الوصول لصفحة غير مسموح له بها، نعرض واجهة المنع بدلاً من طرده
  if (!isPathAllowed && pathname !== "/admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-background" dir="rtl">
        <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-2xl">
           <ShieldAlert size={48} />
        </div>
        <h2 className="text-4xl font-black mb-4 gold-text">وصول تخصصي محدود</h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg font-medium">
          عذراً <span className="text-foreground font-bold">{profile.displayName}</span>، هذا القسم يقع خارج نطاق مهامك الحالية كـ <span className="text-primary font-bold">{profile.label || profile.role}</span>. يرجى الالتزام بالأدوات المتاحة في قائمتك الجانبية.
        </p>
        <Button asChild className="mt-12 royal-button px-16 h-16 text-lg">
          <Link href="/admin">العودة لمساحة عملي</Link>
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-border bg-card hidden md:flex" side="right">
          <SidebarHeader className="p-10 border-b text-center">
            <span className="handwritten-logo block mb-3 text-3xl">XMOOD STORE</span>
            <Badge variant="outline" className="text-[10px] uppercase font-black border-primary/30 text-primary px-4 py-1 rounded-full bg-primary/5">
              {profile?.label || profile?.role}
            </Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-5">
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-4 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                 قائمة مهام التخصص
               </SidebarGroupLabel>
               <SidebarMenu className="gap-2.5">
                 {visibleSections.map((item) => (
                   <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton 
                       asChild 
                       isActive={pathname === item.href}
                       className={`h-14 px-6 rounded-2xl transition-all duration-300 ${pathname === item.href ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-primary/10 text-muted-foreground'}`}
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
              <Link href="/"><ArrowLeft size={16} /> العودة للمتجر</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-12 rounded-xl text-red-500 font-black text-[10px] uppercase gap-3 hover:bg-red-500/10">
              <LogOut size={16} /> خروج آمن
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-hidden flex flex-col relative">
          <header className="h-20 md:h-24 border-b flex items-center justify-between px-8 md:px-12 bg-background/90 backdrop-blur-xl z-40 sticky top-0">
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                   <Terminal size={22} />
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-[11px] md:text-sm font-black uppercase tracking-widest text-foreground">وحدة التحكم السيادية</span>
                   <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{profile?.label || profile?.role} Specialist Terminal</span>
                </div>
             </div>
             <div className="flex items-center gap-5">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[9px] md:text-xs font-black px-5 py-1.5 rounded-full shadow-sm">Encrypted Session</Badge>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-14 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-7xl mx-auto pb-32"
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
