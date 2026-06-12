"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, ShieldCheck, Sparkles, LogOut, User as UserIcon, Zap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    { name: "المتجر الملكي", href: "/store" },
    { name: "السوق السيادي", href: "/marketplace" },
    { name: "نظام الضمان", href: "/middleman" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/90 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-10 flex-row-reverse">
        
        <Link href="/" className="flex items-center gap-4 group flex-row-reverse shrink-0">
          <div className="relative w-12 h-12 transition-transform group-hover:scale-110">
            <Image 
              src="https://chatgpt.com/s/m_6a2b55a8375c8191bed49391ecaef764" 
              alt="XMOOD Logo" 
              fill 
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="font-headline text-3xl font-bold tracking-tight gold-text">XMOOD STORE</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 flex-row-reverse shrink-0">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[12px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-zinc-400'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10 hover:bg-primary/10 transition-all">
            <Sparkles size={14} /> المساعد الذكي
          </Link>
        </div>

        <div className="flex items-center gap-5 flex-row-reverse shrink-0">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/10">
              <span className="text-sm font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={14} className="text-primary/60" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-11 px-8">
              <Link href="/login">بوابة الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-11 w-11 rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black">
                      {profile?.displayName?.charAt(0) || <UserIcon size={18} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-3 rounded-2xl bg-zinc-950 border-white/10 shadow-2xl" align="start">
                <DropdownMenuLabel className="p-5 text-right">
                  <p className="font-black text-white gold-text text-lg">{profile?.displayName}</p>
                  <p className="text-[10px] text-zinc-500 truncate mt-1">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="p-2 space-y-1">
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer text-primary font-black justify-end">
                      <Link href="/admin"><LayoutDashboard className="ml-3 w-4 h-4" /> لوحة الإدارة</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer justify-end font-bold text-zinc-300">
                    <Link href="/wallet"><Wallet className="ml-3 w-4 h-4" /> محفظتي السيادية</Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="p-2">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 cursor-pointer text-red-500 font-black justify-end">
                    <LogOut className="ml-3 w-4 h-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </div>
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
