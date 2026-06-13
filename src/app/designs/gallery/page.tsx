"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Smartphone, Sparkles, MessageSquare, Loader2, Camera, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function DesignGalleryPage() {
  const db = useFirestore();
  const [designerPhone, setDesignerPhone] = useState("");

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(40));
  }, [db]);

  const { data: designs, loading } = useCollection(galleryQuery);

  useEffect(() => {
    const fetchDesignerInfo = async () => {
      if (!db) return;
      const q = query(collection(db, "users"), where("role", "==", "designer"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setDesignerPhone(snap.docs[0].data().phoneNumber || "");
      }
    };
    fetchDesignerInfo();
  }, [db]);

  const contactText = "مرحباً، لقد شاهدت أعمالك في معرض التصاميم وأريد طلب خدمة احترافية مشابهة.";
  const whatsappLink = `https://wa.me/${designerPhone?.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(contactText)}`;

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
              بورتفوليو نخبة المصممين والمبدعين
           </Badge>
           <h1 className="text-6xl md:text-9xl font-headline font-black mb-10 text-foreground leading-tight tracking-tighter">معرض <span className="gold-text">الإبداع الرقمي</span></h1>
           <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed">
             استلهم من أرقى التصاميم والهويات البصرية التي نفذتها أنامل خبراء الإبداع في منصتنا الموثوقة.
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
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="luxury-card group h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                       <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       <Badge className="absolute top-5 right-5 bg-primary text-black font-black text-[9px] uppercase px-5 py-1.5 rounded-full shadow-2xl tracking-widest">{item.category}</Badge>
                    </div>
                    <CardContent className="p-10 space-y-6 flex-1 flex flex-col">
                       <h3 className="text-3xl font-black leading-tight group-hover:gold-text transition-colors">{item.title}</h3>
                       <p className="text-base text-muted-foreground leading-relaxed font-medium line-clamp-3">{item.description}</p>
                       
                       <div className="mt-auto pt-8 border-t">
                          <Button asChild className="royal-button w-full h-16">
                             <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageSquare size={20} className="ml-2" /> طلب تصميم احترافي
                             </a>
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
           </div>
         )}
      </section>

      {/* Floating Action */}
      <div className="fixed bottom-10 left-10 z-[100] hidden md:block">
         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="accent-button h-20 px-12 shadow-2xl">
               <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Award size={24} className="ml-3" /> استشارة إبداعية مجانية
               </a>
            </Button>
         </motion.div>
      </div>
    </main>
  );
}
