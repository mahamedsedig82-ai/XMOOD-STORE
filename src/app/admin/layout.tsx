
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Wallet, 
  Settings, 
  Sparkles,
  Wand2,
  FileText,
  ShieldCheck,
  Megaphone,
  CreditCard,
  MessageSquare,
  Zap,
  Activity,
  LogOut,
  Palette,
  Bell,
  Globe,
  Database,
  BarChart3,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { useEffect } from "react";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminLayoutComprehensive({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'agent'];
    if (!loading && (!profile || !allowedRoles.includes(profile.role))) {
      router.push('/'); 
    }
  }, [profile, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-24 h-24 border-t-4 border-primary border-r-4 border-r-red-600 rounded-[2rem] animate-spin" />
    </div>
  );

  const role = profile?.role;

  const mainSections = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "المساعد الذكي AI", icon: Sparkles, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "إدارة الخدمات", icon: Wand2, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer', 'agent'] },
    { label: "المستودع الرقمي", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "المبيعات والطلبات", icon: ShoppingCart, href: "/admin/orders", roles: ['owner', 'admin', 'store_manager', 'support'] },
  ];

  const businessSections = [
    { label: "إدارة الأعضاء", icon: Users, href: "/admin/users", roles: ['owner', 'admin', 'gm'] },
    { label: "الخزانة المالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "الإعلانات والعروض", icon: Megaphone, href: "/admin/ads", roles: ['owner', 'admin', 'gm'] },
    { label: "المدونة والمقالات", icon: FileText, href: "/admin/blog", roles: ['owner', 'admin', 'gm'] },
  ];

  const systemSections = [
    { label: "هوية المتجر", icon: Palette, href: "/admin/settings", roles: ['owner', 'admin'] },
    { label: "إعدادات النظام", icon: Globe, href: "/admin/config", roles: ['owner', 'admin'] },
    { label: "مركز التنبيهات", icon: Bell, href: "/admin/notifications", roles: ['owner', 'admin'] },
    { label: "سجل النشاط", icon: Activity, href: "/admin/system", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: typeof mainSections) => 
    items.filter(item => item.roles.includes(role || 'user')).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-16 px-8 rounded-2xl transition-all duration-300 ${pathname === item.href ? 'bg-primary/20 text-primary border border-primary/40 shadow-xl' : 'hover:bg-white/5 text-zinc-500 hover:text-white'}`}
        >
          <Link href={item.href}>
            <item.icon className={`w-6 h-6 ${pathname === item.href ? 'text-primary' : 'text-zinc-600'}`} />
            <span className="font-bold text-sm">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black font-body overflow-hidden text-white" dir="rtl">
        <Sidebar className="border-l border-white/5 bg-zinc-950" side="right">
          <SidebarHeader className="p-10 border-b border-white/5 bg-black/50 backdrop-blur-3xl">
            <Link href="/" className="flex flex-col items-center gap-4 text-center">
              <span className="decorative-logo text-3xl">{config?.siteInfo?.title || "XMOOD PRO"}</span>
              <Badge variant="outline" className="border-red-600/30 text-red-600 px-6 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.4em]">{profile?.role}</Badge>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-8">
            <SidebarGroup className="mb-10">
              <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-bold uppercase text-zinc-700 tracking-[0.5em]">الإدارة المباشرة</SidebarGroupLabel>
              <SidebarMenu className="gap-3">
                {renderMenuItems(mainSections)}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mb-10">
              <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-bold uppercase text-zinc-700 tracking-[0.5em]">إدارة العمليات</SidebarGroupLabel>
              <SidebarMenu className="gap-3">
                {renderMenuItems(businessSections)}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-bold uppercase text-zinc-700 tracking-[0.5em]">إعدادات المتجر</SidebarGroupLabel>
              <SidebarMenu className="gap-3">
                {renderMenuItems(systemSections)}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-10 border-t border-white/5 bg-black/30">
             <Button 
               variant="ghost" 
               onClick={() => signOut(auth!)}
               className="w-full h-16 rounded-[1.5rem] text-red-600 hover:bg-red-600/10 gap-5 font-bold text-[11px] uppercase tracking-[0.3em]"
             >
               <LogOut size={20} /> تسجيل الخروج
             </Button>
          </div>
        </Sidebar>
        
        <main className="flex-1 overflow-y-auto p-16 bg-black relative">
          <div className="flex justify-between items-center mb-16 pb-12 border-b border-white/5">
             <div className="flex items-center gap-8">
                <Badge variant="outline" className="border-red-600/20 text-red-500 px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.4em] flex gap-4 animate-pulse">
                   <Zap size={16} /> نظام XMOOD النشط
                </Badge>
                <div className="h-10 w-px bg-white/5" />
                <div className="flex items-center gap-4 text-zinc-600 font-bold text-xs uppercase tracking-widest">
                   {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
             </div>
             <div className="flex items-center gap-6">
                <Button size="icon" variant="ghost" className="text-zinc-600 hover:text-primary h-12 w-12"><Activity size={24} /></Button>
                <Button size="icon" variant="ghost" className="text-zinc-600 hover:text-red-500 h-12 w-12"><Database size={24} /></Button>
             </div>
          </div>
          <div className="max-w-[1400px] mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
