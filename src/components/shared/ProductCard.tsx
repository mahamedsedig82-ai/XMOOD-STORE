"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, AlertCircle, Edit, Star, ShoppingBag, Truck } from "lucide-react";
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

  const isOutOfStock = product.status === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0);

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
    <Card className={`luxury-card flex flex-col group h-full transition-all duration-500 ${isOutOfStock ? 'opacity-70 grayscale' : 'hover:border-primary/20'}`}>
      <CardHeader className="p-3 md:p-4 relative aspect-video bg-muted overflow-hidden">
        <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-[1.5rem]">
          <Image 
            src={product.imageUrl || officialPlaceholder} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40 md:opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <Badge className={`absolute top-5 right-5 font-black text-[7px] md:text-[8px] px-2.5 py-1 rounded-full border-none shadow-xl uppercase tracking-widest ${isOutOfStock ? 'bg-zinc-600 text-white' : 'bg-primary text-black animate-pulse'}`}>
          {isOutOfStock ? 'نفد من المستودع' : 'شحن فوري متاح'}
        </Badge>

        {isAdmin && (
          <Button asChild variant="secondary" className="absolute top-5 left-5 h-7 w-7 md:h-8 md:w-8 rounded-lg p-0 bg-background/80 backdrop-blur-md z-20">
            <Link href={`/admin/products`}><Edit size={12} className="text-primary" /></Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-5 md:p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-[7px] md:text-[8px] uppercase font-black text-primary/60 tracking-[0.2em] block mb-1.5">{product.category}</span>
          <CardTitle className="text-base md:text-xl font-bold group-hover:gold-text transition-colors leading-tight line-clamp-2 min-h-[2.5rem] md:min-h-[3.2rem]">
            {product.name}
          </CardTitle>
        </div>

        {highlights.length > 0 && (
          <div className="space-y-1.5 mb-5 bg-primary/5 p-2.5 rounded-xl border border-primary/10">
             {highlights.slice(0, 2).map((h: string, i: number) => (
               <div key={i} className="flex items-center gap-2 text-[8px] md:text-[9px] font-bold text-muted-foreground">
                  <Star size={10} className="text-primary fill-primary shrink-0" />
                  <span className="truncate">{h}</span>
               </div>
             ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div className="flex flex-col">
            <span className="font-black text-lg md:text-xl text-primary tracking-tighter">{formatUSD(product.price)}</span>
            <span className="text-[7px] md:text-[8px] text-muted-foreground font-black uppercase">{formatSDG(product.price, currentRate)}</span>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
             <Zap size={16} className={!isOutOfStock ? "animate-pulse" : ""} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 md:p-6 pt-0 flex gap-2">
        <Button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="royal-button flex-1 h-12 md:h-14 text-[9px] md:text-[10px]"
        >
          {isOutOfStock ? <><AlertCircle size={14} className="ml-2" /> بانتظار التزويد</> : <><Truck size={14} className="ml-2" /> اختيار للشحن ⚡</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
