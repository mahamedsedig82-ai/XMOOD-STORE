"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Briefcase, ChevronRight, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatUSD } from "@/lib/currency";
import { doc } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
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
  const { itemCount } = useCart();
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

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

  const labels = config?.navLabels || {
    home: "الرئيسية",
    store: "المتجر",
    services: "سوق الخدمات",
    gallery: "معرض الإبداع",
    agents: "الوكلاء"
  };

  const navLinks = [
    { label: labels.home, href: "/", icon: Home },
    { label: labels.store, href: "/store", icon: Store },
    { label: labels.services, href: "/other-services", icon: Briefcase },
    { label: labels.gallery, href: "/designs/gallery", icon: Palette },
    { label: labels.agents, href: "/middleman", icon: ShieldCheck },
  ];

  const isAdmin = ['owner', 'admin', 'gm', 'store_manager'].includes(profile?.role || '');

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[90] w-full border-b bg-background/80 backdrop-blur-3xl transition-all duration-500 h-20 md:h-24">
      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        <div className="lg:hidden flex items-center gap-3">
          <Sheet dir="rtl">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary rounded-xl bg-primary/10 h-11 w-11 border border-primary/20 shadow-sm transition-all">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-sm bg-background/98 backdrop-blur-3xl p-0 flex flex-col rounded-l-[2.5rem] border-none shadow-2xl overflow-hidden">
              <SheetHeader className="p-8 border-b bg-muted/20">
                 <SheetTitle className="handwritten-logo text-4xl text-right">
                    {config?.appearance?.logoUrl ? (
                        <div className="w-24 h-12 rounded-xl overflow-hidden border border-primary/10 ml-auto bg-white">
                           <img src={config.appearance.logoUrl} alt="XMOOD" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        config?.siteInfo?.title || "XMOOD"
                    )}
                 </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link 
                        href={link.href} 
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border group ${pathname === link.href ? 'bg-primary text-black border-primary shadow-xl' : 'bg-card hover:bg-muted border-border/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pathname === link.href ? 'bg-black/10' : 'bg-primary/10 text-primary'}`}>
                             <link.icon size={20} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider">{link.label}</span>
                        </div>
                        <ChevronRight size={14} className={pathname === link.href ? 'opacity-100' : 'opacity-20'} />
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-3 group">
          {config?.appearance?.logoUrl ? (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.5rem] overflow-hidden border-2 border-primary/20 shadow-xl bg-white">
                 <img src={config.appearance.logoUrl} alt="XMOOD Logo" className="w-full h-full object-cover" />
              </div>
          ) : (
              <span className="handwritten-logo text-xl md:text-3xl font-black">{config?.siteInfo?.title || "XMOOD STORE"}</span>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
              <span className={`absolute -bottom-2 right-0 h-0.5 bg-primary transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/cart" className="relative group p-2.5 bg-muted/20 border rounded-xl hover:bg-primary/10 transition-all">
             <ShoppingCart size={18} className="text-foreground group-hover:text-primary transition-colors" />
             {itemCount > 0 && (
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                  {itemCount}
               </span>
             )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-10 w-10 md:h-12 md:w-12 border bg-muted/20">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/5 px-5 py-2.5 rounded-xl border border-primary/20 group cursor-pointer" onClick={() => router.push('/wallet')}>
              <span className="text-xs font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={16} className="text-primary" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 md:h-12 px-5 md:px-8 shadow-lg">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-[1.2rem] overflow-hidden border-2 border-primary/20">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 font-bold text-primary">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 rounded-[2rem] p-5 shadow-2xl border bg-card/98 backdrop-blur-3xl" align="start">
                <DropdownMenuLabel className="p-2 mb-4 text-right">
                  <p className="font-black text-xl gold-text truncate leading-none mb-1">{profile?.displayName}</p>
                  <p className="text-[9px] text-muted-foreground truncate opacity-60">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <div className="space-y-2 mt-4">
                  <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer hover:bg-primary/5 transition-colors">
                    <Link href="/wallet" className="flex items-center w-full gap-3 justify-end font-black px-3">
                      <span className="text-[9px] uppercase tracking-widest">المحفظة</span>
                      <Wallet size={16} className="text-primary" />
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer hover:bg-primary/5 transition-colors">
                      <Link href="/admin" className="flex items-center w-full gap-3 justify-end font-black text-primary px-3">
                        <span className="text-[9px] uppercase tracking-widest">الإدارة</span>
                        <LayoutDashboard size={16} />
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-3 opacity-50" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-12 cursor-pointer text-red-500 font-black hover:bg-red-50 transition-colors px-3">
                    <div className="flex items-center w-full gap-3 justify-end">
                      <span className="text-[9px] uppercase tracking-widest">خروج</span>
                      <LogOut size={16} />
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
