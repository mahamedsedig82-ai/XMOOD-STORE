
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  LogOut, 
  Zap, 
  Menu,
  ArrowRightLeft,
  Home,
  Store,
  Users,
  ShieldCheck,
  ChevronDown,
  X,
  Palette,
  User as UserIcon
} from "lucide-react";
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
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "المتجر", href: "/store", icon: Store },
    { name: "المعرض", href: "/designs/gallery", icon: Palette },
    { name: "المجتمع", href: "/marketplace", icon: Users },
    { name: "الوساطة", href: "/middleman", icon: ShieldCheck },
  ];

  const siteTitle = siteSettings?.siteInfo?.title || "XMOOD STORE";
  const isAdmin = ['owner', 'admin', 'gm', 'store_manager', 'design_manager', 'designer', 'accountant'].includes(profile?.role || '');

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-3xl shadow-2xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between flex-row-reverse">
        
        <Link href="/" className="flex flex-col items-end group">
          <span className="decorative-logo text-2xl group-hover:scale-105 transition-transform">{siteTitle}</span>
          <span className="text-[7px] font-black tracking-[0.4em] text-red-600 uppercase opacity-60">Enterprise System</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 flex-row-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary border-b-2 border-primary pb-1' : 'text-zinc-500'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-[9px] font-black uppercase text-red-500 bg-red-600/5 px-4 py-1.5 rounded-full border border-red-600/10 hover:bg-red-600/10 transition-all">
            <Sparkles size={12} /> المحلل الذكي
          </Link>
        </div>

        <div className="flex items-center gap-4 flex-row-reverse">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 px-4 py-1.5 rounded-xl border border-primary/20 shadow-xl">
              <span className="text-lg font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={14} className="text-red-600" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-10 px-6 text-[9px]">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-10 w-10 rounded-xl overflow-hidden border border-primary/30 hover:border-primary transition-all relative">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-zinc-950 text-primary font-black text-lg">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary text-black rounded-tl-sm p-0.5"><ChevronDown size={6} /></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-2 rounded-[2rem] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 p-3" align="start">
                <DropdownMenuLabel className="p-4 text-right bg-white/5 rounded-2xl mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="border-primary/20 text-primary text-[6px] px-2 py-0.5 rounded-full uppercase">{profile?.role}</Badge>
                    <p className="text-[8px] text-zinc-500 uppercase">ID: {user.uid.substring(0,6)}</p>
                  </div>
                  <p className="font-headline text-xl font-bold gold-text">{profile?.displayName || "عضو سيادي"}</p>
                </DropdownMenuLabel>
                
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer justify-end font-bold text-zinc-400 hover:text-primary transition-all">
                    <Link href="/wallet" className="flex items-center w-full justify-end">
                      <span className="ml-3 text-xs">المحفظة والملف</span>
                      <Wallet size={16} className="text-red-600" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer justify-end font-bold text-zinc-400 hover:text-primary transition-all">
                    <Link href="/wallet/transfer" className="flex items-center w-full justify-end">
                      <span className="ml-3 text-xs">تحويل الرصيد</span>
                      <ArrowRightLeft size={16} className="text-amber-500" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/5 my-2" />

                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer text-primary font-black justify-end bg-primary/5 hover:bg-primary/20 border border-primary/10">
                    <Link href="/admin" className="flex items-center w-full justify-end">
                      <span className="ml-3 text-[10px] uppercase">لوحة الإدارة PRO</span>
                      <LayoutDashboard size={16} />
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 cursor-pointer text-red-600 font-bold justify-end hover:bg-red-600/10 transition-all">
                  <span className="ml-3 text-xs">خروج سيادي</span>
                  <LogOut size={16} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary h-10 w-10 bg-white/5 rounded-xl border border-white/5">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black border-l border-white/10 p-0 text-white flex flex-col h-full">
              <SheetHeader className="p-8 border-b border-white/5 bg-zinc-950 flex flex-row items-center justify-between">
                <SheetTitle className="text-right">
                  <span className="decorative-logo text-2xl">{siteTitle}</span>
                </SheetTitle>
                <SheetClose className="text-zinc-500"><X size={24}/></SheetClose>
              </SheetHeader>
              
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] pr-2 mb-4">قائمة التنقل</p>
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link href={link.href} className={`flex items-center flex-row-reverse gap-5 p-4 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                          <link.icon size={20} /><span className="font-bold text-sm">{link.name}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {user && (
                <div className="p-8 border-t border-white/5 bg-zinc-950 mt-auto">
                  <Button variant="ghost" onClick={handleSignOut} className="w-full h-14 rounded-2xl text-red-600 hover:bg-red-600/10 gap-4 font-bold text-sm flex flex-row-reverse items-center justify-center border border-red-600/20 shadow-2xl">
                    <LogOut size={20} /> تسجيل الخروج
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
