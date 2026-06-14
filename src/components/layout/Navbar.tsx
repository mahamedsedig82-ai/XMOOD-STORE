"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Zap, ChevronLeft, X
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
    { name: "معرض الأعمال", href: "/designs/gallery", icon: Palette },
    { name: "الوكلاء المعتمدون", href: "/middleman", icon: ShieldCheck },
    { name: "خدمات أخرى", href: "/other-services", icon: Zap },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[90] w-full border-b bg-background/90 backdrop-blur-2xl transition-all duration-500">
      <div className="container mx-auto px-4 md:px-10 h-16 md:h-24 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 md:gap-5 group">
          {config?.appearance?.logoUrl ? (
            <img src={config.appearance.logoUrl} alt="Logo" className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex flex-col items-start leading-none">
               <span className="handwritten-logo text-xl md:text-3xl font-black transition-all">XMOOD STORE</span>
               <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Elite Digital Services</span>
            </div>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              <span className={`absolute -bottom-2 left-0 h-0.5 bg-primary transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full h-9 w-9 md:h-12 md:w-12 border border-border/50 bg-muted/20 hover:bg-primary/5 hover:text-primary transition-all"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/20 shadow-sm">
              <span className="text-xs font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={16} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-9 md:h-12 px-5 md:px-10 text-[9px] md:text-xs">
              <Link href="/login">دخول الأعضاء</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-9 w-9 md:h-12 md:w-12 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all shadow-lg">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-muted text-primary font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 rounded-[2rem] p-5 shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl" align="start">
                <DropdownMenuLabel className="p-2 mb-3 text-right">
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase mb-3 px-4 py-1 rounded-full">{profile?.role}</Badge>
                  <p className="font-black text-lg truncate leading-none">{profile?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem asChild className="rounded-2xl h-14 cursor-pointer mt-3 hover:bg-primary/5 transition-colors">
                  <Link href="/wallet" className="flex items-center w-full gap-4 justify-end font-black">
                    <span className="text-[10px] uppercase tracking-widest">المحفظة الرقمية</span>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Wallet size={18} /></div>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-2xl h-14 cursor-pointer mt-2 hover:bg-primary/5 transition-colors">
                    <Link href="/admin" className="flex items-center w-full gap-4 justify-end font-black text-primary">
                      <span className="text-[10px] uppercase tracking-widest">إدارة المنصة</span>
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><LayoutDashboard size={18} /></div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-3 opacity-50" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl h-14 cursor-pointer text-red-500 font-black hover:bg-red-50 transition-colors">
                  <div className="flex items-center w-full gap-4 justify-end">
                    <span className="text-[10px] uppercase tracking-widest">تسجيل الخروج الآمن</span>
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><LogOut size={18} /></div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-2xl bg-primary/5 h-10 w-10 border border-primary/20 shadow-sm">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm bg-background p-0 flex flex-col rounded-l-[3rem] border-none shadow-2xl overflow-hidden">
              <SheetHeader className="p-10 border-b bg-muted/5 relative">
                 <SheetClose className="absolute left-8 top-10 opacity-70 hover:opacity-100 transition-opacity">
                    <X className="h-6 w-6 text-foreground" />
                 </SheetClose>
                 <SheetTitle className="handwritten-logo text-3xl text-right">XMOOD STORE</SheetTitle>
                 <p className="text-[8px] text-muted-foreground uppercase tracking-[0.4em] font-black text-right mt-2">Premium Mobile Access</p>
              </SheetHeader>

              <div className="flex-1 p-8 space-y-4 overflow-y-auto">
                {user && profile && (
                  <Link href="/wallet" className="flex items-center justify-between bg-zinc-900 dark:bg-zinc-800 p-6 rounded-[2rem] border border-white/5 mb-8 shadow-xl group">
                     <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-zinc-500 uppercase mb-1 tracking-widest">الرصيد المتاح</span>
                        <span className="text-2xl font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
                     </div>
                     <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <ChevronLeft size={24} />
                     </div>
                  </Link>
                )}

                <div className="space-y-3">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link 
                        href={link.href} 
                        className={`flex items-center flex-row-reverse gap-5 p-5 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground hover:bg-muted font-bold'}`}
                      >
                        <link.icon size={20} className={pathname === link.href ? 'text-white' : 'text-primary'} />
                        <span className="font-black text-xs uppercase tracking-[0.1em]">{link.name}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              <div className="p-10 border-t bg-muted/5 space-y-4">
                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full h-14 rounded-2xl text-red-500 font-black text-[11px] uppercase tracking-widest gap-3">
                     <LogOut size={20} /> تسجيل الخروج
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-14 text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
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