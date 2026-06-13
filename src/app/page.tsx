
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
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      
      {/* Modern Professional Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-60 md:pb-40 overflow-hidden bg-zinc-50/30 dark:bg-background">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Badge className="mb-10 py-2.5 px-10 bg-primary/10 text-primary border-primary/20 rounded-full font-black text-[11px] tracking-widest uppercase shadow-sm">
               {config?.siteInfo?.subtitle || "منصة الخدمات الرقمية الموثوقة الأولى"}
             </Badge>
             
             <h1 className="text-5xl md:text-8xl lg:text-9xl mb-10 font-headline font-black leading-tight tracking-tighter text-zinc-900 dark:text-white">
                حلول رقمية <span className="gold-text">مبتكرة وموثوقة</span>
             </h1>

             <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
               {config?.siteInfo?.heroDescription || "نقدم باقات شحن الألعاب، اشتراكات رقمية، وخدمات إبداعية متكاملة تضمن لك السرعة والأمان التام في كل خطوة."}
             </p>
             
             <div className="flex flex-wrap justify-center gap-6">
               <Button asChild className="royal-button h-16 px-14 text-lg">
                 <Link href="/store"><Store className="ml-3" size={24} /> تصفح المتجر</Link>
               </Button>
               <Button asChild className="accent-button h-16 px-14 text-lg">
                 <Link href="/marketplace"><Users className="ml-3" size={24} /> مجتمع الوكلاء</Link>
               </Button>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Corporate Features */}
      <section className="py-32 bg-white dark:bg-zinc-950/40 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">لماذا يختارنا المحترفون؟</h2>
             <p className="text-zinc-500 text-lg max-w-2xl mx-auto">نلتزم بأعلى معايير الجودة والأمان لتقديم تجربة رقمية لا تضاهى.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: ShieldCheck, title: "حماية متكاملة", desc: "أنظمة تشفير وحماية بيانات متطورة تضمن خصوصية تعاملاتك.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
              { icon: Award, title: "جودة معتمدة", desc: "كافة خدماتنا تخضع لمعايير فحص دقيقة لضمان رضاكم التام.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
              { icon: Zap, title: "تنفيذ لحظي", desc: "نظام آلي متطور يضمن وصول طلباتك في ثوانٍ معدودة.", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
              { icon: CheckCircle, title: "وكلاء موثوقون", desc: "نخبة من الوكلاء المعتمدين لضمان حقوقك في كل صفقة وساطة.", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="luxury-card p-10 border-none h-full flex flex-col items-center text-center group">
                  <div className={`w-20 h-20 rounded-3xl ${item.bg} flex items-center justify-center ${item.color} mb-8 transition-transform group-hover:scale-110 shadow-sm`}>
                    <item.icon size={36} />
                  </div>
                  <h4 className="font-bold text-2xl text-zinc-900 dark:text-white mb-4">{item.title}</h4>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Restructured */}
      <footer className="py-32 bg-zinc-50 dark:bg-zinc-950 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="decorative-logo text-5xl mb-10">{config?.siteInfo?.title || "XMOOD"}</div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-16 text-lg leading-relaxed font-medium">
            {config?.siteInfo?.description || "المنصة الرائدة والموثوقة لتقديم كافة الحلول والخدمات الرقمية المتكاملة، نسعى دائماً للابتكار والسرعة لخدمة عملائنا في كل مكان."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-10 mb-20">
             {config?.contact?.whatsapp && (
               <a href={`https://wa.me/${config.contact.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 hover:text-primary transition-all font-bold text-sm bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl shadow-sm border border-border/50">
                  <MessageSquare size={18} className="text-green-500" /> دعم العملاء المباشر
               </a>
             )}
             {config?.contact?.email && (
               <a href={`mailto:${config.contact.email}`} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 hover:text-primary transition-all font-bold text-sm bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl shadow-sm border border-border/50">
                  <Mail size={18} className="text-primary" /> المراسلة الرسمية
               </a>
             )}
          </div>

          <div className="flex flex-wrap justify-center gap-10 text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-20">
            <Link href="/marketplace" className="hover:text-primary transition-all">مجتمع التداول</Link>
            <Link href="/designs/gallery" className="hover:text-primary transition-all">معرض التصاميم</Link>
            <Link href="/middleman" className="hover:text-primary transition-all">الوكلاء المعتمدون</Link>
            <Link href="/admin" className="hover:text-primary transition-all opacity-40">لوحة التحكم</Link>
          </div>
          
          <div className="pt-10 border-t border-border/50">
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
              {config?.siteInfo?.copyright || "© 2025 XMOOD INTEGRATED SERVICES. ALL RIGHTS RESERVED."}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
