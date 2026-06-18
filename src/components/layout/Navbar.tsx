"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Briefcase, ShoppingCart
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
  const BRAND_LOGO = "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png";

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={BRAND_LOGO} alt="XMOOD" className="h-10 w-auto rounded-lg" />
          <span className="font-bold text-xl hidden md:block">XMOOD STORE</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-bold hover:text-primary transition-colors ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2 bg-muted rounded-xl">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
               <div className="hidden sm:block text-right ml-2">
                  <p className="text-[10px] font-bold text-primary">{formatUSD(profile?.walletBalance || 0)}</p>
               </div>
               <Link href="/wallet">
                 <Avatar className="h-10 w-10 border-2 border-primary/20">
                   <AvatarImage src={profile?.photoURL} />
                   <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
                 </Avatar>
               </Link>
               {isAdmin && (
                 <Link href="/admin">
                   <Button variant="ghost" size="icon"><LayoutDashboard size={20} /></Button>
                 </Link>
               )}
               <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500"><LogOut size={20} /></Button>
            </div>
          ) : (
            <Button asChild className="royal-button px-6 h-10">
              <Link href="/login">دخول</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}