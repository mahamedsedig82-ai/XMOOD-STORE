"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertCircle, Edit, Star, Truck } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAdmin } = useUser();
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
    <Card className={`luxury-card flex flex-col h-full transition-all group ${isOutOfStock ? 'opacity-70 grayscale' : 'hover:border-primary/20'}`}>
      <CardHeader className="p-3 relative aspect-[16/10] bg-muted overflow-hidden">
        <div className="relative w-full h-full overflow-hidden rounded-xl">
          <Image 
            src={product.imageUrl || officialPlaceholder} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <Badge className={`absolute top-4 right-4 font-black text-[7px] px-2 py-0.5 rounded-full border-none shadow-md uppercase tracking-widest ${isOutOfStock ? 'bg-zinc-600 text-white' : 'bg-primary text-black animate-pulse'}`}>
          {isOutOfStock ? 'نفد المخزون' : 'شحن فوري'}
        </Badge>

        {isAdmin && (
          <Button asChild variant="secondary" className="absolute top-4 left-4 h-7 w-7 rounded-lg p-0 bg-background/80 backdrop-blur-md z-20">
            <Link href={`/admin/products`}><Edit size={12} className="text-primary" /></Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-[7px] uppercase font-black text-primary/60 tracking-widest block mb-1">{product.category}</span>
          <CardTitle className="text-sm md:text-lg font-bold group-hover:gold-text transition-colors leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </CardTitle>
        </div>

        {highlights.length > 0 && (
          <div className="space-y-1 mb-5 bg-primary/5 p-2 rounded-xl border border-primary/5">
             {highlights.slice(0, 1).map((h: string, i: number) => (
               <div key={i} className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground">
                  <Star size={10} className="text-primary fill-primary shrink-0" />
                  <span className="truncate">{h}</span>
               </div>
             ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
          <div className="flex flex-col">
            <span className="font-black text-base md:text-xl text-primary tracking-tighter">{formatUSD(product.price)}</span>
            <span className="text-[7px] text-muted-foreground font-black uppercase">{formatSDG(product.price, currentRate)}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
             <Zap size={14} className={!isOutOfStock ? "animate-pulse" : ""} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="royal-button flex-1 h-12 text-[9px]"
        >
          {isOutOfStock ? <><AlertCircle size={14} className="ml-2" /> بانتظار التزويد</> : <><Truck size={14} className="ml-2" /> اختيار للشحن ⚡</>}
        </Button>
      </CardFooter>
    </Card>
  );
}