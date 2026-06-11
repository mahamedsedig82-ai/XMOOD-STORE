
"use client";

import Image from "next/image";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-none bg-white shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-[2rem]">
      <CardHeader className="p-0 relative aspect-[16/11] overflow-hidden">
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.isP2P && (
          <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md hover:bg-primary font-bold text-[10px] px-3 py-1 rounded-full border-none">بائع مستقل</Badge>
        )}
      </CardHeader>
      <CardContent className="p-8 text-right">
        <div className="flex flex-col gap-1 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">{product.category}</span>
          <CardTitle className="text-2xl font-headline font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6 font-light">
          {product.description}
        </p>

        <div className="flex flex-col items-end pt-4 border-t border-primary/5">
          <span className="font-headline font-bold text-2xl text-primary">{formatUSD(product.price)}</span>
          <span className="text-xs text-muted-foreground font-medium opacity-70">{formatSDG(product.price)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-8 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all group-hover:scale-[1.02] active:scale-95">
          <ShoppingCart size={20} className="ml-2" />
          شراء الآن
        </Button>
      </CardFooter>
    </Card>
  );
}
