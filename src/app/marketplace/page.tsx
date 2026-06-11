"use client";

import { Navbar } from "@/components/layout/Navbar";
import { MARKETPLACE_PRODUCTS } from "@/app/lib/mock-data";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-primary mb-4">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-sm font-bold tracking-widest uppercase">XMOOD P2P MARKET</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-2">سوق المستخدمين</h1>
              <p className="text-muted-foreground">تداول الحسابات والخدمات مع مستخدمين آخرين تحت إشرافنا</p>
            </div>
            
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="ابحث في سوق المستخدمين..." className="pr-10 h-12 rounded-xl bg-white border-none shadow-sm" />
              </div>
              <Button variant="outline" className="gap-2 h-12 rounded-xl bg-white border-none shadow-sm">
                <Filter className="w-4 h-4" /> تصفية
              </Button>
            </div>
          </div>
        </header>

        {MARKETPLACE_PRODUCTS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {MARKETPLACE_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-20 text-center border shadow-sm">
            <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold mb-2">السوق فارغ حالياً</h3>
            <p className="text-muted-foreground">لا توجد عروض نشطة في سوق المستخدمين في الوقت الحالي.</p>
          </div>
        )}
      </div>
    </main>
  );
}