"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { STORE_PRODUCTS } from "@/app/lib/mock-data";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(STORE_PRODUCTS.map(p => p.category)));
  
  const filteredProducts = STORE_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <header className="mb-16 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary mb-2 font-bold tracking-widest uppercase text-xs">
                <LayoutGrid size={16} />
                <span>XMOOD Official Catalog</span>
              </div>
              <h1 className="text-5xl font-headline font-bold mb-3">متجر الخدمات الرقمية</h1>
              <p className="text-muted-foreground text-lg max-w-xl font-light">تصفح أفضل باقات الشحن للألعاب العالمية والخدمات الرقمية الحصرية.</p>
            </div>
            
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن شدات، جواهر، أو نقاط..." 
                  className="pr-12 h-14 rounded-2xl border-slate-100 bg-slate-50 shadow-inner focus:ring-primary" 
                />
              </div>
              <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 bg-slate-50 flex items-center justify-center p-0">
                <Filter className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "default" : "outline"}
              className={`rounded-full px-6 font-bold h-10 ${selectedCategory === null ? 'bg-primary' : 'border-slate-100 text-slate-500'}`}
            >
              الكل
            </Button>
            {categories.map((cat) => (
              <Button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`rounded-full px-6 font-bold h-10 ${selectedCategory === cat ? 'bg-primary' : 'border-slate-100 text-slate-500'}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="text-slate-200 mb-4 flex justify-center">
                <Search size={64} />
              </div>
              <h3 className="text-2xl font-bold text-slate-400">لم نجد ما تبحث عنه</h3>
              <p className="text-slate-400 text-sm">حاول البحث بكلمات أخرى أو اختر فئة مختلفة</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
