"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Camera, Award, Sparkles, ExternalLink, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function DesignGalleryPage() {
  const db = useFirestore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);
  const { data: config } = useDoc(settingsRef);

  // تم توحيد حقل البحث عن التاريخ لضمان ظهور العروض
  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(40));
  }, [db]);

  const { data: designs, loading } = useCollection(galleryQuery);

  const handleRequest = (designerPhone: string, title: string) => {
    const text = encodeURIComponent(`مرحباً، لقد شاهدت عملك الفني "${title}" في معرض XMOOD وأريد طلب تصميم احترافي مشابه.`);
    window.open(`https://wa.me/${designerPhone?.replace(/\+/g, '').replace(/\s/g, '')}?text=${text}`, '_blank');
  };

  const galleryTexts = config?.gallerySettings || {
    title: "معرض الإبداع",
    subtitle: "استلهم من أرقى التصاميم والهويات البصرية التي نفذتها أنامل خبراء الإبداع في منصتنا الموثوقة.",
    badge: "بورتفوليو نخبة المصممين والمبدعين",
    buttonText: "طلب تصميم مشابه"
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative pt-48 pb-32 overflow-hidden bg-muted/20 border-b">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <pattern id="grid-gal" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
             </pattern>
            <rect width="100%" height="100%" fill="url(#grid-gal)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
           <Badge className="mb-8 py-2 px-8 bg-primary/10 text-primary border-primary/20 rounded-full font-black uppercase text-[10px] tracking-widest">
              {galleryTexts.badge}
           </Badge>
           <h1 className="text-5xl md:text-8xl font-headline font-black mb-8 leading-tight">
              {galleryTexts.title} <span className="gold-text">الرقمي</span>
           </h1>
           <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
             {galleryTexts.subtitle}
           </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 pb-48">
         {loading ? (
           <div className="py-40 flex flex-col items-center gap-6">
             <Loader2 className="animate-spin text-primary" size={60} />
             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">جاري استحضار الأعمال الفنية...</p>
           </div>
         ) : designs?.length === 0 ? (
           <div className="py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
              <Camera size={100} className="text-muted-foreground mb-8" />
              <h2 className="text-2xl font-black uppercase tracking-widest">قريباً.. أولى روائع النخبة</h2>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {designs?.map((item: any, i: number) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="luxury-card group h-full flex flex-col border-none bg-card/60 backdrop-blur-xl shadow-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer" onClick={() => setSelectedImage(item.imageUrl)}>
                       <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                       <Badge className="absolute top-4 right-4 bg-primary text-black font-black text-[8px] uppercase px-4 py-1 rounded-full shadow-xl">{item.category}</Badge>
                    </div>
                    <CardContent className="p-8 space-y-4 flex-1 flex flex-col">
                       <h3 className="text-2xl font-black leading-tight group-hover:gold-text transition-colors">{item.title}</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-3">{item.description}</p>
                       
                       <div className="mt-auto pt-6 border-t flex flex-col gap-3">
                          <Button onClick={() => handleRequest(item.designerPhone, item.title)} className="royal-button w-full h-14">
                             <MessageSquare size={18} className="ml-2" /> {galleryTexts.buttonText}
                          </Button>
                          <Link href={`/profile/${item.designerId}`} className="text-[10px] font-black text-primary uppercase text-center hover:underline flex items-center justify-center gap-2">
                             <Award size={14} /> ملف المبدع
                          </Link>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </div>
         )}
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
             <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border-4 border-white/10" alt="Preview" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}