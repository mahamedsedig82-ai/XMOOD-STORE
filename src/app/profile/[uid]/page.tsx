"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Award, Zap, ShieldCheck, TrendingUp, Heart, MessageSquare, Store, Briefcase, Palette, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PublicProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const db = useFirestore();

  const userRef = useMemoFirebase(() => doc(db, "users", uid), [db, uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  if (profileLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={60} />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <h1 className="text-4xl font-headline font-bold gold-text">المستخدم غير موجود</h1>
    </div>
  );

  const navigationHub = [
    { name: "المتجر الرئيسي", desc: "استعرض باقات الشحن المتاحة", icon: Store, href: "/store", color: "text-blue-500" },
    { name: "سوق الخدمات", desc: "حلول تقنية وإبداعية متكاملة", icon: Briefcase, href: "/other-services", color: "text-amber-500" },
    { name: "معرض الأعمال", desc: "شاهد أرقى التصاميم المنفذة", icon: Palette, href: "/designs/gallery", color: "text-purple-500" },
    { name: "الوكلاء المعتمدون", desc: "تواصل مع وسطاء الثقة", icon: ShieldCheck, href: "/middleman", color: "text-green-500" }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30" dir="rtl">
      <Navbar />
      
      {/* Sovereign Header */}
      <section className="relative pt-48 pb-20 overflow-hidden border-b bg-muted/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
             <Avatar className="w-48 h-48 border-4 border-white dark:border-zinc-800 shadow-[0_20px_80px_rgba(212,175,55,0.15)] rounded-[3rem] overflow-hidden">
                <AvatarImage src={profile.photoURL} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-6xl text-primary font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="absolute -bottom-4 -right-4 bg-primary text-black p-4 rounded-2xl border-4 border-background shadow-2xl">
                <Award size={32} />
             </div>
          </motion.div>

          <div className="text-center lg:text-right flex-1 space-y-6">
             <div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                   <h1 className="text-5xl md:text-7xl font-headline font-black gold-text leading-tight">{profile.displayName}</h1>
                   <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{profile.label || "عضو سيادي"}</Badge>
                </div>
                <p className="text-xl text-muted-foreground font-medium max-w-2xl">{profile.bio || "عضو سيادي موثق في مجتمع XMOOD الرقمي."}</p>
             </div>

             <div className="flex flex-wrap justify-center lg:justify-start gap-8">
                <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase text-[10px] tracking-widest bg-card px-5 py-2.5 rounded-xl border">
                   <Calendar size={16} className="text-primary" /> عضو منذ {new Date(profile.createdAt).getFullYear()}
                </div>
                <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase text-[10px] tracking-widest bg-card px-5 py-2.5 rounded-xl border">
                   <ShieldCheck size={16} className="text-green-500" /> الهوية: موثقة سيادياً
                </div>
             </div>
          </div>

          <Card className="w-full lg:w-80 luxury-card p-10 bg-primary/5 border-primary/10 shadow-2xl">
             <div className="space-y-8">
                <div className="text-center lg:text-right">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 flex items-center justify-center lg:justify-start gap-2">
                     <TrendingUp size={12} /> سمعة المتداول
                   </p>
                   <p className="text-5xl font-black text-foreground tracking-tighter">{profile.affinityPoints || 50}</p>
                   <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Sovereign Trust Points</p>
                </div>
                <div className="h-px bg-border/50" />
                <div className="text-center lg:text-right">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">عمليات ناجحة</p>
                   <p className="text-5xl font-black text-foreground tracking-tighter">{profile.completedDeals || 0}</p>
                   <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Confirmed Transactions</p>
                </div>
             </div>
          </Card>
        </div>
      </section>

      {/* Profile Activity & Navigation Hub */}
      <section className="container mx-auto px-6 py-20">
         <Tabs defaultValue="categories" className="space-y-12">
            <TabsList className="bg-card p-2 rounded-[2rem] h-20 border inline-flex gap-2 px-4 shadow-xl">
               <TabsTrigger value="categories" className="rounded-2xl px-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Zap size={16} className="ml-2" /> الأقسام السيادية
               </TabsTrigger>
               <TabsTrigger value="activity" className="rounded-2xl px-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Heart size={16} className="ml-2" /> النشاط الأخير
               </TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="animate-fade-up">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {navigationHub.map((item, i) => (
                    <Link key={i} href={item.href} className="group">
                      <Card className="luxury-card p-10 hover:border-primary transition-all h-full bg-card/60 backdrop-blur-xl border-none shadow-lg">
                        <div className={`w-16 h-16 rounded-[1.5rem] bg-muted flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color}`}>
                           <item.icon size={32} />
                        </div>
                        <h3 className="text-2xl font-black mb-3 group-hover:gold-text transition-colors">{item.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                      </Card>
                    </Link>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="activity">
               <Card className="luxury-card p-12 bg-card/40 border-none shadow-xl">
                  <div className="space-y-12">
                     {[
                       { icon: Heart, label: "قام بالإعجاب بباقة شحن جديدة", date: "منذ ساعتين", color: "text-red-500" },
                       { icon: MessageSquare, label: "استفسر عن خدمة تصميم هوية", date: "منذ 5 ساعات", color: "text-primary" },
                       { icon: ShieldCheck, label: "أتم عملية شحن محفظة بنجاح", date: "أمس", color: "text-green-500" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-8 group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className={`w-16 h-16 rounded-[1.5rem] bg-muted flex items-center justify-center ${item.color} border border-transparent group-hover:border-current transition-all shadow-sm`}>
                             <item.icon size={28} />
                          </div>
                          <div>
                             <p className="text-2xl font-bold text-foreground mb-1.5">{item.label}</p>
                             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{item.date}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>
            </TabsContent>
         </Tabs>
      </section>
    </main>
  );
}
