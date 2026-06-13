"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, Users, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
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
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('xmood-theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('xmood-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  const navLinks = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "المتجر", href: "/store", icon: Store },
    { name: "معرض الأعمال", href: "/designs/gallery", icon: Palette },
    { name: "المجتمع", href: "/marketplace", icon: Users },
    { name: "الوكلاء", href: "/middleman", icon: ShieldCheck },
    { name: "خدمات رقمية", href: "/other-services", icon: Zap },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-2xl transition-all duration-500">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        
        <Link href="/" className="flex flex-col items-start">
          <span className="decorative-logo">{config?.siteInfo?.title || "XMOOD"}</span>
          <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">{config?.siteInfo?.subtitle || "Professional Services Platform"}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[12px] font-bold uppercase tracking-widest transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              {link.name}
              {pathname === link.href && <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_#d4af37]" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 hover:text-primary rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 h-12 w-12 border border-border/50">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 shadow-inner">
              <span className="text-sm font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={16} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-12 px-8 text-xs">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all shadow-lg">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-zinc-100 text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-6 rounded-[2rem] p-6 shadow-2xl border-border/50 bg-card/95 backdrop-blur-3xl" align="start">
                <DropdownMenuLabel className="p-0 mb-6 text-right">
                  <Badge variant="outline" className="w-fit text-[9px] font-black uppercase mb-3 border-primary/20 text-primary px-3 py-1 rounded-full">{profile?.role}</Badge>
                  <p className="font-bold text-xl text-foreground truncate">{profile?.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate mt-1">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mb-4" />
                <DropdownMenuItem asChild className="rounded-xl h-14 cursor-pointer hover:bg-primary/10 transition-colors">
                  <Link href="/wallet" className="flex items-center w-full gap-4 justify-end font-bold text-sm">
                    <span>المحفظة الرقمية</span>
                    <Wallet size={18} className="text-primary" />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl h-14 cursor-pointer text-primary hover:bg-primary/5">
                    <Link href="/admin" className="flex items-center w-full gap-4 justify-end font-bold text-sm">
                      <span>إدارة المنصة</span>
                      <LayoutDashboard size={18} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-4" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-14 cursor-pointer text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20">
                  <div className="flex items-center w-full gap-4 justify-end text-sm">
                    <span>تسجيل الخروج</span>
                    <LogOut size={18} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-2xl bg-primary/5 h-12 w-12 border border-primary/10">
                <Menu size={28} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:max-w-sm bg-background p-0 border-l border-border flex flex-col rounded-l-[3rem]">
              <SheetHeader className="p-10 border-b">
                <SheetTitle className="decorative-logo text-3xl">{config?.siteInfo?.title || "XMOOD"}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 p-8 space-y-4 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className={`flex items-center gap-6 p-5 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                      <link.icon size={22} /><span className="font-bold text-lg">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              {user && (
                <div className="p-8 border-t bg-zinc-50 dark:bg-zinc-900/30">
                  <Button variant="ghost" onClick={handleSignOut} className="w-full h-16 rounded-2xl text-red-500 font-bold border border-red-100 dark:border-red-900/20 hover:bg-red-50 transition-all text-base">
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