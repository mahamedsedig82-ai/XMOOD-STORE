
"use client";

import Image from "next/image";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden">
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isP2P && (
          <Badge className="absolute top-2 left-2 bg-accent hover:bg-accent font-bold">بائع مستقل</Badge>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star className="w-3 h-3 text-primary fill-primary" />
          4.9
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.category}</span>
          <span className="font-headline font-bold text-xl text-primary">${product.price}</span>
        </div>
        <CardTitle className="text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold group">
          <ShoppingCart className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
          شراء الآن
        </Button>
      </CardFooter>
    </Card>
  );
}
