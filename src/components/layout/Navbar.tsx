
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, ShieldCheck, Sparkles, LogOut, User as UserIcon, Search, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
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
  const pathname = usePathname();

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المتجر", href: "/store" },
    { name: "السوق المفتوح", href: "/marketplace" },
    { name: "نظام الوساطة", href: "/middleman" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-black/80 backdrop-blur-3xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between gap-10 flex-row-reverse">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group flex-row-reverse shrink-0">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-primary/30 group-hover:rotate-6 transition-transform">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </div>
          <span className="font-handwriting text-4xl font-bold tracking-tight text-primary mt-1">XMOOD STORE</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-10 flex-row-reverse shrink-0">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-black uppercase tracking-widest transition-all hover:text-primary hover:scale-105 ${pathname === link.href ? 'text-primary' : 'text-slate-400'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-6 py-2.5 rounded-full border border-primary/20 hover:bg-primary/20 transition-all">
            <Sparkles size={16} /> المساعد الذكي
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 flex-row-reverse shrink-0">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-4 bg-zinc-900 px-6 py-2.5 rounded-full border border-primary/10">
              <span className="text-lg font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={18} className="text-primary/60" />
            </div>
          )}

          {!user ? (
            <Button asChild className="rounded-full h-14 px-10 font-black shadow-2xl royal-button text-lg">
              <Link href="/login">بوابة الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-14 w-14 rounded-[1.2rem] overflow-hidden border border-primary/20 shadow-2xl hover:scale-110 transition-transform">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                      {user.displayName?.charAt(0) || <UserIcon size={24} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 p-3 rounded-[2rem] border-primary/10 bg-zinc-950 shadow-2xl" align="start">
                <DropdownMenuLabel className="p-6 text-right">
                  <p className="font-black text-xl text-white gold-text">{user.displayName}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                <div className="p-2 space-y-1">
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-xl p-4 cursor-pointer text-primary font-black focus:bg-primary/10 justify-end transition-all">
                      <Link href="/admin"><LayoutDashboard className="ml-4 w-5 h-5" /> لوحة الإدارة العليا</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl p-4 cursor-pointer focus:bg-white/5 justify-end transition-all">
                    <Link href="/wallet" className="font-bold"><Wallet className="ml-4 w-5 h-5" /> محفظتي السيادية</Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-primary/5" />
                <div className="p-2">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-4 cursor-pointer text-red-500 focus:bg-red-500/10 font-black justify-end transition-all">
                    <LogOut className="ml-4 w-5 h-5" /> تسجيل الخروج
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" className="lg:hidden text-primary">
            <Menu size={32} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
