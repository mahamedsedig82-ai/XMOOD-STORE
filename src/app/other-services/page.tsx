"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, Loader2, UserCheck, Smartphone, CheckCircle } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { motion } from "framer-motion";

export default function OtherServicesPublic() {
  const db = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "other_services"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: services, loading } = useCollection(servicesQuery);

  const handleOrder = (whatsapp: string, serviceName: string) => {
    const text = encodeURIComponent(`مرحباً، أريد طلب خدمة: ${serviceName} المعروضة في متجركم الاحترافي.`);
    window.open(`https://wa.me/${whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${text}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-7xl">
        <header className="text-center mb-24 space-y-8 animate-fade-up">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-10 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">
            سوق الخدمات والحلول الرقمية المتقدمة
          </Badge>
          <h1 className="text-6xl md:text-8xl font-headline font-black leading-tight text-foreground">باقات <span className="gold-text">احترافية متكاملة</span></h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-4xl mx-auto font-medium leading-relaxed">
            نخبة من الخبراء والوكلاء يقدمون حلولاً تقنية وإبداعية مبتكرة بأعلى معايير الجودة والضمان.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60 gap-6">
            <Loader2 className="animate-spin text-primary" size={80} />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">جاري جلب قائمة الخدمات...</p>
          </div>
        ) : services?.length === 0 ? (
          <div className="py-60 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
            <Zap size={140} className="text-muted-foreground mb-10" />
            <h3 className="text-3xl font-black uppercase tracking-widest">لا توجد خدمات نشطة حالياً</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services?.map((s: any, i: number) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="luxury-card h-full flex flex-col hover:scale-[1.02] duration-500">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img 
                      src={s.imageUrl || "https://picsum.photos/seed/service/800/450"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={s.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-5 right-5 bg-primary text-black font-black text-[9px] px-5 py-2 rounded-full shadow-2xl uppercase tracking-widest">
                      {s.type}
                    </Badge>
                    <div className="absolute bottom-5 right-5 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                       <CheckCircle size={14} className="text-primary" /> Verified Service
                    </div>
                  </div>

                  <CardContent className="p-10 flex-1 flex flex-col">
                    <h3 className="text-3xl font-black mb-4 leading-tight group-hover:gold-text transition-colors">{s.name}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed font-medium mb-10 line-clamp-4">
                      {s.description}
                    </p>
                    
                    <div className="mt-auto pt-8 border-t flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">قيمة الخدمة</p>
                        <p className="text-4xl font-black text-primary tracking-tighter">{formatUSD(s.price)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">الخبير المسؤول</p>
                        <div className="flex items-center gap-2 text-sm font-black">
                          <UserCheck size={16} className="text-primary" /> {s.agentName}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleOrder(s.whatsapp, s.name)}
                      className="royal-button w-full h-18 mt-10"
                    >
                      <MessageSquare className="ml-3" size={20} /> تواصل لطلب الخدمة
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
