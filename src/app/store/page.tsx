
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, LayoutGrid, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StorePage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, loading } = useCollection(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <header className="mb-24 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="text-right">
              <div className="flex items-center gap-3 text-primary mb-4 font-black tracking-[0.4em] uppercase text-[10px]">
                <Sparkles size={16} />
                <span>XMOOD Sovereign Catalog</span>
              </div>
              <h1 className="text-6xl font-headline font-bold gold-text leading-tight">مستودع الأصول الرقمية</h1>
              <p className="text-slate-500 text-xl font-light mt-4">تصفح أرقى الخدمات والباقات الرقمية المعتمدة سيادياً.</p>
            </div>
            
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-1 md:w-96">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن أصل رقمي..." 
                  className="pr-16 h-18 rounded-[1.5rem] border-primary/10 bg-zinc-900 text-white shadow-inner focus:ring-primary" 
                />
              </div>
              <Button variant="outline" className="h-18 w-18 rounded-[1.5rem] border-primary/10 bg-zinc-900 flex items-center justify-center p-0">
                <Filter className="w-6 h-6 text-primary/40" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "default" : "outline"}
              className={`rounded-full px-10 font-black h-12 text-sm uppercase tracking-widest ${selectedCategory === null ? 'bg-primary text-black' : 'border-primary/10 text-slate-500 hover:bg-primary/5'}`}
            >
              الكل
            </Button>
            {categories.map((cat) => (
              <Button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`rounded-full px-10 font-black h-12 text-sm uppercase tracking-widest ${selectedCategory === cat ? 'bg-primary text-black' : 'border-primary/10 text-slate-500 hover:bg-primary/5'}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-60">
            <Loader2 className="animate-spin text-primary" size={60} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-60 text-center luxury-card rounded-[4rem] border-dashed border-primary/10">
            <div className="text-primary/10 mb-10 flex justify-center">
              <Search size={120} />
            </div>
            <h3 className="text-4xl font-bold gold-text mb-4">لا توجد أصول متاحة</h3>
            <p className="text-slate-500 text-lg">لم نتمكن من العثور على أي باقات تطابق معاييرك حالياً.</p>
          </div>
        )}
      </div>
    </main>
  );
}
