"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Moon, Sun, Home, Store, Palette, ShieldCheck, 
  Wallet, LayoutDashboard, LogOut, Briefcase, ShoppingCart, User, X, ShieldAlert,
  ChevronLeft, Sparkles, Zap, LayoutGrid, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, limit } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

  // جلب التصنيفات للعرض في القائمة الجانبية
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), limit(20));
  }, [db]);
  const { data: products } = useCollection(productsQuery);

  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean).slice(0, 5);
  }, [products]);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('xmood-theme') || 'light' : 'light';
    setTheme(savedTheme as any);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

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
    <nav className="fixed top-0 z-[150] w-full border-b bg-background/95 backdrop-blur-3xl h-20 md:h-24 shadow-sm" dir="rtl">
      <div className="container h-full flex items-center justify-between px-4 md:px-6">
        
        <Link href="/" className="flex items-center gap-2 transition-all shrink-0">
          {config?.appearance?.logoUrl ? (
            <img src={config.appearance.logoUrl} className="h-10 w-10 md:h-16 md:w-16 rounded-full object-cover border-2 border-primary/20 shadow-md" alt="XMOOD" />
          ) : (
            <div className="flex flex-col" style={{ direction: 'ltr' }}>
              <span className="handwritten-logo !text-lg md:!text-3xl leading-none">XMOOD STORE</span>
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
            >
              <ShieldAlert size={14} /> لوحة الإدارة
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <Link href="/cart" className="relative p-2.5 bg-muted/50 hover:bg-primary/10 rounded-xl transition-all border border-primary/5">
            <ShoppingCart size={20} className="text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background">
                {itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-10 w-10 bg-muted/50 border border-primary/5 hidden sm:flex">
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary" />}
          </Button>

          {user ? (
            <Link href="/wallet">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary/20 shadow-sm rounded-full overflow-hidden transition-transform hover:scale-105">
                <AvatarImage src={profile?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">XM</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button asChild className="royal-button h-11 px-8 rounded-xl text-[10px]">
              <Link href="/login">دخول</Link>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-xl bg-muted/60 border h-11 w-11 z-[200] active:scale-90" 
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
              className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[160] h-screen w-[85%] max-w-[320px] bg-background border-l-2 border-primary/20 shadow-2xl lg:hidden flex flex-col mobile-sidebar-shadow"
            >
              {/* Sidebar Header */}
              <div className="p-8 border-b border-border/50 flex flex-col gap-4 bg-muted/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                         <Sparkles size={20} className="text-primary animate-pulse" />
                      </div>
                      <span className="font-black text-xs gold-text uppercase tracking-widest">XMOOD SOVEREIGN</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/60 h-10 w-10">
                      <X size={18} />
                   </Button>
                </div>
                {user && (
                   <Link href="/wallet" className="flex items-center gap-4 p-4 rounded-2xl bg-card border shadow-sm mt-4 active:scale-95 transition-all">
                      <Avatar className="w-10 h-10 border-2 border-primary/10">
                         <AvatarImage src={profile?.photoURL} />
                         <AvatarFallback>XM</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                         <p className="font-black text-xs truncate">{profile?.displayName}</p>
                         <p className="text-[9px] font-bold text-primary uppercase">{profile?.label || "عضو سيادي"}</p>
                      </div>
                   </Link>
                )}
              </div>

              {/* Sidebar Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
                
                {/* Main Navigation */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-2">القوائم الرئيسية</p>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`flex items-center justify-between p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-primary/5 text-foreground/80 border border-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <link.icon size={18} className={pathname === link.href ? 'text-black' : 'text-primary'} />
                        {link.label}
                      </div>
                      <ChevronLeft size={14} className="opacity-30" />
                    </Link>
                  ))}
                </div>

                {/* Categories & Offers (The missing sections) */}
                {categories.length > 0 && (
                   <div className="space-y-3">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-2">الأقسام الرقمية</p>
                      <div className="grid grid-cols-1 gap-2">
                         {categories.map((cat, i) => (
                            <Link 
                              key={i} 
                              href={`/store?category=${cat}`} 
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 text-[10px] font-bold text-foreground/70 transition-all border border-transparent hover:border-primary/10"
                            >
                               <LayoutGrid size={14} className="text-primary/60" />
                               {String(cat)}
                            </Link>
                         ))}
                      </div>
                   </div>
                )}

                {/* Exclusive Offers */}
                <div className="space-y-4">
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-2">العروض والضمان</p>
                   <Link href="/middleman" className="block p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 group">
                      <div className="flex items-center gap-3 mb-2">
                         <ShieldCheck size={20} className="text-primary" />
                         <span className="font-black text-xs">نظام الضمان الموثوق</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed font-bold">تواصل مع وسطاء معتمدين لتأمين صفقاتك في السوق المفتوح.</p>
                   </Link>
                </div>

                {/* Admin Access (Highlighted) */}
                {isAdmin && (
                  <div className="pt-4 border-t border-border/50">
                    <Link 
                      href="/admin" 
                      className={`flex items-center gap-5 p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${pathname.startsWith('/admin') ? 'bg-blue-600 text-white shadow-xl' : 'text-blue-500 bg-blue-500/5 border-2 border-blue-500/20'}`}
                    >
                      <ShieldAlert size={22} />
                      لوحة الإدارة السيادية
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Sidebar Footer */}
              <div className="p-8 border-t border-border/50 bg-muted/5 space-y-6">
                <div className="flex justify-between items-center bg-background p-4 rounded-2xl border shadow-inner">
                   <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">نمط الواجهة</span>
                   <div className="flex gap-4">
                      <Sun size={18} className={theme === 'light' ? 'text-primary scale-110' : 'opacity-30'} onClick={toggleTheme} />
                      <Moon size={18} className={theme === 'dark' ? 'text-primary scale-110' : 'opacity-30'} onClick={toggleTheme} />
                   </div>
                </div>

                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full justify-center gap-4 h-14 rounded-2xl font-black text-[10px] text-red-500 border border-red-500/20 bg-red-500/5 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      <LogOut size={18} /> تسجيل الخروج
                   </Button>
                ) : (
                  <Button asChild className="w-full royal-button h-16 shadow-lg shadow-primary/20">
                    <Link href="/login">دخول عالم النخبة</Link>
                  </Button>
                )}
                <div className="text-center">
                   <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-30">XMOOD OS 9.0 CORE</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}