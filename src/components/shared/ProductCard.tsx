
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, AlertCircle, Edit, Star, ShoppingBag } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { profile, isAdmin } = useUser();
  const db = useFirestore();
  const { addItem } = useCart();

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);
  const currentRate = config?.siteInfo?.usdRate || 5400;

  const isOutOfStock = product.status === 'out_of_stock' || product.stock <= 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      category: product.category
    });
  };

  const highlights = product.highlights ? product.highlights.split('\n').filter((h: string) => h.trim() !== "") : [];
  
  const officialPlaceholder = "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png";

  return (
    <Card className={`luxury-card flex flex-col group h-full ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}>
      <CardHeader className="p-4 relative aspect-video bg-muted overflow-hidden">
        <div className="relative w-full h-full overflow-hidden rounded-[1.5rem]">
          <Image 
            src={product.imageUrl || officialPlaceholder} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <Badge className={`absolute top-6 right-6 font-black text-[8px] px-3 py-1 rounded-full border-none shadow-2xl uppercase tracking-widest ${isOutOfStock ? 'bg-zinc-600 text-white' : 'bg-primary text-black'}`}>
          {isOutOfStock ? 'نفد المخزون' : 'باقة معتمدة'}
        </Badge>

        {isAdmin && (
          <Button asChild variant="secondary" className="absolute top-6 left-6 h-8 w-8 rounded-lg p-0 glass-morphism z-20">
            <Link href={`/admin/products`}><Edit size={14} className="text-primary" /></Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-[8px] uppercase font-black text-muted-foreground tracking-[0.2em] block mb-1">{product.category}</span>
          <CardTitle className="text-lg md:text-xl font-bold group-hover:gold-text transition-colors leading-tight line-clamp-2">
            {product.name}
          </CardTitle>
        </div>

        {highlights.length > 0 && (
          <div className="space-y-1.5 mb-6 bg-primary/5 p-3 rounded-xl border border-primary/10">
             {highlights.slice(0, 3).map((h: string, i: number) => (
               <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 dark:text-zinc-400">
                  <Star size={10} className="text-primary fill-primary" />
                  <span>{h}</span>
               </div>
             ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div className="flex flex-col">
            <span className="font-black text-xl text-primary tracking-tighter">{formatUSD(product.price)}</span>
            <span className="text-[8px] text-muted-foreground font-black uppercase">{formatSDG(product.price, currentRate)}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-inner">
             <Zap size={18} className={!isOutOfStock ? "animate-pulse" : ""} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="royal-button flex-1 h-14"
        >
          {isOutOfStock ? <><AlertCircle size={14} className="ml-2" /> غير متوفر</> : <><ShoppingCart size={14} className="ml-2" /> أضف للسلة</>}
        </Button>
        <Button asChild variant="outline" className="h-14 w-14 rounded-2xl border-primary/20 hover:bg-primary/5">
           <Link href="/cart"><ShoppingBag size={18} className="text-primary" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
