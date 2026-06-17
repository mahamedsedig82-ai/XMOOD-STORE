
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, Loader2, UserCheck, LayoutGrid } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function OtherServicesPublic() {
  const db = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "other_services"), 
      orderBy("createdAt", "desc")
    );
  }, [db]);

  const { data: allServices, loading } = useCollection(servicesQuery);

  const officialPlaceholder = "https://aboutmsr.com/wp-content/uploads/2025/02/766f8e72-20c2-4824-814c-1d90f5080e77.png";

  // تجميع الخدمات حسب النوع (التصنيف)
  const groupedServices = useMemo(() => {
    if (!allServices) return {};
    const active = allServices.filter((s: any) => s.isAvailable === true);
    return active.reduce((acc: any, service: any) => {
      const type = service.type || "خدمات عامة";
      if (!acc[type]) acc[type] = [];
      acc[type].push(service);
      return acc;
    }, {});
  }, [allServices]);

  const handleOrder = (whatsapp: string, serviceName: string) => {
    const text = encodeURIComponent(`مرحباً، أريد طلب خدمة: ${serviceName} المعروضة في متجركم الاحترافي.`);
    window.open(`https://wa.me/${whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${text}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-7xl">
        <header className="text-center mb-24 space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-8 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">
            سوق الخدمات والحلول الرقمية
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-black leading-tight text-foreground">باقات <span className="gold-text">احترافية معتمدة</span></h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            نخبة من الخبراء يقدمون حلولاً تقنية وإبداعية مبتكرة مرتبة حسب التخصص والنوع.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="animate-spin text-primary" size={60} />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">جاري جلب قائمة الخدمات...</p>
          </div>
        ) : Object.keys(groupedServices).length === 0 ? (
          <div className="py-40 text-center luxury-card border-dashed opacity-30 flex flex-col items-center">
            <Zap size={100} className="text-muted-foreground mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-widest">لا توجد خدمات نشطة حالياً</h3>
            <p className="text-sm text-muted-foreground mt-2">تواصل مع الإدارة لنشر أول خدمة احترافية.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {Object.entries(groupedServices).map(([category, items]: [string, any]) => (
              <section key={category} className="animate-fade-up">
                 <div className="flex items-center gap-4 mb-12 border-r-4 border-primary pr-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                       <LayoutGrid size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{category}</h2>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-black px-4">{items.length} خدمة</Badge>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {items.map((s: any, i: number) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="luxury-card h-full flex flex-col hover:border-primary/30 transition-all duration-500 group">
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            <img 
                              src={s.imageUrl || officialPlaceholder} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              alt={s.name} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                                  <UserCheck size={14} className="text-primary" /> {s.agentName || "وكيل معتمد"}
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
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
