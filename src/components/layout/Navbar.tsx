"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Briefcase, ShoppingCart, User, X, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, profile, isAdmin } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <nav className="fixed top-0 z-[100] w-full border-b bg-background/85 backdrop-blur-xl h-20 md:h-24" dir="rtl">
      <div className="container h-full flex items-center justify-between px-4 md:px-6">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 transition-all shrink-0">
          {config?.appearance?.logoUrl ? (
            <div className="relative">
              <img src={config.appearance.logoUrl} className="h-10 w-10 md:h-16 md:w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm" alt="XMOOD" />
            </div>
          ) : (
            <div className="flex flex-col" style={{ direction: 'ltr' }}>
              <span className="handwritten-logo !text-lg md:!text-3xl leading-none tracking-tight">XMOOD <span>STORE</span></span>
              <span className="text-[6px] md:text-[8px] font-black tracking-widest uppercase text-primary/40">Sovereign Engine</span>
            </div>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all relative group ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
              <span className={`absolute -bottom-2.5 left-0 h-[2px] bg-primary transition-all ${pathname === link.href ? 'w-full' : 'w-0'}`} />
            </Link>
          ))}
          
          {/* Admin Dashboard Link for Desktop */}
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-sm"
            >
              <ShieldAlert size={14} /> لوحة الإدارة
            </Link>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/cart" className="relative p-2.5 bg-muted/40 hover:bg-primary/10 rounded-xl transition-all border border-primary/5">
            <ShoppingCart size={18} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-10 w-10 bg-muted/40 border border-primary/5 hidden sm:flex">
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
               <Link href="/wallet">
                 <Avatar className="h-9 w-9 md:h-11 md:w-11 border-2 border-primary/20 shadow-sm rounded-full overflow-hidden">
                   <AvatarImage src={profile?.photoURL} className="object-cover" />
                   <AvatarFallback className="bg-primary/10 text-primary font-bold"><User size={16}/></AvatarFallback>
                 </Avatar>
               </Link>
               <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500 h-9 w-9 md:h-11 md:w-11 rounded-xl bg-red-500/10 hidden md:flex">
                 <LogOut size={18} />
               </Button>
            </div>
          ) : (
            <Button asChild className="royal-button h-10 px-6 rounded-xl text-[9px]">
              <Link href="/login">دخول</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl bg-muted/40 border h-10 w-10" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 top-20 z-50 bg-background lg:hidden p-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary/10 text-primary border border-primary/10 shadow-sm' : 'text-muted-foreground'}`}
                >
                  <link.icon size={20} className="text-primary" />
                  {link.label}
                </Link>
              ))}
              
              {/* Admin Dashboard Link for Mobile Menu */}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-5 rounded-2xl font-black text-xs uppercase tracking-widest text-blue-500 bg-blue-500/5 border border-blue-500/10 shadow-sm"
                >
                  <LayoutDashboard size={20} />
                  وحدة التحكم الإدارية
                </Link>
              )}
              
              {user && (
                <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-4 p-5 h-auto rounded-2xl font-black text-xs text-red-500 mt-4 border border-red-500/10 bg-red-500/5">
                  <LogOut size={20} /> تسجيل الخروج
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}