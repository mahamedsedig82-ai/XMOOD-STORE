
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, Users, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, X, User, ChevronLeft, ShoppingBag, Loader2
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
    { name: "المتجر الرقمي", href: "/store", icon: Store },
    { name: "السوق المفتوح", href: "/marketplace", icon: ShoppingBag },
    { name: "معرض الإبداع", href: "/designs/gallery", icon: Palette },
    { name: "الخبراء المعتمدون", href: "/middleman", icon: ShieldCheck },
    { name: "حلول تقنية", href: "/other-services", icon: Zap },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/90 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
        
        <Link href="/" className="flex flex-col items-start group">
          <span className="decorative-logo group-hover:scale-105 transition-transform">{config?.siteInfo?.title || "XMOOD"}</span>
          <span className="text-[8px] font-black tracking-[0.3em] text-muted-foreground uppercase">{config?.siteInfo?.subtitle || "Professional Services"}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-all hover:text-primary relative py-2 ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_10px_#d4af37]" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-xl h-10 w-10 md:h-12 md:w-12 border border-border/50 bg-muted/20 hover:bg-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
              <span className="text-xs font-bold text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={14} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 md:h-12 px-6 md:px-8 text-[10px]">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 md:h-12 md:w-12 rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-muted text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-4 rounded-2xl p-4 shadow-2xl border-border bg-card/95 backdrop-blur-3xl" align="start">
                <DropdownMenuLabel className="p-2 mb-4 text-right">
                  <Badge variant="outline" className="w-fit text-[8px] font-bold uppercase mb-2 border-primary/20 text-primary px-2 py-0.5 rounded-full">{profile?.role}</Badge>
                  <p className="font-bold text-base text-foreground truncate">{profile?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer mt-2">
                  <Link href="/wallet" className="flex items-center w-full gap-3 justify-end font-bold text-xs">
                    <span>المحفظة الرقمية</span>
                    <Wallet size={16} className="text-primary" />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer text-primary hover:bg-primary/5">
                    <Link href="/admin" className="flex items-center w-full gap-3 justify-end font-bold text-xs">
                      <span>إدارة المنصة</span>
                      <LayoutDashboard size={16} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-2 opacity-50" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-12 cursor-pointer text-destructive font-bold hover:bg-destructive/10">
                  <div className="flex items-center w-full gap-3 justify-end text-xs">
                    <span>تسجيل الخروج</span>
                    <LogOut size={16} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-xl bg-primary/5 h-10 w-10 border border-primary/10">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:max-w-sm bg-background p-0 border-l border-border flex flex-col rounded-l-3xl overflow-hidden shadow-2xl">
              <SheetHeader className="p-8 border-b bg-muted/10">
                <div className="flex items-center justify-between">
                   <SheetTitle className="decorative-logo text-2xl">{config?.siteInfo?.title || "XMOOD"}</SheetTitle>
                   <SheetClose asChild>
                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl"><X size={20} /></Button>
                   </SheetClose>
                </div>
              </SheetHeader>

              {user && profile && (
                <div className="p-6 bg-primary/5 border-b border-border">
                   <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12 rounded-xl border border-primary/20">
                        <AvatarImage src={profile.photoURL} />
                        <AvatarFallback className="bg-zinc-100 text-primary font-bold">XM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate">{profile.displayName}</p>
                        <Badge variant="outline" className="text-[8px] uppercase font-bold border-primary/20 text-primary px-2 py-0.5 rounded-full">{profile.role}</Badge>
                      </div>
                   </div>
                   <Link href="/wallet" className="flex items-center justify-between bg-card p-4 rounded-xl border border-border hover:border-primary/30 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground uppercase mb-1">الرصيد المتاح</span>
                        <span className="text-sm font-bold text-primary">{formatUSD(profile.walletBalance || 0)}</span>
                      </div>
                      <ChevronLeft size={16} className="text-muted-foreground" />
                   </Link>
                </div>
              )}

              <div className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link 
                      href={link.href} 
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${pathname === link.href ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'text-foreground hover:bg-muted border-transparent'}`}
                    >
                      <link.icon size={18} />
                      <span className="font-bold text-sm uppercase tracking-wider">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}

                {isAdmin && (
                   <SheetClose asChild>
                     <Link href="/admin" className="flex items-center gap-4 p-4 rounded-xl text-primary hover:bg-primary/10 border border-transparent font-bold text-sm">
                        <LayoutDashboard size={18} />
                        <span>لوحة إدارة المنصة</span>
                     </Link>
                   </SheetClose>
                )}
              </div>

              <div className="p-6 border-t bg-muted/10 space-y-3">
                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full h-12 rounded-xl text-destructive font-bold border border-destructive/10 hover:bg-destructive/5 transition-all text-xs">
                     <LogOut size={16} className="ml-2" /> تسجيل الخروج
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-12 text-xs">
                    <Link href="/login">دخول الأعضاء المعتمدين</Link>
                  </Button>
                )}
                <p className="text-[8px] text-center text-muted-foreground uppercase font-black tracking-widest mt-4">
                  Professional Services Hub
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
