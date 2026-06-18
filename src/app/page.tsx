"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShoppingBag, Palette, Flame, Zap } from "lucide-react";

export default function HomePage() {
  const db = useFirestore();
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
  }, [db]);

  const { data: products } = useCollection(productsQuery);
  const BRAND_LOGO = "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png";

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 px-6 py-1 bg-primary/10 text-primary border-primary/20">المرجع الأول للخدمات الرقمية</Badge>
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            متجر <span className="gold-text">XMOOD</span> للخدمات الإلكترونية
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            أفضل باقات شحن الألعاب، الحسابات الرقمية، وحلول التصميم الاحترافية في منصة واحدة موثوقة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="royal-button h-14 px-10">
              <Link href="/store"><ShoppingBag className="ml-2" /> المتجر</Link>
            </Button>
            <Button asChild variant="outline" className="h-14 px-10 rounded-xl">
              <Link href="/designs/gallery"><Palette className="ml-2" /> معرض الأعمال</Link>
            </Button>
          </div>
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Flame className="text-red-500" /> باقات مختارة
              </h2>
              <Link href="/store" className="text-primary font-bold hover:underline">المزيد</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
           <Zap className="mx-auto text-primary mb-6" size={48} />
           <h2 className="text-3xl font-bold mb-4">لماذا تختار XMOOD؟</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 bg-background rounded-2xl shadow-sm">
                 <h4 className="font-bold text-xl mb-2">تسليم فوري</h4>
                 <p className="text-muted-foreground text-sm">يتم معالجة كافة الطلبات بشكل آلي وسريع.</p>
              </div>
              <div className="p-6 bg-background rounded-2xl shadow-sm">
                 <h4 className="font-bold text-xl mb-2">أمان كامل</h4>
                 <p className="text-muted-foreground text-sm">كافة المعاملات المالية محمية بنظام المحفظة الموثق.</p>
              </div>
              <div className="p-6 bg-background rounded-2xl shadow-sm">
                 <h4 className="font-bold text-xl mb-2">دعم فني</h4>
                 <p className="text-muted-foreground text-sm">فريق مختص متواجد لمساعدتك عبر الواتساب دائماً.</p>
              </div>
           </div>
        </div>
      </section>
    </main>
  );
}