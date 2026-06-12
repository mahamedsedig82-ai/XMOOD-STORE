"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Coins, 
  ArrowLeftRight, 
  UserCheck, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  BadgeCheck, 
  DollarSign, 
  History,
  Lock,
  ArrowRight,
  Trophy,
  Star,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/currency";

export default function MarketplacePage() {
  const { profile, user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: marketplaceUsers } = useCollection(
    query(collection(db, "users"), orderBy("walletBalance", "desc"), limit(10))
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section Luxury Pro */}
      <section className="py-32 relative overflow-hidden bg-black">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-luxury" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#fbbf24" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-luxury)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center md:text-right">
           <div className="max-w-5xl">
              <Badge className="mb-8 bg-primary/20 text-primary border-primary/40 py-2 px-8 rounded-full font-black tracking-[0.5em] uppercase text-[10px]">
                 Open Market Transparency Protocol
              </Badge>
              <h1 className="text-6xl md:text-9xl font-headline font-bold mb-10 leading-none gold-text">سوق التداول <br/><span className="text-white">المفتوح والشفاف</span></h1>
              <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-light max-w-3xl">
                أول سوق رقمي يعتمد على "نقاط الأفضلية". تداول بحرية، ابنِ سمعتك، وارتقِ في تصنيف النخبة لضمان الأولوية في كافة العمليات.
              </p>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-40">
        <Tabs defaultValue="transparency" className="space-y-20">
          <div className="flex justify-center">
            <TabsList className="bg-white/5 backdrop-blur-3xl p-2 rounded-[3rem] h-24 shadow-2xl border border-primary/20 flex gap-4 w-fit">
              <TabsTrigger value="transparency" className="rounded-[2rem] px-14 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-black transition-all">نظام الشفافية</TabsTrigger>
              <TabsTrigger value="market" className="rounded-[2rem] px-14 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-black transition-all">العروض الحية</TabsTrigger>
              <TabsTrigger value="exchange" className="rounded-[2rem] px-14 font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-black transition-all">تحويل P2P</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="transparency" className="space-y-16 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* User Marketplace Profile */}
              <Card className="lg:col-span-1 luxury-card border-none overflow-hidden relative p-12 legendary-border">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-10">هويتك في السوق</h3>
                {user ? (
                  <div className="space-y-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                        <UserCheck size={40} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-bold text-white">{profile?.displayName}</h4>
                        <Badge className="bg-primary text-black font-black text-[10px] px-3 mt-2">{profile?.label || "عضو مبتدئ"}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-2">نقاط الأفضلية</p>
                        <p className="text-4xl font-black text-primary">0</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-2">الترتيب العالمي</p>
                        <p className="text-4xl font-black text-white">#--</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold italic">
                      "النقاط تُمنح بناءً على حجم التداولات، سرعة التسليم، وتقييم الأطراف الأخرى."
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Lock size={60} className="mx-auto text-slate-800 mb-6" />
                    <p className="text-slate-500 font-bold">سجل دخولك لرؤية إحصائياتك في السوق.</p>
                  </div>
                )}
              </Card>

              {/* Leaderboard / Transparency List */}
              <Card className="lg:col-span-2 luxury-card border-none p-12">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-bold flex items-center gap-4">
                    <Trophy size={28} className="text-primary" /> قائمة الأفضلية والشفافية
                  </h3>
                  <Badge variant="outline" className="border-primary/20 text-primary">مباشر الآن</Badge>
                </div>
                <div className="space-y-6">
                  {marketplaceUsers?.map((u: any, i: number) => (
                    <div key={u.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-primary/5 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-6">
                        <span className="text-2xl font-black text-slate-700 group-hover:text-primary transition-colors">#{i + 1}</span>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{u.displayName}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black">{u.label || "عضو XMOOD"}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <Star size={14} className="fill-primary text-primary" />
                          <span className="text-xl font-black text-primary">{(1000 - i * 50)}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">PTS</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market" className="animate-fade-in text-center py-40">
             <div className="max-w-2xl mx-auto space-y-8">
                <Zap size={80} className="mx-auto text-slate-800 animate-pulse" />
                <h2 className="text-5xl font-headline font-bold gold-text">السوق فارغ حالياً</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  كن أول من يضع بصمته في السوق المفتوح الجديد. أضف عرضك الآن وابدأ في تجميع نقاط الأفضلية لتتصدر القائمة.
                </p>
                <Button className="h-20 px-16 royal-button text-xl">أضف عرضك الأول</Button>
             </div>
          </TabsContent>

          <TabsContent value="exchange" className="animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card className="luxury-card border-none p-12 legendary-border">
                  <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
                    <ArrowLeftRight size={28} className="text-primary" /> التحويل المالي الذكي (P2P)
                  </h3>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">من محفظتك (USD)</label>
                      <Input readOnly value={formatUSD(profile?.walletBalance || 0)} className="h-20 bg-white/5 border-none rounded-3xl text-3xl font-black text-center text-primary" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">إلى معرف المستخدم (User ID)</label>
                      <Input placeholder="مثال: ABC123XYZ..." className="h-20 bg-white/5 border-none rounded-3xl text-3xl font-black text-center" />
                    </div>
                    <Button className="w-full h-24 royal-button text-2xl">بدء التحويل الأسطوري</Button>
                  </div>
                </Card>

                <div className="space-y-8">
                  <Card className="luxury-card border-none p-12">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Lock size={20} className="text-primary" /> نظام الأمان المزدوج
                    </h4>
                    <p className="text-slate-400 leading-relaxed font-light">
                      كل عملية تحويل تخضع لبروتوكول التحقق الفوري. يتم حجز المبلغ في "الخزانة الرقمية" ولا يُحرر إلا بعد تأكيد الطرفين بالـ PIN الأمني الخاص بهما.
                    </p>
                  </Card>
                  <Card className="luxury-card border-none p-12">
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <BadgeCheck size={20} className="text-primary" /> الشفافية المطلقة
                    </h4>
                    <p className="text-slate-400 leading-relaxed font-light">
                      تظهر كافة عمليات التحويل (بأسماء مشفرة) في سجل التدفق المالي العام للسوق لضمان أن النظام يعمل بفعالية ومصداقية للجميع.
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