
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayoutComprehensive({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    // قائمة الأدوار المسموح لها بدخول لوحة الإدارة
    const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'];
    
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile && !allowedRoles.includes(profile.role)) {
        router.push('/'); 
      }
    }
  }, [profile, loading, user, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 border-t-4 border-primary border-r-4 border-r-red-600 rounded-[2rem] animate-spin" />
        <p className="text-primary font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Sovereign Link Active...</p>
      </div>
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
    { label: "إدارة الوساطة", icon: ShieldCheck, href: "/admin/middleman", roles: ['owner', 'admin', 'middleman'] },
    { label: "الإعلانات والعروض", icon: Megaphone, href: "/admin/ads", roles: ['owner', 'admin', 'gm'] },
  ];

  const systemSections = [
    { label: "هوية المتجر", icon: Palette, href: "/admin/settings", roles: ['owner', 'admin'] },
    { label: "إعدادات النظام", icon: Globe, href: "/admin/config", roles: ['owner', 'admin'] },
    { label: "سجل النشاط", icon: Activity, href: "/admin/system", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => item.roles.includes(role || 'user')).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-14 px-6 rounded-xl transition-all duration-300 ${pathname === item.href ? 'bg-primary/20 text-primary border border-primary/40 shadow-xl' : 'hover:bg-white/5 text-zinc-500 hover:text-white'}`}
        >
          <Link href={item.href}>
            <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-primary' : 'text-zinc-600'}`} />
            <span className="font-bold text-xs">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black font-body overflow-hidden text-white" dir="rtl">
        <Sidebar className="border-l border-white/5 bg-zinc-950" side="right">
          <SidebarHeader className="p-8 border-b border-white/5 bg-black/50 backdrop-blur-3xl">
            <Link href="/" className="flex flex-col items-center gap-3 text-center">
              <span className="decorative-logo text-2xl">{config?.siteInfo?.title || "XMOOD PRO"}</span>
              <Badge variant="outline" className="border-red-600/30 text-red-600 px-4 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em]">{profile?.role}</Badge>
            </Link>
          </SidebarHeader>
          
          <ScrollArea className="flex-1">
            <SidebarContent className="p-6">
              <SidebarGroup className="mb-8">
                <SidebarGroupLabel className="text-right px-4 mb-4 text-[8px] font-black uppercase text-zinc-700 tracking-[0.4em]">الإدارة المباشرة</SidebarGroupLabel>
                <SidebarMenu className="gap-2">
                  {renderMenuItems(mainSections)}
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup className="mb-8">
                <SidebarGroupLabel className="text-right px-4 mb-4 text-[8px] font-black uppercase text-zinc-700 tracking-[0.4em]">إدارة العمليات</SidebarGroupLabel>
                <SidebarMenu className="gap-2">
                  {renderMenuItems(businessSections)}
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-right px-4 mb-4 text-[8px] font-black uppercase text-zinc-700 tracking-[0.4em]">إعدادات المتجر</SidebarGroupLabel>
                <SidebarMenu className="gap-2">
                  {renderMenuItems(systemSections)}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </ScrollArea>

          <div className="p-6 border-t border-white/5 bg-black/30">
             <Button 
               variant="ghost" 
               onClick={() => signOut(auth!)}
               className="w-full h-12 rounded-xl text-red-600 hover:bg-red-600/10 gap-4 font-black text-[10px] uppercase tracking-[0.2em]"
             >
               <LogOut size={18} /> تسجيل الخروج
             </Button>
          </div>
        </Sidebar>
        
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-black relative">
          <div className="flex justify-between items-center mb-12 pb-8 border-b border-white/5">
             <div className="flex items-center gap-6">
                <Badge variant="outline" className="border-red-600/20 text-red-500 px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.3em] flex gap-3 animate-pulse">
                   <Zap size={14} /> نظام XMOOD النشط
                </Badge>
                <div className="hidden md:block h-8 w-px bg-white/5" />
                <div className="hidden md:flex items-center gap-3 text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
                   {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" className="text-zinc-600 hover:text-primary h-10 w-10"><Activity size={20} /></Button>
                <Button size="icon" variant="ghost" className="text-zinc-600 hover:text-red-500 h-10 w-10"><Database size={20} /></Button>
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
