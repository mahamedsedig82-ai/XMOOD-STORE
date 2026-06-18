"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Briefcase, ShoppingCart, User, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatUSD } from "@/lib/currency";
import { useCart } from "@/context/CartContext";

export const DragonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" className="opacity-20" />
    <path d="M7 10c0-1.657 2.239-3 5-3s5 1.343 5 3" />
    <path d="M12 7v14" />
    <path d="M9 14l3 3 3-3" />
    <path d="M17 10c1.105 0 2 .895 2 2s-.895 2-2 2" />
    <path d="M7 10c-1.105 0-2 .895-2 2s.895 2 2 2" />
  </svg>
);

export function Navbar() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('xmood-theme') || 'light' : 'light';
    setTheme(savedTheme as any);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('xmood-theme', next);
    }
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  const navLinks = [
    { label: config?.navLabels?.home || "الرئيسية", href: "/", icon: Home },
    { label: config?.navLabels?.store || "المتجر", href: "/store", icon: Store },
    { label: config?.navLabels?.services || "الخدمات", href: "/other-services", icon: Briefcase },
    { label: config?.navLabels?.gallery || "المعرض", href: "/designs/gallery", icon: Palette },
    { label: config?.navLabels?.agents || "الوكلاء", href: "/middleman", icon: ShieldCheck },
  ];

  if (!isMounted) return null;

  const isAdmin = ['owner', 'admin', 'gm'].includes(profile?.role || '');

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/85 backdrop-blur-2xl h-24 shadow-sm">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group transition-all hover:scale-105">
          {config?.appearance?.logoUrl ? (
            <img src={config.appearance.logoUrl} className="h-12 md:h-14 w-auto object-contain rounded-[1.5rem] border-2 border-primary/20 shadow-xl" alt="Logo" />
          ) : (
            <div className="flex items-center gap-3">
              <DragonIcon className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
              <div className="flex flex-col">
                <span className="handwritten-logo text-3xl md:text-4xl leading-none">XMOOD STORE</span>
                <span className="text-[8px] font-black tracking-[0.5em] uppercase text-primary/60 -mt-1">Sovereign Edition</span>
              </div>
            </div>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
              <span className={`absolute -bottom-2 left-0 h-[2px] bg-primary transition-all duration-500 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/cart" className="relative p-4 bg-muted/60 hover:bg-primary/15 rounded-2xl transition-all border border-transparent hover:border-primary/25 shadow-inner">
            <ShoppingCart size={20} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary text-black text-[11px] font-black rounded-full flex items-center justify-center shadow-2xl border-2 border-background animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-2xl h-12 w-12 bg-muted/60 border border-transparent hover:border-primary/20 transition-all">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-primary" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col text-left items-end">
                  <p className="text-[12px] font-black text-primary tracking-tighter leading-none">{formatUSD(profile?.walletBalance || 0)}</p>
               </div>
               <Link href="/wallet">
                 <Avatar className="h-12 w-12 border-3 border-primary/20 shadow-2xl rounded-[1.25rem] transition-transform hover:scale-110 overflow-hidden ring-4 ring-primary/5">
                   <AvatarImage src={profile?.photoURL} className="object-cover" />
                   <AvatarFallback className="bg-primary/10 text-primary font-black"><User size={20}/></AvatarFallback>
                 </Avatar>
               </Link>
               {isAdmin && (
                 <Link href="/admin">
                   <Button variant="ghost" size="icon" className="text-primary h-12 w-12 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10"><LayoutDashboard size={20} /></Button>
                 </Link>
               )}
               <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500 h-12 w-12 rounded-2xl bg-red-500/5 border border-red-500/15 hover:bg-red-50"><LogOut size={20} /></Button>
            </div>
          ) : (
            <Button asChild className="royal-button h-12 px-10 rounded-[1.25rem] shadow-primary/20">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}