"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  ArrowLeftRight, 
  UserCheck, 
  ShieldCheck, 
  Trophy, 
  Star, 
  Users,
  Search,
  Zap,
  Lock,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/currency";

export default function MarketplacePage() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: marketplaceUsers } = useCollection(
    query(collection(db, "users"), orderBy("walletBalance", "desc"), limit(20))
  );

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />
      
      <section className="py-40 relative overflow-hidden bg-black border-b border-primary/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-market" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fbbf24" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-market)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
           <Badge className="mb-10 bg-primary/20 text-primary border-primary/40 py-2 px-10 rounded-full font-black tracking-[0.6em] uppercase text-[10px]">
              Open Marketplace Transparency
           </Badge>
           <h1 className="text-7xl md:text-[9rem] font-headline font-bold mb-10 leading-none gold-text drop-shadow-2xl">سوق النخبة</h1>
           <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-light">
             تداول الأرصدة والخدمات في بيئة آمنة وشفافة. كلما زادت نقاط أفضليتك، زادت سلطتك ومصداقيتك في السوق.
           </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-16 relative z-20 pb-40">
        <Tabs defaultValue="leaderboard" className="space-y-16">
          <div className="flex justify-center">
            <TabsList className="bg-white/5 backdrop-blur-3xl p-2 rounded-[3rem] h-24 shadow-2xl border border-white/10 flex gap-4 w-fit">
              <TabsTrigger value="leaderboard" className="rounded-[2rem] px-16 font-black text-lg data-[state=active]:bg-primary data-[state=active]:text-black transition-all">تصنيف النخبة</TabsTrigger>
              <TabsTrigger value="listings" className="rounded-[2rem] px-16 font-black text-lg data-[state=active]:bg-primary data-[state=active]:text-black transition-all">العروض الحية</TabsTrigger>
              <TabsTrigger value="escrow" className="rounded-[2rem] px-16 font-black text-lg data-[state=active]:bg-primary data-[state=active]:text-black transition-all">نظام الضمان</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leaderboard" className="space-y-16 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <Card className="lg:col-span-1 luxury-card border-none p-12 legendary-border relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-primary mb-12">سجلك في السوق</h3>
                {user ? (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner border border-primary/20">
                        <UserCheck size={40} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-bold text-white mb-2">{profile?.displayName}</h4>
                        <Badge className="bg-primary text-black font-black text-[10px] px-4 py-1 rounded-full">{profile?.label || "عضو مبتدئ"}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-3 tracking-widest">نقاط الأفضلية</p>
                        <p className="text-5xl font-black text-primary">0</p>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-3 tracking-widest">التقييم</p>
                        <div className="flex items-center gap-2">
                           <Star size={24} className="fill-primary text-primary" />
                           <span className="text-4xl font-black text-white">5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 space-y-6">
                    <Lock size={80} className="mx-auto text-slate-800" />
                    <p className="text-slate-500 font-bold">سجل دخولك لرؤية تصنيفك في السوق.</p>
                  </div>
                )}
              </Card>

              <Card className="lg:col-span-2 luxury-card border-none p-12">
                <div className="flex justify-between items-center mb-16">
                  <h3 className="text-3xl font-bold flex items-center gap-6 gold-text">
                    <Trophy size={36} className="text-primary" /> تصنيف موثوقية النخبة
                  </h3>
                  <Badge variant="outline" className="border-primary/20 text-primary py-2 px-6 rounded-full font-black text-[10px] animate-pulse">LIVE PROTOCOL</Badge>
                </div>
                <div className="space-y-6">
                  {marketplaceUsers?.map((u: any, i: number) => (
                    <div key={u.id} className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:bg-primary/10 hover:border-primary/30 transition-all duration-500">
                      <div className="flex items-center gap-8">
                        <span className="text-3xl font-black text-slate-800 group-hover:text-primary transition-colors">#{i + 1}</span>
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5">
                          <Users size={30} />
                        </div>
                        <div>
                          <p className="font-bold text-xl mb-1">{u.displayName}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{u.label || "عضو XMOOD"}</p>
                        </div>
                      </div>
                      <div className="text-left flex flex-col items-end">
                        <div className="flex items-center gap-3 mb-2">
                          <Star size={16} className="fill-primary text-primary" />
                          <span className="text-3xl font-black text-primary">{(1000 - i * 50)}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">Affinity Points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="animate-fade-in py-40 text-center">
             <div className="max-w-3xl mx-auto space-y-10">
                <Zap size={100} className="mx-auto text-slate-800" />
                <h2 className="text-6xl font-headline font-bold gold-text">السوق بانتظار عروضك</h2>
                <p className="text-slate-500 text-xl font-light">
                  كن من أوائل الذين يضعون بصمتهم في سوق XMOOD الجديد. عروضك ترفع من نقاط أفضليتك وتجعلك في الصدارة.
                </p>
                <Button className="h-24 px-20 royal-button text-2xl shadow-primary/20">نشر عرض جديد</Button>
             </div>
          </TabsContent>

          <TabsContent value="escrow" className="animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card className="luxury-card border-none p-16 legendary-border">
                  <h3 className="text-3xl font-bold mb-12 flex items-center gap-6 gold-text">
                    <ArrowLeftRight size={36} className="text-primary" /> التحويل المالي المباشر
                  </h3>
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] pr-4">المبلغ من محفظتك (USD)</label>
                      <Input readOnly value={formatUSD(profile?.walletBalance || 0)} className="h-24 bg-white/5 border-none rounded-[2rem] text-4xl font-black text-center text-primary shadow-inner" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] pr-4">معرف المستلم (Target UID)</label>
                      <Input placeholder="أدخل الـ ID هنا..." className="h-24 bg-white/5 border-none rounded-[2rem] text-4xl font-black text-center text-white shadow-inner focus:ring-primary/40" />
                    </div>
                    <Button className="w-full h-24 royal-button text-2xl">بدء عملية التحويل</Button>
                  </div>
                </Card>

                <div className="space-y-10">
                  <Card className="luxury-card border-none p-12 bg-white/5">
                    <h4 className="text-2xl font-bold mb-8 flex items-center gap-4 text-primary">
                      <Lock size={28} /> حماية Escrow الذكية
                    </h4>
                    <p className="text-slate-400 text-lg leading-relaxed font-light">
                      كل عملية تحويل تمر عبر نظام الحماية المزدوج. يتم حجز الأصول في "الخزانة الرقمية" حتى يتم التأكد من استلام الخدمة أو الكود بنجاح.
                    </p>
                  </Card>
                  <Card className="luxury-card border-none p-12 bg-white/5">
                    <h4 className="text-2xl font-bold mb-8 flex items-center gap-4 text-primary">
                      <BadgeCheck size={28} /> الشفافية والتدقيق
                    </h4>
                    <p className="text-slate-400 text-lg leading-relaxed font-light">
                      تظهر العمليات الكبرى في سجل السوق لضمان النزاهة. التزامك بقواعد السوق يمنحك رتباً أعلى في "نادي النخبة".
                    </p>
                  </Card>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}