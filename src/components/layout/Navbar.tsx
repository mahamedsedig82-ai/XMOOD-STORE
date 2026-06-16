"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, ShoppingBag, User, Briefcase, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useAuth, useFirestore } from "@/firebase";
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
    { name: "سوق الخدمات", href: "/other-services", icon: Briefcase },
    { name: "التصاميم", href: "/designs/gallery", icon: Palette },
    { name: "الوكلاء", href: "/middleman", icon: ShieldCheck },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[90] w-full border-b bg-background/80 backdrop-blur-3xl transition-all duration-500 h-20 md:h-24">
      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Mobile Menu Trigger (Three Lines) - Enhanced Design */}
        <div className="lg:hidden flex items-center gap-3">
          <Sheet dir="rtl">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary rounded-xl bg-primary/10 h-11 w-11 border border-primary/20 shadow-sm active:scale-95 transition-all">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm bg-background/98 backdrop-blur-3xl p-0 flex flex-col rounded-l-[2.5rem] border-none shadow-2xl overflow-hidden">
              <SheetHeader className="p-8 border-b bg-muted/20 relative">
                 <SheetTitle className="handwritten-logo text-4xl text-right">XMOOD</SheetTitle>
                 <p className="text-[8px] text-muted-foreground uppercase tracking-[0.4em] font-black text-right mt-2">Sovereign Portal</p>
              </SheetHeader>
              
              <div className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
                {user && profile && (
                  <div className="mb-8 p-5 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20 rounded-xl">
                      <AvatarImage src={profile.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-zinc-100 font-bold text-primary">XM</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-right truncate">
                      <span className="font-black text-base gold-text truncate">{profile.displayName}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{profile.label || "عضو موثق"}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pr-4 mb-2">القائمة الرئيسية</p>
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link 
                        href={link.href} 
                        className={`flex items-center flex-row-reverse justify-between gap-4 p-4 rounded-2xl transition-all border ${pathname === link.href ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'hover:bg-muted border-transparent font-bold'}`}
                      >
                        <div className="flex items-center flex-row-reverse gap-4">
                          <link.icon size={20} className={pathname === link.href ? 'text-white' : 'text-primary'} />
                          <span className="text-xs uppercase tracking-widest">{link.name}</span>
                        </div>
                        {pathname === link.href && <Zap size={12} className="fill-white" />}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t bg-muted/20">
                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full h-14 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest gap-3 bg-red-50/50 border border-red-100/50">
                     <LogOut size={18} /> تسجيل خروج آمن
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-14 text-[10px] uppercase tracking-widest shadow-xl">
                    <Link href="/login">دخول الأعضاء</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Elegant Alignment */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex flex-col items-start leading-none text-right">
             <span className="handwritten-logo text-xl md:text-3xl font-black transition-all group-hover:scale-105">XMOOD STORE</span>
             <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Elite Digital Services</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              <span className={`absolute -bottom-2 right-0 h-0.5 bg-primary transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-xl h-10 w-10 md:h-12 md:w-12 border bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/5 px-5 py-2.5 rounded-xl border border-primary/20 shadow-sm group cursor-pointer active:scale-95 transition-all" onClick={() => router.push('/wallet')}>
              <span className="text-xs font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={16} className="text-primary group-hover:rotate-12 transition-transform" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 md:h-12 px-5 md:px-8 shadow-lg">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-all shadow-xl active:scale-95">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 dark:bg-zinc-900 text-primary font-bold text-sm md:text-xl">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 md:w-80 mt-4 rounded-[2rem] p-5 md:p-6 shadow-2xl border bg-card/98 backdrop-blur-3xl" align="start">
                <DropdownMenuLabel className="p-2 mb-4 text-right">
                  <Badge className="bg-primary text-primary-foreground border-none text-[8px] font-black uppercase mb-4 px-4 py-1 rounded-full">{profile?.role}</Badge>
                  <p className="font-black text-xl md:text-2xl truncate leading-none mb-1 gold-text">{profile?.displayName}</p>
                  <p className="text-[9px] text-muted-foreground truncate opacity-60">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <div className="space-y-2 mt-4">
                  <DropdownMenuItem asChild className="rounded-xl h-12 md:h-14 cursor-pointer hover:bg-primary/5 transition-colors">
                    <Link href="/wallet" className="flex items-center w-full gap-3 md:gap-4 justify-end font-black px-3">
                      <span className="text-[9px] uppercase tracking-widest">المحفظة</span>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg md:rounded-xl flex items-center justify-center text-primary"><Wallet size={16} /></div>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl h-12 md:h-14 cursor-pointer hover:bg-primary/5 transition-colors">
                      <Link href="/admin" className="flex items-center w-full gap-3 md:gap-4 justify-end font-black text-primary px-3">
                        <span className="text-[9px] uppercase tracking-widest">الإدارة</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg md:rounded-xl flex items-center justify-center text-primary"><LayoutDashboard size={16} /></div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-3 opacity-50" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-12 cursor-pointer text-red-500 font-black hover:bg-red-50 transition-colors px-3">
                    <div className="flex items-center w-full gap-3 md:gap-4 justify-end">
                      <span className="text-[9px] uppercase tracking-widest">خروج</span>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500"><LogOut size={16} /></div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}