"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, ChevronLeft, X, ShoppingBag, User
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
    { name: "المتجر", href: "/store", icon: ShoppingBag },
    { name: "التصاميم", href: "/designs/gallery", icon: Palette },
    { name: "الوكلاء", href: "/middleman", icon: ShieldCheck },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[90] w-full border-b bg-background/80 backdrop-blur-3xl transition-all duration-500 h-20 md:h-24">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-4 group">
          <div className="flex flex-col items-start leading-none">
             <span className="handwritten-logo text-2xl md:text-4xl font-black transition-all group-hover:scale-105">XMOOD STORE</span>
             <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Elite Digital Services</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              <span className={`absolute -bottom-2 right-0 h-0.5 bg-primary transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-2xl h-11 w-11 border bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/5 px-5 py-2.5 rounded-2xl border border-primary/20 shadow-sm group cursor-pointer" onClick={() => router.push('/wallet')}>
              <span className="text-sm font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={18} className="text-primary group-hover:rotate-12 transition-transform" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-11 px-8">
              <Link href="/login">دخول الأعضاء</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all shadow-xl">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 dark:bg-zinc-900 text-primary font-bold text-xl">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 mt-6 rounded-[2.5rem] p-6 shadow-2xl border bg-card/98 backdrop-blur-3xl" align="start">
                <DropdownMenuLabel className="p-2 mb-4 text-right">
                  <Badge className="bg-primary text-primary-foreground border-none text-[8px] font-black uppercase mb-4 px-5 py-1.5 rounded-full">{profile?.role}</Badge>
                  <p className="font-black text-xl truncate leading-none mb-1">{profile?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate opacity-60">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <div className="space-y-2 mt-4">
                  <DropdownMenuItem asChild className="rounded-2xl h-14 cursor-pointer hover:bg-primary/5 transition-colors">
                    <Link href="/wallet" className="flex items-center w-full gap-4 justify-end font-black px-4">
                      <span className="text-[10px] uppercase tracking-widest">المحفظة الرقمية</span>
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Wallet size={18} /></div>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-2xl h-14 cursor-pointer hover:bg-primary/5 transition-colors">
                      <Link href="/admin" className="flex items-center w-full gap-4 justify-end font-black text-primary px-4">
                        <span className="text-[10px] uppercase tracking-widest">إدارة المنصة</span>
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><LayoutDashboard size={18} /></div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-4 opacity-50" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl h-14 cursor-pointer text-red-500 font-black hover:bg-red-50 transition-colors px-4">
                    <div className="flex items-center w-full gap-4 justify-end">
                      <span className="text-[10px] uppercase tracking-widest">خروج آمن</span>
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><LogOut size={18} /></div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-2xl bg-primary/5 h-11 w-11 border border-primary/20">
                <Menu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm bg-background p-0 flex flex-col rounded-l-[3rem] border-none shadow-2xl">
              <SheetHeader className="p-10 border-b bg-slate-50 dark:bg-white/5">
                 <SheetTitle className="handwritten-logo text-4xl text-right">XMOOD</SheetTitle>
                 <p className="text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-black text-right mt-2">Elite Access</p>
              </SheetHeader>
              <div className="flex-1 p-8 space-y-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link 
                      href={link.href} 
                      className={`flex items-center flex-row-reverse gap-5 p-6 rounded-3xl transition-all ${pathname === link.href ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-muted font-black'}`}
                    >
                      <link.icon size={20} className={pathname === link.href ? 'text-white' : 'text-primary'} />
                      <span className="text-xs uppercase tracking-widest">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <div className="p-10 border-t">
                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full h-16 rounded-3xl text-red-500 font-black text-[11px] uppercase tracking-widest gap-4 bg-red-50">
                     <LogOut size={20} /> تسجيل الخروج
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-16 text-xs uppercase tracking-widest">
                    <Link href="/login">دخول الأعضاء الموثق</Link>
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
