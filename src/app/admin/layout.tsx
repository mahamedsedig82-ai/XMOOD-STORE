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
  Cpu,
  Star
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-6">
          <ShieldCheck className="w-20 h-20 text-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Accessing Sovereign Core...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: "الرئيسية الذكية", icon: LayoutDashboard, href: "/admin" },
    { label: "مساعد الـ AI", icon: Sparkles, href: "/admin/ai", highlight: true },
    { label: "مستودع الأصول", icon: Package, href: "/admin/products" },
    { label: "سجل الطلبات", icon: ShoppingCart, href: "/admin/orders" },
    { label: "إدارة النخبة", icon: Users, href: "/admin/users" },
    { label: "البنك المركزي", icon: Wallet, href: "/admin/finance" },
    { label: "إدارة السوق P2P", icon: UserCheck, href: "/admin/marketplace" },
    { label: "أسعار الصرف", icon: Coins, href: "/admin/exchange" },
    { label: "دعم السيادة", icon: LifeBuoy, href: "/admin/support" },
    { label: "سجلات الأمن", icon: Lock, href: "/admin/security" },
    { label: "إعدادات النظام", icon: Settings, href: "/admin/settings" },
    { label: "شبكة الوكلاء", icon: Activity, href: "/admin/agents" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black font-body overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-primary/10 bg-black shadow-2xl" side="right">
          <SidebarHeader className="p-12 border-b border-primary/10 bg-black">
            <Link href="/" className="flex flex-col gap-4 group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary rounded-[1.2rem] flex items-center justify-center text-black shadow-2xl shadow-primary/30 group-hover:rotate-6 transition-transform">
                  <ShieldCheck size={32} />
                </div>
                <div>
                   <span className="font-handwriting text-4xl font-bold text-primary block leading-none">XMOOD Admin</span>
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mt-1">Master Sovereignty</p>
                </div>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-8 bg-black">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-6 mb-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Administrative Core</SidebarGroupLabel>
              <SidebarMenu className="gap-3">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`justify-start gap-5 h-16 px-8 rounded-[1.5rem] transition-all duration-300 hover:bg-white/5 data-[active=true]:bg-primary data-[active=true]:text-black ${item.highlight ? 'bg-primary/5 border border-primary/10' : ''}`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-6 h-6 ${pathname === item.href ? 'text-black' : 'text-primary/60'}`} />
                        <span className={`text-lg ${pathname === item.href ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-12 px-6 border-t border-primary/10">
               <Button asChild variant="ghost" className="w-full justify-start gap-5 text-slate-500 hover:text-primary rounded-2xl h-16 hover:bg-white/5 transition-all">
                  <Link href="/">
                    <ArrowRight className="w-7 h-7" />
                    <span className="font-black text-sm uppercase tracking-[0.3em]">Exit Core</span>
                  </Link>
               </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-12 md:p-20 bg-black">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}