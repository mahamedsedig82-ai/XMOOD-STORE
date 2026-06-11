"use client";

import Image from "next/image";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { formatUSD, formatSDG } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="p-0 relative aspect-[16/10] overflow-hidden border-b">
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isP2P && (
          <Badge className="absolute top-3 right-3 bg-primary hover:bg-primary font-bold text-[10px] px-2 py-0.5">بائع مستقل</Badge>
        )}
      </CardHeader>
      <CardContent className="p-5 text-right">
        <div className="flex flex-col gap-1 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{product.category}</span>
          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </div>
        
        <div className="flex flex-col mb-4">
          <span className="font-headline font-bold text-xl text-primary">{formatUSD(product.price)}</span>
          <span className="text-xs text-muted-foreground font-medium">{formatSDG(product.price)}</span>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-lg">
          <ShoppingCart size={18} className="ml-2" />
          شراء الآن
        </Button>
      </CardFooter>
    </Card>
  );
}