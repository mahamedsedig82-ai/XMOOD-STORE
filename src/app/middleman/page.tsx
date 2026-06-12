"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, UserCheck, Lock, History, MessageCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function MiddlemanPage() {
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
      <section className="relative py-32 overflow-hidden border-b border-white/5 bg-zinc-950/40">
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
          <Badge className="mb-8 py-2 px-8 bg-red-600/10 text-red-500 border-red-600/20 rounded-full font-bold uppercase text-[10px] tracking-widest">
            XMOOD SECURE ESCROW
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 gold-text">نظام الوساطة المضمون</h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
            تداول بكل راحة بال. نحن الطرف الثالث الموثوق الذي يضمن حق المشتري والبائع في أرقى العمليات الرقمية.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="luxury-card border-none bg-zinc-900/50 p-8 h-full">
                    <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-600/20">
                      <f.icon size={30} />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-center text-white">{f.title}</h3>
                    <p className="text-sm text-zinc-500 text-center leading-relaxed">{f.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="luxury-card border-none overflow-hidden bg-gradient-to-r from-red-900/20 to-black/40 border border-red-600/10">
              <CardContent className="p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-right space-y-4">
                    <h2 className="text-3xl font-headline font-bold text-white">هل تود بدء صفقة الآن؟</h2>
                    <p className="text-zinc-400 max-w-md leading-relaxed">
                      ابدأ طلب وساطة جديد الآن. سيقوم أحد وكلائنا المعتمدين بالتواصل معك فوراً لفتح غرفة مفاوضات آمنة.
                    </p>
                  </div>
                  <Button className="accent-button h-16 px-12 text-lg">
                    طلب وساطة جديد <ArrowRight className="mr-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="luxury-card border-none bg-zinc-900/80 p-8">
              <CardHeader className="p-0 border-b border-white/5 pb-6 mb-6">
                <CardTitle className="text-xl flex items-center gap-3 gold-text">
                  <ShieldCheck className="text-primary" /> رحلة الصفقة الآمنة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-6">
                  {[
                    "تقديم طلب الوساطة وتوضيح بنود الاتفاق.",
                    "إيداع المبلغ في محفظة الوسيط المؤمنة.",
                    "فحص البيانات وتغيير المعلومات الأمنية.",
                    "التحقق الفني الشامل من سلامة الحساب.",
                    "تسليم المشتري وتحويل المبلغ للبائع فوراً."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-1 border border-red-600/20">
                        {i + 1}
                      </span>
                      <p className="text-sm text-zinc-300 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="luxury-card border-none bg-primary/5 p-8 text-center legendary-border">
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-4">عمولة الخدمة</p>
              <div className="text-5xl font-black gold-text mb-2">5%</div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                تُطبق لضمان أعلى معايير الأمان الفني والمالي لصفقتك.
              </p>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
