
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Monitor, Smartphone, 
  Home, Store, Palette, Users, ShieldCheck, 
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
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [layout, setLayout] = useState<'desktop' | 'mobile'>('desktop');
  const [isMounted, setIsMounted] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('xmood-theme') as 'light' | 'dark' || 'dark';
    const savedLayout = localStorage.getItem('xmood-layout') as 'desktop' | 'mobile' || 'desktop';
    setTheme(savedTheme);
    setLayout(savedLayout);
    
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    if (window.innerWidth > 1024) {
      document.body.className = savedLayout === 'mobile' ? 'mobile-view-container' : 'desktop-view-container';
    }
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

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
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

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className={`container mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between ${layout === 'mobile' ? 'max-w-[450px]' : ''}`}>
        
        <Link href="/" className="flex flex-col items-start md:items-end group">
          <span className="decorative-logo">{config?.siteInfo?.title || "XMOOD"}</span>
          <span className="text-[7px] md:text-[8px] font-black tracking-widest text-primary uppercase">{config?.siteInfo?.subtitle || "Elite Enterprise"}</span>
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
              {pathname === link.href && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Controls */}
          <div className="hidden xl:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLayout} className="text-muted-foreground hover:text-primary rounded-xl bg-muted/50 h-10 w-10">
              {layout === 'desktop' ? <Smartphone size={18} /> : <Monitor size={18} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary rounded-xl bg-muted/50 h-10 w-10">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="xl:hidden text-muted-foreground hover:text-primary rounded-xl bg-muted/50 h-10 w-10">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
              <span className="text-sm font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={14} className="text-red-600 fill-current animate-pulse" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 md:h-12 px-6 md:px-10 text-[10px] md:text-[11px]">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 md:h-12 md:w-12 rounded-xl overflow-hidden border-2 border-primary/30 hover:border-primary transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-muted text-primary font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-4 rounded-2xl p-4 shadow-2xl border-primary/10 bg-card" align="start">
                <DropdownMenuLabel className="p-2 text-right">
                  <Badge variant="outline" className="w-fit text-[7px] font-black uppercase tracking-widest mb-1 border-primary/20 text-primary">{profile?.role}</Badge>
                  <p className="font-black text-lg gold-text truncate">{profile?.displayName}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5 my-2" />
                <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer focus:bg-primary/5 focus:text-primary">
                  <Link href="/wallet" className="flex items-center w-full gap-3 justify-end font-bold text-xs">
                    <span>محفظتي السيادية</span>
                    <Wallet size={16} />
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer text-primary focus:bg-primary/10">
                    <Link href="/admin" className="flex items-center w-full gap-3 justify-end font-bold text-xs">
                      <span>إدارة النظام</span>
                      <LayoutDashboard size={16} />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-primary/5 my-2" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl h-11 cursor-pointer text-red-600 focus:bg-red-500/10 font-bold">
                  <div className="flex items-center w-full gap-3 justify-end text-xs">
                    <span>خروج آمن</span>
                    <LogOut size={16} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary rounded-xl bg-primary/10 h-10 w-10 border border-primary/20">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:max-w-xs bg-background p-0 border-l border-primary/10 flex flex-col">
              <SheetHeader className="p-6 border-b bg-muted/20 flex flex-row items-center justify-between">
                <SheetTitle className="decorative-logo text-3xl">{config?.siteInfo?.title || "XMOOD"}</SheetTitle>
                <SheetClose className="text-muted-foreground"><X size={24}/></SheetClose>
              </SheetHeader>
              <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}>
                      <link.icon size={20} /><span className="font-bold text-sm">{link.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              {user && (
                <div className="p-6 border-t bg-muted/30">
                  <Button variant="ghost" onClick={handleSignOut} className="w-full h-12 rounded-xl text-red-600 font-black border border-red-500/20 hover:bg-red-500/10 transition-all text-sm">
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
