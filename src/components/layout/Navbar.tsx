
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, Sparkles, LogOut, User as UserIcon, Zap, Menu, Wand2, ShieldCheck } from "lucide-react";
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

  const logoUrl = siteSettings?.appearance?.logoUrl;
  const siteTitle = siteSettings?.siteInfo?.title || "XMOOD";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-3xl">
      <div className="container mx-auto px-6 h-28 flex items-center justify-between gap-10 flex-row-reverse">
        
        {/* Brand Section */}
        <Link href="/" className="flex items-center gap-6 group flex-row-reverse shrink-0">
          <div className="relative w-16 h-16 transition-all duration-500 group-hover:scale-110 rounded-2xl overflow-hidden border border-primary/20 bg-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="object-cover w-full h-full" />
            ) : (
              <ShieldCheck className="text-primary" size={32} />
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="font-headline text-3xl font-black tracking-tighter gold-text leading-none">{siteTitle}</span>
            <span className="text-[9px] font-black tracking-[0.4em] text-red-600 uppercase mt-1">{siteSettings?.siteInfo?.subtitle || "PRO MAX"}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-12 flex-row-reverse shrink-0">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-zinc-500'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-600/5 px-8 py-3.5 rounded-full border border-red-600/10 hover:bg-red-600/10 transition-all shadow-xl shadow-red-600/5">
            <Sparkles size={16} /> المساعد السيادي
          </Link>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-6 flex-row-reverse shrink-0">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-4 bg-zinc-900 px-6 py-2.5 rounded-2xl border border-white/5 shadow-inner">
              <span className="text-xl font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={16} className="text-red-600 animate-pulse" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-14 px-12 text-sm">
              <Link href="/login">بوابة الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-16 w-16 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all shadow-2xl">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-zinc-950 text-primary font-black text-2xl">
                      {profile?.displayName?.charAt(0) || <UserIcon size={24} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 mt-6 rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,1)] p-4" align="start">
                <DropdownMenuLabel className="p-6 text-right">
                  <p className="font-black text-white gold-text text-2xl mb-1">{profile?.displayName}</p>
                  <p className="text-[9px] text-red-500 font-black tracking-[0.3em] uppercase">{profile?.label || "Elite Citizen"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mx-4" />
                <div className="p-3 space-y-2">
                  <DropdownMenuItem asChild className="rounded-2xl p-5 cursor-pointer justify-end font-black text-zinc-300 hover:bg-white/5 hover:text-primary">
                    <Link href="/wallet"><Wallet className="ml-4 w-5 h-5 text-red-600" /> محفظتي السيادية</Link>
                  </DropdownMenuItem>
                  {['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer'].includes(profile?.role || '') && (
                    <DropdownMenuItem asChild className="rounded-2xl p-5 cursor-pointer text-primary font-black justify-end hover:bg-primary/5">
                      <Link href="/admin"><LayoutDashboard className="ml-4 w-5 h-5 text-primary" /> مركز القيادة PRO</Link>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/5 mx-4" />
                <div className="p-3">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl p-5 cursor-pointer text-red-600 font-black justify-end hover:bg-red-600/5">
                    <LogOut className="ml-4 w-5 h-5" /> مغادرة الإمبراطورية
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" className="lg:hidden text-primary">
            <Menu size={36} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
