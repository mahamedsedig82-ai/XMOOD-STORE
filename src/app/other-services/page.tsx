"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, Loader2, UserCheck, CheckCircle } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { motion } from "framer-motion";

export default function OtherServicesPublic() {
  const db = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!db) return null;
    // استعلام عام بدون فلاتر لضمان الظهور لكافة المستخدمين
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
        <header className="text-center mb-16 md:mb-24 space-y-6 animate-fade-up">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-8 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">
            سوق الخدمات والحلول الرقمية
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-black leading-tight text-foreground">باقات <span className="gold-text">احترافية معتمدة</span></h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            نخبة من الخبراء يقدمون حلولاً تقنية وإبداعية مبتكرة بأعلى معايير الجودة والضمان.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="animate-spin text-primary" size={60} />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">جاري جلب قائمة الخدمات...</p>
          </div>
        ) : services?.length === 0 ? (
          <div className="py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
            <Zap size={100} className="text-muted-foreground mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-widest">لا توجد خدمات نشطة حالياً</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {services?.map((s: any, i: number) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="luxury-card h-full flex flex-col hover:border-primary/30 transition-all duration-500 group">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img 
                      src={s.imageUrl || `https://picsum.photos/seed/${s.id}/800/450`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={s.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-primary text-black font-black text-[8px] px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                      {s.type}
                    </Badge>
                  </div>

                  <CardContent className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black mb-3 leading-tight group-hover:gold-text transition-colors">{s.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium mb-8 line-clamp-3">
                      {s.description}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">قيمة الخدمة</p>
                        <p className="text-2xl font-black text-primary tracking-tighter">{formatUSD(s.price)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">المسؤول</p>
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <UserCheck size={14} className="text-primary" /> {s.agentName}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleOrder(s.whatsapp, s.name)}
                      className="royal-button w-full h-14 mt-8"
                    >
                      <MessageSquare className="ml-2" size={18} /> اطلب الخدمة الآن
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
