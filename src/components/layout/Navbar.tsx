
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-primary">EXIGO</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 space-x-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80">
            <Cpu className="w-4 h-4" /> المساعد الذكي
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && profile && (
            <Link href="/wallet" className="hidden sm:flex flex-col items-end group">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">المحفظة</span>
              <div className="flex items-center gap-1 font-bold text-primary">
                <Wallet className="w-4 h-4" />
                <span>${profile.walletBalance?.toFixed(2) || "0.00"}</span>
              </div>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            {!user ? (
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-full px-6">
                <Link href="/login">دخول</Link>
              </Button>
            ) : (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.displayName?.charAt(0) || <UserIcon size={20} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 text-right">
                      <p className="text-sm font-bold leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer justify-end">
                      <Link href="/admin"><LayoutDashboard className="ml-2 h-4 w-4" /> لوحة التحكم</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer justify-end">
                    <Link href="/wallet"><Wallet className="ml-2 h-4 w-4" /> المحفظة</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer justify-end text-destructive">
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
