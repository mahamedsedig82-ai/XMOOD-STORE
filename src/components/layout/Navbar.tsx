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
    <nav className="fixed top-0 z-[150] w-full border-b bg-background/95 backdrop-blur-2xl h-20 md:h-24 shadow-sm" dir="rtl">
      <div className="container h-full flex items-center justify-between px-4 md:px-6">
        
        <Link href="/" className="flex items-center gap-2 transition-all shrink-0">
          {config?.appearance?.logoUrl ? (
            <div className="relative">
              <img src={config.appearance.logoUrl} className="h-10 w-10 md:h-16 md:w-16 rounded-full object-cover border-2 border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]" alt="XMOOD" />
            </div>
          ) : (
            <div className="flex flex-col" style={{ direction: 'ltr' }}>
              <span className="handwritten-logo !text-lg md:!text-3xl leading-none tracking-tight">XMOOD <span>STORE</span></span>
              <span className="text-[6px] md:text-[8px] font-black tracking-widest uppercase text-primary/40">Sovereign Engine</span>
            </div>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-widest hover:text-primary transition-all relative group ${pathname === link.href ? 'text-primary' : 'text-foreground/80'}`}
            >
              {link.label}
              <span className={`absolute -bottom-2.5 left-0 h-[2px] bg-primary transition-all ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full opacity-50'}`} />
            </Link>
          ))}
          
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-sm"
            >
              <ShieldAlert size={14} /> لوحة الإدارة
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <Link href="/cart" className="relative p-2.5 bg-muted/50 hover:bg-primary/10 rounded-xl transition-all border border-primary/5 shadow-inner">
            <ShoppingCart size={20} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-10 w-10 bg-muted/50 border border-primary/5 hidden sm:flex">
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
               <Link href="/wallet">
                 <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/20 shadow-md rounded-full overflow-hidden transition-transform hover:scale-105">
                   <AvatarImage src={profile?.photoURL} className="object-cover" />
                   <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">XM</AvatarFallback>
                 </Avatar>
               </Link>
               <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500 h-10 w-10 md:h-12 md:w-12 rounded-xl bg-red-500/10 hidden md:flex hover:bg-red-500 hover:text-white transition-all">
                 <LogOut size={20} />
               </Button>
            </div>
          ) : (
            <Button asChild className="royal-button h-11 px-8 rounded-xl text-[10px]">
              <Link href="/login">دخول المنصة</Link>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-xl bg-muted/60 border h-11 w-11 z-[200] active:scale-90 transition-transform" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} className="text-primary" /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[140] bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-[160] h-full w-[85%] max-w-[340px] bg-background border-l shadow-2xl lg:hidden p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-border/50">
                 <div className="flex flex-col">
                    <span className="font-black text-sm gold-text uppercase tracking-widest">XMOOD STORE</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Sovereign Navigation</span>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/60 h-10 w-10">
                    <X size={20} />
                 </Button>
              </div>

              <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-5 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-primary/5 text-foreground/90 border border-transparent hover:border-primary/10'}`}
                  >
                    <link.icon size={20} className={pathname === link.href ? 'text-black' : 'text-primary'} />
                    {link.label}
                  </Link>
                ))}
                
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`flex items-center gap-5 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all mt-6 ${pathname.startsWith('/admin') ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-500 bg-blue-500/5 border-2 border-blue-500/20 shadow-sm'}`}
                  >
                    <ShieldAlert size={22} />
                    لوحة الإدارة السيادية
                  </Link>
                )}
              </div>
              
              <div className="mt-auto pt-8 border-t border-border/50 space-y-5">
                {user ? (
                  <div className="space-y-4">
                    <Link href="/wallet" className="flex items-center gap-4 p-5 rounded-2xl bg-muted/40 border border-border/50 shadow-inner">
                       <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-md">
                          <AvatarImage src={profile?.photoURL} />
                          <AvatarFallback className="font-black text-primary">XM</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col">
                          <span className="font-black text-xs truncate max-w-[150px]">{profile?.displayName}</span>
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">إدارة المحفظة</span>
                       </div>
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-center gap-4 p-5 h-auto rounded-2xl font-black text-[10px] text-red-500 border border-red-500/10 bg-red-500/5 uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
                      <LogOut size={18} /> تسجيل الخروج السيادي
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full royal-button h-16 text-[11px] shadow-2xl">
                    <Link href="/login">دخول عالم النخبة</Link>
                  </Button>
                )}
                <div className="flex justify-center gap-6 opacity-40 py-4">
                   <Sun size={16} className={theme === 'light' ? 'text-primary scale-110 opacity-100' : ''} onClick={toggleTheme} />
                   <div className="w-[1px] h-5 bg-muted-foreground" />
                   <Moon size={16} className={theme === 'dark' ? 'text-primary scale-110 opacity-100' : ''} onClick={toggleTheme} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
