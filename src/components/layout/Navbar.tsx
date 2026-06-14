"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, ChevronLeft, ShoppingBag
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
    { name: "الخدمات الإلكترونية", href: "/store", icon: Store },
    { name: "السوق المفتوح", href: "/marketplace", icon: ShoppingBag },
    { name: "معرض الأعمال", href: "/designs/gallery", icon: Palette },
    { name: "الوكلاء المعتمدون", href: "/middleman", icon: ShieldCheck },
    { name: "خدمات أخرى", href: "/other-services", icon: Zap },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[90] w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3">
          {config?.appearance?.logoUrl ? (
            <img src={config.appearance.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <div className="flex flex-col items-start leading-none">
               <span className="handwritten-logo text-2xl font-black">XMOOD STORE</span>
               <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground">Premium Marketplace</span>
            </div>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-xl h-10 w-10 border border-border bg-muted/20"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden md:flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
              <span className="text-xs font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={16} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 px-6">
              <Link href="/login">دخول الأعضاء</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 rounded-xl overflow-hidden border border-primary/20">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-muted text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-4 rounded-2xl p-4 shadow-xl border-border bg-card" align="start">
                <DropdownMenuLabel className="p-2 mb-2 text-right">
                  <Badge variant="outline" className="text-[7px] font-black uppercase mb-2 border-primary/20 text-primary px-3 py-0.5 rounded-full">{profile?.role}</Badge>
                  <p className="font-bold text-base truncate">{profile?.displayName}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer mt-2">
                  <Link href="/wallet" className="flex items-center w-full gap-3 justify-end font-bold">
                    <span className="text-[10px] uppercase">المحفظة الرقمية</span>
                    <Wallet size={16} className="text-primary" />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer text-primary hover:bg-primary/5">
                    <Link href="/admin" className="flex items-center w-full gap-3 justify-end font-bold">
                      <span className="text-[10px] uppercase">إدارة المنصة</span>
                      <LayoutDashboard size={16} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-12 cursor-pointer text-destructive font-bold hover:bg-destructive/5">
                  <div className="flex items-center w-full gap-3 justify-end">
                    <span className="text-[10px] uppercase">تسجيل الخروج</span>
                    <LogOut size={16} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-xl bg-primary/5 h-10 w-10 border border-primary/10">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] max-w-xs bg-background p-0 flex flex-col rounded-l-3xl overflow-hidden shadow-2xl">
              <SheetHeader className="p-8 border-b bg-muted/5">
                 <SheetTitle className="handwritten-logo text-2xl">XMOOD STORE</SheetTitle>
              </SheetHeader>

              <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                {user && profile && (
                  <Link href="/wallet" className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-muted-foreground uppercase mb-0.5">الرصيد</span>
                        <span className="text-lg font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
                     </div>
                     <ChevronLeft size={20} className="text-primary" />
                  </Link>
                )}

                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link 
                      href={link.href} 
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary text-white shadow-lg' : 'text-foreground hover:bg-muted'}`}
                    >
                      <link.icon size={18} />
                      <span className="font-bold text-xs uppercase tracking-widest">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="p-8 border-t bg-muted/5">
                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full h-12 rounded-2xl text-destructive font-bold text-[10px] uppercase">
                     <LogOut size={18} className="ml-2" /> تسجيل الخروج
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-12 text-[10px] uppercase">
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
