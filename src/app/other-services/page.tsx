
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, UserCheck, MessageSquare, Loader2 } from "lucide-react";
import { formatUSD } from "@/lib/currency";

export default function OtherServicesPublic() {
  const db = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "other_services"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: services, loading } = useCollection(servicesQuery);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-6xl">
        <header className="text-center mb-20 space-y-4 animate-fade-up">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-8 py-2 rounded-full font-black uppercase text-[10px] tracking-widest">
            XMOOD MANAGED SERVICES
          </Badge>
          <h1 className="text-6xl font-headline font-bold gold-text">خدمات احترافية إضافية</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">باقات متخصصة يقدمها نخبة من الوكلاء والخبراء تحت إشراف المنصة.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-primary" size={60} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((s: any) => (
              <Card key={s.id} className="luxury-card border-none bg-card p-10 flex flex-col hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                    <Zap size={32} />
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 text-[8px] font-black uppercase tracking-widest">
                    {s.type}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-headline font-bold leading-tight">{s.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{s.description}</p>
                  
                  <div className="pt-6 border-t flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">السعر</p>
                      <p className="text-3xl font-black text-primary">{formatUSD(s.price)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">الوكيل</p>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <UserCheck size={14} className="text-primary" /> {s.agentName}
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="royal-button w-full h-16 mt-10 text-xs">
                  <MessageSquare className="ml-3" size={18} /> اطلب الخدمة الآن
                </Button>
              </Card>
            ))}

            {services?.length === 0 && (
              <div className="col-span-full py-40 text-center opacity-30">
                <Zap size={80} className="mx-auto mb-6" />
                <p className="text-xl font-black uppercase tracking-widest">لا توجد خدمات إضافية حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
