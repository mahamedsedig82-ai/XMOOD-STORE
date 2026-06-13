
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, UserCheck, Lock, MessageCircle, Zap, Star, TrendingUp, MapPin, Smartphone, ArrowRight, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AgentsDirectoryPage() {
  const db = useFirestore();
  
  const agentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "in", ["middleman", "agent", "owner"]), orderBy("completedDeals", "desc"), limit(30));
  }, [db]);

  const { data: agents, loading } = useCollection(agentsQuery);

  const features = [
    {
      icon: UserCheck,
      title: "وكلاء معتمدون",
      desc: "نخبة من الوكلاء الموثقين سيادياً لخدمتكم في كافة المناطق."
    },
    {
      icon: Lock,
      title: "أمان مالي تام",
      desc: "نضمن سلامة التحويلات والوساطة عبر بروتوكولات XMOOD الصارمة."
    },
    {
      icon: MessageCircle,
      title: "تواصل مباشر",
      desc: "دعم فني وتواصل لحظي مع الوكلاء لإتمام طلباتكم بسرعة."
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-48 overflow-hidden border-b border-white/5 bg-zinc-950/40">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#grid-v6)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-8 py-2 px-8 bg-primary/10 text-primary border-primary/20 rounded-full font-bold uppercase text-[10px] tracking-[0.5em]">
            XMOOD ELITE AGENTS DIRECTORY
          </Badge>
          <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 gold-text leading-tight">الوكلاء والخدمات السيادية</h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-4xl mx-auto leading-relaxed font-light">
            تداول واشحن بكل سيادة. هنا تجد قائمة الوكلاء المعتمدين لتنفيذ عمليات شحن الرصيد والوساطة الآمنة في منطقتك.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="luxury-card border-none bg-zinc-900/50 p-10 h-full hover:border-primary/20 transition-all">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20 shadow-2xl">
                      <f.icon size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-4 text-center text-white">{f.title}</h3>
                    <p className="text-sm text-zinc-500 text-center leading-relaxed font-medium">{f.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Agents Grid */}
            <div className="space-y-10">
               <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-headline font-bold text-white flex items-center gap-5">
                     <ShieldCheck className="text-primary w-10 h-10" /> دليل الوكلاء والوسطاء
                  </h2>
                  <Badge variant="outline" className="border-white/10 text-zinc-500 text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full">Active Elite Status</Badge>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {agents?.map((m: any) => (
                    <Card key={m.id} className="luxury-card border-none p-10 bg-zinc-950/40 hover:bg-zinc-950 transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
                       
                       <div className="flex items-center gap-6 relative z-10">
                          <div className="relative">
                            <Avatar className="w-20 h-20 border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                               <AvatarImage src={m.photoURL} />
                               <AvatarFallback className="bg-zinc-900 text-primary font-black text-2xl">XM</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-black ${m.middlemanInfo?.isAvailable ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500'}`} />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-2xl font-bold text-white">{m.displayName}</h4>
                                <Star size={14} className="text-primary fill-primary" />
                             </div>
                             <div className="flex items-center gap-2 text-zinc-400">
                                <MapPin size={14} className="text-primary" />
                                <span className="text-xs font-bold">{m.residence || "المنطقة السيادية"}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-2 mt-8">
                          {m.middlemanInfo?.services?.map((s: string) => (
                            <Badge key={s} className="bg-primary/10 text-primary border-primary/20 text-[8px] px-4 py-1.5 rounded-full uppercase font-black tracking-widest">
                              {s === 'escrow' ? '🛡️ وساطة صفقات' : s === 'charging' ? '⚡ شحن محفظة' : s}
                            </Badge>
                          ))}
                       </div>

                       <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                          <div>
                             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">حالة التوفر</p>
                             <p className="text-xs text-primary font-black italic">{m.middlemanInfo?.workHours || "متاح للطلبات الآن"}</p>
                          </div>
                          <div className="text-left">
                             <div className="flex items-center gap-2 text-white font-black text-2xl leading-none">
                                <TrendingUp size={18} className="text-primary" /> {m.completedDeals || 0}
                             </div>
                             <p className="text-[8px] text-zinc-600 uppercase font-black mt-1">Total Deals</p>
                          </div>
                       </div>

                       <div className="mt-8 flex gap-4">
                          <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                             <Link href={`/profile/${m.id}`}>الملف الشخصي</Link>
                          </Button>
                          <Button asChild className="royal-button flex-1 h-14 text-[10px]">
                             <a href={`https://wa.me/${m.phoneNumber?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                               <Smartphone size={16} className="ml-3" /> بدء الطلب
                             </a>
                          </Button>
                       </div>
                    </Card>
                  ))}
                  {agents?.length === 0 && (
                    <div className="col-span-full py-32 text-center opacity-30">
                       <ShieldCheck size={100} className="mx-auto mb-8 text-zinc-800" />
                       <p className="text-xl font-bold uppercase tracking-[0.3em]">بانتظار تعيين الوكلاء من الإدارة</p>
                    </div>
                  )}
               </div>
            </div>

            <Card className="luxury-card border-none overflow-hidden bg-gradient-to-r from-red-900/20 to-black/40 border border-red-600/10">
              <CardContent className="p-16">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="text-right space-y-6">
                    <h2 className="text-4xl font-headline font-bold text-white leading-tight">انضم لنخبة وكلاء XMOOD</h2>
                    <p className="text-zinc-400 max-w-lg leading-relaxed text-lg font-light">
                      هل تملك الخبرة في شحن الأرصدة أو الوساطة الرقمية؟ قدم طلب "رتبة وكيل" الآن لتصبح جزءاً من النظام.
                    </p>
                  </div>
                  <Button asChild className="accent-button h-20 px-16 text-xl shadow-red-600/20">
                    <Link href="/wallet">تقديم طلب الانضمام <ArrowRight className="mr-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="luxury-card border-none bg-zinc-900/80 p-10 sticky top-36">
              <CardHeader className="p-0 border-b border-white/5 pb-8 mb-8">
                <CardTitle className="text-2xl font-headline font-bold gold-text flex items-center gap-4">
                  <Award className="text-primary animate-pulse" /> بروتوكول الوكلاء
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-8">
                  {[
                    "اختر الوكيل المناسب بناءً على منطقتك الجغرافية.",
                    "وضح نوع الخدمة المطلوبة (شحن محفظة أو وساطة عرض).",
                    "في الشحن: يتم التحويل للوكيل ويزودك بالرصيد سيادياً.",
                    "في الوساطة: يضمن الوكيل حقك عبر استلام الرصيد وتأمين التسليم.",
                    "كافة العمليات مسجلة في سجل التدفقات المالية لضمان الأمان."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-6 items-start group">
                      <span className="w-10 h-10 rounded-2xl bg-primary/10 text-primary text-sm font-black flex items-center justify-center shrink-0 mt-1 border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all shadow-xl">
                        {i + 1}
                      </span>
                      <p className="text-base text-zinc-300 leading-relaxed font-medium">{step}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="luxury-card border-none bg-primary/5 p-12 text-center relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
              <p className="text-[11px] text-primary font-black uppercase tracking-[0.5em] mb-8">ضريبة السيادة</p>
              <div className="text-8xl font-black gold-text mb-6 tracking-tighter">5%</div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest leading-relaxed font-bold max-w-[200px] mx-auto">
                رسوم تشغيلية لضمان أمان العمليات المالية والوساطة.
              </p>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
