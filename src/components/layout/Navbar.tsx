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
              className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 z-[160] h-screen w-[88%] max-w-[340px] bg-background border-l-2 border-primary/20 shadow-2xl lg:hidden flex flex-col mobile-sidebar-shadow"
            >
              {/* Sidebar Header - Enhanced Padding */}
              <div className="p-8 border-b border-border/50 flex flex-col gap-5 bg-muted/5 shrink-0">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                         <Sparkles size={24} className="text-primary animate-pulse" />
                      </div>
                      <span className="font-black text-sm gold-text uppercase tracking-widest leading-none">XMOOD<br/>SOVEREIGN</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/60 h-11 w-11 border border-border/40">
                      <X size={22} />
                   </Button>
                </div>
                {user && (
                   <Link href="/wallet" className="flex items-center gap-5 p-5 rounded-2xl bg-card border border-primary/10 shadow-lg mt-4 active:scale-95 transition-all">
                      <Avatar className="w-12 h-12 border-2 border-primary/15 shadow-md">
                         <AvatarImage src={profile?.photoURL} />
                         <AvatarFallback className="bg-primary/10 text-primary font-bold">XM</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                         <p className="font-black text-sm truncate text-foreground">{profile?.displayName}</p>
                         <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">{profile?.label || "عضو سيادي"}</p>
                      </div>
                   </Link>
                )}
              </div>

              {/* Sidebar Content (Scrollable) - Improved Spacing */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12">
                
                {/* Main Navigation - More room between items */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] pr-4 mb-4 opacity-50">القوائم الرئيسية</p>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`flex items-center justify-between p-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-primary/5 text-foreground/80 border border-transparent'}`}
                    >
                      <div className="flex items-center gap-5">
                        <link.icon size={20} className={pathname === link.href ? 'text-black' : 'text-primary'} />
                        {link.label}
                      </div>
                      <ChevronLeft size={16} className={pathname === link.href ? 'text-black/30' : 'opacity-20'} />
                    </Link>
                  ))}
                </div>

                {/* Categories & Offers - Better visual grouping */}
                {categories.length > 0 && (
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] pr-4 mb-4 opacity-50">الأقسام الرقمية</p>
                      <div className="grid grid-cols-1 gap-3">
                         {categories.map((cat, i) => (
                            <Link 
                              key={i} 
                              href={`/store?category=${cat}`} 
                              className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/80 text-[11px] font-black text-foreground/70 transition-all border border-border/30 hover:border-primary/20"
                            >
                               <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center">
                                  <LayoutGrid size={16} className="text-primary/60" />
                               </div>
                               {String(cat)}
                            </Link>
                         ))}
                      </div>
                   </div>
                )}

                {/* Trust & Guarantees - Standout section */}
                <div className="space-y-5">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] pr-4 mb-4 opacity-50">نظام الضمان</p>
                   <Link href="/middleman" className="block p-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
                      <div className="flex items-center gap-4 mb-3">
                         <ShieldCheck size={24} className="text-primary" />
                         <span className="font-black text-xs text-foreground">الوسطاء المعتمدون</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">تأمين كامل لكافة صفقاتك مع وسطاء ذوي سمعة رقمية عالية.</p>
                   </Link>
                </div>

                {/* Admin Access - Prominent Visibility */}
                {isAdmin && (
                  <div className="pt-6 border-t border-border/50">
                    <Link 
                      href="/admin" 
                      className={`flex items-center gap-5 p-6 rounded-3xl font-black text-[12px] uppercase tracking-widest transition-all shadow-lg ${pathname.startsWith('/admin') ? 'bg-blue-600 text-white' : 'text-blue-500 bg-blue-500/10 border-2 border-blue-500/20'}`}
                    >
                      <ShieldAlert size={24} />
                      لوحة الإدارة السيادية
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Sidebar Footer - Redesigned for clarity */}
              <div className="p-8 border-t border-border/50 bg-muted/10 space-y-6 shrink-0">
                <div className="flex justify-between items-center bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border/40 shadow-inner">
                   <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">المظهر</span>
                   <div className="flex gap-5">
                      <button onClick={toggleTheme} className={`transition-all ${theme === 'light' ? 'text-primary scale-125' : 'opacity-40 hover:opacity-100'}`}><Sun size={20} /></button>
                      <button onClick={toggleTheme} className={`transition-all ${theme === 'dark' ? 'text-primary scale-125' : 'opacity-40 hover:opacity-100'}`}><Moon size={20} /></button>
                   </div>
                </div>

                {user ? (
                   <Button variant="ghost" onClick={handleSignOut} className="w-full justify-center gap-4 h-16 rounded-2xl font-black text-[11px] text-red-500 border border-red-500/20 bg-red-500/10 uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <LogOut size={20} /> تسجيل الخروج
                   </Button>
                ) : (
                  <Button asChild className="w-full royal-button h-18 shadow-2xl shadow-primary/20 text-sm">
                    <Link href="/login">دخول عالم النخبة</Link>
                  </Button>
                )}
                <div className="text-center">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.6em] opacity-30">XMOOD OS 10.0 CORE</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}