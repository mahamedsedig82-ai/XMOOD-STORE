"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, ShieldCheck, Cpu, LogIn, LogOut, User as UserIcon } from "lucide-react";
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
import { formatUSD, formatSDG } from "@/lib/currency";

export function Navbar() {
  const { user, profile, loading } = useUser();
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
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between flex-row-reverse">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-row-reverse">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-primary/90 transition-all">
            <ShieldCheck size={20} />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-primary">EXIGO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 flex-row-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-bold transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-1.5 text-sm font-bold text-primary/80 hover:text-primary transition-colors flex-row-reverse">
            <Cpu size={16} /> المساعد الذكي
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-5 flex-row-reverse">
          {user && profile && (
            <Link href="/wallet" className="hidden sm:flex flex-col items-end group border-l pl-5">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-primary transition-colors">المحفظة</span>
              <div className="flex items-center gap-1 text-primary font-bold">
                <span className="text-sm">{formatUSD(profile.walletBalance || 0)}</span>
                <Wallet size={14} />
              </div>
              <span className="text-[8px] text-muted-foreground/60">{formatSDG(profile.walletBalance || 0)}</span>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            {!user ? (
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-full px-6 h-10">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
            ) : (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {user.displayName?.charAt(0) || <UserIcon size={18} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="start">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 text-right">
                      <p className="text-sm font-bold leading-none">{user.displayName}</p>
                      <p className="text-[10px] leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer justify-end font-bold text-primary">
                      <Link href="/admin"><LayoutDashboard className="ml-2 h-4 w-4" /> لوحة التحكم</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer justify-end font-medium">
                    <Link href="/wallet"><Wallet className="ml-2 h-4 w-4" /> المحفظة</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer justify-end text-destructive font-medium">
                    <LogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
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