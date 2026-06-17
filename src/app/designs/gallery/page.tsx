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

export default function DesignGalleryPage() {
  const db = useFirestore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(40));
  }, [db]);

  const { data: designs, loading } = useCollection(galleryQuery);

  const handleRequest = (designerPhone: string, title: string) => {
    const text = encodeURIComponent(`مرحباً، لقد شاهدت عملك الفني "${title}" في معرض XMOOD وأريد طلب تصميم احترافي مشابه.`);
    window.open(`https://wa.me/${designerPhone?.replace(/\+/g, '').replace(/\s/g, '')}?text=${text}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-muted/40 border-b">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
           <Badge className="mb-10 py-2.5 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">
              {config?.gallerySettings?.badge || "بورتفوليو نخبة المصممين والمبدعين"}
           </Badge>
           <h1 className="text-6xl md:text-9xl font-headline font-black mb-10 text-foreground leading-tight tracking-tighter">
              {config?.gallerySettings?.title || "معرض"} <span className="gold-text">الإبداع الرقمي</span>
           </h1>
           <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed">
             {config?.gallerySettings?.subtitle || "استلهم من أرقى التصاميم والهويات البصرية التي نفذتها أنامل خبراء الإبداع في منصتنا الموثوقة."}
           </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-6 py-24 pb-48">
         {loading ? (
           <div className="py-60 flex flex-col items-center gap-6">
             <Loader2 className="animate-spin text-primary" size={80} />
             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">جاري استحضار الأعمال الفنية...</p>
           </div>
         ) : designs?.length === 0 ? (
           <div className="py-60 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
              <Camera size={140} className="text-muted-foreground mb-10" />
              <h2 className="text-3xl font-black uppercase tracking-widest">قريباً.. أولى روائع النخبة</h2>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {designs?.map((item: any, i: number) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="luxury-card group h-full flex flex-col border-none bg-card/60 backdrop-blur-xl shadow-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer" onClick={() => setSelectedImage(item.imageUrl)}>
                       <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                          <Sparkles size={40} className="text-primary animate-pulse" />
                       </div>
                       <Badge className="absolute top-5 right-5 bg-primary text-black font-black text-[9px] uppercase px-5 py-1.5 rounded-full shadow-2xl tracking-widest">{item.category}</Badge>
                    </div>
                    <CardContent className="p-10 space-y-6 flex-1 flex flex-col">
                       <h3 className="text-3xl font-black leading-tight group-hover:gold-text transition-colors">{item.title}</h3>
                       <p className="text-base text-muted-foreground leading-relaxed font-medium line-clamp-3">{item.description}</p>
                       
                       <div className="mt-auto pt-8 border-t flex flex-col gap-4">
                          <Button onClick={() => handleRequest(item.designerPhone, item.title)} className="royal-button w-full h-16 text-xs">
                             <MessageSquare size={20} className="ml-2" /> {config?.gallerySettings?.buttonText || "طلب تصميم مشابه"}
                          </Button>
                          <Link href={`/profile/${item.designerId}`} className="text-[10px] font-black text-primary uppercase text-center hover:underline flex items-center justify-center gap-2">
                             <Award size={14} /> ملف المصرف المبدع <ExternalLink size={10} />
                          </Link>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </div>
         )}
      </section>

      {/* Lightbox Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-20"
            onClick={() => setSelectedImage(null)}
          >
             <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(212,175,55,0.2)]" alt="Preview" />
             <Button className="absolute top-10 right-10 rounded-full h-14 w-14 bg-white/10 hover:bg-white/20 border-white/20 text-white font-black">X</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-10 left-10 z-[100] hidden md:block">
         <Button asChild className="accent-button h-20 px-12 shadow-2xl rounded-[2rem] bg-primary text-black font-black uppercase text-xs">
            <Link href="/designs/request">
               <Palette size={24} className="ml-3" /> ابدأ مشروعك الآن
            </Link>
         </Button>
      </div>
    </main>
  );
}
