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
            <img src={config.appearance.logoUrl} className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-primary/20 shadow-md" alt="Logo" />
          ) : (
            <div className="flex flex-col">
              <span className="handwritten-logo text-2xl md:text-3xl leading-none tracking-widest" style={{ direction: 'ltr' }}>XMOOD <span>STORE</span></span>
              <span className="text-[7px] font-black tracking-[0.5em] uppercase text-primary/40 mt-1">Sovereign Cloud</span>
            </div>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-[0.25em] hover:text-primary transition-all relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
              <span className={`absolute -bottom-2.5 left-0 h-[2px] bg-primary transition-all duration-500 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-1/2'}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/cart" className="relative p-3.5 bg-muted/50 hover:bg-primary/10 rounded-2xl transition-all border border-primary/5 hover:border-primary/20 shadow-inner">
            <ShoppingCart size={20} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-xl border-2 border-background animate-fade-in">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-2xl h-11 w-11 bg-muted/50 border border-primary/5 hover:border-primary/20 transition-all shadow-inner">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-primary" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-4">
               <Link href="/wallet">
                 <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-xl rounded-full transition-transform hover:scale-110 overflow-hidden">
                   <AvatarImage src={profile?.photoURL} className="object-cover" />
                   <AvatarFallback className="bg-primary/5 text-primary font-bold"><User size={18}/></AvatarFallback>
                 </Avatar>
               </Link>
               {isAdmin && (
                 <Link href="/admin" className="hidden sm:block">
                   <Button variant="ghost" size="icon" className="text-primary h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 shadow-lg"><LayoutDashboard size={20} /></Button>
                 </Link>
               )}
               <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500 h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"><LogOut size={20} /></Button>
            </div>
          ) : (
            <Button asChild className="royal-button h-11 px-8 rounded-xl shadow-xl text-[10px]">
              <Link href="/login">دخول</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
