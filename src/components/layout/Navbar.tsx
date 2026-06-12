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

  const logoUrl = "https://chatgpt.com/s/m_6a2b55a8375c8191bed49391ecaef764";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-2xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between gap-10 flex-row-reverse">
        
        <Link href="/" className="flex items-center gap-5 group flex-row-reverse shrink-0">
          <div className="relative w-16 h-16 transition-transform group-hover:scale-110 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(255,184,0,0.2)] bg-zinc-900 flex items-center justify-center">
            <Image 
              src={logoUrl} 
              alt="XMOOD Logo" 
              fill 
              className="object-cover rounded-full"
              unoptimized
              onError={(e) => {
                // Fallback handled by the container if image fails
              }}
            />
            <span className="font-handwriting text-2xl font-bold text-primary relative z-10 pointer-events-none">XM</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-headline text-3xl font-bold tracking-tighter gold-text leading-none">XMOOD</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Sovereign Store</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10 flex-row-reverse shrink-0">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[12px] font-black uppercase tracking-[0.25em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-zinc-400'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary bg-primary/10 px-6 py-3 rounded-full border border-primary/20 hover:bg-primary/20 transition-all shadow-lg shadow-primary/5">
            <Sparkles size={16} /> المساعد الذكي
          </Link>
        </div>

        <div className="flex items-center gap-6 flex-row-reverse shrink-0">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-4 bg-primary/10 px-6 py-2.5 rounded-full border border-primary/20 shadow-inner">
              <span className="text-lg font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={16} className="text-primary animate-pulse" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-14 px-10 text-base">
              <Link href="/login">بوابة الدخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-14 w-14 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-all shadow-xl">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-zinc-900 text-primary font-black text-xl">
                      {profile?.displayName?.charAt(0) || <UserIcon size={24} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 rounded-3xl bg-zinc-950 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] p-2" align="start">
                <DropdownMenuLabel className="p-6 text-right">
                  <p className="font-black text-white gold-text text-xl mb-1">{profile?.displayName}</p>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{profile?.label}</p>
                  <p className="text-[9px] text-zinc-600 truncate mt-2">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mx-4" />
                <div className="p-3 space-y-2">
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer text-primary font-black justify-end hover:bg-primary/5">
                      <Link href="/admin"><LayoutDashboard className="ml-4 w-5 h-5" /> لوحة الإدارة</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-300 hover:bg-white/5">
                    <Link href="/wallet"><Wallet className="ml-4 w-5 h-5" /> محفظتي السيادية</Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-white/5 mx-4" />
                <div className="p-3">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl p-4 cursor-pointer text-red-500 font-black justify-end hover:bg-red-500/5">
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