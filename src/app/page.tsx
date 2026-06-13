"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Zap, Store, Palette, Globe, Award, CheckCircle, 
  MessageSquare, Mail, Smartphone, ArrowRight, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function HomeCorporate() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      {/* Modern Professional Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-56 overflow-hidden bg-muted/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid-modern" width="60" height="60" patternUnits="userSpaceOnUse">
                 <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid-modern)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
             <Badge className="mb-12 py-3 px-12 bg-primary/10 text-primary border-primary/20 rounded-full font-black text-[12px] tracking-[0.2em] uppercase shadow-sm">
               {config?.siteInfo?.subtitle || "منصة الخدمات الرقمية الموثوقة الأولى"}
             </Badge>
             
             <h1 className="text-6xl md:text-9xl mb-12 font-headline font-black leading-tight tracking-tighter text-foreground">
                حلول رقمية <span className="gold-text">مبتكرة وموثوقة</span>
             </h1>

             <p className="text-2xl md:text-3xl text-muted-foreground max-w-5xl mx-auto mb-20 leading-relaxed font-medium">
               {config?.siteInfo?.heroDescription || "نقدم باقات شحن الألعاب، اشتراكات رقمية، وخدمات إبداعية متكاملة تضمن لك السرعة والأمان التام في كل خطوة."}
             </p>
             
             <div className="flex flex-wrap justify-center gap-8">
               <Button asChild className="royal-button h-20 px-16 text-xl">
                 <Link href="/store"><Store className="ml-3" size={28} /> تصفح المتجر</Link>
               </Button>
               <Button asChild className="accent-button h-20 px-16 text-xl">
                 <Link href="/marketplace"><Users className="ml-3" size={28} /> مجتمع الموثوقية</Link>
               </Button>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Corporate Features */}
      <section className="py-40 bg-background border-y">
        <div className="container mx-auto px-6">
          <div className="text-center mb-32 space-y-6">
             <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">لماذا يختارنا المحترفون؟</h2>
             <p className="text-muted-foreground text-2xl max-w-3xl mx-auto font-medium">نلتزم بأعلى معايير الجودة والأمان لتقديم تجربة رقمية لا تضاهى عالمياً.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: ShieldCheck, title: "حماية متكاملة", desc: "أنظمة تشفير وحماية بيانات متطورة تضمن خصوصية تامة لكافة تعاملاتك المالية.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10" },
              { icon: Award, title: "جودة معتمدة", desc: "كافة خدماتنا تخضع لمعايير فحص دقيقة لضمان رضاكم التام واستمرارية الخدمة.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10" },
              { icon: Zap, title: "تنفيذ لحظي", desc: "نظام آلي متطور يضمن معالجة ووصول طلباتكم في ثوانٍ معدودة وبدون تأخير.", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10" },
              { icon: CheckCircle, title: "خبراء موثوقون", desc: "نخبة من الوكلاء المعتمدين لضمان حقوقك في كل صفقة وساطة تتم عبر المنصة.", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/10" },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -15 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="luxury-card p-12 border-none h-full flex flex-col items-center text-center group">
                  <div className={`w-24 h-24 rounded-[2rem] ${item.bg} flex items-center justify-center ${item.color} mb-10 transition-transform group-hover:scale-110 shadow-sm border`}>
                    <item.icon size={44} />
                  </div>
                  <h4 className="font-black text-2xl mb-5">{item.title}</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-40 bg-muted/30 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-6xl mb-12">{config?.siteInfo?.title || "XMOOD"}</div>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-20 text-2xl leading-relaxed font-medium">
            {config?.siteInfo?.description || "المنصة الرائدة والموثوقة لتقديم كافة الحلول والخدمات الرقمية المتكاملة، نسعى دائماً للابتكار والسرعة لخدمة عملائنا في كل مكان."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-32">
             {config?.contact?.whatsapp && (
               <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-sm bg-card px-10 py-5 rounded-3xl shadow-xl border">
                  <MessageSquare size={24} className="text-green-500" /> دعم العملاء المباشر
               </a>
             )}
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-sm bg-card px-10 py-5 rounded-3xl shadow-xl border">
                  <Mail size={24} className="text-primary" /> المراسلة الرسمية
               </a>
             )}
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-[13px] font-black uppercase tracking-widest text-muted-foreground mb-24 border-b pb-24">
            <Link href="/marketplace" className="hover:text-primary transition-all">مجتمع التداول</Link>
            <Link href="/designs/gallery" className="hover:text-primary transition-all">معرض التصاميم</Link>
            <Link href="/middleman" className="hover:text-primary transition-all">الوكلاء المعتمدون</Link>
            <Link href="/admin" className="hover:text-primary transition-all opacity-40">لوحة التحكم</Link>
          </div>
          
          <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
            {config?.siteInfo?.copyright || "© 2025 XMOOD PROFESSIONAL SERVICES. ALL RIGHTS RESERVED."}
          </p>
        </div>
      </footer>
    </main>
  );
}
