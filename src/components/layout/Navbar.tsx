"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, Sparkles, LogOut, User as UserIcon, Zap, Menu, ShieldCheck } from "lucide-react";
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
    { name: "المتجر الملكي", href: "/store" },
    { name: "السوق الاجتماعي", href: "/marketplace" },
    { name: "الوساطة السيادية", href: "/middleman" },
  ];

  const logoUrl = siteSettings?.appearance?.logoUrl;
  const siteTitle = siteSettings?.siteInfo?.title || "XMOOD PRO";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-3xl">
      <div className="container mx-auto px-6 h-32 flex items-center justify-between gap-10 flex-row-reverse">
        
        {/* Brand Section */}
        <Link href="/" className="flex items-center gap-6 group flex-row-reverse shrink-0">
          <div className="relative flex flex-col items-end">
            <span className="decorative-logo">{siteTitle}</span>
            <span className="text-[10px] font-black tracking-[0.6em] text-red-600 uppercase mt-1 opacity-80">{siteSettings?.siteInfo?.subtitle || "MAX SOVEREIGNTY"}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-14 flex-row-reverse shrink-0">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[12px] font-black uppercase tracking-[0.4em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-zinc-500'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-600/5 px-10 py-4 rounded-full border border-red-600/10 hover:bg-red-600/10 transition-all shadow-2xl shadow-red-600/5">
            <Sparkles size={18} /> المساعد السيادي
          </Link>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-8 flex-row-reverse shrink-0">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-5 bg-zinc-950 px-8 py-3 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
              <span className="text-2xl font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={18} className="text-red-600 animate-pulse" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-16 px-14 text-sm">
              <Link href="/login">بوابة الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-18 w-18 rounded-[2rem] overflow-hidden border-2 border-primary/30 hover:border-primary transition-all shadow-2xl">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-zinc-950 text-primary font-black text-3xl">
                      {profile?.displayName?.charAt(0) || <UserIcon size={28} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 mt-6 rounded-[3rem] bg-zinc-950 border-2 border-white/5 shadow-[0_50px_100px_-15px_rgba(0,0,0,1)] p-6" align="start">
                <DropdownMenuLabel className="p-8 text-right bg-white/5 rounded-[2.5rem] mb-4">
                  <p className="font-headline text-3xl font-black gold-text mb-2 leading-none">{profile?.displayName}</p>
                  <p className="text-[10px] text-red-600 font-black tracking-[0.5em] uppercase">{profile?.label || "Elite Citizen"}</p>
                </DropdownMenuLabel>
                <div className="p-4 space-y-3">
                  <DropdownMenuItem asChild className="rounded-[1.5rem] p-6 cursor-pointer justify-end font-black text-zinc-300 hover:bg-primary/10 hover:text-primary transition-all">
                    <Link href="/wallet"><Wallet className="ml-5 w-6 h-6 text-red-600" /> محفظتي السيادية</Link>
                  </DropdownMenuItem>
                  {['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer'].includes(profile?.role || '') && (
                    <DropdownMenuItem asChild className="rounded-[1.5rem] p-6 cursor-pointer text-primary font-black justify-end hover:bg-primary/20">
                      <Link href="/admin"><LayoutDashboard className="ml-5 w-6 h-6 text-primary" /> مركز القيادة PRO</Link>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/5 mx-6" />
                <div className="p-4">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-[1.5rem] p-6 cursor-pointer text-red-600 font-black justify-end hover:bg-red-600/10 transition-all">
                    <LogOut className="ml-5 w-6 h-6" /> مغادرة الإمبراطورية
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" className="lg:hidden text-primary">
            <Menu size={40} />
          </Button>
        </div>
      </div>
    </nav>
  );
}