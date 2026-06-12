
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  Zap, 
  Menu,
  ShoppingBag,
  ArrowRightLeft,
  Settings,
  ShieldCheck,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";

export function Navbar() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: siteSettings } = useDoc(settingsRef);

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المتجر", href: "/store" },
    { name: "السوق الاجتماعي", href: "/marketplace" },
    { name: "الوساطة المضمونة", href: "/middleman" },
  ];

  const siteTitle = siteSettings?.siteInfo?.title || "XMOOD PRO";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-3xl shadow-2xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between flex-row-reverse">
        
        {/* Brand Section */}
        <Link href="/" className="flex flex-col items-end group">
          <span className="decorative-logo text-3xl group-hover:scale-105 transition-transform">{siteTitle}</span>
          <span className="text-[8px] font-bold tracking-[0.4em] text-red-600 uppercase opacity-60">Premium Experience</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10 flex-row-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-zinc-500'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-red-500 bg-red-600/5 px-6 py-2 rounded-full border border-red-600/10 hover:bg-red-600/10 transition-all">
            <Sparkles size={14} /> المحلل الذكي
          </Link>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-6 flex-row-reverse">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-zinc-900 px-5 py-2 rounded-xl border border-primary/20 shadow-xl">
              <span className="text-xl font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={16} className="text-red-600" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-12 px-8 text-[10px]">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-xl overflow-hidden border border-primary/30 hover:border-primary transition-all shadow-xl group">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-zinc-950 text-primary font-black text-xl">
                      {profile?.displayName?.charAt(0) || <UserIcon size={20} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 mt-4 rounded-[2.5rem] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] p-4" align="start">
                <DropdownMenuLabel className="p-6 text-right bg-white/5 rounded-3xl mb-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-primary/20 text-primary text-[7px] px-3 py-0.5 rounded-full uppercase font-black">{profile?.label || "عضو بريميوم"}</Badge>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">معرف: {user.uid.substring(0,8)}</p>
                  </div>
                  <p className="font-headline text-2xl font-bold gold-text leading-none">{profile?.displayName}</p>
                </DropdownMenuLabel>
                
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-600 pr-4 mb-2 tracking-widest">إدارة الحساب والمالية</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/wallet">
                      <span className="ml-3">المحفظة الشخصية</span>
                      <Wallet className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/wallet/transfer">
                      <span className="ml-3">تحويل سريع للأموال</span>
                      <ArrowRightLeft className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/5 my-4" />

                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-600 pr-4 mb-2 tracking-widest">الخدمات والدعم</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/designs/request">
                      <span className="ml-3">طلب تصميم جديد</span>
                      <ShoppingBag className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/concierge">
                      <span className="ml-3">المحلل الذكي X-AI</span>
                      <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {['owner', 'admin', 'gm', 'store_manager', 'design_manager'].includes(profile?.role || '') && (
                  <>
                    <DropdownMenuSeparator className="bg-white/5 my-4" />
                    <DropdownMenuGroup className="space-y-1">
                      <DropdownMenuLabel className="text-[9px] font-black uppercase text-zinc-600 pr-4 mb-2 tracking-widest">أدوات الإدارة</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer text-primary font-black justify-end bg-primary/5 hover:bg-primary/20 transition-all border border-primary/10">
                        <Link href="/admin">
                          <span className="ml-3">لوحة التحكم PRO</span>
                          <LayoutDashboard className="w-5 h-5" />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator className="bg-white/5 my-4" />
                
                <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl p-4 cursor-pointer text-red-600 font-bold justify-end hover:bg-red-600/10 transition-all group">
                  <span className="ml-3">تسجيل الخروج</span>
                  <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" className="lg:hidden text-primary">
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
