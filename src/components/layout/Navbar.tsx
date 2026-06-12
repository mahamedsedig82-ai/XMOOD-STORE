
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, Sparkles, LogOut, User as UserIcon, Zap, Menu } from "lucide-react";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    { name: "السوق", href: "/marketplace" },
    { name: "الوساطة", href: "/middleman" },
  ];

  const siteTitle = siteSettings?.siteInfo?.title || "XMOOD PRO";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-3xl shadow-2xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between flex-row-reverse">
        
        {/* Brand Section */}
        <Link href="/" className="flex flex-col items-end group">
          <span className="decorative-logo text-3xl group-hover:scale-105 transition-transform">{siteTitle}</span>
          <span className="text-[8px] font-bold tracking-[0.4em] text-red-600 uppercase opacity-60">Digital Excellence</span>
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
            <Sparkles size={14} /> المساعد الذكي
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
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-xl overflow-hidden border border-primary/30 hover:border-primary transition-all shadow-xl">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-zinc-950 text-primary font-black text-xl">
                      {profile?.displayName?.charAt(0) || <UserIcon size={20} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 mt-4 rounded-[2rem] bg-zinc-950 border border-white/10 shadow-2xl p-4" align="start">
                <DropdownMenuLabel className="p-6 text-right bg-white/5 rounded-2xl mb-2">
                  <p className="font-headline text-2xl font-bold gold-text mb-1 leading-none">{profile?.displayName}</p>
                  <p className="text-[9px] text-red-600 font-bold tracking-widest uppercase">{profile?.label || "بريميوم"}</p>
                </DropdownMenuLabel>
                <div className="space-y-1">
                  <DropdownMenuItem asChild className="rounded-xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all">
                    <Link href="/wallet"><Wallet className="ml-3 w-5 h-5 text-red-600" /> المحفظة الشخصية</Link>
                  </DropdownMenuItem>
                  {['owner', 'admin', 'gm', 'store_manager'].includes(profile?.role || '') && (
                    <DropdownMenuItem asChild className="rounded-xl p-4 cursor-pointer text-primary font-bold justify-end hover:bg-primary/20">
                      <Link href="/admin"><LayoutDashboard className="ml-3 w-5 h-5" /> لوحة التحكم PRO</Link>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/5 my-3" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-4 cursor-pointer text-red-600 font-bold justify-end hover:bg-red-600/10">
                  <LogOut className="ml-3 w-5 h-5" /> تسجيل الخروج
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

