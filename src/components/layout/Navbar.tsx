"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, Users, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, X, ChevronLeft, ShoppingBag
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
    { name: "معرض الأعمال", href: "/designs/gallery", icon: Palette },
    { name: "الوكلاء المعتمدون", href: "/middleman", icon: ShieldCheck },
    { name: "خدمات أخرى", href: "/other-services", icon: Zap },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        
        <Link href="/" className="flex flex-col items-start group">
          <span className="handwritten-logo text-3xl group-hover:scale-105 transition-transform">
            {config?.siteInfo?.title || "XMOOD STORE"}
          </span>
          <span className="text-[8px] font-black tracking-[0.3em] text-muted-foreground uppercase">
            {config?.siteInfo?.subtitle || "مركز الخدمات الرقمية الموثوقة"}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-all hover:text-primary relative py-2 ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-2xl h-12 w-12 border border-border/50 bg-muted/20 hover:bg-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {user && profile && (
            <div className="hidden md:flex items-center gap-4 bg-primary/10 px-6 py-2.5 rounded-2xl border border-primary/20">
              <span className="text-sm font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={18} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-12 px-8">
              <Link href="/login">دخول الأعضاء</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-muted text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 rounded-[2rem] p-6 shadow-2xl border-border bg-card/95 backdrop-blur-3xl" align="start">
                <DropdownMenuLabel className="p-2 mb-4 text-right">
                  <Badge variant="outline" className="w-fit text-[8px] font-black uppercase mb-3 border-primary/20 text-primary px-3 py-1 rounded-full">{profile?.role}</Badge>
                  <p className="font-bold text-lg truncate">{profile?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl h-14 cursor-pointer mt-4">
                  <Link href="/wallet" className="flex items-center w-full gap-4 justify-end font-bold">
                    <span>المحفظة الرقمية</span>
                    <Wallet size={18} className="text-primary" />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl h-14 cursor-pointer text-primary hover:bg-primary/5">
                    <Link href="/admin" className="flex items-center w-full gap-4 justify-end font-bold">
                      <span>إدارة المنصة</span>
                      <LayoutDashboard size={18} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-4" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-14 cursor-pointer text-destructive font-bold hover:bg-destructive/10">
                  <div className="flex items-center w-full gap-4 justify-end">
                    <span>تسجيل الخروج</span>
                    <LogOut size={18} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-2xl bg-primary/5 h-12 w-12 border border-primary/10">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:max-w-sm bg-background p-0 border-l border-border flex flex-col rounded-l-[3rem] overflow-hidden shadow-2xl">
              <SheetHeader className="p-10 border-b bg-muted/10">
                 <SheetTitle className="handwritten-logo text-3xl">XMOOD STORE</SheetTitle>
              </SheetHeader>

              <div className="flex-1 p-8 space-y-4 overflow-y-auto custom-scrollbar">
                {user && profile && (
                  <Link href="/wallet" className="flex items-center justify-between bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-8">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground uppercase mb-1">الرصيد المتاح</span>
                        <span className="text-xl font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
                     </div>
                     <ChevronLeft size={24} className="text-primary" />
                  </Link>
                )}

                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link 
                      href={link.href} 
                      className={`flex items-center gap-6 p-5 rounded-3xl transition-all border ${pathname === link.href ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'text-foreground hover:bg-muted border-transparent'}`}
                    >
                      <link.icon size={22} />
                      <span className="font-bold text-sm uppercase tracking-widest">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}

                {isAdmin && (
                   <SheetClose asChild>
                     <Link href="/admin" className="flex items-center gap-6 p-5 rounded-3xl text-primary hover:bg-primary/10 border border-transparent font-bold">
                        <LayoutDashboard size={22} />
                        <span>لوحة التحكم الاحترافية</span>
                     </Link>
                   </SheetClose>
                )}
              </div>

              <div className="p-10 border-t bg-muted/10">
                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full h-16 rounded-3xl text-destructive font-bold border border-destructive/10 hover:bg-destructive/5 transition-all text-xs">
                     <LogOut size={20} className="ml-3" /> تسجيل الخروج النهائي
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-16 text-sm">
                    <Link href="/login">دخول الأعضاء</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}