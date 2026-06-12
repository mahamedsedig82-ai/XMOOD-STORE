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
  Sparkles,
  Lock,
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
        <ShieldCheck className="w-16 h-16 text-primary animate-pulse" />
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
    { label: "إدارة السوق", icon: Star, href: "/admin/marketplace" },
    { label: "إعدادات النظام", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black font-body overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-white/5 bg-zinc-950 shadow-2xl" side="right">
          <SidebarHeader className="p-8 border-b border-white/5">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                 <span className="font-handwriting text-2xl font-bold text-primary block leading-none">Admin Core</span>
                 <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-1">XMOOD Sovereign</p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-6 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Control Panel</SidebarGroupLabel>
              <SidebarMenu className="gap-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`justify-start gap-4 h-12 px-6 rounded-2xl transition-all ${item.highlight ? 'bg-primary/5 border border-primary/20' : ''}`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-black' : 'text-primary'}`} />
                        <span className={`text-sm ${pathname === item.href ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-8 px-4 border-t border-white/5">
               <Button asChild variant="ghost" className="w-full justify-start gap-4 text-zinc-500 hover:text-primary rounded-xl h-12 transition-all">
                  <Link href="/">
                    <ArrowRight className="w-5 h-5" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Exit Core</span>
                  </Link>
               </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-10 bg-black">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
