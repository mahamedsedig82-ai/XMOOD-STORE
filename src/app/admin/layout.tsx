"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ShieldCheck, 
  Wallet, 
  Settings, 
  ArrowRight, 
  Coins, 
  LifeBuoy, 
  Activity, 
  UserCheck, 
  Lock,
  Sparkles,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      router.push('/'); 
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <ShieldCheck className="w-16 h-16 text-primary animate-pulse" />
          <p className="text-xs font-black uppercase tracking-widest animate-pulse">Master Access Validating...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: "نظرة عامة", icon: LayoutDashboard, href: "/admin" },
    { label: "مساعد الذكاء الاصطناعي", icon: Sparkles, href: "/admin/ai", highlight: true },
    { label: "إدارة المنتجات", icon: Package, href: "/admin/products" },
    { label: "طلبات الشحن", icon: ShoppingCart, href: "/admin/orders" },
    { label: "الأعضاء والرتب", icon: Users, href: "/admin/users" },
    { label: "المركز المالي", icon: Wallet, href: "/admin/finance" },
    { label: "إدارة السوق P2P", icon: UserCheck, href: "/admin/marketplace" },
    { label: "أسعار الصرف", icon: Coins, href: "/admin/exchange" },
    { label: "الدعم الفني", icon: LifeBuoy, href: "/admin/support" },
    { label: "الأمن والسجلات", icon: Lock, href: "/admin/security" },
    { label: "إعدادات المتجر", icon: Settings, href: "/admin/settings" },
    { label: "شبكة الوكلاء", icon: Activity, href: "/admin/agents" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 font-body" dir="rtl">
        <Sidebar className="border-l bg-white shadow-2xl" side="right">
          <SidebarHeader className="p-10 border-b bg-slate-950 text-white">
            <Link href="/" className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                  <ShieldCheck size={28} />
                </div>
                <div>
                   <span className="font-handwriting text-3xl font-bold text-primary block">XMOOD Admin</span>
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Master Console</p>
                </div>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-6 bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Management Protocol</SidebarGroupLabel>
              <SidebarMenu className="gap-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`justify-start gap-4 h-14 px-6 rounded-[1.2rem] hover:bg-slate-50 transition-all data-[active=true]:bg-primary/10 data-[active=true]:text-primary ${item.highlight ? 'bg-primary/5 border border-primary/10' : ''}`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-5 h-5 ${pathname === item.href || item.highlight ? 'text-primary' : 'text-slate-400'}`} />
                        <span className={`text-sm ${pathname === item.href ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-10 px-4 border-t">
               <Button asChild variant="ghost" className="w-full justify-start gap-4 text-slate-400 hover:text-primary rounded-2xl h-14 hover:bg-slate-50">
                  <Link href="/">
                    <ArrowRight className="w-6 h-6" />
                    <span className="font-black text-sm uppercase tracking-widest">Exit Portal</span>
                  </Link>
               </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-10 md:p-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
