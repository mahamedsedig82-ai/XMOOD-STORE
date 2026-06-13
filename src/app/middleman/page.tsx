
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, UserCheck, Lock, History, MessageCircle, Zap, Star, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MiddlemanPage() {
  const db = useFirestore();
  
  const middlemenQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "in", ["middleman", "owner"]), orderBy("completedDeals", "desc"), limit(12));
  }, [db]);

  const { data: middlemen } = useCollection(middlemenQuery);

  const features = [
    {
      icon: UserCheck,
      title: "التحقق من الهوية",
      desc: "نضمن لك هوية الأطراف ومصداقية الحسابات قبل بدء أي عملية."
    },
    {
      icon: Lock,
      title: "تأمين الأموال",
      desc: "يبقى المبلغ في خزنة XMOOD الآمنة ولا يُسلم إلا بعد التأكد التام."
    },
    {
      icon: MessageCircle,
      title: "إشراف احترافي",
      desc: "وكيل معتمد يتابع عملية نقل البيانات خطوة بخطوة لضمان الأمان."
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-48 overflow-hidden border-b border-white/5 bg-zinc-950/40">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-mid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="red" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-mid)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-8 py-2 px-8 bg-red-600/10 text-red-500 border-red-600/20 rounded-full font-bold uppercase text-[10px] tracking-[0.5em]">
            XMOOD SECURE ESCROW PROTOCOL
          </Badge>
          <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 gold-text leading-tight">الوساطة السيادية المضمونة</h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-4xl mx-auto leading-relaxed font-light">
            تداول بكل سيادة. نحن الطرف الثالث الموثوق الذي يضمن حق المشتري والبائع في أرقى العمليات الرقمية باستخدام تقنيات التحقق المتقدمة.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info & Middlemen List */}
          <div className="lg:col-span-2 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="luxury-card border-none bg-zinc-900/50 p-10 h-full hover:border-red-500/20 transition-all">
                    <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-600/20 shadow-2xl">
                      <f.icon size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-4 text-center text-white">{f.title}</h3>
                    <p className="text-sm text-zinc-500 text-center leading-relaxed font-medium">{f.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Middlemen Directory */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-headline font-bold text-white flex items-center gap-4">
                     <ShieldCheck className="text-primary" /> دليل الوسطاء المعتمدين
                  </h2>
                  <Badge variant="outline" className="border-white/10 text-zinc-500 text-[8px] font-black uppercase tracking-widest px-4">Live Availability</Badge>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {middlemen?.map((m: any) => (
                    <Card key={m.id} className="luxury-card border-none p-8 bg-zinc-950/40 hover:bg-zinc-950 transition-all group">
                       <div className="flex items-center gap-6">
                          <Avatar className="w-16 h-16 border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                             <AvatarImage src={m.photoURL} />
                             <AvatarFallback className="bg-zinc-900 text-primary font-black">XM</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xl font-bold text-white">{m.displayName}</h4>
                                <Star size={12} className="text-primary fill-primary" />
                             </div>
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Elite Sovereign Middleman</p>
                          </div>
                          <div className="text-left">
                             <div className="flex items-center gap-2 text-primary font-black text-xl leading-none">
                                <TrendingUp size={16} /> {m.completedDeals || 0}
                             </div>
                             <p className="text-[8px] text-zinc-700 uppercase font-black tracking-tighter">Deals Done</p>
                          </div>
                       </div>
                       <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                          <Button asChild variant="outline" className="flex-1 h-12 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest">
                             <Link href={`/profile/${m.id}`}>الملف الشخصي</Link>
                          </Button>
                          <Button className="royal-button flex-1 h-12 text-[10px]">طلب الوساطة</Button>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>

            <Card className="luxury-card border-none overflow-hidden bg-gradient-to-r from-red-900/20 to-black/40 border border-red-600/10 shadow-red-900/5">
              <CardContent className="p-16">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="text-right space-y-6">
                    <h2 className="text-4xl font-headline font-bold text-white">هل تود بدء صفقة سيادية الآن؟</h2>
                    <p className="text-zinc-400 max-w-lg leading-relaxed text-lg font-light">
                      ابدأ طلب وساطة جديد الآن. سيقوم أحد وكلائنا المعتمدين بفتح غرفة عمليات مؤمنة لضمان سلاسة العملية.
                    </p>
                  </div>
                  <Button className="accent-button h-20 px-16 text-xl shadow-red-600/20">
                    فتح طلب وساطة <ArrowRight className="mr-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="luxury-card border-none bg-zinc-900/80 p-10 sticky top-36">
              <CardHeader className="p-0 border-b border-white/5 pb-8 mb-8">
                <CardTitle className="text-2xl font-headline font-bold gold-text flex items-center gap-4">
                  <Zap className="text-primary animate-pulse" /> بروتوكول الصفقة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-8">
                  {[
                    "تقديم طلب الوساطة وتوضيح كافة بنود الاتفاق.",
                    "إيداع المبلغ في خزنة XMOOD المؤمنة سيادياً.",
                    "فحص البيانات الفنية وتغيير المعلومات الأمنية.",
                    "التحقق الشامل من سلامة الأصول الرقمية.",
                    "تسليم المشتري وتحويل المبلغ للبائع بشكل لحظي."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-6 items-start group">
                      <span className="w-8 h-8 rounded-xl bg-red-600/10 text-red-500 text-xs font-black flex items-center justify-center shrink-0 mt-1 border border-red-600/20 group-hover:bg-red-600 group-hover:text-white transition-all shadow-xl">
                        {i + 1}
                      </span>
                      <p className="text-base text-zinc-300 leading-relaxed font-medium">{step}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="luxury-card border-none bg-primary/5 p-12 text-center legendary-border">
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.5em] mb-6 flex items-center justify-center gap-2">
                 <Award size={14} /> ضريبة السيادة
              </p>
              <div className="text-7xl font-black gold-text mb-4 tracking-tighter">5%</div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed font-bold">
                تُطبق لضمان أعلى معايير الأمان التقني والمالي لنخبة المتداولين.
              </p>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
