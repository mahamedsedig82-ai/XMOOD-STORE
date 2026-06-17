"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, UserCheck, Smartphone, TrendingUp, MapPin, Award, Loader2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

export default function AgentsDirectoryPage() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const agentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "in", ["middleman", "agent", "owner"]));
  }, [db]);

  const { data: rawAgents, loading } = useCollection(agentsQuery);

  const agents = useMemo(() => {
    if (!rawAgents) return [];
    return [...rawAgents].sort((a: any, b: any) => (b.completedDeals || 0) - (a.completedDeals || 0));
  }, [rawAgents]);

  const steps = [
    { title: "اختيار الوكيل", desc: "اختر الوكيل المعتمد الأقرب لمنطقتك أو صاحب أعلى سمعة." },
    { title: "تحديد الخدمة", desc: "تواصل مع الوكيل لتوضيح ما إذا كنت تريد شحن رصيد أو وساطة عرض." },
    { title: "تأمين الصفقة", desc: "يقوم الوكيل بتأمين التحويل وضمان استلام كافة الأطراف لحقوقهم." }
  ];

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <section className="relative py-48 overflow-hidden bg-muted/30">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-8 py-2 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black uppercase text-[10px] tracking-widest">
            {config?.agentSettings?.badge || "دليل الوكلاء والوسطاء المعتمدين"}
          </Badge>
          <h1 className="text-6xl md:text-8xl font-headline font-black mb-8 leading-tight text-foreground">
            {config?.agentSettings?.title || "التعامل بـ"} <span className="gold-text">موثوقية تامة</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            {config?.agentSettings?.subtitle || "شبكة من الخبراء المعتمدين لتنفيذ عمليات الشحن والوساطة المالية بأعلى معايير الأمان والسرعة."}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-20">
            <div className="space-y-12">
               <div className="flex items-center justify-between border-b pb-8">
                  <h2 className="text-4xl font-black flex items-center gap-5">
                     <ShieldCheck className="text-primary w-10 h-10" /> قائمة الوكلاء الموثوقين
                  </h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {loading ? (
                    <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={60} /></div>
                  ) : agents?.length === 0 ? (
                    <div className="col-span-full py-40 text-center opacity-30">
                       <UserCheck size={100} className="mx-auto mb-8" />
                       <p className="text-2xl font-black uppercase tracking-widest">بانتظار تعيين أول وكيل معتمد</p>
                    </div>
                  ) : agents?.map((m: any) => (
                    <Card key={m.id} className="luxury-card p-10 hover:border-primary transition-all group">
                       <div className="flex items-center gap-6 mb-10">
                          <div className="relative">
                            <Avatar className="w-24 h-24 rounded-3xl border-4 border-background shadow-2xl transition-transform group-hover:scale-105">
                               <AvatarImage src={m.photoURL} />
                               <AvatarFallback className="bg-primary/10 text-primary font-black text-3xl">XM</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-4 border-background ${m.middlemanInfo?.isAvailable ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-zinc-400'}`} />
                          </div>
                          <div className="flex-1">
                             <h4 className="text-2xl font-black text-foreground mb-2 flex items-center gap-3">
                                {m.displayName}
                                <Star size={14} className="text-primary fill-primary" />
                             </h4>
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin size={14} className="text-primary" />
                                <span className="text-xs font-bold">{m.residence || "مركز الخدمات الموحد"}</span>
                             </div>
                          </div>
                       </div>

                       {/* Rating Display */}
                       <div className="flex items-center gap-2 mb-8 bg-muted/30 p-4 rounded-2xl border border-border/50">
                          <div className="flex gap-1 text-primary">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} className={i < Math.round(m.rating || 5) ? 'fill-current' : 'opacity-20'} />
                             ))}
                          </div>
                          <span className="text-xs font-black">({m.ratingCount || 0} تقييم)</span>
                       </div>

                       <div className="flex flex-wrap gap-2 mb-10">
                          {m.middlemanInfo?.services?.map((s: string) => (
                            <Badge key={s} className="bg-secondary text-secondary-foreground border-none text-[8px] px-4 py-2 rounded-xl font-black uppercase tracking-widest">
                              {s === 'escrow' ? '🛡️ وساطة صفقات' : s === 'charging' ? '⚡ شحن محفظة' : s}
                            </Badge>
                          ))}
                       </div>

                       <div className="flex items-center justify-between border-t pt-8 mb-10">
                          <div>
                             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">حالة التوفر</p>
                             <p className="text-sm text-primary font-black">{m.middlemanInfo?.workHours || "متاح للخدمة الآن"}</p>
                          </div>
                          <div className="text-left">
                             <div className="flex items-center gap-2 text-foreground font-black text-3xl leading-none">
                                <TrendingUp size={20} className="text-primary" /> {m.completedDeals || 0}
                             </div>
                             <p className="text-[8px] text-muted-foreground uppercase font-black mt-1">ناجحة إجمالاً</p>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                             <Link href={`/profile/${m.id}`}>زيارة الملف</Link>
                          </Button>
                          <Button asChild className="royal-button flex-1 h-14">
                             <a href={`https://wa.me/${m.phoneNumber?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                               <Smartphone size={16} className="ml-2" /> طلب فوري
                             </a>
                          </Button>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-12">
            <Card className="luxury-card p-10 glass-morphism sticky top-36">
              <CardHeader className="p-0 border-b pb-8 mb-8">
                <CardTitle className="text-2xl font-black gold-text flex items-center gap-4">
                  <Award size={24} /> بروتوكول التعامل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <span className="w-10 h-10 rounded-2xl bg-primary text-black text-sm font-black flex items-center justify-center shrink-0 shadow-lg">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
