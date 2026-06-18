"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Briefcase, ShoppingCart, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatUSD } from "@/lib/currency";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('xmood-theme') || 'light';
    setTheme(savedTheme as any);
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
    { label: "الرئيسية", href: "/", icon: Home },
    { label: "المتجر", href: "/store", icon: Store },
    { label: "الخدمات", href: "/other-services", icon: Briefcase },
    { label: "المعرض", href: "/designs/gallery", icon: Palette },
    { label: "الوكلاء", href: "/middleman", icon: ShieldCheck },
  ];

  if (!isMounted) return null;

  const isAdmin = ['owner', 'admin', 'gm'].includes(profile?.role || '');

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex flex-col items-center">
            <span className="handwritten-logo text-3xl md:text-4xl leading-none">Xmood</span>
            <span className="text-[7px] font-black tracking-[0.4em] uppercase text-primary -mt-1 opacity-80 group-hover:opacity-100 transition-opacity">Store</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/cart" className="relative p-3 bg-muted/50 hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20">
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-11 w-11 bg-muted/50 border border-transparent hover:border-primary/10">
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex flex-col text-left items-end">
                  <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Balance</span>
                  <p className="text-[11px] font-black text-primary tracking-tighter leading-none">{formatUSD(profile?.walletBalance || 0)}</p>
               </div>
               <Link href="/wallet">
                 <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-xl rounded-xl transition-transform hover:scale-105 overflow-hidden">
                   <AvatarImage src={profile?.photoURL} className="object-cover" />
                   <AvatarFallback className="bg-primary/10 text-primary font-black"><User size={20}/></AvatarFallback>
                 </Avatar>
               </Link>
               {isAdmin && (
                 <Link href="/admin">
                   <Button variant="ghost" size="icon" className="text-primary h-11 w-11 rounded-xl bg-primary/5 border border-primary/10"><LayoutDashboard size={20} /></Button>
                 </Link>
               )}
               <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500 h-11 w-11 rounded-xl bg-red-500/5 border border-red-500/10"><LogOut size={20} /></Button>
            </div>
          ) : (
            <Button asChild className="royal-button h-11 px-8">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}