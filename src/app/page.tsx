"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Zap, Store, Palette, Award, CheckCircle, 
  MessageSquare, Mail, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function HomeCorporate() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db]);
  const { data: config } = useDoc(settingsRef);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      {/* Dynamic Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-56 overflow-hidden bg-muted/20 border-b">
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
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
          >
             <motion.div variants={itemVariants}>
               <Badge className="mb-12 py-3 px-12 bg-primary/10 text-primary border-primary/20 rounded-full font-black text-[12px] tracking-[0.2em] uppercase shadow-sm">
                 {config?.siteInfo?.subtitle || "منصة الخدمات الإلكترونية المعتمدة والأكثر موثوقية"}
               </Badge>
             </motion.div>
             
             <motion.h1 
               variants={itemVariants}
               className="text-6xl md:text-9xl mb-12 font-headline font-black leading-tight tracking-tighter text-foreground"
             >
                {config?.pageContent?.heroTitle || "حلول رقمية متقدمة وموثوقة"}
             </motion.h1>

             <motion.p 
               variants={itemVariants}
               className="text-2xl md:text-3xl text-muted-foreground max-w-5xl mx-auto mb-20 leading-relaxed font-medium"
             >
               {config?.pageContent?.heroDescription || "نقدم لك أفضل باقات شحن الألعاب، الحسابات المميزة، والخدمات الاحترافية بأعلى معايير الأمان والسرعة."}
             </motion.p>
             
             <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-8">
               <Button asChild className="royal-button h-20 px-16 text-xl shadow-primary/20">
                 <Link href="/store"><Store className="ml-3" size={28} /> الخدمات الإلكترونية</Link>
               </Button>
               <Button asChild className="accent-button h-20 px-16 text-xl shadow-foreground/10">
                 <Link href="/designs/gallery"><Palette className="ml-3" size={28} /> معرض الإبداع</Link>
               </Button>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-40 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-32 space-y-6">
             <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-foreground">لماذا يختارنا المحترفون؟</h2>
             <p className="text-muted-foreground text-2xl max-w-3xl mx-auto font-medium">نلتزم بأعلى معايير الجودة والأمان لتقديم تجربة رقمية لا تضاهى.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: ShieldCheck, title: "حماية متكاملة", desc: "أنظمة تشفير وحماية بيانات متطورة تضمن خصوصية تامة لكافة تعاملاتك المالية والتقنية.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10" },
              { icon: Award, title: "جودة معتمدة", desc: "كافة الخدمات تخضع لمعايير فحص دقيقة لضمان رضاكم التام واستمرارية الخدمة بنجاح.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10" },
              { icon: Zap, title: "تنفيذ فوري", desc: "نظام آلي متطور يضمن معالجة ووصول طلباتكم في ثوانٍ معدودة وبأعلى مستويات السرعة.", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10" },
              { icon: CheckCircle, title: "خبراء موثوقون", desc: "نخبة من الوكلاء المعتمدين لضمان حقوقك في كل صفقة وساطة تتم عبر المنصة باحترافية.", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/10" },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -15 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="luxury-card p-12 border-none h-full flex flex-col items-center text-center group">
                  <div className={`w-24 h-24 rounded-[2rem] ${item.bg} flex items-center justify-center ${item.color} mb-10 transition-transform group-hover:scale-110 shadow-sm border`}>
                    <item.icon size={44} />
                  </div>
                  <h4 className="font-black text-2xl mb-5 text-foreground">{item.title}</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Footer */}
      <footer className="py-40 bg-muted/30 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="handwritten-logo text-7xl mb-12">
            {config?.siteInfo?.title || "XMOOD STORE"}
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-20 text-2xl leading-relaxed font-medium">
            {config?.pageContent?.footerAbout || "المنصة الرائدة والموثوقة لتقديم كافة الحلول والخدمات الإلكترونية المتكاملة، نسعى دائماً للابتكار والسرعة لخدمة عملائنا في كل مكان."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-32">
             {config?.contact?.whatsapp && (
               <a href={config.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-sm bg-card px-10 py-5 rounded-[2rem] shadow-xl border">
                  <MessageSquare size={24} className="text-green-500" /> الدعم الفني المباشر
               </a>
             )}
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-4 text-foreground hover:gold-text transition-all font-black text-sm bg-card px-10 py-5 rounded-[2rem] shadow-xl border">
                  <Mail size={24} className="text-primary" /> البريد الإلكتروني الرسمي
               </a>
             )}
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-[12px] font-black uppercase tracking-widest text-muted-foreground mb-24 border-b pb-24 border-border/50">
            <Link href="/store" className="hover:text-primary transition-all">الخدمات الإلكترونية</Link>
            <Link href="/designs/gallery" className="hover:text-primary transition-all">معرض الأعمال</Link>
            <Link href="/middleman" className="hover:text-primary transition-all">الوكلاء</Link>
            <Link href="/admin" className="hover:text-primary transition-all opacity-40">الإدارة</Link>
          </div>
          
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
            {config?.siteInfo?.copyright || "© 2025 XMOOD STORE PROFESSIONAL SERVICES. ALL RIGHTS RESERVED."}
          </p>
        </div>
      </footer>
    </main>
  );
}