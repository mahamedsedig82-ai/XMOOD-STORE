"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useFirestore } from "@/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StorePage() {
  const db = useFirestore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-7xl">
        <header className="mb-24 space-y-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="text-right">
              <div className="flex items-center gap-3 text-primary mb-6 font-black tracking-[0.4em] uppercase text-[10px]">
                <Zap size={16} className="animate-pulse" />
                <span>مركز الأصول الرقمية المعتمدة</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-headline font-black gold-text leading-tight">مستودع الخدمات</h1>
              <p className="text-zinc-500 text-xl font-medium mt-6 max-w-2xl leading-relaxed">اكتشف أرقى باقات الشحن والخدمات الرقمية الموثوقة والمجهزة للتسليم الفوري.</p>
            </div>
            
            <div className="flex w-full lg:w-auto gap-4">
              <div className="relative flex-1 lg:w-[450px] group">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-primary transition-all" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن باقة أو خدمة..." 
                  className="pr-16 h-20 rounded-3xl border-border/50 bg-card text-xl shadow-xl focus:ring-primary/20" 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6 border-t border-border/50">
            <Button 
              onClick={() => setSelectedCategory(null)}
              className={`rounded-2xl px-10 h-14 font-black text-xs uppercase tracking-widest transition-all ${selectedCategory === null ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            >
              كافة الخدمات
            </Button>
            {categories.map((cat) => (
              <Button 
                key={String(cat)}
                onClick={() => setSelectedCategory(String(cat))}
                className={`rounded-2xl px-10 h-14 font-black text-xs uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                {String(cat)}
              </Button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60 gap-6">
            <Loader2 className="animate-spin text-primary" size={80} />
            <p className="font-black text-zinc-500 uppercase tracking-widest text-xs">جاري جلب البيانات من المركز...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-60 text-center luxury-card border-dashed border-border flex flex-col items-center">
            <div className="text-zinc-200 dark:text-zinc-800 mb-10">
              <Search size={140} />
            </div>
            <h3 className="text-4xl font-black gold-text mb-4">لا توجد أصول مطابقة</h3>
            <p className="text-zinc-500 text-lg font-medium">لم نتمكن من العثور على أي نتائج لبحثك الحالي.</p>
          </div>
        )}
      </div>
    </main>
  );
}