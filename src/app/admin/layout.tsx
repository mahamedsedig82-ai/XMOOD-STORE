
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, Users, Wallet, 
  Settings, Palette, LogOut, ArrowLeft, Zap, ShoppingBag, Cpu, Terminal, Image as ImageIcon, ClipboardList
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

  // بروتوكول الحماية ومنع الطرد الخاطئ - لا يتم اتخاذ قرار إلا بعد اكتمال التحميل تماماً
  useEffect(() => {
    if (!loading && isClient) {
      if (!user) {
        router.replace('/login');
      } else if (isAdmin === false) {
        // إذا تأكد النظام أن المستخدم ليس طاقم عمل بعد انتهاء التحميل، يتم طرده
        router.replace('/');
      }
    }
  }, [loading, user, isAdmin, isClient, router]);

  // واجهة تأمين الوصول تظهر طالما لم نتأكد من الصلاحيات بعد
  if (!isClient || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6" dir="rtl">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_15px_var(--primary)]" />
          </div>
        </div>
        <div className="text-center space-y-2">
           <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">جاري فحص بروتوكول الوصول...</p>
           <p className="text-[9px] text-muted-foreground uppercase font-bold opacity-50">Sovereign Identity Verification</p>
        </div>
      </div>
    );
  }

  // منع عرض المحتوى إذا كان المستخدم غير مخول قطعاً
  if (!user || !isAdmin) return null;

  const allSections = [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm', 'designer', 'agent', 'middleman'] },
    { label: "مساعد الإدارة AI", icon: Cpu, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "السوق المفتوح", icon: ShoppingBag, href: "/admin/community", roles: ['owner', 'admin', 'gm', 'community_mod'] },
    { label: "الخدمات الإلكترونية", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "سوق الخدمات", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent', 'middleman', 'designer'] },
    { label: "إدارة الوكلاء", icon: Users, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "طلبات العملاء", icon: ClipboardList, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager', 'designer', 'agent'] },
    { label: "الخزينة والمالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "أدوات التصميم", icon: Palette, href: "/admin/design-tools", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "معرض أعمالي", icon: ImageIcon, href: "/admin/designs", roles: ['owner', 'designer'] },
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
    { label: "إعدادات المنصة", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ];

  const visibleSections = allSections.filter(item => 
    profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role))
  );

  const currentSection = allSections.find(s => s.href === pathname);
  const isAllowed = profile?.role === 'owner' || (profile?.role && currentSection?.roles.includes(profile.role));

  // إذا حاول الدخول لرابط لا يملكه، تظهر شاشة المنع بدلاً من الطرد للمنزل
  if (pathname !== "/admin" && !isAllowed && currentSection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10" dir="rtl">
        <Terminal size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">وصول غير مصرح به</h2>
        <p className="text-muted-foreground">عذراً، هذا القسم مخصص لمتخصصين آخرين. يرجى العودة للقسم الخاص بتخصصك.</p>
        <Button asChild className="mt-8 royal-button">
          <Link href="/admin">العودة للرئيسية</Link>
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-border bg-card hidden md:flex" side="right">
          <SidebarHeader className="p-8 border-b text-center">
            <span className="handwritten-logo block mb-2 text-2xl">XMOOD STORE</span>
            <Badge variant="outline" className="text-[8px] uppercase font-bold border-primary/20 text-primary px-3 py-0.5 rounded-full">
              {profile?.label || profile?.role}
            </Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-4">
            <SidebarGroup>
               <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">
                 قسم التخصص: {profile?.role}
               </SidebarGroupLabel>
               <SidebarMenu className="gap-2">
                 {visibleSections.map((item) => (
                   <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton 
                       asChild 
                       isActive={pathname === item.href}
                       className={`h-12 px-5 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-primary/5 text-muted-foreground'}`}
                     >
                       <Link href={item.href} className="flex flex-row-reverse items-center gap-4 w-full">
                         <item.icon size={18} />
                         <span className="font-bold text-[11px] uppercase tracking-wider">{item.label}</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 ))}
               </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-6 border-t bg-muted/5 space-y-3">
            <Button asChild variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase gap-2 border-border">
              <Link href="/"><ArrowLeft size={16} /> الواجهة العامة</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-11 rounded-xl text-red-500 font-black text-[10px] uppercase gap-2 hover:bg-red-500/5">
              <LogOut size={16} /> خروج آمن
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-hidden flex flex-col relative">
          <header className="h-16 md:h-20 border-b flex items-center justify-between px-6 md:px-10 bg-background/80 backdrop-blur-md z-40 sticky top-0">
             <div className="flex items-center gap-4">
                <Terminal size={18} className="text-primary" />
                <div className="flex flex-col text-right">
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">وحدة التحكم التخصصية</span>
                   <span className="text-[8px] text-muted-foreground uppercase">{profile?.role} Department Console</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] md:text-[10px] font-black px-4 py-1 rounded-full">Secure Session</Badge>
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
