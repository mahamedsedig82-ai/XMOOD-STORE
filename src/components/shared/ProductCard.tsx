"use client";

import Image from "next/image";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Zap, AlertCircle } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.status === 'out_of_stock' || product.stock <= 0;
  const hasDiscount = product.status === 'discount' && product.discountPrice;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;

  return (
    <Card className={`group overflow-hidden border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`}>
      <CardHeader className="p-0 relative aspect-square overflow-hidden bg-slate-50">
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 ${!isOutOfStock ? 'group-hover:scale-110' : ''}`}
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {isOutOfStock ? (
            <Badge className="bg-red-500 text-white font-bold text-[10px] px-3 py-1 rounded-full border-none shadow-lg">منتهي من المخزون</Badge>
          ) : hasDiscount ? (
            <Badge className="bg-green-500 text-white font-bold text-[10px] px-3 py-1 rounded-full border-none shadow-lg">تخفيض خاص</Badge>
          ) : (
            <Badge className="bg-primary text-white font-bold text-[10px] px-3 py-1 rounded-full border-none shadow-lg">متوفر الآن</Badge>
          )}
        </div>

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-100">
           <Star size={12} className="fill-yellow-400 text-yellow-400" />
           <span className="text-xs font-bold text-slate-800">4.9</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 text-right flex-1 flex flex-col">
        <div className="flex flex-col gap-1.5 mb-4">
          <span className="text-[10px] uppercase font-black text-primary/60 tracking-widest">{product.category}</span>
          <CardTitle className="text-xl font-headline font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[3rem]">
            {product.name}
          </CardTitle>
        </div>
        
        <div className="mt-auto pt-4 flex flex-row-reverse items-center justify-between border-t border-slate-50">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through decoration-red-400/50">
                  {formatUSD(product.price)}
                </span>
              )}
              <span className="font-bold text-2xl text-primary">{formatUSD(displayPrice)}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{formatSDG(displayPrice)}</span>
          </div>
          <div className="bg-primary/5 text-primary p-2.5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
             <Zap size={18} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          disabled={isOutOfStock}
          className={`w-full font-bold h-14 rounded-2xl shadow-xl transition-all ${
            isOutOfStock 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-slate-900 hover:bg-primary text-white shadow-primary/10'
          }`}
        >
          {isOutOfStock ? (
            <><AlertCircle size={18} className="ml-2" /> غير متوفر</>
          ) : (
            <><ShoppingBag size={18} className="ml-2" /> أضف للسلة</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
