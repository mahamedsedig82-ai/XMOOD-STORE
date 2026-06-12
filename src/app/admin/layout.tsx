
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
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useEffect } from "react";
import { doc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'support'];
    if (!loading && (!profile || !allowedRoles.includes(profile.role))) {
      router.push('/'); 
    }
  }, [profile, loading, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
    { label: "الدفع", icon: CreditCard, href: "/admin/payments", roles: ['owner', 'admin'] },
    { label: "الذكاء الاصطناعي", icon: Sparkles, href: "/admin/ai", roles: ['owner', 'admin'] },
    { label: "الإعدادات", icon: Settings, href: "/admin/settings", roles: ['owner', 'admin'] },
  ].filter(item => item.roles.includes(role || 'user'));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 font-body overflow-hidden" dir="rtl">
        <Sidebar className="border-l border-primary/10 bg-white" side="right">
          <SidebarHeader className="p-8 border-b border-primary/5">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div className="text-right">
                 <span className="font-headline text-xl font-bold text-slate-900 block leading-none">XMOOD PRO</span>
                 <p className="text-[9px] font-black uppercase text-primary mt-1 tracking-widest">{profile?.role}</p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-6 text-[10px] font-black uppercase text-slate-400">النظام المركزي</SidebarGroupLabel>
              <SidebarMenu className="gap-2">
                {menu.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-12 px-6 rounded-xl ${pathname === item.href ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-10 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
