"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Award, Zap, ShieldCheck, TrendingUp, Heart, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function PublicProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const db = useFirestore();

  const userRef = useMemoFirebase(() => doc(db, "users", uid), [db, uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  if (profileLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={60} />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <h1 className="text-4xl font-headline font-bold gold-text">المستخدم غير موجود</h1>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30" dir="rtl">
      <Navbar />
      
      {/* Sovereign Header */}
      <section className="relative pt-40 pb-16 md:pt-60 md:pb-32 overflow-hidden border-b bg-muted/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
             <Avatar className="w-32 h-32 md:w-56 md:h-56 border-8 border-card shadow-2xl rounded-[3rem] overflow-hidden">
                <AvatarImage src={profile.photoURL} className="object-cover" />
                <AvatarFallback className="bg-muted text-4xl md:text-7xl text-primary font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="absolute -bottom-4 -right-4 bg-primary text-black p-4 md:p-6 rounded-[2rem] border-8 border-background shadow-2xl">
                <Award size={24} className="md:w-10 md:h-10" />
             </div>
          </motion.div>

          <div className="text-center lg:text-right flex-1 space-y-6">
             <div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                   <h1 className="text-4xl md:text-8xl font-headline font-black gold-text leading-tight">{profile.displayName}</h1>
                   <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{profile.label || "عضو سيادي"}</Badge>
                </div>
                <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto lg:mx-0">{profile.bio || "عضو سيادي موثق في مجتمع XMOOD الرقمي."}</p>
             </div>

             <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-card px-6 py-3 rounded-2xl border">
                   <Calendar size={16} className="text-primary" /> منذ {new Date(profile.createdAt).getFullYear()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest bg-card px-6 py-3 rounded-2xl border">
                   <ShieldCheck size={16} className="text-green-500" /> الهوية: موثقة
                </div>
             </div>
          </div>

          <Card className="w-full lg:w-96 luxury-card p-10 bg-primary/5 border-primary/10 shadow-2xl">
             <div className="flex flex-row lg:flex-col justify-around lg:justify-start gap-10">
                <div className="text-center lg:text-right">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center justify-center lg:justify-start gap-3">
                     <TrendingUp size={12} /> السمعة الرقمية
                   </p>
                   <p className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">{profile.affinityPoints || 50}</p>
                </div>
                <div className="hidden lg:block h-px bg-border/50" />
                <div className="text-center lg:text-right">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">إجمالي العمليات</p>
                   <p className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">{profile.completedDeals || 0}</p>
                </div>
             </div>
          </Card>
        </div>
      </section>

      {/* Activity Content */}
      <section className="container mx-auto px-6 py-20 pb-40">
         <Tabs defaultValue="activity" className="space-y-12">
            <div className="flex items-center justify-between border-b pb-8">
               <TabsList className="bg-card p-2 rounded-[2rem] h-20 border inline-flex gap-4 px-6 shadow-2xl">
                  <TabsTrigger value="activity" className="rounded-[1.5rem] px-10 md:px-16 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
                     <Zap size={18} className="ml-3" /> النشاط الأخير
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="rounded-[1.5rem] px-10 md:px-16 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
                     <Award size={18} className="ml-3" /> الأوسمة
                  </TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="activity">
               <Card className="luxury-card p-10 md:p-16 bg-card/40 border-none shadow-2xl">
                  <div className="space-y-12 md:space-y-20">
                     {[
                       { icon: Heart, label: "قام بالإعجاب بباقة شحن جديدة", date: "منذ ساعتين", color: "text-red-500" },
                       { icon: MessageSquare, label: "استفسر عن خدمة تصميم هوية", date: "منذ 5 ساعات", color: "text-primary" },
                       { icon: ShieldCheck, label: "أتم عملية شحن محفظة بنجاح", date: "أمس", color: "text-green-500" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-6 md:gap-12 group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[2rem] bg-muted flex items-center justify-center ${item.color} border-2 border-transparent group-hover:border-current transition-all shadow-inner shrink-0`}>
                             <item.icon size={28} className="md:w-10 md:h-10" />
                          </div>
                          <div>
                             <p className="text-xl md:text-4xl font-bold text-foreground mb-2 leading-tight">{item.label}</p>
                             <p className="text-[10px] md:text-[12px] text-muted-foreground font-black uppercase tracking-widest">{item.date}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>
            </TabsContent>
            
            <TabsContent value="achievements">
               <div className="py-40 text-center opacity-30 flex flex-col items-center">
                  <Award size={120} className="text-muted-foreground mb-10" />
                  <p className="text-2xl font-black uppercase tracking-widest">تمنح الأوسمة بناءً على عدد الصفقات الناجحة</p>
               </div>
            </TabsContent>
         </Tabs>
      </section>
    </main>
  );
}