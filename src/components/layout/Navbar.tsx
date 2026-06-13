
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, Moon, Sun, Monitor, Smartphone, 
  Home, Store, Palette, Users, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, ChevronDown, X, Zap, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function Navbar() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  
  // Theme & Layout States
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [layout, setLayout] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const savedTheme = localStorage.getItem('xmood-theme') as 'light' | 'dark' || 'dark';
    const savedLayout = localStorage.getItem('xmood-layout') as 'desktop' | 'mobile' || 'desktop';
    setTheme(savedTheme);
    setLayout(savedLayout);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.body.className = savedLayout === 'mobile' ? 'mobile-view-container' : 'desktop-view-container';
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('xmood-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const toggleLayout = () => {
    const next = layout === 'desktop' ? 'mobile' : 'desktop';
    setLayout(next);
    localStorage.setItem('xmood-layout', next);
    document.body.className = next === 'mobile' ? 'mobile-view-container' : 'desktop-view-container';
    window.location.reload(); // Refresh to ensure layout constraints apply correctly
  };

  const navLinks = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "المتجر", href: "/store", icon: Store },
    { name: "المعرض", href: "/designs/gallery", icon: Palette },
    { name: "المجتمع", href: "/marketplace", icon: Users },
    { name: "الوكلاء", href: "/middleman", icon: ShieldCheck },
    { name: "خدمات أخرى", href: "/other-services", icon: Zap },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className={`container mx-auto px-6 h-20 flex items-center justify-between ${layout === 'mobile' ? 'max-w-[450px]' : ''}`}>
        
        {/* Right Side: Logo */}
        <Link href="/" className="flex flex-col items-end group">
          <span className="decorative-logo">XMOOD</span>
          <span className="text-[7px] font-black tracking-widest text-primary uppercase">Enterprise System</span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[9px] font-black uppercase tracking-widest transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Left Side: Controls & User */}
        <div className="flex items-center gap-3">
          
          {/* Layout Simulation Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleLayout} className="hidden md:flex text-muted-foreground hover:text-primary rounded-xl">
            {layout === 'desktop' ? <Smartphone size={18} /> : <Monitor size={18} />}
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary rounded-xl">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-2 bg-muted px-4 py-1.5 rounded-xl border">
              <span className="text-sm font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={14} className="text-red-500 fill-current" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 px-6">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 rounded-xl overflow-hidden border border-primary/30 relative">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-muted text-primary font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2" align="start">
                <DropdownMenuLabel className="p-4 text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">{profile?.role}</p>
                  <p className="font-bold text-lg">{profile?.displayName || "عضو سيادي"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/wallet" className="flex items-center w-full gap-3 justify-end">
                    <span>المحفظة</span>
                    <Wallet size={16} />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-primary">
                    <Link href="/admin" className="flex items-center w-full gap-3 justify-end">
                      <span>لوحة الإدارة</span>
                      <LayoutDashboard size={16} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut(auth!)} className="rounded-xl cursor-pointer text-red-600">
                  <div className="flex items-center w-full gap-3 justify-end">
                    <span>خروج</span>
                    <LogOut size={16} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-xl bg-muted">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs bg-background p-0 border-l border-border flex flex-col">
              <SheetHeader className="p-8 border-b bg-muted/50 flex flex-row items-center justify-between">
                <SheetTitle className="decorative-logo">XMOOD</SheetTitle>
                <SheetClose className="text-muted-foreground"><X size={24}/></SheetClose>
              </SheetHeader>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted'}`}>
                      <link.icon size={20} /><span className="font-bold text-sm">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              {user && (
                <div className="p-8 border-t bg-muted/30">
                  <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-14 rounded-2xl text-red-600 font-bold border border-red-200">
                    تسجيل الخروج
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
