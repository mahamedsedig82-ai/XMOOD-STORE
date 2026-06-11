"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, UserCheck, Lock, History, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MiddlemanPage() {
  const features = [
    {
      icon: UserCheck,
      title: "تحقق من الهوية",
      desc: "نتأكد من هوية الطرفين ومصداقية الحسابات قبل البدء."
    },
    {
      icon: Lock,
      title: "حجز المبلغ",
      desc: "يبقى المبلغ في خزينة XMOOD الآمنة حتى استلام الخدمة."
    },
    {
      icon: MessageCircle,
      title: "إشراف مباشر",
      desc: "وكيل معتمد يشرف على عملية نقل البيانات خطوة بخطوة."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-white border-b py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge variant="outline" className="mb-6 py-2 px-6 bg-primary/5 text-primary border-primary/20 rounded-full font-bold tracking-widest uppercase text-[10px]">
            XMOOD ESCROW SYSTEM
          </Badge>
          <h1 className="text-5xl md:text-6xl font-headline font-bold mb-6">نظام الوساطة الضامن</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            تداول بكل ثقة. نحن الطرف الثالث الموثوق الذي يضمن حق المشتري والبائع في العمليات الكبرى والحسابات النادرة.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <Card key={i} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                      <f.icon size={30} />
                    </div>
                    <h3 className="font-bold text-lg mb-3">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
              <CardContent className="p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-right">
                    <h2 className="text-3xl font-headline font-bold mb-4">هل لديك صفقة حالية؟</h2>
                    <p className="text-slate-400 max-w-md leading-relaxed">
                      ابدأ طلب وساطة جديد الآن. سيقوم أحد وكلائنا المعتمدين بالتواصل معك لفتح غرفة مفاوضات آمنة بين الطرفين.
                    </p>
                  </div>
                  <Button size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-2xl shadow-primary/20 text-lg">
                    طلب وساطة جديد <ArrowRight className="mr-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="bg-muted/30 border-b p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="text-primary" /> كيف يعمل النظام؟
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ol className="space-y-6">
                  {[
                    "تقديم طلب الوساطة وتحديد تفاصيل الصفقة.",
                    "يقوم المشتري بإيداع المبلغ في محفظة الوسيط.",
                    "يقوم البائع بتسليم كافة بيانات الحساب أو الخدمة للوسيط.",
                    "يتحقق الوسيط من البيانات ويغير المعلومات الأمنية.",
                    "يتم تسليم المشتري البيانات وتحويل المال للبائع فوراً."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">عمولة الوساطة</p>
                <div className="text-4xl font-bold text-primary mb-2">5%</div>
                <p className="text-[10px] text-muted-foreground">تُخصم من قيمة الصفقة الإجمالية لضمان الأمان الفني والإداري.</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
