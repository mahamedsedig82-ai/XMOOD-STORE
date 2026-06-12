
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
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { useEffect } from "react";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support'];
    if (!loading && (!profile || !allowedRoles.includes(profile.role))) {
      router.push('/'); 
    }
  }, [profile, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-20 h-20 border-t-4 border-primary border-r-4 border-r-red-600 rounded-full animate-spin" />
    </div>
  );

  const role = profile?.role;

  const menu = [
    { label: "الرئيسية", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm', 'store_manager'] },
    { label: "طلبات التصميم", icon: Wand2, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
    { label: "المستودع", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "الطلبات", icon: ShoppingCart, href: "/admin/orders", roles: ['owner', 'admin', 'gm', 'store_manager', 'support'] },
    { label: "المستخدمين", icon: Users, href: "/admin/users", roles: ['owner', 'admin', 'gm'] },
    { label: "المالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "المقالات", icon: FileText, href: "/admin/blog", roles: ['owner', 'admin', 'gm'] },
    { label: "الإعلانات", icon: Megaphone, href: "/admin/ads", roles: ['owner', 'admin'] },
    { label: "الذكاء الاصطناعي", icon: Sparkles, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "الإعدادات", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ].filter(item => item.roles.includes(role || 'user'));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black font-body overflow-hidden text-white" dir="rtl">
        <Sidebar className="border-l border-white/5 bg-zinc-950" side="right">
          <SidebarHeader className="p-8 border-b border-white/5">
            <Link href="/" className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <ShieldCheck className="text-primary" size={28} />
              </div>
              <div className="text-right">
                 <span className="font-headline text-2xl font-black gold-text block leading-none">XMOOD PRO</span>
                 <p className="text-[9px] font-black uppercase text-red-600 mt-2 tracking-[0.3em]">{profile?.role}</p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-8 text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">النظام المركزي السيادي</SidebarGroupLabel>
              <SidebarMenu className="gap-4">
                {menu.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-14 px-8 rounded-2xl transition-all ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20 shadow-xl' : 'hover:bg-white/5 text-zinc-500 hover:text-white'}`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-primary' : 'text-zinc-600'}`} />
                        <span className="font-bold text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-8 border-t border-white/5">
             <Button 
               variant="ghost" 
               onClick={() => signOut(auth!)}
               className="w-full h-14 rounded-2xl text-red-600 hover:bg-red-600/5 gap-4 font-black text-xs uppercase tracking-widest"
             >
               <LogOut size={18} /> تسجيل الخروج
             </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-12 bg-black relative">
          {/* Dashboard Header Bar */}
          <div className="flex justify-between items-center mb-16 pb-12 border-b border-white/5">
             <div className="flex items-center gap-6">
                <Badge variant="outline" className="border-red-600/20 text-red-500 px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.3em] flex gap-3 animate-pulse">
                   <Zap size={14} /> LIVE NUCLEUS
                </Badge>
                <Badge variant="outline" className="border-primary/20 text-primary px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.3em] flex gap-3">
                   <Activity size={14} /> SYSTEM HEALTH: 100%
                </Badge>
             </div>
             <div className="flex items-center gap-4 text-zinc-500 font-bold text-xs">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </div>
          <div className="max-w-7xl mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
