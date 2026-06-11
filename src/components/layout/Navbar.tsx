
"use client";

import Link from "next/link";
import { User, Wallet, LayoutDashboard, ShoppingBag, MessageSquare, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-primary">EXIGO</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
          <Link href="/store" className="text-sm font-medium hover:text-primary transition-colors">المتجر</Link>
          <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">السوق</Link>
          <Link href="/middleman" className="text-sm font-medium hover:text-primary transition-colors">الوساطة</Link>
          <Link href="/forum" className="text-sm font-medium hover:text-primary transition-colors">المنتدى</Link>
          <Link href="/concierge" className="flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80">
            <Cpu className="w-4 h-4" /> المساعد الذكي
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">المحفظة</span>
            <div className="flex items-center gap-1 font-bold text-primary">
              <Wallet className="w-4 h-4" />
              <span>$450.00</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="icon" title="لوحة التحكم">
                <LayoutDashboard className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold">
              دخول
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
