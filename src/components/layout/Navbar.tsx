"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, ShieldCheck, Cpu, LogOut, User as UserIcon, Sparkles } from "lucide-react";
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
    { name: "المتجر الرئيسي", href: "/store" },
    { name: "سوق المنصة", href: "/marketplace" },
    { name: "خدمات الوساطة", href: "/middleman" },
    { name: "المجتمع", href: "/forum" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/5 bg-white/80 backdrop-blur-2xl h-24">
      <div className="container mx-auto px-4 h-full flex items-center justify-between flex-row-reverse">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group flex-row-reverse">
          <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-500 group-hover:rotate-3">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-end">
            <span className="font-headline text-2xl md:text-3xl font-bold tracking-tighter text-primary leading-none mb-1">XMOOD</span>
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/60 leading-none">Luxury Store</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10 flex-row-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-bold tracking-wide transition-all hover:text-primary relative py-2 ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />
              )}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-3 text-sm font-bold text-primary hover:opacity-80 transition-all flex-row-reverse bg-primary/10 px-6 py-3 rounded-2xl border border-primary/10 shadow-sm hover:shadow-primary/5">
            <Sparkles size={18} className="animate-pulse" /> المساعد الذكي
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-8 flex-row-reverse">
          {user && profile && (
            <Link href="/wallet" className="hidden sm:flex flex-col items-end group transition-all">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold group-hover:text-primary transition-colors mb-1">الرصيد المتاح</span>
              <div className="flex items-center gap-3 text-primary font-bold">
                <span className="text-xl tracking-tight">{formatUSD(profile.walletBalance || 0)}</span>
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Wallet size={16} />
                </div>
              </div>
            </Link>
          )}
          
          <div className="flex items-center gap-4">
            {!user ? (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-10 h-12 shadow-2xl shadow-primary/10 transition-all text-base">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
            ) : (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-14 w-14 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all p-0 overflow-hidden shadow-lg group">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-base font-bold">
                        {user.displayName?.charAt(0) || <UserIcon size={24} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 mt-6 p-3 rounded-[2rem] border-primary/10 shadow-3xl" align="start">
                  <DropdownMenuLabel className="font-normal p-5">
                    <div className="flex flex-col space-y-2 text-right">
                      <p className="text-lg font-bold leading-none text-foreground">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground tracking-tight">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/5 mx-2" />
                  <div className="p-2 space-y-1">
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem asChild className="cursor-pointer justify-end font-bold text-primary p-4 rounded-2xl focus:bg-primary/10">
                        <Link href="/admin"><LayoutDashboard className="ml-4 h-5 w-5" /> لوحة الإدارة العامة</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer justify-end font-medium p-4 rounded-2xl focus:bg-primary/5">
                      <Link href="/wallet"><Wallet className="ml-4 h-5 w-5" /> محفظتي الإلكترونية</Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-primary/5 mx-2" />
                  <div className="p-2">
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer justify-end text-destructive font-bold p-4 rounded-2xl focus:bg-destructive/10">
                      <LogOut className="ml-4 h-5 w-5" /> تسجيل الخروج الآمن
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
