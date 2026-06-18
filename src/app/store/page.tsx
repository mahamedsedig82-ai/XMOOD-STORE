"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Zap, ArrowDownWideNarrow, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StorePage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 🛡️ الاستعلام السيادي: تم تحسينه ليكون أكثر استقراراً وشمولية
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    // تم إلغاء الترتيب الإلزامي مؤقتاً لضمان ظهور كافة العروض حتى التي لا تحتوي على تاريخ
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
        const category = (p.category || "").toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => (a.price || 0) - (b.price || 0)); // ترتيب محلي نقي لضمان الظهور
  }, [rawProducts, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-7xl">
        <header className="mb-24 space-y-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="text-right">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-8 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] mb-6 shadow-sm">
                Sovereign Digital Assets Repository
              </Badge>
              <h1 className="text-6xl md:text-9xl font-headline font-black gold-text leading-tight tracking-tighter">المستودع الرقمي</h1>
              <div className="flex items-center gap-3 text-zinc-500 mt-6 text-sm font-black uppercase tracking-widest bg-muted/30 px-6 py-3 rounded-2xl w-fit">
                 <ArrowDownWideNarrow size={18} className="text-primary" /> فرز آلي حسب القيمة الاقتصادية
              </div>
            </div>
            
            <div className="flex w-full lg:w-auto gap-4">
              <div className="relative flex-1 lg:w-[550px] group">
                <Search className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-zinc-400 group-focus-within:text-primary transition-all duration-500" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن باقة، خدمة، أو كود تفعيل..." 
                  className="pr-20 h-24 rounded-[2.5rem] border-primary/10 bg-card text-2xl shadow-2xl focus:ring-primary/20 transition-all font-black" 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-10 border-t border-border/50">
            <Button 
              onClick={() => setSelectedCategory(null)}
              className={`rounded-2xl px-10 h-16 font-black text-xs uppercase tracking-widest transition-all duration-500 ${selectedCategory === null ? 'bg-primary text-black shadow-2xl shadow-primary/20 scale-105' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            >
              كافة الأصول الرقمية
            </Button>
            {categories.map((cat) => (
              <Button 
                key={String(cat)}
                onClick={() => setSelectedCategory(String(cat))}
                className={`rounded-2xl px-10 h-16 font-black text-xs uppercase tracking-widest transition-all duration-500 ${selectedCategory === cat ? 'bg-primary text-black shadow-2xl shadow-primary/20 scale-105' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                {String(cat)}
              </Button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60 gap-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <Loader2 className="animate-spin text-primary relative z-10" size={100} />
            </div>
            <p className="font-black text-zinc-500 uppercase tracking-[0.5em] text-xs">Synchronizing with Central Repository...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 md:gap-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-60 text-center luxury-card border-dashed border-primary/20 bg-primary/5 flex flex-col items-center animate-fade-in">
            <div className="text-zinc-200 dark:text-zinc-800 mb-12 opacity-30">
              <Zap size={180} className="animate-pulse" />
            </div>
            <h3 className="text-5xl font-black gold-text mb-6 uppercase tracking-tighter">لم يتم العثور على أصول</h3>
            <p className="text-zinc-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              نواة البحث الحالية لم تجد نتائج مطابقة. يرجى تجربة كلمات بحث أخرى أو العودة لاحقاً للمخزون المحدث.
            </p>
            <Button onClick={() => { setSearchTerm(""); setSelectedCategory(null); }} variant="outline" className="mt-12 h-14 rounded-2xl border-primary/20 font-black uppercase text-[10px] tracking-widest">
               إعادة ضبط البحث
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}