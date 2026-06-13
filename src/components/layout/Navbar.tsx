
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
import { Badge } from "@/components/ui/badge";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const pathname = usePathname();
  
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
    window.location.reload(); 
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
      <div className={`container mx-auto px-6 h-24 flex items-center justify-between ${layout === 'mobile' ? 'max-w-[450px]' : ''}`}>
        
        <Link href="/" className="flex flex-col items-end group">
          <span className="decorative-logo text-4xl">XMOOD</span>
          <span className="text-[8px] font-black tracking-widest text-primary uppercase">Elite Enterprise</span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              {pathname === link.href && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleLayout} className="hidden md:flex text-muted-foreground hover:text-primary rounded-2xl bg-muted/50 h-12 w-12 transition-all">
            {layout === 'desktop' ? <Smartphone size={20} /> : <Monitor size={20} />}
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary rounded-2xl bg-muted/50 h-12 w-12 transition-all">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-2xl border border-primary/20 shadow-inner">
              <span className="text-base font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={16} className="text-red-600 fill-current animate-pulse" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-12 px-10 text-[11px]">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary/30 relative hover:border-primary transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-muted text-primary font-black text-lg">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 rounded-3xl p-3 shadow-2xl border-primary/10" align="start">
                <DropdownMenuLabel className="p-6 text-right">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-widest mb-2 border-primary/20 text-primary">{profile?.role}</Badge>
                    <p className="font-black text-xl gold-text">{profile?.displayName || "عضو سيادي"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem asChild className="rounded-2xl h-14 cursor-pointer focus:bg-primary/5 focus:text-primary transition-all">
                  <Link href="/wallet" className="flex items-center w-full gap-4 justify-end font-bold">
                    <span>محفظتي السيادية</span>
                    <Wallet size={20} />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-2xl h-14 cursor-pointer text-primary focus:bg-primary/10 transition-all">
                    <Link href="/admin" className="flex items-center w-full gap-4 justify-end font-bold">
                      <span>وحدة القيادة العليا</span>
                      <LayoutDashboard size={20} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem onClick={() => signOut(auth!)} className="rounded-2xl h-14 cursor-pointer text-red-600 focus:bg-red-500/10 font-bold transition-all">
                  <div className="flex items-center w-full gap-4 justify-end">
                    <span>خروج آمن</span>
                    <LogOut size={20} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-2xl bg-primary/10 h-12 w-12 border border-primary/20">
                <Menu size={28} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs bg-background p-0 border-l border-primary/10 flex flex-col">
              <SheetHeader className="p-10 border-b bg-muted/30 flex flex-row items-center justify-between">
                <SheetTitle className="decorative-logo text-5xl">XMOOD</SheetTitle>
                <SheetClose className="text-muted-foreground hover:text-primary"><X size={32}/></SheetClose>
              </SheetHeader>
              <div className="flex-1 p-8 space-y-4 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className={`flex items-center gap-6 p-6 rounded-3xl transition-all duration-300 ${pathname === link.href ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-primary/10'}`}>
                      <link.icon size={24} /><span className="font-black text-lg">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              {user && (
                <div className="p-10 border-t bg-muted/50">
                  <Button variant="ghost" onClick={() => signOut(auth!)} className="w-full h-16 rounded-[2rem] text-red-600 font-black border-2 border-red-500/20 hover:bg-red-500/10 transition-all text-lg">
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
