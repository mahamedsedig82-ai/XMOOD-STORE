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

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <nav className="fixed top-0 z-[150] w-full border-b bg-background/90 backdrop-blur-2xl h-20 md:h-24" dir="rtl">
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

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-xl bg-muted/40 border h-10 w-10 z-[200]" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} className="text-primary" /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[160] h-full w-[80%] max-w-[320px] bg-background border-l shadow-2xl lg:hidden p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10 pb-6 border-b">
                 <div className="flex flex-col">
                    <span className="font-black text-xs gold-text uppercase tracking-widest">XMOOD STORE</span>
                    <span className="text-[7px] font-black text-muted-foreground uppercase">Navigation Menu</span>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/40">
                    <X size={18} />
                 </Button>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-4 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary text-black shadow-lg' : 'hover:bg-primary/5 text-muted-foreground border border-transparent hover:border-primary/10'}`}
                  >
                    <link.icon size={18} className={pathname === link.href ? 'text-black' : 'text-primary'} />
                    {link.label}
                  </Link>
                ))}
                
                {/* Admin Dashboard Link - Prominent in Mobile Menu */}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`flex items-center gap-4 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all mt-4 ${pathname.startsWith('/admin') ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-500 bg-blue-500/5 border border-blue-500/10 shadow-sm'}`}
                  >
                    <ShieldAlert size={18} />
                    لوحة الإدارة السيادية
                  </Link>
                )}
              </div>
              
              <div className="mt-auto pt-6 border-t space-y-4">
                {user ? (
                  <div className="space-y-3">
                    <Link href="/wallet" className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border">
                       <Avatar className="w-10 h-10 border border-primary/20">
                          <AvatarImage src={profile?.photoURL} />
                          <AvatarFallback>XM</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col">
                          <span className="font-black text-[10px] truncate max-w-[120px]">{profile?.displayName}</span>
                          <span className="text-[8px] font-bold text-primary uppercase">عرض المحفظة</span>
                       </div>
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-4 p-4 h-auto rounded-xl font-black text-[10px] text-red-500 border border-red-500/10 bg-red-500/5 uppercase tracking-widest">
                      <LogOut size={16} /> تسجيل الخروج
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full royal-button h-14 text-[10px]">
                    <Link href="/login">دخول المنصة</Link>
                  </Button>
                )}
                <div className="flex justify-center gap-4 opacity-40 pt-4">
                   <Sun size={14} className={theme === 'light' ? 'text-primary' : ''} onClick={toggleTheme} />
                   <div className="w-[1px] h-4 bg-muted-foreground" />
                   <Moon size={14} className={theme === 'dark' ? 'text-primary' : ''} onClick={toggleTheme} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
