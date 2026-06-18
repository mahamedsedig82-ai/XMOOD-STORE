"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Zap, ArrowDownWideNarrow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StorePage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"));
  }, [db]);

  const { data: rawProducts, loading } = useCollection(productsQuery);

  const categories = useMemo(() => {
    if (!rawProducts) return [];
    return Array.from(new Set(rawProducts.map(p => p.category))).filter(Boolean);
  }, [rawProducts]);
  
  const filteredProducts = useMemo(() => {
    if (!rawProducts) return [];
    return rawProducts
      .filter(p => {
        const title = (p.name || "").toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
  }, [rawProducts, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container py-32">
        <header className="mb-16 md:mb-24 space-y-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="text-right">
              <Badge className="bg-primary/10 text-primary border-primary/15 px-6 py-1.5 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest mb-6 shadow-sm">
                Sovereign Digital Assets Repository
              </Badge>
              <h1 className="text-4xl md:text-8xl font-headline font-black gold-text leading-tight tracking-tighter">المستودع الرقمي</h1>
              <div className="flex items-center gap-2 text-zinc-500 mt-4 text-[10px] font-black uppercase tracking-widest bg-muted/40 px-5 py-2 rounded-xl w-fit">
                 <ArrowDownWideNarrow size={16} className="text-primary" /> فرز آلي حسب القيمة
              </div>
            </div>
            
            <div className="w-full lg:w-auto">
              <div className="relative group w-full lg:w-[450px]">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-primary transition-all" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن باقة أو خدمة..." 
                  className="pr-16 h-16 md:h-20 rounded-2xl md:rounded-3xl border-primary/10 bg-card text-lg md:text-xl shadow-xl focus:ring-primary/15 transition-all font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-8 border-t border-border/40">
            <Button 
              onClick={() => setSelectedCategory(null)}
              className={`rounded-xl px-8 h-12 font-black text-[9px] uppercase tracking-widest transition-all ${selectedCategory === null ? 'bg-primary text-black shadow-lg shadow-primary/15 scale-105' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              كافة الأصول الرقمية
            </Button>
            {categories.map((cat) => (
              <Button 
                key={String(cat)}
                onClick={() => setSelectedCategory(String(cat))}
                className={`rounded-xl px-8 h-12 font-black text-[9px] uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-primary text-black shadow-lg shadow-primary/15 scale-105' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {String(cat)}
              </Button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <Loader2 className="animate-spin text-primary" size={60} />
            <p className="font-black text-zinc-500 uppercase tracking-widest text-[9px]">Synchronizing with Central Repository...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center luxury-card border-dashed border-primary/15 bg-primary/5 flex flex-col items-center">
            <Zap size={100} className="text-zinc-200 mb-8 opacity-40 animate-pulse" />
            <h3 className="text-3xl font-black gold-text mb-4 uppercase tracking-tighter">لم يتم العثور على نتائج</h3>
            <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto px-6 leading-relaxed">
              نواة البحث لم تجد أصولاً مطابقة حالياً. يرجى تجربة كلمات أخرى.
            </p>
            <Button onClick={() => { setSearchTerm(""); setSelectedCategory(null); }} variant="outline" className="mt-8 h-12 rounded-xl border-primary/15 font-black uppercase text-[9px] tracking-widest">
               إعادة ضبط البحث
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}