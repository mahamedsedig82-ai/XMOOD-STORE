
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Wallet, 
  Settings, Palette, ShieldCheck, Activity, LogOut, ArrowLeft, Zap
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const allowedRoles = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant', 'support', 'middleman', 'agent'];
    if (!loading) {
      if (!user) router.push('/login');
      else if (profile && !allowedRoles.includes(profile.role)) router.push('/'); 
    }
  }, [profile, loading, user, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
    </div>
  );

  const mainSections = [
    { label: "لوحة التحكم", icon: LayoutDashboard, href: "/admin", roles: ['owner', 'admin', 'gm'] },
    { label: "المستودع", icon: Package, href: "/admin/products", roles: ['owner', 'admin', 'store_manager'] },
    { label: "إدارة الوكلاء", icon: ShieldCheck, href: "/admin/middleman", roles: ['owner', 'admin', 'gm'] },
    { label: "إدارة التصاميم", icon: Palette, href: "/admin/designs", roles: ['owner', 'admin', 'design_manager', 'designer'] },
  ];

  const businessSections = [
    { label: "الخزانة المالية", icon: Wallet, href: "/admin/finance", roles: ['owner', 'admin', 'accountant'] },
    { label: "الخدمات الإضافية", icon: Zap, href: "/admin/other-services", roles: ['owner', 'admin', 'agent'] },
    { label: "إدارة المستخدمين", icon: Users, href: "/admin/users", roles: ['owner', 'admin'] },
  ];

  const renderMenuItems = (items: any[]) => 
    items.filter(item => (profile?.role === 'owner' || (profile?.role && item.roles.includes(profile.role)))).map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === item.href}
          className={`h-12 px-4 rounded-xl ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted'}`}
        >
          <Link href={item.href} className="flex flex-row-reverse items-center gap-3">
            <item.icon size={18} />
            <span className="font-bold text-xs">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background" dir="rtl">
        <Sidebar className="border-l bg-card" side="right">
          <SidebarHeader className="p-8 border-b text-center">
            <span className="decorative-logo block mb-1">XMOOD PRO</span>
            <Badge variant="outline" className="text-[8px] uppercase tracking-widest">{profile?.role}</Badge>
          </SidebarHeader>
          <ScrollArea className="flex-1 p-4">
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">العمليات</SidebarGroupLabel>
              <SidebarMenu className="gap-1">{renderMenuItems(mainSections)}</SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="text-right px-4 mb-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">إدارة الفريق</SidebarGroupLabel>
              <SidebarMenu className="gap-1">{renderMenuItems(businessSections)}</SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
          <div className="p-4 border-t bg-muted/20 space-y-2">
            <Button asChild variant="outline" className="w-full h-10 rounded-xl text-xs gap-2">
              <Link href="/"><ArrowLeft size={14} /> العودة للموقع</Link>
            </Button>
            <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-10 rounded-xl text-red-600 font-bold text-xs gap-2">
              <LogOut size={14} /> خروج
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 animate-fade-up">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
