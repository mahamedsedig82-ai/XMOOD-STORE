"use client";

import Image from "next/image";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Zap } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[1.5rem] flex flex-col">
      <CardHeader className="p-0 relative aspect-square overflow-hidden bg-slate-100">
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.isP2P && (
          <Badge className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary font-bold text-[10px] px-2 py-0.5 rounded-full border-none shadow-sm">بائع مستقل</Badge>
        )}
        <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md p-1 rounded-lg flex items-center gap-1 shadow-sm">
           <Star size={10} className="fill-yellow-400 text-yellow-400" />
           <span className="text-[10px] font-bold">4.9</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 text-right flex-1 flex flex-col">
        <div className="flex flex-col gap-1 mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">{product.category}</span>
          <CardTitle className="text-lg font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors h-12">
            {product.name}
          </CardTitle>
        </div>
        
        <div className="mt-auto pt-4 flex flex-row-reverse items-center justify-between">
          <div className="flex flex-col items-end">
            <span className="font-bold text-xl text-primary">{formatUSD(product.price)}</span>
            <span className="text-[10px] text-slate-400 font-medium">{formatSDG(product.price)}</span>
          </div>
          <div className="bg-primary/5 text-primary p-2 rounded-xl">
             <Zap size={16} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button className="w-full bg-slate-900 hover:bg-primary text-white font-bold h-11 rounded-xl shadow-md transition-all">
          <ShoppingBag size={18} className="ml-2" />
          أضف للسلة
        </Button>
      </CardFooter>
    </Card>
  );
}