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
  const db = useFirestore();
  const pathname = usePathname();
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
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean).slice(0, 6);
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
    <>
      <nav className="fixed top-0 z-[150] w-full border-b bg-background/95 backdrop-blur-3xl h-20" dir="rtl">
        <div className="container h-full flex items-center justify-between px-4 md:px-6">
          
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {config?.appearance?.logoUrl ? (
              <img src={config.appearance.logoUrl} className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-primary/20 shadow-md" alt="XMOOD" />
            ) : (
              <div className="flex flex-col" style={{ direction: 'ltr' }}>
                <span className="handwritten-logo !text-lg md:!text-2xl">XMOOD STORE</span>
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
                href={profile?.role === 'designer' ? "/admin/designs" : "/admin"} 
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
              >
                <ShieldAlert size={14} /> {profile?.role === 'designer' ? 'لوحة المصمم' : 'لوحة الإدارة'}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-10 w-10 bg-muted/50 border border-primary/5 hidden sm:flex">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary" />}
            </Button>

            <Link href="/cart" className="relative p-2.5 bg-muted/50 hover:bg-primary/10 rounded-xl transition-all border border-primary/5">
              <ShoppingCart size={18} className="text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-black text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link href="/wallet" className="shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm rounded-full overflow-hidden transition-transform hover:scale-105">
                    <AvatarImage src={profile?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">XM</AvatarFallback>
                  </Avatar>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={logout} 
                  className="hidden md:flex rounded-xl h-10 w-10 bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="تسجيل الخروج"
                >
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
              className="lg:hidden rounded-xl bg-muted/60 border h-10 w-10 active:scale-90" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[450] bg-black/80 backdrop-blur-md lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 35, stiffness: 400 }}
              className="fixed top-0 right-0 z-[500] h-full w-[85%] max-w-[340px] bg-background border-l border-white/10 shadow-2xl lg:hidden flex flex-col overflow-hidden"
              dir="rtl"
            >
              <div className="flex-none p-4 border-b border-white/5 bg-muted/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                         <Sparkles size={18} className="text-primary" />
                      </div>
                      <span className="font-black text-[11px] gold-text uppercase tracking-widest leading-none">XMOOD<br/>SYSTEM</span>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-white/5 h-8 w-8 text-white hover:bg-primary/20">
                      <X size={16} />
                   </Button>
                </div>
                {user && (
                   <Link href="/wallet" className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-primary/10 shadow-inner">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                         <AvatarImage src={profile?.photoURL} />
                         <AvatarFallback className="bg-primary/5 text-primary font-bold text-[10px]">XM</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden text-right">
                         <p className="font-black text-xs text-foreground truncate">{profile?.displayName}</p>
                         <p className="text-[8px] font-bold text-primary uppercase tracking-widest">{profile?.label || "عضو سيادي"}</p>
                      </div>
                   </Link>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-2 mb-2 opacity-50">التنقل الرئيسي</p>
                  <div className="grid gap-1">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        className={`flex items-center justify-between p-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${pathname === link.href ? 'bg-primary text-black shadow-md' : 'hover:bg-primary/5 text-foreground/80'}`}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon size={16} className={pathname === link.href ? 'text-black' : 'text-primary'} />
                          {link.label}
                        </div>
                        <ChevronLeft size={12} className={pathname === link.href ? 'text-black' : 'opacity-20'} />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] pr-2 mb-2 opacity-50">الأمان والتحكم</p>
                   <div className="grid gap-1">
                      <Link href="/middleman" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 shadow-inner">
                         <ShieldCheck size={18} className="text-primary animate-pulse" />
                         <div className="flex flex-col text-right">
                            <span className="font-black text-[10px] text-foreground leading-tight">الوسطاء المعتمدون</span>
                            <span className="text-[7px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">ضمان الصفقات</span>
                         </div>
                      </Link>
                      {isAdmin && (
                       <Link 
                         href={profile?.role === 'designer' ? "/admin/designs" : "/admin"} 
                         className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/5 border border-blue-600/10 text-blue-500 shadow-inner"
                       >
                         <ShieldAlert size={18} />
                         <div className="flex flex-col text-right">
                            <span className="font-black text-[10px] uppercase tracking-widest leading-tight">{profile?.role === 'designer' ? 'لوحة المصمم' : 'لوحة الإدارة'}</span>
                            <span className="text-[7px] opacity-60 font-black uppercase tracking-tighter mt-0.5">التحكم السيادي</span>
                         </div>
                       </Link>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex-none p-4 border-t border-white/5 bg-muted/10 space-y-3">
                <div className="flex justify-between items-center bg-background/50 p-2 rounded-lg border border-white/5 shadow-inner">
                   <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest pr-2">المظهر</span>
                   <div className="flex gap-3">
                      <button onClick={toggleTheme} className={`transition-all ${theme === 'light' ? 'text-primary scale-110' : 'opacity-30'}`}><Sun size={16} /></button>
                      <button onClick={toggleTheme} className={`transition-all ${theme === 'dark' ? 'text-primary scale-110' : 'opacity-30'}`}><Moon size={16} /></button>
                   </div>
                </div>

                {user ? (
                   <Button 
                    variant="ghost" 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                    className="w-full justify-start gap-3 h-11 px-3 rounded-lg font-black text-[10px] text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all"
                   >
                      <LogOut size={16} /> تسجيل الخروج الآمن
                   </Button>
                ) : (
                  <Button asChild className="royal-button w-full h-11 text-[9px] shadow-xl">
                    <Link href="/login">دخول عالم النخبة</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
