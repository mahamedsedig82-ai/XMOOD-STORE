
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc, getDoc, getDocs, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Smartphone, Sparkles, Layout, MessageSquare, ArrowRight, Loader2, AtSign } from "lucide-react";
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
      // Fetch user with role 'designer' to get their contact
      const q = query(collection(db, "users"), where("role", "==", "designer"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setDesignerPhone(snap.docs[0].data().phoneNumber || "");
      }
    };
    fetchDesignerInfo();
  }, [db]);

  const contactText = "مرحباً، لقد شاهدت أعمالك في معرض XMOOD وأريد طلب تصميم احترافي.";
  const whatsappLink = `https://wa.me/${designerPhone?.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(contactText)}`;

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-24 overflow-hidden border-b border-white/5 bg-zinc-950/40">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-v6)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
           <Badge className="mb-8 py-2 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-bold uppercase text-[10px] tracking-[0.4em]">
              XMOOD ELITE DESIGN PORTFOLIO
           </Badge>
           <h1 className="text-6xl md:text-9xl font-headline font-bold mb-8 gold-text leading-tight">معرض النخبة</h1>
           <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-light leading-relaxed">
             استلهم من أرقى التصاميم الرقمية التي نفذتها أنامل المصممين المبدعين في مجتمعنا السيادي.
           </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-6 py-20 pb-40">
         {loading ? (
           <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={60} /></div>
         ) : designs?.length === 0 ? (
           <div className="py-60 text-center opacity-30">
              <Palette size={100} className="mx-auto mb-10" />
              <h2 className="text-3xl font-black uppercase tracking-widest">قريباً.. أولى أعمال النخبة</h2>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {designs?.map((item: any, i: number) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="luxury-card border-none overflow-hidden group h-full flex flex-col bg-zinc-950">
                    <div className="relative aspect-video overflow-hidden">
                       <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                       <Badge className="absolute top-4 right-4 bg-primary text-black font-black text-[8px] uppercase px-4 py-1 rounded-full">{item.category}</Badge>
                    </div>
                    <CardContent className="p-8 space-y-4 flex-1 flex flex-col">
                       <h3 className="text-2xl font-bold gold-text">{item.title}</h3>
                       <p className="text-sm text-zinc-500 leading-relaxed font-medium line-clamp-3">{item.description}</p>
                       
                       <div className="mt-auto pt-6 border-t border-white/5">
                          <Button asChild className="royal-button w-full h-14 text-[10px]">
                             <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageSquare size={16} className="ml-3" /> طلب تصميم مشابه
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

      {/* Floating Action for Designer Contact */}
      <div className="fixed bottom-10 left-10 z-[100]">
         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="accent-button h-20 px-10 shadow-red-600/30">
               <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Smartphone size={24} className="ml-4" /> تواصل مع المصمم الآن
               </a>
            </Button>
         </motion.div>
      </div>
    </main>
  );
}
