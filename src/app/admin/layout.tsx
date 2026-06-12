
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Wallet, 
  Settings, 
  ArrowRight, 
  Sparkles,
  Star,
  Cpu,
  Wand2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { doc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  const { data: siteSettings } = useDoc(doc(db, "settings", "global"));

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      router.push('/'); 
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-primary">
        <Cpu className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { label: "الرئيسية الذكية", icon: LayoutDashboard, href: "/admin" },
    { label: "معالج الـ AI", icon: Sparkles, href: "/admin/ai", highlight: true },
    { label: "المصمم الملكي", icon: Wand2, href: "/admin/designs", highlight: true },
    { label: "مستودع الأصول", icon: Package, href: "/admin/products" },
    { label: "سجل الطلبات", icon: ShoppingCart, href: "/admin/orders" },
    { label: "إدارة النخبة", icon: Users, href: "/admin/users" },
    { label: "البنك المركزي", icon: Wallet, href: "/admin/finance" },
    { label: "إدارة السوق", icon: Star, href: "/admin/marketplace" },
    { label: "إعدادات الهوية", icon: Settings, href: "/admin/settings" },
  ];

  const logoData = siteSettings?.logoData;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black font-body overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-white/10 bg-zinc-950 shadow-2xl" side="right">
          <SidebarHeader className="p-8 border-b border-white/10">
            <Link href="/" className="flex items-center gap-5">
              <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 border-primary shadow-2xl bg-zinc-900 flex items-center justify-center">
                {logoData ? (
                  <img src={logoData} alt="Admin Logo" className="object-cover w-full h-full" />
                ) : (
                  <>
                    <span className="font-handwriting text-xl font-bold text-primary relative z-10">XM</span>
                  </>
                )}
              </div>
              <div className="text-right">
                 <span className="font-headline text-2xl font-bold text-primary block leading-none gold-text">ADMIN</span>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">Sovereign Core</p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-6 mb-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Master Protocols</SidebarGroupLabel>
              <SidebarMenu className="gap-3">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`justify-start gap-5 h-14 px-8 rounded-2xl transition-all ${item.highlight ? 'bg-primary/10 border border-primary/30 shadow-lg shadow-primary/5' : 'hover:bg-white/5'}`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`w-6 h-6 ${pathname === item.href ? 'text-black' : 'text-primary'}`} />
                        <span className={`text-sm tracking-wide ${pathname === item.href ? 'font-black' : 'font-bold text-zinc-400'}`}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto pt-10 px-6 border-t border-white/10">
               <Button asChild variant="ghost" className="w-full justify-start gap-5 text-zinc-600 hover:text-primary rounded-2xl h-14 transition-all">
                  <Link href="/">
                    <ArrowRight className="w-6 h-6" />
                    <span className="font-black text-[11px] uppercase tracking-[0.3em]">Exit Protocol</span>
                  </Link>
               </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-10 bg-black relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="admin-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ffb800" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#admin-grid)" />
            </svg>
          </div>
          <div className="max-w-7xl mx-auto animate-fade-in relative z-10">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
