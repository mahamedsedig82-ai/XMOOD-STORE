"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, Users, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, X, Zap, UserCircle
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
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/90 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex flex-col items-start group">
          <span className="decorative-logo">{config?.siteInfo?.title || "XMOOD"}</span>
          <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase">{config?.siteInfo?.subtitle || "Premium Digital Hub"}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-bold uppercase tracking-wide transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              {link.name}
              {pathname === link.href && <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 hover:text-primary rounded-full bg-zinc-100 dark:bg-zinc-800 h-10 w-10">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
              <span className="text-xs font-bold text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={14} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 px-6 text-[11px]">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 rounded-full overflow-hidden border border-primary/20 hover:border-primary transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-zinc-100 text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-4 rounded-xl p-4 shadow-xl border-zinc-100 dark:border-zinc-800 bg-card" align="start">
                <DropdownMenuLabel className="p-2 text-right">
                  <Badge variant="outline" className="w-fit text-[8px] font-bold uppercase mb-2">{profile?.role}</Badge>
                  <p className="font-bold text-base text-foreground truncate">{profile?.displayName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg h-11 cursor-pointer">
                  <Link href="/wallet" className="flex items-center w-full gap-3 justify-end font-bold text-xs">
                    <span>المحفظة الرقمية</span>
                    <Wallet size={16} />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-lg h-11 cursor-pointer text-primary">
                    <Link href="/admin" className="flex items-center w-full gap-3 justify-end font-bold text-xs">
                      <span>إدارة النظام</span>
                      <LayoutDashboard size={16} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-lg h-11 cursor-pointer text-red-500 font-bold">
                  <div className="flex items-center w-full gap-3 justify-end text-xs">
                    <span>تسجيل الخروج</span>
                    <LogOut size={16} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-lg bg-primary/5 h-10 w-10 border border-primary/10">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:max-w-xs bg-background p-0 border-l border-zinc-100 dark:border-zinc-800 flex flex-col">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="decorative-logo text-2xl">{config?.siteInfo?.title || "XMOOD"}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${pathname === link.href ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                      <link.icon size={18} /><span className="font-bold text-sm">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              {user && (
                <div className="p-6 border-t bg-zinc-50 dark:bg-zinc-900/50">
                  <Button variant="ghost" onClick={handleSignOut} className="w-full h-12 rounded-xl text-red-500 font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-50 transition-all text-sm">
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
