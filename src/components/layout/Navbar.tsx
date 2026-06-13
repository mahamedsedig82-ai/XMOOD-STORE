
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  Zap, 
  Menu,
  ShoppingBag,
  ArrowRightLeft,
  Settings,
  MessageSquare,
  Activity,
  UserCircle,
  Home,
  Store,
  Users,
  ShieldCheck,
  MoreVertical,
  ChevronDown
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
    { name: "السوق الاجتماعي", href: "/marketplace", icon: Users },
    { name: "الوساطة المضمونة", href: "/middleman", icon: ShieldCheck },
  ];

  const siteTitle = siteSettings?.siteInfo?.title || "XMOOD PRO";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-3xl shadow-2xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between flex-row-reverse">
        
        {/* Brand Section */}
        <Link href="/" className="flex flex-col items-end group">
          <span className="decorative-logo text-3xl group-hover:scale-105 transition-transform">{siteTitle}</span>
          <span className="text-[8px] font-bold tracking-[0.4em] text-red-600 uppercase opacity-60">Sovereign Experience</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10 flex-row-reverse">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-zinc-500'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/concierge" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-red-500 bg-red-600/5 px-6 py-2 rounded-full border border-red-600/10 hover:bg-red-600/10 transition-all">
            <Sparkles size={14} /> المحلل الذكي
          </Link>
        </div>

        {/* User Section & Mobile Menu */}
        <div className="flex items-center gap-4 flex-row-reverse">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-3 bg-zinc-900 px-5 py-2 rounded-xl border border-primary/20 shadow-xl">
              <span className="text-xl font-black text-primary tracking-tighter">{formatUSD(profile.walletBalance || 0)}</span>
              <Zap size={16} className="text-red-600" />
            </div>
          )}

          {!user ? (
            <Button asChild className="royal-button h-12 px-8 text-[10px]">
              <Link href="/login">دخول</Link>
            </Button>
          ) : (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-12 w-12 rounded-xl overflow-hidden border border-primary/30 hover:border-primary transition-all shadow-xl group relative">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={profile?.photoURL} alt={user.displayName || ""} />
                    <AvatarFallback className="bg-zinc-950 text-primary font-black text-xl">
                      {profile?.displayName?.charAt(0) || <UserIcon size={20} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary text-black rounded-tl-md p-0.5">
                    <ChevronDown size={8} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 mt-4 rounded-[2.5rem] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] p-4" align="start">
                <DropdownMenuLabel className="p-6 text-right bg-white/5 rounded-3xl mb-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-primary/20 text-primary text-[7px] px-3 py-0.5 rounded-full uppercase font-black">{profile?.label || "عضو بريميوم"}</Badge>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">معرف: {user.uid.substring(0,8)}</p>
                  </div>
                  <p className="font-headline text-2xl font-bold gold-text leading-none">{profile?.displayName}</p>
                </DropdownMenuLabel>
                
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/wallet" className="flex items-center w-full justify-end">
                      <span className="ml-3">المحفظة الشخصية</span>
                      <Wallet className="w-5 h-5 text-red-600" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/wallet/transfer" className="flex items-center w-full justify-end">
                      <span className="ml-3">تحويل الأموال</span>
                      <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/5 my-4" />

                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer justify-end font-bold text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all group">
                    <Link href="/designs/request" className="flex items-center w-full justify-end">
                      <span className="ml-3">طلب تصميم</span>
                      <ShoppingBag className="w-5 h-5 text-blue-500" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {['owner', 'admin', 'gm', 'design_manager', 'designer'].includes(profile?.role || '') && (
                  <>
                    <DropdownMenuSeparator className="bg-white/5 my-4" />
                    <DropdownMenuItem asChild className="rounded-2xl p-4 cursor-pointer text-primary font-black justify-end bg-primary/5 hover:bg-primary/20 transition-all border border-primary/10">
                      <Link href="/admin" className="flex items-center w-full justify-end">
                        <span className="ml-3">لوحة التحكم PRO</span>
                        <LayoutDashboard className="w-5 h-5" />
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-white/5 my-4" />
                
                <DropdownMenuItem onClick={handleSignOut} className="rounded-2xl p-4 cursor-pointer text-red-600 font-bold justify-end hover:bg-red-600/10 transition-all group">
                  <span className="ml-3">تسجيل الخروج</span>
                  <LogOut className="w-5 h-5" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile Sheet Menu (3 Lines) */}
          <Sheet dir="rtl">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-primary h-12 w-12 bg-white/5 rounded-xl border border-white/5">
                <Menu size={28} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-black border-l border-white/10 p-0 text-white flex flex-col h-full">
              <SheetHeader className="p-8 border-b border-white/5 bg-zinc-950">
                <SheetTitle className="text-right">
                  <span className="decorative-logo text-2xl">{siteTitle}</span>
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                  {user && profile && (
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-right space-y-4">
                      <div className="flex items-center gap-4 flex-row-reverse">
                        <Avatar className="w-16 h-16 border-2 border-primary/20">
                          <AvatarImage src={profile.photoURL} />
                          <AvatarFallback className="bg-zinc-900 text-primary font-bold">{profile.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg gold-text">{profile.displayName}</p>
                          <Badge variant="outline" className="border-primary/20 text-primary text-[8px] uppercase">{profile.label || "عضو"}</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl">
                        <span className="text-xs font-bold text-zinc-500">الرصيد</span>
                        <span className="text-xl font-black text-primary">{formatUSD(profile.walletBalance || 0)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] pr-4 mb-4">التنقل الرئيسي</p>
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link 
                          href={link.href} 
                          className={`flex items-center flex-row-reverse gap-4 p-4 rounded-2xl transition-all ${pathname === link.href ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-400 hover:bg-white/5'}`}
                        >
                          <link.icon size={20} />
                          <span className="font-bold text-sm">{link.name}</span>
                        </Link>
                      </SheetClose>
                    ))}
                    <SheetClose asChild>
                      <Link href="/concierge" className="flex items-center flex-row-reverse gap-4 p-4 rounded-2xl text-red-500 bg-red-600/5 border border-red-600/10">
                        <Sparkles size={20} />
                        <span className="font-bold text-sm">المحلل الذكي</span>
                      </Link>
                    </SheetClose>
                  </div>

                  {user && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] pr-4 mb-4">حسابي والعمليات</p>
                      <SheetClose asChild>
                        <Link href="/wallet" className="flex items-center flex-row-reverse gap-4 p-4 rounded-2xl text-zinc-400 hover:bg-white/5">
                          <Wallet size={20} className="text-red-600" />
                          <span className="font-bold text-sm">المحفظة</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/wallet/transfer" className="flex items-center flex-row-reverse gap-4 p-4 rounded-2xl text-zinc-400 hover:bg-white/5">
                          <ArrowRightLeft size={20} className="text-amber-500" />
                          <span className="font-bold text-sm">تحويل الأموال</span>
                        </Link>
                      </SheetClose>
                      {['owner', 'admin', 'gm', 'design_manager', 'designer'].includes(profile?.role || '') && (
                        <SheetClose asChild>
                          <Link href="/admin" className="flex items-center flex-row-reverse gap-4 p-4 rounded-2xl text-primary bg-primary/5 border border-primary/10">
                            <LayoutDashboard size={20} />
                            <span className="font-bold text-sm">لوحة الإدارة PRO</span>
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {user && (
                <div className="p-8 border-t border-white/5 bg-zinc-950 mt-auto">
                  <Button 
                    variant="ghost" 
                    onClick={() => { handleSignOut(); }}
                    className="w-full h-16 rounded-2xl text-red-600 hover:bg-red-600/10 gap-4 font-bold text-sm flex flex-row-reverse items-center justify-center border border-red-600/20"
                  >
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
