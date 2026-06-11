"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LayoutDashboard, ShieldCheck, Sparkles, LogOut, User as UserIcon, Search, ShoppingCart, Menu } from "lucide-react";
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
    { name: "السوق", href: "/marketplace" },
    { name: "الوساطة", href: "/middleman" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8 flex-row-reverse">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-row-reverse shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-primary">XMOOD</span>
        </Link>

        {/* Search Bar - Main Store Style */}
        <div className="hidden lg:flex flex-1 max-w-xl relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن شدات، حسابات، أو خدمات..." 
            className="w-full pr-10 h-11 bg-slate-50 border-none rounded-full focus-visible:ring-primary/20 text-sm"
          />
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 flex-row-reverse shrink-0">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-bold transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-slate-600'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10 hover:bg-primary/10 transition-colors">
            <Sparkles size={14} /> المساعد الذكي
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 flex-row-reverse shrink-0">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border">
              <span className="text-sm font-bold text-primary">{formatUSD(profile.walletBalance || 0)}</span>
              <Wallet size={16} className="text-slate-400" />
            </div>
          )}

          {!user ? (
            <Button asChild className="rounded-full px-6 font-bold shadow-md">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 rounded-full overflow-hidden border shadow-sm">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.displayName?.charAt(0) || <UserIcon size={18} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl border-none shadow-2xl" align="start">
                <DropdownMenuLabel className="p-4">
                  <p className="font-bold text-slate-900">{user.displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1">
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer text-primary font-bold focus:bg-primary/5">
                      <Link href="/admin"><LayoutDashboard className="ml-3 w-4 h-4" /> لوحة الإدارة</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer focus:bg-slate-50">
                    <Link href="/wallet"><Wallet className="ml-3 w-4 h-4" /> محفظتي</Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 cursor-pointer text-destructive focus:bg-destructive/5 font-bold">
                    <LogOut className="ml-3 w-4 h-4" /> خروج
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </div>
      </div>
    </nav>
  );
}