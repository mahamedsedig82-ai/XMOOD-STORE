
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, ShieldCheck, Cpu, LogOut, User as UserIcon } from "lucide-react";
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
    { name: "المتجر", href: "/store" },
    { name: "السوق", href: "/marketplace" },
    { name: "الوساطة", href: "/middleman" },
    { name: "المنتدى", href: "/forum" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/5 bg-white/80 backdrop-blur-xl h-24">
      <div className="container mx-auto px-4 h-full flex items-center justify-between flex-row-reverse">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-row-reverse">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
            <ShieldCheck size={24} strokeWidth={2} />
          </div>
          <span className="font-headline text-3xl font-bold tracking-tighter text-primary">EXIGO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10 flex-row-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-bold tracking-wide transition-all hover:text-primary relative py-1 ${pathname === link.href ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : 'text-muted-foreground'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity flex-row-reverse bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Cpu size={16} /> المساعد الذكي
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6 flex-row-reverse">
          {user && profile && (
            <Link href="/wallet" className="hidden sm:flex flex-col items-end group">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-primary transition-colors mb-0.5">الرصيد</span>
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="text-lg">{formatUSD(profile.walletBalance || 0)}</span>
                <Wallet size={16} />
              </div>
            </Link>
          )}
          
          <div className="flex items-center gap-4">
            {!user ? (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-8 h-11 shadow-lg shadow-primary/10 transition-all">
                <Link href="/login">دخول</Link>
              </Button>
            ) : (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all p-0 overflow-hidden shadow-sm">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                        {user.displayName?.charAt(0) || <UserIcon size={20} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-4 p-2 rounded-2xl border-primary/10" align="start">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2 text-right">
                      <p className="text-base font-bold leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer justify-end font-bold text-primary p-3 rounded-xl focus:bg-primary/5">
                      <Link href="/admin"><LayoutDashboard className="ml-3 h-5 w-5" /> لوحة التحكم</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer justify-end font-medium p-3 rounded-xl focus:bg-primary/5">
                    <Link href="/wallet"><Wallet className="ml-3 h-5 w-5" /> المحفظة</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer justify-end text-destructive font-bold p-3 rounded-xl focus:bg-destructive/5">
                    <LogOut className="ml-3 h-5 w-5" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
