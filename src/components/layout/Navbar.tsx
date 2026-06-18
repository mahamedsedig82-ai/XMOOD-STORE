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
import { logout } from "@/lib/auth";
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
    if (!products || products.length === 0) return [];
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

  const navLinks = [
    { label: config?.navLabels?.home || "الرئيسية", href: "/", icon: Home },
    { label: config?.navLabels?.store || "المتجر", href: "/store", icon: Store },
    { label: config?.navLabels?.services || "الخدمات", href: "/other-services", icon: Briefcase },
    { label: config?.navLabels?.gallery || "المعرض", href: "/designs/gallery", icon: Palette },
    { label: config?.navLabels?.agents || "الوكلاء", href: "/middleman", icon: ShieldCheck },
  ];

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 z-[150] w-full border-b bg-background/95 backdrop-blur-3xl h-20 md:h-24" dir="rtl">
      <div className="container h-full flex items-center justify-between px-4 md:px-6">
        
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {config?.appearance?.logoUrl ? (
            <img src={config.appearance.logoUrl} className="h-10 w-10 md:h-16 md:w-16 rounded-full object-cover border-2 border-primary/20 shadow-md" alt="XMOOD" />
          ) : (
            <div className="flex flex-col" style={{ direction: 'ltr' }}>
              <span className="handwritten-logo !text-lg md:!text-3xl">XMOOD STORE</span>
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
            className="lg:hidden rounded-xl bg-muted/60 border h-11 w-11 active:scale-90" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer UI - Rebuilt for 100% Stability */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 z-[300] h-full w-[85%] max-w-[340px] bg-background border-l-2 border-primary/20 shadow-2xl lg:hidden flex flex-col overflow-hidden"
            >
              {/* Header - Shrink Zero */}
              <div className="flex-none p-8 border-b border-border/50 flex flex-col gap-6 bg-muted/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                         <Sparkles size={24} className="text-primary" />
                      </div>
                      <span className="font-black text-xs gold-text uppercase tracking-widest leading-none">XMOOD<br/>SYSTEM</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/60 h-10 w-10">
                      <X size={20} />
                   </Button>
                </div>
                {user && (
                   <Link href="/wallet" className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-primary/10">
                      <Avatar className="w-10 h-10 border border-primary/10">
                         <AvatarImage src={profile?.photoURL} />
                         <AvatarFallback className="bg-primary/5 text-primary font-bold">XM</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                         <p className="font-black text-xs truncate">{profile?.displayName}</p>
                         <p className="text-[8px] font-bold text-primary uppercase tracking-tighter">{profile?.label || "عضو سيادي"}</p>
                      </div>
                   </Link>
                )}
              </div>

              {/* Scrollable Body - flex-1 */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
                
                {/* Section 1: Main Links */}
                <div className="flex flex-col gap-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-2 opacity-50">التنقل الرئيسي</p>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`flex items-center justify-between p-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary text-black' : 'hover:bg-primary/5 text-foreground/80'}`}
                    >
                      <div className="flex items-center gap-4">
                        <link.icon size={18} />
                        {link.label}
                      </div>
                      <ChevronLeft size={14} className="opacity-30" />
                    </Link>
                  ))}
                </div>

                {/* Section 2: Categories (Visible to all) */}
                <div className="flex flex-col gap-2">
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-2 opacity-50">الأقسام الرقمية</p>
                   <div className="flex flex-col gap-1.5">
                      {categories.length > 0 ? categories.map((cat, i) => (
                         <Link 
                           key={i} 
                           href={`/store?category=${cat}`} 
                           className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted text-[10px] font-bold text-foreground/70 border border-transparent hover:border-primary/10"
                         >
                            <LayoutGrid size={14} className="text-primary/40" />
                            {String(cat)}
                         </Link>
                      )) : (
                        <p className="text-[9px] text-muted-foreground italic pr-4">جاري تحميل الأقسام...</p>
                      )}
                   </div>
                </div>

                {/* Section 3: Admin & Trust */}
                <div className="flex flex-col gap-4">
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-4 mb-1 opacity-50">الأمن والإدارة</p>
                   <Link href="/middleman" className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group">
                      <ShieldCheck size={20} className="text-primary" />
                      <div className="flex flex-col">
                         <span className="font-black text-[10px] text-foreground">الوسطاء المعتمدون</span>
                         <span className="text-[8px] text-muted-foreground font-bold">تأمين كامل لكافة صفقاتك</span>
                      </div>
                   </Link>
                   {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center gap-4 p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-500"
                    >
                      <ShieldAlert size={20} />
                      <span className="font-black text-[10px] uppercase">لوحة الإدارة السيادية</span>
                    </Link>
                   )}
                </div>
              </div>

              {/* Footer - Shrink Zero */}
              <div className="flex-none p-8 border-t border-border/50 bg-muted/10 space-y-4">
                <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/40">
                   <span className="text-[9px] font-black uppercase text-muted-foreground">المظهر</span>
                   <div className="flex gap-4">
                      <button onClick={toggleTheme} className={theme === 'light' ? 'text-primary' : 'opacity-30'}><Sun size={18} /></button>
                      <button onClick={toggleTheme} className={theme === 'dark' ? 'text-primary' : 'opacity-30'}><Moon size={18} /></button>
                   </div>
                </div>

                {user ? (
                   <Button variant="ghost" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full justify-center gap-3 h-14 rounded-xl font-black text-[10px] text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all">
                      <LogOut size={18} /> تسجيل الخروج الآمن
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-14 text-[10px]">
                    <Link href="/login">دخول عالم النخبة</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
